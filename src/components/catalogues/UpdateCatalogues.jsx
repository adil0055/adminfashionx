import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import vtonRefImage from '../../assets/vton_reference.jpg';
import { UploadSimple, FileCsv, CheckCircle, Warning, DownloadSimple, CircleNotch } from '@phosphor-icons/react';

const UpdateCatalogues = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [locations, setLocations] = useState([]);
    const [file, setFile] = useState(null);
    const [processedFile, setProcessedFile] = useState(null);
    const [extraDataFile, setExtraDataFile] = useState(null);
    const [validationStatus, setValidationStatus] = useState(null); // 'validating', 'success', 'error'
    const [validationErrors, setValidationErrors] = useState([]);
    const [extraColumns, setExtraColumns] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

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
                    const keys = Object.keys(parsed[0]).filter(k => k !== 'line' && k !== 'product_id');
                    setExtraColumns(keys);
                }
            } catch (e) {
                console.warn("Failed to parse pending extras for UI", e);
            }
        }
    }, []);

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
        setSelectedLocation('');
        setLocations([]);

        if (!clientId) return;

        try {
            const result = await api.clients.getDetails(clientId);
            const clientData = result.success ? result.data : result;
            const locs = clientData.locations || [];
            setLocations(Array.isArray(locs) ? locs : []);
        } catch (error) {
            console.error("Failed to fetch client details", error);
        }
    };

    const handleDownloadExample = () => {
        const csvContent = "product_id,Name ,Brand,MRP,Discount %,Category,Sub_Category,Gender,Color,Description ,Material Care,sizes,Thumbnail Image Filename,Vton Ready Image Filename,Other images filename\n945531067,3-pack Regular Fit T-shirts,H&M,1199,10,tshirts,Null,man,Blue/Beige,null,null,S; XS; XXL; XL; L; M,0945531067.jpg,0945531067.jpg,0945531067_0.jpg";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'example_catalogue.csv';
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

    const validateCSV = (file) => {
        setValidationStatus('validating');
        setValidationErrors([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const { headers, rows } = parseCSV(text);
            const errors = [];

            const expectedHeaders = [
                'product_id', 'Name', 'Brand', 'MRP', 'Discount %', 'Category',
                'Sub_Category', 'Gender', 'Color', 'Description', 'Material Care',
                'sizes', 'Thumbnail Image Filename', 'Vton Ready Image Filename', 'Other images filename'
            ];

            const headerMap = {};
            expectedHeaders.forEach(eh => {
                const foundIndex = headers.findIndex(h => h.trim() === eh.trim() || h.trim() === eh.replace(' %', '').trim());
                if (foundIndex === -1 && eh === 'Discount %') {
                    const altIndex = headers.findIndex(h => h.trim() === 'Discount');
                    if (altIndex !== -1) headerMap[eh] = altIndex;
                    // Discount is optional, so no error if missing
                } else if (foundIndex !== -1) {
                    headerMap[eh] = foundIndex;
                }
            });

            // Check for missing REQUIRED headers
            const requiredFields = [
                'product_id', 'Name', 'Brand', 'MRP', 'Category', 'Gender',
                'Color', 'sizes', 'Thumbnail Image Filename', 'Vton Ready Image Filename', 'Other images filename'
            ];

            requiredFields.forEach(field => {
                if (headerMap[field] === undefined) {
                    errors.push(`Missing required header: ${field}`);
                }
            });

            if (errors.length > 0) {
                setValidationStatus('error');
                setValidationErrors(errors);
                return;
            }



            rows.forEach(row => {
                // Skip empty rows (e.g. trailing commas from Excel)
                const isRowEmpty = row.values.every(val => !val || val.trim() === '');
                if (isRowEmpty) return;

                requiredFields.forEach(field => {
                    const colIndex = headerMap[field];
                    const val = row.values[colIndex];
                    if (!val || val === '' || val.toLowerCase() === 'null') {
                        errors.push(`Line ${row.line}: Missing required field '${field}'`);
                    }
                });
            });

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
                            product_id: (headerMap['product_id'] !== undefined) ? row.values[headerMap['product_id']] : null,
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

                // 2. Normalize Rows (Filter to expected headers, fill nulls, remove extras)
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

                // Save to local storage
                try {
                    localStorage.setItem('pendingCatalogue', newCsvContent);
                    localStorage.setItem('pendingCatalogueName', file.name);
                } catch (e) {
                    console.warn("Failed to save to local storage (likely too large)", e);
                }

                setValidationStatus('success');
            }
        };
        reader.readAsText(file);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
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
        try {
            const formData = new FormData();
            formData.append('file', processedFile || file);
            if (extraDataFile) {
                formData.append('extra_data', extraDataFile);
            }
            formData.append('client_id', selectedClient);
            if (selectedLocation) formData.append('location_id', selectedLocation);

            await api.catalogues.upload(formData);
            alert('Catalogue uploaded successfully!');

            // Clear local storage
            localStorage.removeItem('pendingCatalogue');
            localStorage.removeItem('pendingCatalogueName');
            localStorage.removeItem('pendingCatalogueExtras');

            setFile(null);
            setProcessedFile(null);
            setExtraDataFile(null);
            setExtraColumns([]);
            setValidationStatus(null);
        } catch (error) {
            console.error(error);
            alert('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '2rem' }}>
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

            {/* Client Selection Card */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
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
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>Select Location (Optional)</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="styled-select"
                            disabled={!selectedClient}
                            style={{ opacity: !selectedClient ? 0.5 : 1 }}
                        >
                            <option value="">All Locations</option>
                            {locations.map(l => (
                                <option key={l.id} value={l.id}>{l.name} - {l.address}</option>
                            ))}
                        </select>
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
                                        { name: 'product_id', req: 'Required', desc: 'Unique identification code' },
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

                    {/* Upload Card */}
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
                                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        <Warning size={20} weight="fill" />
                                        <span>Validation Failed</span>
                                    </div>
                                    <ul className="custom-scrollbar" style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.75rem', color: '#fda4af', maxHeight: '8rem', overflowY: 'auto' }}>
                                        {validationErrors.map((err, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem' }}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}



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

                            {validationStatus === 'success' && (
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
                        </div>
                    </div>
                </div>
            </div>

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
