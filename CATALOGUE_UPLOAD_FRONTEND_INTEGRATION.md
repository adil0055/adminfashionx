# Catalogue Upload API - Frontend Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Endpoint Details](#api-endpoint-details)
4. [Frontend Implementation Guide](#frontend-implementation-guide)
5. [UI/UX Considerations](#uiux-considerations)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Testing Guide](#testing-guide)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Catalogue Upload API allows frontend applications to bulk upload product catalogues via CSV files and image ZIP archives. This guide provides comprehensive instructions for integrating this endpoint into your admin web interface.

### Key Features

- **Bulk Product Upload**: Upload hundreds of products in a single request
- **Strict Validation**: All-or-nothing validation ensures data integrity
- **Progress Tracking**: Real-time validation feedback
- **Error Reporting**: Detailed row-level error messages
- **Location Management**: Flexible location assignment (request-level or per-row)

### Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Upload Flow                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User Selects   │
                    │  CSV + ZIP      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Client-side    │
                    │  Validation    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Upload to API  │
                    │  (multipart)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Show Progress  │
                    │  & Validation   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Display Result │
                    │  (Success/Error)│
                    └─────────────────┘
```

---

## Prerequisites

### Required Knowledge

- React/TypeScript (or your frontend framework)
- FormData API for multipart uploads
- File handling (CSV parsing, ZIP creation)
- Error handling and user feedback

### Required Files

1. **CSV File** (`products.csv`):
   - Must contain required columns: `id`, `Name`, `Category`, `Gender`, `Thumbnail Image Filename`, `Vton Ready Image Filename`
   - Optional columns: `Brand`, `MRP`, `Discount %`, `Sub_Category`, `Color`, `Description`, `Material Care`, `sizes`, `Other images filename`, `locations`

2. **ZIP File** (`images.zip`):
   - Structure: `garments/{product_id}/{image_filename}`
   - Must contain thumbnail and VTON images for each product

### API Access

- **Endpoint**: `POST /api/internal/catalogues/upload`
- **Authentication**: Requires admin authentication (JWT token)
- **Content-Type**: `multipart/form-data`

---

## API Endpoint Details

### Request

**URL**: `{BASE_URL}/api/internal/catalogues/upload`

**Method**: `POST`

**Headers**:
```typescript
{
  'Authorization': 'Bearer {JWT_TOKEN}',
  // Content-Type will be set automatically by browser for multipart/form-data
}
```

**Body** (FormData):
```typescript
{
  client_id: number,              // Required
  file: File,                      // Required - CSV file
  images_zip: File,                // Required - ZIP file
  location_ids?: string,           // Optional - Comma-separated IDs
  extra_data?: File                // Optional - JSON file
}
```

### Response

**Success (200 OK)**:
```typescript
{
  success: true,
  request_id: string,
  message: string,
  products_processed: number,
  products_failed: number,
  validation_report: {
    request_id: string,
    status: "completed",
    total_rows: number,
    valid_rows: number,
    errors: [],
    warnings: ValidationWarning[],
    phase: string,
    phase_details: {}
  },
  data: {
    products: ProductResult[],
    total_images_uploaded: number
  },
  created_at: string
}
```

**Error (400 Bad Request)**:
```typescript
{
  detail: {
    message: string,
    phase: string,
    errors: Array<{
      message: string,
      row?: number,
      field?: string
    }>
  }
}
```

---

## Frontend Implementation Guide

### Step 1: Create Upload Component Structure

```typescript
// types.ts
export interface CatalogueUploadRequest {
  client_id: number;
  file: File;
  images_zip: File;
  location_ids?: string;
  extra_data?: File;
}

export interface ValidationError {
  row?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationReport {
  request_id: string;
  status: 'pending' | 'validating' | 'uploading' | 'completed' | 'failed';
  total_rows: number;
  valid_rows: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  phase: string;
  phase_details: Record<string, any>;
}

export interface CatalogueUploadResponse {
  success: boolean;
  request_id: string;
  message: string;
  products_processed: number;
  products_failed: number;
  validation_report?: ValidationReport;
  data?: {
    products: any[];
    total_images_uploaded: number;
  };
  created_at: string;
}
```

### Step 2: Implement File Validation (Client-Side)

```typescript
// utils/fileValidation.ts

export const validateCSVFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { valid: false, error: 'File must be a CSV file' };
  }
  
  // Check file size (10MB limit)
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `CSV file too large. Maximum size: ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

export const validateZIPFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return { valid: false, error: 'File must be a ZIP file' };
  }
  
  // Check file size (500MB limit)
  const maxSizeMB = 500;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `ZIP file too large. Maximum size: ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

export const validateCSVStructure = async (file: File): Promise<{ valid: boolean; error?: string; headers?: string[] }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        resolve({ valid: false, error: 'CSV file must contain at least a header row and one data row' });
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Check required columns
      const requiredColumns = ['id', 'Name', 'Category', 'Gender', 'Thumbnail Image Filename', 'Vton Ready Image Filename'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        resolve({ 
          valid: false, 
          error: `Missing required columns: ${missingColumns.join(', ')}` 
        });
        return;
      }
      
      resolve({ valid: true, headers });
    };
    
    reader.onerror = () => {
      resolve({ valid: false, error: 'Failed to read CSV file' });
    };
    
    reader.readAsText(file);
  });
};
```

### Step 3: Create Upload Service

```typescript
// services/catalogueUploadService.ts

import axios from 'axios';
import { CatalogueUploadRequest, CatalogueUploadResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export class CatalogueUploadService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token'); // Adjust based on your auth implementation
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  static async uploadCatalogue(
    request: CatalogueUploadRequest
  ): Promise<CatalogueUploadResponse> {
    const formData = new FormData();
    
    formData.append('client_id', request.client_id.toString());
    formData.append('file', request.file);
    formData.append('images_zip', request.images_zip);
    
    if (request.location_ids) {
      formData.append('location_ids', request.location_ids);
    }
    
    if (request.extra_data) {
      formData.append('extra_data', request.extra_data);
    }

    const response = await axios.post<CatalogueUploadResponse>(
      `${API_BASE_URL}/api/internal/catalogues/upload`,
      formData,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        // Set timeout for large uploads (5 minutes)
        timeout: 5 * 60 * 1000,
        // Track upload progress
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          // Emit progress event (implement event emitter or callback)
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      }
    );

    return response.data;
  }

  static async getCSVTemplate(): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/api/internal/catalogues/template`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }
}
```

### Step 4: Create React Component

```typescript
// components/CatalogueUpload.tsx

import React, { useState, useCallback } from 'react';
import { CatalogueUploadService } from '../services/catalogueUploadService';
import { CatalogueUploadRequest, CatalogueUploadResponse, ValidationError } from '../types';
import { validateCSVFile, validateZIPFile, validateCSVStructure } from '../utils/fileValidation';

interface CatalogueUploadProps {
  clientId: number;
  onUploadComplete?: (response: CatalogueUploadResponse) => void;
  onError?: (error: string) => void;
}

export const CatalogueUpload: React.FC<CatalogueUploadProps> = ({
  clientId,
  onUploadComplete,
  onError,
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [locationIds, setLocationIds] = useState<string>('');
  const [extraDataFile, setExtraDataFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [response, setResponse] = useState<CatalogueUploadResponse | null>(null);

  const handleCSVChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const csvValidation = validateCSVFile(file);
    if (!csvValidation.valid) {
      setValidationErrors([csvValidation.error!]);
      return;
    }

    const structureValidation = await validateCSVStructure(file);
    if (!structureValidation.valid) {
      setValidationErrors([structureValidation.error!]);
      return;
    }

    setCsvFile(file);
    setValidationErrors([]);
  }, []);

  const handleZIPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const zipValidation = validateZIPFile(file);
    if (!zipValidation.valid) {
      setValidationErrors([zipValidation.error!]);
      return;
    }

    setZipFile(file);
    setValidationErrors([]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile || !zipFile) {
      setValidationErrors(['Please select both CSV and ZIP files']);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setValidationErrors([]);
    setResponse(null);

    try {
      const request: CatalogueUploadRequest = {
        client_id: clientId,
        file: csvFile,
        images_zip: zipFile,
        location_ids: locationIds || undefined,
        extra_data: extraDataFile || undefined,
      };

      const result = await CatalogueUploadService.uploadCatalogue(request);
      
      setResponse(result);
      
      if (result.success) {
        onUploadComplete?.(result);
      } else {
        // Extract errors from validation report
        const errors = result.validation_report?.errors.map(
          err => `Row ${err.row || 'N/A'}: ${err.message}`
        ) || [result.message];
        setValidationErrors(errors);
        onError?.(result.message);
      }
    } catch (error: any) {
      let errorMessage = 'Upload failed';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail.errors)) {
          errorMessage = detail.errors.map(
            (e: ValidationError) => `Row ${e.row || 'N/A'}: ${e.message}`
          ).join('\n');
        } else {
          errorMessage = detail.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setValidationErrors([errorMessage]);
      onError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [csvFile, zipFile, locationIds, extraDataFile, clientId, onUploadComplete, onError]);

  return (
    <div className="catalogue-upload">
      <h2>Upload Catalogue</h2>
      
      <form onSubmit={handleSubmit}>
        {/* CSV File Input */}
        <div className="form-group">
          <label htmlFor="csv-file">
            CSV File (Required)
            <span className="required">*</span>
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleCSVChange}
            disabled={uploading}
            required
          />
          {csvFile && (
            <div className="file-info">
              <span>{csvFile.name}</span>
              <span className="file-size">
                ({(csvFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>

        {/* ZIP File Input */}
        <div className="form-group">
          <label htmlFor="zip-file">
            Images ZIP File (Required)
            <span className="required">*</span>
          </label>
          <input
            id="zip-file"
            type="file"
            accept=".zip"
            onChange={handleZIPChange}
            disabled={uploading}
            required
          />
          {zipFile && (
            <div className="file-info">
              <span>{zipFile.name}</span>
              <span className="file-size">
                ({(zipFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>

        {/* Location IDs Input */}
        <div className="form-group">
          <label htmlFor="location-ids">
            Location IDs (Optional)
            <small>Comma-separated location IDs. Leave empty to use CSV locations column.</small>
          </label>
          <input
            id="location-ids"
            type="text"
            value={locationIds}
            onChange={(e) => setLocationIds(e.target.value)}
            placeholder="1,2,3"
            disabled={uploading}
          />
        </div>

        {/* Extra Data File Input */}
        <div className="form-group">
          <label htmlFor="extra-data">
            Extra Data JSON (Optional)
          </label>
          <input
            id="extra-data"
            type="file"
            accept=".json"
            onChange={(e) => setExtraDataFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="error-box">
            <h4>Validation Errors:</h4>
            <ul>
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span>Uploading... {uploadProgress}%</span>
          </div>
        )}

        {/* Success Response */}
        {response?.success && (
          <div className="success-box">
            <h4>Upload Successful!</h4>
            <p>{response.message}</p>
            <ul>
              <li>Products Processed: {response.products_processed}</li>
              <li>Total Images Uploaded: {response.data?.total_images_uploaded}</li>
              {response.validation_report?.warnings.length > 0 && (
                <li>
                  Warnings: {response.validation_report.warnings.length}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !csvFile || !zipFile}
          className="submit-button"
        >
          {uploading ? 'Uploading...' : 'Upload Catalogue'}
        </button>
      </form>
    </div>
  );
};
```

---

## UI/UX Considerations

### 1. File Selection Interface

**Best Practices**:
- Use drag-and-drop for better UX
- Show file previews with size information
- Validate files immediately on selection
- Provide clear error messages

**Example Drag-and-Drop Component**:

```typescript
const FileDropZone: React.FC<{
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
}> = ({ onFileSelect, accept, label }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <p>{label}</p>
      <p className="hint">Drag and drop or click to select</p>
    </div>
  );
};
```

### 2. Progress Indication

**Requirements**:
- Show upload progress percentage
- Display current validation phase
- Provide estimated time remaining
- Allow cancellation (if possible)

**Example Progress Component**:

```typescript
const UploadProgress: React.FC<{
  progress: number;
  phase: string;
  onCancel?: () => void;
}> = ({ progress, phase, onCancel }) => {
  const phases = {
    phase1_upload_guards: 'Validating file sizes...',
    phase2_zip_validation: 'Checking ZIP structure...',
    phase3_cross_validation: 'Validating images...',
    phase4_image_validation: 'Checking image formats...',
    phase5_location_validation: 'Validating locations...',
    phase6_db_lookups: 'Checking database...',
    uploading: 'Uploading to S3...',
    completed: 'Completed!',
  };

  return (
    <div className="upload-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-info">
        <span>{phases[phase] || phase}</span>
        <span>{progress}%</span>
      </div>
      {onCancel && (
        <button onClick={onCancel} className="cancel-button">
          Cancel
        </button>
      )}
    </div>
  );
};
```

### 3. Error Display

**Requirements**:
- Group errors by type (validation, network, server)
- Show row numbers for CSV errors
- Highlight affected fields
- Provide actionable error messages

**Example Error Display**:

```typescript
const ErrorDisplay: React.FC<{
  errors: ValidationError[];
  warnings?: ValidationError[];
}> = ({ errors, warnings }) => {
  if (errors.length === 0 && (!warnings || warnings.length === 0)) {
    return null;
  }

  return (
    <div className="error-display">
      {errors.length > 0 && (
        <div className="errors">
          <h4>Errors ({errors.length})</h4>
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Field</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((error, idx) => (
                <tr key={idx}>
                  <td>{error.row || '-'}</td>
                  <td>{error.field || '-'}</td>
                  <td>{error.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {warnings && warnings.length > 0 && (
        <div className="warnings">
          <h4>Warnings ({warnings.length})</h4>
          <ul>
            {warnings.map((warning, idx) => (
              <li key={idx}>
                Row {warning.row || 'N/A'}: {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

### 4. Success Feedback

**Requirements**:
- Show summary statistics
- Display uploaded product count
- Link to view uploaded products
- Option to download validation report

---

## Error Handling

### Error Types

1. **Client-Side Validation Errors**
   - File type mismatch
   - File size exceeded
   - Missing required columns
   - Invalid CSV structure

2. **Network Errors**
   - Connection timeout
   - Network failure
   - Server unavailable

3. **Server Validation Errors**
   - Missing images in ZIP
   - Invalid category/brand
   - Location validation failures
   - Database constraint violations

### Error Handling Strategy

```typescript
const handleUploadError = (error: any): string[] => {
  const errors: string[] = [];

  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    if (status === 400) {
      // Validation errors
      if (data.detail?.errors) {
        errors.push(...data.detail.errors.map((e: ValidationError) => 
          `Row ${e.row || 'N/A'}: ${e.message}`
        ));
      } else if (data.detail?.message) {
        errors.push(data.detail.message);
      }
    } else if (status === 401) {
      errors.push('Authentication required. Please log in again.');
    } else if (status === 403) {
      errors.push('You do not have permission to upload catalogues.');
    } else if (status === 413) {
      errors.push('File too large. Please reduce file size.');
    } else if (status === 500) {
      errors.push('Server error. Please try again later.');
    }
  } else if (error.request) {
    // Request made but no response
    errors.push('Network error. Please check your connection.');
  } else {
    // Something else happened
    errors.push(error.message || 'An unexpected error occurred.');
  }

  return errors;
};
```

---

## Code Examples

### Complete React Hook Example

```typescript
// hooks/useCatalogueUpload.ts

import { useState, useCallback } from 'react';
import { CatalogueUploadService } from '../services/catalogueUploadService';
import { CatalogueUploadRequest, CatalogueUploadResponse } from '../types';

export const useCatalogueUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [response, setResponse] = useState<CatalogueUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (request: CatalogueUploadRequest) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResponse(null);

    try {
      const result = await CatalogueUploadService.uploadCatalogue(request);
      setResponse(result);
      
      if (!result.success) {
        setError(result.message);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail?.message || 
                          err.message || 
                          'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  return {
    upload,
    uploading,
    progress,
    response,
    error,
  };
};
```

### Usage in Component

```typescript
const MyComponent = () => {
  const { upload, uploading, response, error } = useCatalogueUpload();

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await upload({
        client_id: 1,
        file: formData.get('csv') as File,
        images_zip: formData.get('zip') as File,
      });
      
      if (result.success) {
        console.log(`Uploaded ${result.products_processed} products`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    // Your component JSX
  );
};
```

---

## Testing Guide

### Unit Tests

```typescript
// __tests__/catalogueUploadService.test.ts

import { CatalogueUploadService } from '../services/catalogueUploadService';

describe('CatalogueUploadService', () => {
  it('should upload catalogue successfully', async () => {
    const csvFile = new File(['id,Name\n1,Test'], 'test.csv', { type: 'text/csv' });
    const zipFile = new File([''], 'test.zip', { type: 'application/zip' });

    const result = await CatalogueUploadService.uploadCatalogue({
      client_id: 1,
      file: csvFile,
      images_zip: zipFile,
    });

    expect(result.success).toBe(true);
  });

  it('should handle validation errors', async () => {
    // Test error handling
  });
});
```

### Integration Tests

1. **Test CSV Validation**
   - Missing required columns
   - Invalid file format
   - File size limits

2. **Test ZIP Validation**
   - Missing product folders
   - Missing images
   - Invalid structure

3. **Test Upload Flow**
   - Successful upload
   - Partial failures
   - Network errors

---

## Best Practices

### 1. Client-Side Validation

**Always validate before upload**:
- Check file types
- Verify file sizes
- Validate CSV structure
- Preview data if possible

### 2. User Feedback

**Provide clear feedback**:
- Show upload progress
- Display validation status
- Highlight errors clearly
- Confirm successful uploads

### 3. Error Recovery

**Help users fix errors**:
- Show specific row numbers
- Highlight missing fields
- Provide download links for corrected CSV
- Allow retry with corrected files

### 4. Performance Optimization

**Optimize for large uploads**:
- Use chunked uploads for very large files (if API supports)
- Show progress indicators
- Allow cancellation
- Implement retry logic

### 5. Security

**Protect sensitive data**:
- Validate file types server-side (don't trust client)
- Sanitize file names
- Check file content, not just extension
- Implement rate limiting on frontend

---

## Troubleshooting

### Common Issues

#### 1. "CSV file too large"

**Solution**: 
- Check file size before upload
- Compress CSV if possible
- Split into multiple uploads

#### 2. "Missing required columns"

**Solution**:
- Use the template endpoint to get correct headers
- Validate CSV structure before upload
- Show user which columns are missing

#### 3. "Images not found in ZIP"

**Solution**:
- Verify ZIP structure matches CSV
- Check folder names match product IDs
- Ensure filenames match exactly (case-sensitive)

#### 4. "Network timeout"

**Solution**:
- Increase timeout for large uploads
- Show progress to user
- Implement retry logic
- Consider chunked uploads

#### 5. "Authentication error"

**Solution**:
- Check token expiration
- Refresh token before upload
- Show login prompt if expired

---

## Additional Resources

### API Documentation
- Full API docs: `CATALOGUE_UPLOAD_API.md`
- Template endpoint: `GET /api/internal/catalogues/template`

### Sample Files

**Sample CSV** (`sample_products.csv`):
```csv
id,Name,Brand,MRP,Category,Gender,Thumbnail Image Filename,Vton Ready Image Filename
SKU001,Test Product,TestBrand,1999.00,Formal shirts,Men,thumb.jpg,vton.jpg
```

**Sample ZIP Structure**:
```
images.zip
└── garments/
    └── SKU001/
        ├── thumb.jpg
        └── vton.jpg
```

---

## Support

For issues or questions:
1. Check error messages in response
2. Review validation report details
3. Consult API documentation
4. Contact backend team with `request_id`

---

**Last Updated**: 2026-01-14
**API Version**: 1.0.0

