import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import vtonRefImage from '../../assets/vton_reference.jpg';
import { UploadSimple, FileCsv, CheckCircle, Warning, DownloadSimple, CircleNotch, FileZip, CaretDown, CaretUp, X, Info, XCircle, FileText, Image, Folder, MagnifyingGlass, Package, List, Copy, MapPin } from '@phosphor-icons/react';

import { getZipFileNames } from '../../utils/zipReader';
// removed JSZip import since we use custom reader now

// Import Guideline Images
import backViewImg from '../../assets/vton_guidelines/back_view.png';
import holdingObjImg from '../../assets/vton_guidelines/holding_object.png';
import sidewaysGlassesImg from '../../assets/vton_guidelines/sideways_glasses.png';
import complexBgImg from '../../assets/vton_guidelines/complex_bg.png';
import sidewaysPoseImg from '../../assets/vton_guidelines/sideways_pose.png';

import goodExampleImg from '../../assets/vton_guidelines/good_example.png';
import zipStructureImg from '../../assets/zip_structure_ref.png'; // New Image Import

const UpdateCatalogues = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');

    // Location State
    const [clientLocations, setClientLocations] = useState([]); // Available locations for the client
    const [selectedLocations, setSelectedLocations] = useState([]); // Array of selected location IDs
    const [isCustomLocation, setIsCustomLocation] = useState(false);
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const locationDropdownRef = useRef(null);

    // File State
    const [file, setFile] = useState(null);
    const [processedFile, setProcessedFile] = useState(null);
    const [zipFile, setZipFile] = useState(null);
    const [zipEntries, setZipEntries] = useState(new Map()); // Map of { path: size } in zip

    const [extraDataFile, setExtraDataFile] = useState(null);
    const [validationStatus, setValidationStatus] = useState(null); // 'validating', 'success', 'error'
    const [validationErrors, setValidationErrors] = useState([]);
    const [extraColumns, setExtraColumns] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isValidatingZip, setIsValidatingZip] = useState(false);
    const [showZipInfo, setShowZipInfo] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [uploadResponse, setUploadResponse] = useState(null); // Store API response
    const [uploadProgress, setUploadProgress] = useState(0);

    // Terms & Guidelines State
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(true);
    const [termsChecked, setTermsChecked] = useState(false);
    const [isReadOnlyMode, setIsReadOnlyMode] = useState(false); // Used when viewing guidelines manually

    useEffect(() => {
        fetchClients();

        // Check for pending upload
        const pendingCSV = localStorage.getItem('pendingCatalogue');
        const pendingFileName = localStorage.getItem('pendingCatalogueName');
        if (pendingCSV && pendingFileName) {
            const fileObj = new File([pendingCSV], pendingFileName, { type: 'text/csv' });
            setFile(fileObj);
            setProcessedFile(fileObj); // It's already processed if in storage
            validateCSV(fileObj);
        }

        // Check for pending extra data
        const pendingExtras = localStorage.getItem('pendingCatalogueExtras');
        if (pendingExtras) {
            const extraFile = new File([pendingExtras], 'extra_data.json', { type: 'application/json' });
            setExtraDataFile(extraFile);
            try {
                const parsed = JSON.parse(pendingExtras);
                if (parsed && parsed.length > 0) {
                    // Extract keys from the first object, excluding internal fields
                    const keys = Object.keys(parsed[0]).filter(k => k !== 'line' && k !== 'id');
                    setExtraColumns(keys);
                }
            } catch (e) {
                console.warn("Failed to parse pending extras for UI", e);
            }
        }
    }, []);

    // Click outside handler for location dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
                setIsLocationDropdownOpen(false);
            }
        };

        if (isLocationDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocationDropdownOpen]);

    const fetchClients = async () => {
        try {
            const response = await api.clients.list();
            setClients(response.data || []);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        }
    };

    const handleClientChange = async (e) => {
        const clientId = e.target.value;
        setSelectedClient(clientId);

        // Reset state
        setSelectedLocations([]);
        setIsCustomLocation(false);
        setClientLocations([]);
        setFile(null);
        setProcessedFile(null);
        // Don't clear zip file when client changes, as it's likely the same for different clients or user workflow
        // setZipFile(null); 
        // setZipEntries(new Set());
        setValidationStatus(null);
        setValidationErrors([]);

        if (!clientId) return;

        try {
            const result = await api.clients.getDetails(clientId);
            const clientData = result.success ? result.data : result;
            const locs = clientData.locations || [];
            setClientLocations(Array.isArray(locs) ? locs : []);
        } catch (error) {
            console.error("Failed to fetch client details", error);
        }
    };

    const toggleLocation = (locId) => {
        if (locId === 'custom') {
            const newValue = !isCustomLocation;
            setIsCustomLocation(newValue);
            if (newValue) {
                setSelectedLocations([]); // Clear specific locations if custom is selected
            }
        } else {
            // If selecting a specific location, disable custom
            if (isCustomLocation) setIsCustomLocation(false);

            setSelectedLocations(prev => {
                if (prev.includes(locId)) {
                    return prev.filter(id => id !== locId);
                } else {
                    return [...prev, locId];
                }
            });
        }
    };

    const handleZipChange = async (e) => {
        const zipFileObj = e.target.files[0];
        if (!zipFileObj) return;

        // Reset input value to allow re-uploading the same file if needed
        e.target.value = '';

        setZipFile(zipFileObj);
        setIsValidatingZip(true);
        setValidationStatus(null); // Re-trigger CSV validation if zip changes

        try {
            // Use smart reader for all files (handles large files efficiently)
            const paths = await getZipFileNames(zipFileObj);

            setZipEntries(paths);

            // If CSV is already loaded, re-validate it against the new zip
            if (file) {
                validateCSV(file, paths, zipFileObj);
            }

        } catch (err) {
            console.error("Failed to read zip", err);
            alert("Failed to read zip file structure. Please ensure it is a valid zip archive.");
            setZipFile(null);
            setZipEntries(new Map());
        } finally {
            setIsValidatingZip(false);
        }
    };

    const handleRemoveZip = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setZipFile(null);
        setZipEntries(new Map());
        setValidationStatus(null);
        setValidationErrors([]);
    };

    const handleRemoveCSV = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDiscard();
    };

    const handleDownloadExample = () => {
        // Dynamic headers based on selection
        let headers = "id,Name,Brand,MRP,Discount %,Category,Sub_Category,Gender,Color,Description,Material Care,sizes,Thumbnail Image Filename,Vton Ready Image Filename,Other images filename";
        let row = "945531067,3-pack Regular Fit T-shirts,H&M,1199,10,tshirts,Null,man,Blue/Beige,null,null,S; XS; XXL; XL; L; M,0945531067.jpg,0945531067.jpg,0945531067_0.jpg";

        if (isCustomLocation) {
            headers += ",locations";
            // Pre-fill with client's available locations as dummy data
            const dummyLocs = clientLocations.map(l => l.name).join(';'); // Using semicolon to avoid CSV conflict, or quote it
            // Actually user said comma separated. So we must quote the field.
            // But in CSV, if we put "Loc1, Loc2", it's one field.
            const locString = clientLocations.length > 0 ? `"${clientLocations.map(l => l.name).join(',')}"` : "Location1,Location2";
            row += `,${locString}`;
        }

        const csvContent = `${headers}\n${row}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalogue_template_${isCustomLocation ? 'custom' : 'standard'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const parseCSV = (text) => {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;

        // Normalize line endings to \n
        const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < cleanText.length; i++) {
            const char = cleanText[i];
            const nextChar = cleanText[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote ("") inside quotes -> becomes a single quote
                    currentField += '"';
                    i++; // Skip the next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // Field separator
                currentRow.push(currentField.trim()); // Trim might be risky if spaces are intentional, but usually safe for CSVs
                currentField = '';
            } else if (char === '\n' && !inQuotes) {
                // Row separator
                currentRow.push(currentField.trim());
                rows.push({ line: rows.length + 2, values: currentRow }); // +2 because 1-based and header is row 1 (but we'll shift headers out later)
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }

        // Handle the last field/row if not empty
        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            rows.push({ line: rows.length + 2, values: currentRow });
        }

        if (rows.length === 0) return { headers: [], rows: [] };

        // Extract headers from the first row
        // The first row object in 'rows' array corresponds to the header line in the file
        const headerRow = rows.shift();
        const headers = headerRow ? headerRow.values : [];

        // Adjust line numbers for remaining rows
        // The 'line' property was calculated assuming the first row was data row 1 (effectively), 
        // but since we shifted headers, the first data row is actually line 2 of the file.
        // My previous logic: rows.push({ line: rows.length + 2 ... })
        // If i=0 (header), line=2. 
        // If i=1 (first data), line=3.
        // Wait, let's trace:
        // Header is processed -> pushed as line 2? No, rows.length is 0 initially.
        // 1st row (header) -> rows.length is 0 -> line: 2.
        // 2nd row (data) -> rows.length is 1 -> line: 3.
        // This seems off by 1 if we consider header as line 1.
        // Let's fix line numbering.

        // Correct logic:
        // We want 'line' to represent the line number in the original file.
        // Header is Line 1.
        // First data row is Line 2.

        // Let's re-map the line numbers after shifting headers.
        const headersValues = headers.map(h => h.trim());

        // The rows array now contains only data rows.
        // The first element was the header (Line 1).
        // The next element (now index 0) was Line 2.
        // So we just need to make sure the 'line' property is correct.
        // In the loop above:
        // 1st iteration (Header): rows.length = 0 => line = 2 (Wrong, should be 1)

        // Let's fix the loop logic for line numbers:
        // rows.push({ line: rows.length + 1, values: currentRow });

        // But I can't easily change the loop logic in the replacement string without rewriting the whole function carefully.
        // I'll just re-map the rows to have correct line numbers.

        const correctedRows = rows.map((r, index) => ({
            ...r,
            line: index + 2 // Header is 1, so first data row is 2
        }));

        return { headers: headersValues, rows: correctedRows };
    };

    const reconstructCSV = (headers, rows) => {
        const escape = (val) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headerLine = headers.map(escape).join(',');
        const body = rows.map(r => {
            // Ensure row has enough columns to match headers, filling with empty string if needed
            const rowVals = [...r.values];
            while (rowVals.length < headers.length) rowVals.push('');
            return rowVals.map(escape).join(',');
        }).join('\n');
        return headerLine + '\n' + body;
    };

    const validateCSV = (file, currentZipEntries = zipEntries, currentZipFile = null) => {
        // Use provided zip file or fallback to state
        const activeZipFile = currentZipFile || zipFile;
        setValidationStatus('validating');
        setValidationErrors([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const { headers, rows } = parseCSV(text);
            const errors = [];

            const expectedHeaders = [
                'id', 'Name', 'Brand', 'MRP', 'Discount %', 'Category',
                'Sub_Category', 'Gender', 'Color', 'Description', 'Material Care',
                'sizes', 'Thumbnail Image Filename', 'Vton Ready Image Filename', 'Other images filename'
            ];

            if (isCustomLocation) {
                expectedHeaders.push('locations');
            }

            const headerMap = {};
            expectedHeaders.forEach(eh => {
                const foundIndex = headers.findIndex(h => h.trim() === eh.trim() || h.trim() === eh.replace(' %', '').trim());
                if (foundIndex === -1 && eh === 'Discount %') {
                    const altIndex = headers.findIndex(h => h.trim() === 'Discount');
                    if (altIndex !== -1) headerMap[eh] = altIndex;
                } else if (foundIndex !== -1) {
                    headerMap[eh] = foundIndex;
                }
            });

            // Check for missing REQUIRED headers
            const requiredFields = [
                'id', 'Name', 'Brand', 'MRP', 'Category', 'Gender',
                'Color', 'sizes', 'Thumbnail Image Filename', 'Vton Ready Image Filename', 'Other images filename'
            ];

            if (isCustomLocation) {
                requiredFields.push('locations');
            }

            requiredFields.forEach(field => {
                if (headerMap[field] === undefined) {
                    errors.push({
                        type: 'header_missing',
                        message: `Missing required column: ${field}`,
                        detail: `Your CSV is missing the "${field}" column header.`,
                        fix: `Add a column named "${field}" to your CSV file. Download the template for reference.`
                    });
                }
            });

            // If NOT custom location, ensure 'locations' column is NOT present
            if (!isCustomLocation) {
                const locIndex = headers.findIndex(h => h.trim().toLowerCase() === 'locations');
                if (locIndex !== -1) {
                    errors.push({
                        type: 'header_conflict',
                        message: `Unexpected 'locations' column found`,
                        detail: `You selected specific locations from the dropdown, but your CSV also contains a 'locations' column.`,
                        fix: `Either remove the 'locations' column from your CSV, OR select "Custom Location (Define in CSV)" from the location dropdown above.`
                    });
                }
            }

            if (errors.length > 0) {
                setValidationStatus('error');
                setValidationErrors(errors);
                return;
            }

            // Prepare for location validation
            const validLocationNames = clientLocations.map(l => l.name.toLowerCase());

            // Track duplicate IDs
            const seenIds = new Set();


            rows.forEach(row => {
                // Skip empty rows
                const isRowEmpty = row.values.every(val => !val || val.trim() === '');
                if (isRowEmpty) return;

                requiredFields.forEach(field => {
                    const colIndex = headerMap[field];
                    const val = row.values[colIndex];
                    if (!val || val === '' || val.toLowerCase() === 'null') {
                        errors.push({
                            type: 'field_missing',
                            line: row.line,
                            productId: row.values[headerMap['id']] || 'Unknown',
                            message: `Missing value for '${field}'`,
                            detail: `Row ${row.line} is missing a value in the "${field}" column.`,
                            fix: `Open your CSV and fill in the "${field}" value for the product on line ${row.line}.`
                        });
                    }
                });

                // Duplicate ID Check
                const idVal = row.values[headerMap['id']];
                if (idVal && idVal !== '' && idVal.toLowerCase() !== 'null') {
                    if (seenIds.has(idVal)) {
                        errors.push({
                            type: 'duplicate_id',
                            line: row.line,
                            productId: idVal,
                            message: `Duplicate product ID: ${idVal}`,
                            detail: `The ID "${idVal}" appears multiple times in your CSV. Each product must have a unique ID.`,
                            fix: `Find all rows with ID "${idVal}" and ensure each product has a unique ID value.`
                        });
                    } else {
                        seenIds.add(idVal);
                    }
                }

                // Location Validation
                if (isCustomLocation) {
                    const locIndex = headerMap['locations'];
                    const locVal = row.values[locIndex];
                    if (locVal) {
                        const locs = locVal.split(',').map(s => s.trim());
                        locs.forEach(l => {
                            if (!validLocationNames.includes(l.toLowerCase())) {
                                errors.push({
                                    type: 'invalid_location',
                                    line: row.line,
                                    productId: row.values[headerMap['id']] || 'Unknown',
                                    message: `Invalid location: ${l}`,
                                    detail: `The location "${l}" on line ${row.line} is not recognized for this client.`,
                                    fix: `Use one of these valid locations: ${clientLocations.map(cl => cl.name).join(', ')}`
                                });
                            }
                        });
                    }
                }

                // Image Validation against Zip
                if (currentZipEntries.size > 0) {
                    const idIndex = headerMap['id'];
                    const thumbIndex = headerMap['Thumbnail Image Filename'];
                    const vtonIndex = headerMap['Vton Ready Image Filename'];
                    const otherIndex = headerMap['Other images filename'];

                    const id = row.values[idIndex];

                    // Size limits
                    const MIN_IMAGE_SIZE = 10 * 1024;      // 10KB
                    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

                    const formatSize = (bytes) => {
                        if (bytes < 1024) return `${bytes} B`;
                        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
                    };

                    // Step 1: Check if product folder exists in zip (using Map keys)
                    const productFolderPath = `garments/${id}/`;
                    const folderExists = Array.from(currentZipEntries.keys()).some(entry => entry.startsWith(productFolderPath));

                    if (!folderExists) {
                        errors.push({
                            type: 'folder_missing',
                            line: row.line,
                            productId: id,
                            message: `Product folder missing in ZIP`,
                            detail: `Expected folder: garments/${id}/`,
                            fix: `Create a folder named "${id}" inside the "garments" folder in your zip file, then add all images for this product inside it.`
                        });
                        return; // Skip image checks if folder doesn't exist
                    }

                    // Step 2: Check individual images (existence and size)
                    const checkImage = (filename, type) => {
                        if (!filename || filename.toLowerCase() === 'null') return;
                        const expectedPath = `garments/${id}/${filename}`;

                        if (!currentZipEntries.has(expectedPath)) {
                            errors.push({
                                type: 'image_missing',
                                line: row.line,
                                productId: id,
                                imageType: type,
                                filename: filename,
                                message: `${type} image not found`,
                                detail: `Missing: ${expectedPath}`,
                                fix: `Add the file "${filename}" to the folder "garments/${id}/" in your zip, OR update the "${type === 'Thumbnail' ? 'Thumbnail Image Filename' : type === 'Vton' ? 'Vton Ready Image Filename' : 'Other images filename'}" column in your CSV to match the actual filename.`
                            });
                        } else {
                            // Check file size
                            const fileSize = currentZipEntries.get(expectedPath);

                            if (fileSize > MAX_IMAGE_SIZE) {
                                errors.push({
                                    type: 'image_too_large',
                                    line: row.line,
                                    productId: id,
                                    imageType: type,
                                    filename: filename,
                                    message: `${type} image exceeds 5MB limit`,
                                    detail: `File "${filename}" is ${formatSize(fileSize)} (max allowed: 5MB).`,
                                    fix: `Compress or resize the image "${filename}" to be under 5MB. Use tools like TinyPNG or Photoshop's "Save for Web".`
                                });
                            } else if (fileSize < MIN_IMAGE_SIZE) {
                                errors.push({
                                    type: 'image_too_small',
                                    line: row.line,
                                    productId: id,
                                    imageType: type,
                                    filename: filename,
                                    message: `${type} image is suspiciously small`,
                                    detail: `File "${filename}" is only ${formatSize(fileSize)} (min expected: 10KB).`,
                                    fix: `This file may be corrupted, a placeholder, or too low quality. Replace with a proper high-resolution image (minimum 10KB).`
                                });
                            }
                        }
                    };

                    checkImage(row.values[thumbIndex], 'Thumbnail');
                    checkImage(row.values[vtonIndex], 'Vton');

                    const otherImages = row.values[otherIndex];
                    if (otherImages && otherImages.toLowerCase() !== 'null') {
                        otherImages.split(';').forEach(img => checkImage(img.trim(), 'Other'));
                    }
                }
            });

            if (currentZipEntries.size === 0 && activeZipFile) {
                // Zip is loaded but empty? Or maybe parsing failed silently?
                // If zipFile is present but entries 0, maybe wait? 
                // But we handle that in handleZipChange.
            } else if (!activeZipFile) {
                // Warn that zip is missing? User said "uploaded folder should be a zip file too".
                // Maybe strict error?
                errors.push({
                    type: 'zip_missing',
                    message: `No images ZIP file uploaded`,
                    detail: `You must upload a ZIP file containing product images to validate your catalogue.`,
                    fix: `Upload a ZIP file with this structure: garments/{product_id}/image.jpg. Use the "Upload Images" section above.`
                });
            }

            if (errors.length > 0) {
                setValidationStatus('error');
                setValidationErrors(errors.slice(0, 50));
            } else {
                // 1. Identify Extra Headers
                const extraIndices = headers.map((_, i) => i).filter(i => !Object.values(headerMap).includes(i));

                if (extraIndices.length > 0) {
                    const extraHeaders = extraIndices.map(i => headers[i]);
                    setExtraColumns(extraHeaders);

                    const extraData = rows.map(row => {
                        const extras = {};
                        extraIndices.forEach(idx => {
                            extras[headers[idx]] = row.values[idx];
                        });
                        return {
                            line: row.line,
                            id: (headerMap['id'] !== undefined) ? row.values[headerMap['id']] : null,
                            ...extras
                        };
                    });

                    const extraJson = JSON.stringify(extraData, null, 2);
                    const extraFile = new File([extraJson], 'extra_data.json', { type: 'application/json' });
                    setExtraDataFile(extraFile);

                    try {
                        localStorage.setItem('pendingCatalogueExtras', extraJson);
                    } catch (e) {
                        console.warn("Failed to save extra data to local storage", e);
                    }
                } else {
                    setExtraDataFile(null);
                    setExtraColumns([]);
                    localStorage.removeItem('pendingCatalogueExtras');
                }

                // 2. Normalize Rows
                const normalizedRows = rows.map(row => ({
                    ...row,
                    values: expectedHeaders.map(eh => {
                        const idx = headerMap[eh];
                        let val = (idx !== undefined) ? row.values[idx] : 'null';
                        if (!val || val.trim() === '') val = 'null';
                        return val;
                    })
                }));

                const newCsvContent = reconstructCSV(expectedHeaders, normalizedRows);
                const newFile = new File([newCsvContent], file.name, { type: 'text/csv' });
                setProcessedFile(newFile);

                try {
                    localStorage.setItem('pendingCatalogue', newCsvContent);
                    localStorage.setItem('pendingCatalogueName', file.name);
                } catch (e) {
                    console.warn("Failed to save to local storage", e);
                }

                setValidationStatus('success');
            }
        };
        reader.readAsText(file);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Reset input value to allow re-uploading the same file
            e.target.value = '';

            setFile(selectedFile);
            setProcessedFile(null);
            validateCSV(selectedFile);
        }
    };

    const handleDiscard = () => {
        setFile(null);
        setProcessedFile(null);
        setValidationStatus(null);
        setValidationErrors([]);
        localStorage.removeItem('pendingCatalogue');
        localStorage.removeItem('pendingCatalogueName');
        localStorage.removeItem('pendingCatalogueExtras');
        setExtraDataFile(null);
        setExtraColumns([]);
    };

    const handleUpload = async () => {
        if (!file || validationStatus !== 'success' || !selectedClient) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadResponse(null);
        setValidationErrors([]);

        try {
            const formData = new FormData();
            formData.append('file', processedFile || file);
            formData.append('images_zip', zipFile); // Required according to API

            if (extraDataFile) {
                formData.append('extra_data', extraDataFile);
            }

            formData.append('client_id', selectedClient.toString());

            if (!isCustomLocation && selectedLocations.length > 0) {
                formData.append('location_ids', selectedLocations.join(','));
            }

            const response = await api.catalogues.upload(formData);

            // Handle response according to API documentation
            if (response.success) {
                setUploadResponse(response);
                setValidationStatus('success');

                // Clear local storage on success
                localStorage.removeItem('pendingCatalogue');
                localStorage.removeItem('pendingCatalogueName');
                localStorage.removeItem('pendingCatalogueExtras');

                // Show success message with statistics
                const message = `Upload successful!\n\n` +
                    `Products Processed: ${response.products_processed || 0}\n` +
                    `Products Failed: ${response.products_failed || 0}\n` +
                    `Images Uploaded: ${response.data?.total_images_uploaded || 0}\n` +
                    (response.validation_report?.warnings?.length > 0
                        ? `\nWarnings: ${response.validation_report.warnings.length}`
                        : '');

                alert(message);
            } else {
                // Handle validation errors from response
                const errors = [];
                if (response.validation_report?.errors) {
                    response.validation_report.errors.forEach(err => {
                        errors.push(`Row ${err.row || 'N/A'}: ${err.message}`);
                    });
                }
                if (response.message) {
                    errors.push(response.message);
                }
                if (errors.length === 0) {
                    errors.push('Upload failed. Please check your files and try again.');
                }

                setValidationErrors(errors);
                setValidationStatus('error');
                setUploadResponse(response);
            }
        } catch (error) {
            console.error('Upload error:', error);

            // Extract error details from API response
            let errorMessages = [];
            if (error.data?.detail) {
                const detail = error.data.detail;
                if (Array.isArray(detail.errors)) {
                    errorMessages = detail.errors.map(e =>
                        `Row ${e.row || 'N/A'}: ${e.message || e}`
                    );
                } else if (detail.message) {
                    errorMessages.push(detail.message);
                } else if (typeof detail === 'string') {
                    errorMessages.push(detail);
                }
            } else if (error.message) {
                errorMessages.push(error.message);
            } else {
                errorMessages.push('Upload failed. Please check your connection and try again.');
            }

            setValidationErrors(errorMessages);
            setValidationStatus('error');

            // Show error alert
            alert('Upload failed:\n\n' + errorMessages.join('\n'));
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h2 style={{
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        background: 'linear-gradient(90deg, #fff, #a5b4fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Update Catalogue
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
                        Upload and validate your product catalogue CSV. Ensure your data matches the schema below.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsReadOnlyMode(true); // Open in read-only mode
                        setShowTermsModal(true);
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                >
                    <Info size={18} />
                    VTON Guidelines
                </button>
            </div>

            {/* Terms & Guidelines Modal */}
            {showTermsModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999, // Highest priority
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="glass-card custom-scrollbar" style={{
                        maxWidth: '900px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '2rem',
                        borderRadius: '24px',
                        animation: 'slide-up 0.4s ease-out',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '64px', height: '64px', margin: '0 auto 1rem',
                                background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Warning size={32} color="#818cf8" weight="duotone" />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                                Upload Guidelines & Terms
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                                Please read carefully. You must adhere to these rules for successful catalogue processing.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f472b6', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <X size={24} weight="bold" />
                                VTON Image Don'ts (Strictly Prohibited)
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                {[
                                    { src: backViewImg, label: "Facing Backwards" },
                                    { src: sidewaysPoseImg, label: "Sideways Pose" },
                                    { src: holdingObjImg, label: "Holding Objects" },
                                    { src: complexBgImg, label: "Complex Background" },
                                    { src: sidewaysGlassesImg, label: "Sunglasses / Obscured" }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ textAlign: 'center' }}>
                                        <div style={{
                                            position: 'relative', borderRadius: '8px', overflow: 'hidden',
                                            border: '2px solid #fb7185', aspectRatio: '3/4', marginBottom: '0.5rem'
                                        }}>
                                            <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{
                                                position: 'absolute', inset: 0, background: 'rgba(244, 63, 94, 0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <X size={48} color="#fb7185" weight="bold" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                            </div>
                                        </div>
                                        <span style={{ color: '#fb7185', fontSize: '0.75rem', fontWeight: 600 }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    <li><strong>Dress Partially Visible:</strong> The garment must be fully visible.</li>
                                    <li><strong>Sitting:</strong> Model must be standing straight.</li>
                                    <li><strong>Holding Hands:</strong> Arms should be by the sides or natural.</li>
                                </ul>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    <li><strong>Bad Posture:</strong> No slouching or extreme poses.</li>
                                    <li><strong>Blurry/Low Quality:</strong> Images must be high resolution.</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#34d399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={24} weight="bold" />
                                VTON Image Do's (Recommended)
                            </h3>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ width: '150px', flexShrink: 0 }}>
                                    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #34d399', aspectRatio: '3/4' }}>
                                        <img src={goodExampleImg} alt="Good Example" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#d1fae5', fontSize: '0.95rem', lineHeight: '1.8' }}>
                                        <li>✅ <strong>Front Facing:</strong> Model looking directly at camera.</li>
                                        <li>✅ <strong>Neutral Background:</strong> Plain white, grey, or simple background.</li>
                                        <li>✅ <strong>Full View:</strong> Entire garment is clearly visible.</li>
                                        <li>✅ <strong>Natural Pose:</strong> Standing straight, arms relaxed.</li>
                                        <li>✅ <strong>Good Lighting:</strong> Even lighting, no harsh shadows.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px',
                            display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'
                        }}>
                            {isReadOnlyMode ? (
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="btn-secondary"
                                    style={{ width: '100%', maxWidth: '200px' }}
                                >
                                    Close Guidelines
                                </button>
                            ) : (
                                <>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                                        <input
                                            type="checkbox"
                                            checked={termsChecked}
                                            onChange={(e) => setTermsChecked(e.target.checked)}
                                            style={{ width: '20px', height: '20px', accentColor: '#6366f1', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: '#fff', fontSize: '1rem' }}>
                                            I have read the guidelines and confirm that my images meet these requirements.
                                        </span>
                                    </label>

                                    <button
                                        onClick={() => {
                                            if (termsChecked) {
                                                setHasAcceptedTerms(true);
                                                setShowTermsModal(false);
                                            }
                                        }}
                                        disabled={!termsChecked}
                                        className="btn-primary"
                                        style={{
                                            width: '100%', maxWidth: '300px', padding: '1rem', fontSize: '1rem',
                                            opacity: termsChecked ? 1 : 0.5, cursor: termsChecked ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        I Agree & Continue
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Client Selection Card */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', position: 'relative', zIndex: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                        <UploadSimple size={24} weight="duotone" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>Target Destination</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>Select Client</label>
                        <select
                            value={selectedClient}
                            onChange={handleClientChange}
                            className="styled-select"
                        >
                            <option value="">Choose a Client...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.display_name || c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>Select Location(s)</label>
                        <div style={{ position: 'relative' }} ref={locationDropdownRef}>
                            <button
                                onClick={() => !(!selectedClient) && setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                                disabled={!selectedClient}
                                className="styled-select"
                                style={{
                                    opacity: !selectedClient ? 0.5 : 1,
                                    textAlign: 'left',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: !selectedClient ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {isCustomLocation
                                        ? "Custom Location (CSV)"
                                        : selectedLocations.length > 0
                                            ? `${selectedLocations.length} Location${selectedLocations.length > 1 ? 's' : ''} Selected`
                                            : "Select Locations..."}
                                </span>
                                {isLocationDropdownOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
                            </button>

                            {isLocationDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: '#1e1e1e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    zIndex: 50,
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                    padding: '0.5rem',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    <div
                                        onClick={() => toggleLocation('custom')}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            background: isCustomLocation ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                            color: isCustomLocation ? '#818cf8' : '#fff',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px', height: '18px',
                                            borderRadius: '4px',
                                            border: `2px solid ${isCustomLocation ? '#6366f1' : '#4b5563'}`,
                                            background: isCustomLocation ? '#6366f1' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {isCustomLocation && <CheckCircle size={12} weight="fill" color="#fff" />}
                                        </div>
                                        <span>Custom Location (Define in CSV)</span>
                                    </div>

                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                                    {clientLocations.length === 0 ? (
                                        <div style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>
                                            No locations found for this client.
                                        </div>
                                    ) : (
                                        clientLocations.map(l => {
                                            const isSelected = selectedLocations.includes(l.id);
                                            return (
                                                <div
                                                    key={l.id}
                                                    onClick={() => toggleLocation(l.id)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                                        color: isSelected ? '#818cf8' : '#fff',
                                                        transition: 'background 0.2s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '18px', height: '18px',
                                                        borderRadius: '4px',
                                                        border: `2px solid ${isSelected ? '#6366f1' : '#4b5563'}`,
                                                        background: isSelected ? '#6366f1' : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <CheckCircle size={12} weight="fill" color="#fff" />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{l.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{l.address}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Left Column: Instructions */}
                <div style={{ flex: '1 1 60%' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                                    <Warning size={24} weight="duotone" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>Schema Guide</h3>
                            </div>
                            <button
                                onClick={handleDownloadExample}
                                className="btn-secondary"
                            >
                                <DownloadSimple size={18} />
                                <span>Template</span>
                            </button>
                        </div>

                        <div className="custom-scrollbar" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field Name</th>
                                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirement</th>
                                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '0.875rem' }}>
                                    {[
                                        { name: 'id', req: 'Required', desc: 'SKU number of that product' },
                                        { name: 'Name', req: 'Required', desc: 'Name of the product' },
                                        { name: 'Brand', req: 'Required', desc: 'Brand of the product' },
                                        { name: 'MRP', req: 'Required', desc: 'Maximum Retail Price' },
                                        { name: 'Discount', req: 'Optional', desc: 'Percentage of current discount' },
                                        { name: 'Category', req: 'Required', desc: 'Product Category' },
                                        { name: 'Sub Category', req: 'Optional', desc: 'Product Sub Category' },
                                        { name: 'Gender', req: 'Required', desc: 'Target Gender' },
                                        { name: 'Color', req: 'Required', desc: 'Product Color' },
                                        { name: 'Description', req: 'Optional', desc: 'Product description' },
                                        { name: 'Material Care', req: 'Optional', desc: 'Care instructions' },
                                        { name: 'sizes', req: 'Required', desc: 'Size range (e.g., S, M, L)' },
                                        { name: 'Thumbnail Image Filename', req: 'Required', desc: 'Main display image' },
                                        { name: 'Vton Ready Image Filename', req: 'Required', desc: 'Virtual Try-On Image' },
                                        { name: 'Other images filename', req: 'Required', desc: 'Additional images' },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="table-row">
                                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#a5b4fc' }}>{row.name}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    background: row.req === 'Required' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                    color: row.req === 'Required' ? '#fda4af' : '#6ee7b7'
                                                }}>
                                                    {row.req}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{row.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></span>
                                    VTON Image Guidelines
                                </h4>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.6', flex: 1 }}>
                                        <p style={{ marginBottom: '0.5rem' }}>For best results with Virtual Try-On:</p>
                                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                            <li>Use a product cut-out image if possible.</li>
                                            <li>Alternatively: Model front facing, full dress visible.</li>
                                            <li>Plain background, good lighting.</li>
                                        </ul>
                                    </div>
                                    <div style={{ flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', width: '96px', height: '128px', background: '#000' }}>
                                        <img src={vtonRefImage} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Image Zip Upload Card */}
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>
                                    <FileZip size={24} weight="duotone" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>Upload Images</h3>
                            </div>
                            <button
                                onClick={() => setShowZipInfo(true)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s'
                                }}
                                className="hover:text-white"
                            >
                                <Info size={20} />
                            </button>
                        </div>

                        <div
                            className={`upload-zone ${zipFile ? 'has-file' : ''}`}
                            style={{ position: 'relative', minHeight: '150px', cursor: 'pointer' }}
                        >
                            <input
                                type="file"
                                accept=".zip"
                                onChange={handleZipChange}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 10, cursor: 'pointer' }}
                            />
                            <div style={{
                                height: '100%',
                                width: '100%',
                                borderRadius: '12px',
                                border: zipFile ? '2px dashed rgba(236, 72, 153, 0.5)' : '2px dashed rgba(255,255,255,0.2)',
                                background: zipFile ? 'rgba(236, 72, 153, 0.05)' : 'rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1.5rem',
                                textAlign: 'center'
                            }}>
                                {zipFile ? (
                                    <>
                                        <button
                                            onClick={handleRemoveZip}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'rgba(236, 72, 153, 0.2)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                zIndex: 20,
                                                color: '#f472b6',
                                                transition: 'all 0.2s',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.4)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'}
                                            title="Remove Zip File"
                                        >
                                            <X size={18} weight="bold" />
                                        </button>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: '#f472b6' }}>
                                            <FileZip size={24} weight="fill" />
                                        </div>
                                        <p style={{ color: '#fff', fontWeight: 500, fontSize: '1rem', margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 1rem' }}>{zipFile.name}</p>
                                        <p style={{ color: '#f472b6', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(zipFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        {isValidatingZip && <p style={{ color: '#fbbf24', fontSize: '0.75rem', marginTop: '0.5rem' }}>Validating structure...</p>}
                                    </>
                                ) : (
                                    <>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: '#94a3b8' }}>
                                            <UploadSimple size={24} />
                                        </div>
                                        <p style={{ color: '#fff', fontWeight: 500, fontSize: '1rem', margin: 0 }}>Drop Zip file here</p>
                                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>Structure: garments/&#123;id&#125;/image.jpg</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upload CSV Card */}
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                                <FileCsv size={24} weight="duotone" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>Upload File</h3>
                        </div>

                        <div
                            className={`upload-zone ${file ? 'has-file' : ''}`}
                            style={{ position: 'relative', minHeight: '200px', cursor: 'pointer' }}
                        >
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 10, cursor: 'pointer' }}
                            />
                            <div style={{
                                height: '100%',
                                width: '100%',
                                borderRadius: '12px',
                                border: file ? '2px dashed rgba(16, 185, 129, 0.5)' : '2px dashed rgba(255,255,255,0.2)',
                                background: file ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem',
                                textAlign: 'center'
                            }}>
                                {file ? (
                                    <>
                                        <button
                                            onClick={handleRemoveCSV}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'rgba(16, 185, 129, 0.2)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                zIndex: 20,
                                                color: '#34d399',
                                                transition: 'all 0.2s',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.4)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                                            title="Remove CSV File"
                                        >
                                            <X size={18} weight="bold" />
                                        </button>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#34d399' }}>
                                            <FileCsv size={32} weight="fill" />
                                        </div>
                                        <p style={{ color: '#fff', fontWeight: 500, fontSize: '1.125rem', margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 1rem' }}>{file.name}</p>
                                        <p style={{ color: '#34d399', fontSize: '0.875rem', marginTop: '0.25rem' }}>{(file.size / 1024).toFixed(2)} KB</p>
                                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '1rem' }}>Click to replace</p>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#94a3b8' }}>
                                            <UploadSimple size={32} />
                                        </div>
                                        <p style={{ color: '#fff', fontWeight: 500, fontSize: '1.125rem', margin: 0 }}>Drop CSV file here</p>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>or click to browse</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Status Messages */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {validationStatus === 'validating' && (
                                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fbbf24' }}>
                                    <CircleNotch size={20} className="spin" />
                                    <span style={{ fontWeight: 500 }}>Validating CSV structure...</span>
                                </div>
                            )}

                            {validationStatus === 'error' && (
                                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185' }}>
                                            <Warning size={18} weight="fill" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, color: '#fb7185', fontSize: '0.95rem' }}>Validation Failed</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#fda4af' }}>{validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''} found in your files.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowErrorModal(true)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            background: 'rgba(244, 63, 94, 0.2)',
                                            border: '1px solid rgba(244, 63, 94, 0.3)',
                                            color: '#fb7185',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover:bg-red-500/30"
                                    >
                                        View Issues
                                    </button>
                                </div>
                            )}

                            {/* Validation Error Modal */}
                            {showErrorModal && (() => {
                                // Group errors by type
                                const groupedErrors = validationErrors.reduce((acc, err) => {
                                    const type = typeof err === 'object' ? err.type : 'general';
                                    if (!acc[type]) acc[type] = [];
                                    acc[type].push(err);
                                    return acc;
                                }, {});

                                const errorTypeConfig = {
                                    header_missing: { label: 'Missing CSV Columns', icon: <FileText size={20} weight="fill" />, color: '#ef4444' },
                                    header_conflict: { label: 'Column Conflicts', icon: <Warning size={20} weight="fill" />, color: '#f59e0b' },
                                    field_missing: { label: 'Missing Field Values', icon: <XCircle size={20} weight="fill" />, color: '#ef4444' },
                                    duplicate_id: { label: 'Duplicate Product IDs', icon: <Copy size={20} weight="fill" />, color: '#f97316' },
                                    invalid_location: { label: 'Invalid Locations', icon: <MapPin size={20} weight="fill" />, color: '#8b5cf6' },
                                    folder_missing: { label: 'Missing Product Folders', icon: <Folder size={20} weight="fill" />, color: '#3b82f6' },
                                    image_missing: { label: 'Missing Images', icon: <Image size={20} weight="fill" />, color: '#ef4444' },
                                    image_too_large: { label: 'Oversized Images (>5MB)', icon: <FileZip size={20} weight="fill" />, color: '#f97316' },
                                    image_too_small: { label: 'Suspiciously Small Images', icon: <MagnifyingGlass size={20} weight="bold" />, color: '#eab308' },
                                    zip_missing: { label: 'ZIP File Required', icon: <Package size={20} weight="fill" />, color: '#ef4444' },
                                    general: { label: 'General Errors', icon: <Warning size={20} weight="fill" />, color: '#ef4444' }
                                };

                                return createPortal(
                                    <div style={{
                                        position: 'fixed',
                                        inset: 0,
                                        zIndex: 10000,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1.5rem',
                                        backdropFilter: 'blur(8px)',
                                        background: 'rgba(9, 9, 11, 0.75)'
                                    }}>
                                        <div style={{
                                            background: '#0f172a',
                                            border: '1px solid rgba(148, 163, 184, 0.1)',
                                            borderRadius: '12px',
                                            width: '100%',
                                            maxWidth: '720px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            maxHeight: '85vh',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                        }}>
                                            {/* Header */}
                                            <div style={{
                                                padding: '1.25rem 1.5rem',
                                                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                background: 'rgba(30, 41, 59, 0.5)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#ef4444'
                                                    }}>
                                                        <Warning size={22} weight="fill" />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Validation Issues Found</h3>
                                                        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                                                            {validationErrors.length} issues need attention before upload
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShowErrorModal(false)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#64748b',
                                                        cursor: 'pointer',
                                                        padding: '0.5rem',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    className="hover:bg-slate-800 hover:text-white"
                                                >
                                                    <X size={20} weight="bold" />
                                                </button>
                                            </div>

                                            {/* Content Area */}
                                            <div className="custom-scrollbar" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                    {Object.entries(groupedErrors).map(([type, errors]) => {
                                                        const config = errorTypeConfig[type] || errorTypeConfig.general;

                                                        return (
                                                            <div key={type} style={{
                                                                background: 'rgba(30, 41, 59, 0.3)',
                                                                borderRadius: '8px',
                                                                border: '1px solid rgba(148, 163, 184, 0.1)',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {/* Category Header */}
                                                                <div style={{
                                                                    padding: '0.75rem 1rem',
                                                                    background: 'rgba(15, 23, 42, 0.4)',
                                                                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem'
                                                                }}>
                                                                    <div style={{ color: config.color, display: 'flex' }}>
                                                                        {config.icon}
                                                                    </div>
                                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>
                                                                        {config.label}
                                                                    </h4>
                                                                    <span style={{
                                                                        marginLeft: 'auto',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                        color: '#94a3b8',
                                                                        background: 'rgba(148, 163, 184, 0.1)',
                                                                        padding: '0.15rem 0.5rem',
                                                                        borderRadius: '999px'
                                                                    }}>
                                                                        {errors.length}
                                                                    </span>
                                                                </div>

                                                                {/* Errors List */}
                                                                <div className="custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                    {errors.map((err, i) => (
                                                                        <div key={i} style={{
                                                                            padding: '1rem',
                                                                            borderBottom: i < errors.length - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: '0.5rem'
                                                                        }}>
                                                                            {typeof err === 'object' ? (
                                                                                <>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.1rem' }}>
                                                                                        <div style={{ flex: 1 }}>
                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                                                                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#e2e8f0' }}>
                                                                                                    {err.message}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                                                                {err.line && (
                                                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(148, 163, 184, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                                                                        <List size={12} weight="bold" /> Line {err.line}
                                                                                                    </span>
                                                                                                )}
                                                                                                {err.productId && (
                                                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(148, 163, 184, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                                                                        <Package size={12} weight="bold" /> ID: {err.productId}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                                                                        {err.detail}
                                                                                    </p>


                                                                                </>
                                                                            ) : (
                                                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#fda4af' }}>{err}</p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div style={{
                                                padding: '1rem 1.5rem',
                                                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                background: 'rgba(30, 41, 59, 0.5)'
                                            }}>
                                                <button
                                                    onClick={() => setShowErrorModal(false)}
                                                    style={{
                                                        padding: '0.6rem 2rem',
                                                        borderRadius: '6px',
                                                        background: '#e2e8f0',
                                                        color: '#0f172a',
                                                        border: 'none',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                );
                            })()}



                            {validationStatus === 'success' && extraColumns.length > 0 && (
                                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        <Warning size={20} weight="fill" />
                                        <span>Extra Columns Detected</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#c7d2fe', marginBottom: '0.5rem' }}>
                                        The following columns are not part of the standard schema and will be saved to a separate <code>extra_data.json</code> file:
                                    </p>
                                    <div className="custom-scrollbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                                        {extraColumns.map((col, i) => (
                                            <span key={i} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#e0e7ff', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                                {col}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {validationStatus === 'success' && !uploadResponse && (
                                <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399' }}>
                                        <CheckCircle size={24} weight="fill" />
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>Ready to Upload</p>
                                            <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>CSV validated successfully</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={handleDiscard}
                                            className="btn-danger-outline"
                                            style={{ flex: 1 }}
                                        >
                                            Discard
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={isUploading || !selectedClient}
                                            className="btn-primary"
                                            style={{ flex: 2, opacity: (isUploading || !selectedClient) ? 0.5 : 1, cursor: (isUploading || !selectedClient) ? 'not-allowed' : 'pointer' }}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <CircleNotch size={18} className="spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadSimple size={18} weight="bold" />
                                                    <span>Finish Upload</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {!selectedClient && (
                                        <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#fb7185', margin: 0, animation: 'bounce 1s infinite' }}>
                                            Please select a client above to proceed
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Upload Success Response */}
                            {uploadResponse && uploadResponse.success && (
                                <div className="animate-slide-up" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399', marginBottom: '1rem' }}>
                                        <CheckCircle size={24} weight="fill" />
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>Upload Successful!</p>
                                            <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>{uploadResponse.message || 'Catalogue uploaded successfully'}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Products Processed</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#34d399' }}>{uploadResponse.products_processed || 0}</div>
                                        </div>
                                        {uploadResponse.products_failed > 0 && (
                                            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Products Failed</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fb7185' }}>{uploadResponse.products_failed}</div>
                                            </div>
                                        )}
                                        {uploadResponse.data?.total_images_uploaded !== undefined && (
                                            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Images Uploaded</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#34d399' }}>{uploadResponse.data.total_images_uploaded}</div>
                                            </div>
                                        )}
                                    </div>

                                    {uploadResponse.validation_report?.warnings && uploadResponse.validation_report.warnings.length > 0 && (
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                                <Warning size={18} weight="fill" />
                                                <span>Warnings ({uploadResponse.validation_report.warnings.length})</span>
                                            </div>
                                            <ul className="custom-scrollbar" style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.75rem', color: '#fbbf24', maxHeight: '6rem', overflowY: 'auto' }}>
                                                {uploadResponse.validation_report.warnings.slice(0, 10).map((warning, i) => (
                                                    <li key={i} style={{ marginBottom: '0.25rem' }}>
                                                        {warning.row ? `Row ${warning.row}: ` : ''}{warning.message || warning}
                                                    </li>
                                                ))}
                                                {uploadResponse.validation_report.warnings.length > 10 && (
                                                    <li style={{ fontStyle: 'italic', opacity: 0.7 }}>
                                                        ... and {uploadResponse.validation_report.warnings.length - 10} more warnings
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setFile(null);
                                            setProcessedFile(null);
                                            setExtraDataFile(null);
                                            setExtraColumns([]);
                                            setValidationStatus(null);
                                            setUploadResponse(null);
                                            setZipFile(null);
                                            setZipEntries(new Set());
                                            localStorage.removeItem('pendingCatalogue');
                                            localStorage.removeItem('pendingCatalogueName');
                                            localStorage.removeItem('pendingCatalogueExtras');
                                        }}
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '1rem' }}
                                    >
                                        Upload Another Catalogue
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Zip Info Popup */}
            {showZipInfo && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '900px', // Wider modal
                        width: '100%',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        animation: 'slide-up 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Info size={24} color="#f472b6" weight="duotone" />
                                Zip File Instructions
                            </h3>
                            <button
                                onClick={() => setShowZipInfo(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                To ensure your product images are correctly linked, please follow these strict guidelines:
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Left Column: Structure Visuals */}
                                <div>
                                    <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                        1. Folder Structure
                                    </h4>

                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <img src={zipStructureImg} alt="Zip Structure Reference" style={{ width: '100%', display: 'block' }} />
                                        </div>
                                        <code style={{ display: 'block', fontFamily: 'monospace', color: '#f472b6', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                                            garments/<br />
                                            ├── 1001/ &nbsp;&nbsp;&lt;-- Product ID<br />
                                            │&nbsp;&nbsp;&nbsp;├── thumb.jpg<br />
                                            │&nbsp;&nbsp;&nbsp;├── vton.jpg<br />
                                            │&nbsp;&nbsp;&nbsp;└── ...<br />
                                        </code>
                                    </div>
                                </div>

                                {/* Right Column: Rules & Details */}
                                <div>
                                    <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                        2. Filename Matching
                                    </h4>

                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', height: '100%' }}>
                                        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <li>
                                                <strong style={{ color: '#e2e8f0' }}>Exact Match Required:</strong>
                                                <div style={{ marginTop: '0.25rem', opacity: 0.8 }}>
                                                    Filenames in CSV columns (<code>Thumbnail Image Filename</code>) MUST match files in the zip exactly.
                                                </div>
                                            </li>
                                            <li>
                                                <strong style={{ color: '#e2e8f0' }}>Example:</strong>
                                                <div style={{ marginTop: '0.25rem', opacity: 0.8 }}>
                                                    If CSV has Product ID <code>1001</code> and image <code>blue_shirt.jpg</code>:<br />
                                                    Path must be: <span style={{ color: '#f472b6' }}>garments/1001/blue_shirt.jpg</span>
                                                </div>
                                            </li>
                                            <li>
                                                <strong style={{ color: '#e2e8f0' }}>No Extra Folders:</strong>
                                                <div style={{ marginTop: '0.25rem', opacity: 0.8 }}>
                                                    Ensure you don't have nested folders like <code>garments/garments/...</code>.
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowZipInfo(false)}
                                className="btn-primary"
                                style={{ background: '#f472b6', boxShadow: '0 4px 6px -1px rgba(244, 114, 182, 0.2)' }}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .glass-card {
                    background: rgba(30, 30, 30, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                .styled-select {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .styled-select:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 1px #6366f1;
                }
                .styled-select option {
                    background-color: #1e1e1e;
                    color: #fff;
                }

                .btn-secondary {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .btn-primary {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    background: #6366f1;
                    border: none;
                    color: #fff;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
                }
                .btn-primary:hover:not(:disabled) {
                    background: #4f46e5;
                    transform: translateY(-1px);
                }
                .btn-primary:active:not(:disabled) {
                    transform: translateY(0);
                }

                .btn-danger-outline {
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    background: transparent;
                    border: 1px solid rgba(244, 63, 94, 0.3);
                    color: #fb7185;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-danger-outline:hover {
                    background: rgba(244, 63, 94, 0.1);
                }

                .table-row {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    transition: background 0.2s;
                }
                .table-row:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>
        </div>
    );
};

export default UpdateCatalogues;
