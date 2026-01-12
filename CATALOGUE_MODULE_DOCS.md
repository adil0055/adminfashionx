# Catalogue Management Module Documentation

## Overview
The Catalogue Management module allows administrators to manage product catalogues for different clients and locations. It consists of two main sections: **Manage Catalogues** and **Update Catalogues**.

## 1. Manage Catalogues
**Component:** `src/components/catalogues/ManageCatalogues.jsx`

This section provides a view of existing catalogues.
- **Client List**: Displays a list of clients.
- **Product Expansion**: Clicking on a client expands the view to show their associated products.
- **Actions**: Provides options to Edit or Delete specific products (integrated with backend APIs).

## 2. Update Catalogues (Upload Workflow)
**Component:** `src/components/catalogues/UpdateCatalogues.jsx`

This is the core feature for onboarding new product data. It features a robust, user-friendly workflow for validating and uploading CSV files.

### Key Features

#### A. Smart CSV Parsing
- **Robust Parser**: Uses a custom state-machine parser instead of simple split logic.
- **Complex Data Handling**: Correctly handles:
    - Newlines inside quoted fields (e.g., multi-line descriptions).
    - Commas inside quoted fields.
    - Escaped quotes (`""`).

#### B. Schema Validation & Normalization
- **Strict Schema**: Validates uploaded files against a predefined set of headers.
- **Required vs. Optional**:
    - **Required**: `product_id`, `Name`, `Brand`, `MRP`, `Category`, `Gender`, `Color`, `sizes`, `Thumbnail Image Filename`, `Vton Ready Image Filename`, `Other images filename`.
    - **Optional**: `Discount`, `Sub Category`, `Description`, `Material Care`.
- **Automatic Normalization**:
    - Reorders columns to match the expected schema.
    - Fills missing *optional* fields with `null`.
    - Removes empty rows automatically.

#### C. Extra Column Handling (Dynamic Schema)
- **Detection**: Automatically detects columns in the CSV that are *not* part of the standard schema.
- **Extraction**: Extracts data from these extra columns into a separate JSON object.
- **Storage**:
    - The extra data is saved as `extra_data.json`.
    - It is uploaded alongside the CSV as a separate part of the `FormData`.
- **User Feedback**: The UI explicitly lists which extra columns were detected and will be saved.

#### D. Data Persistence (Local Storage)
- **Crash Proofing**: If the user refreshes the page or leaves, their progress is saved.
- **Storage Keys**:
    - `pendingCatalogue`: The processed/normalized CSV content.
    - `pendingCatalogueName`: The original filename.
    - `pendingCatalogueExtras`: The extracted JSON for extra columns.
- **Auto-Load**: On returning to the page, the file and validation state are automatically restored.

#### E. UI/UX Design
- **Visual Style**: Modern "Glassmorphism" aesthetic with dark mode, gradients, and blur effects.
- **Drag & Drop**: Interactive file upload zone with hover states.
- **Real-time Feedback**:
    - **Validating**: Animated spinner during processing.
    - **Success**: Green success card with "Ready to Upload" status.
    - **Error**: Detailed list of validation errors (missing headers, empty required fields).
- **Schema Guide**: Built-in reference table showing all fields and requirements, plus a visual guide for VTON images.

## 3. API Integration
**Service:** `src/services/api.js`

- **Endpoints**:
    - `GET /clients`: Fetches list of clients.
    - `GET /clients/:id`: Fetches client details (locations).
    - `POST /catalogues/upload`: Uploads the processed CSV and `extra_data.json`.
        - Payload: `multipart/form-data`
        - Fields: `file` (CSV), `extra_data` (JSON file), `client_id`, `location_id`.

## 4. Workflow Summary
1.  **Select Client**: User chooses a target client and optional location.
2.  **Upload CSV**: User drags and drops a CSV file.
3.  **Client-Side Validation**:
    - File is parsed.
    - Structure is checked against schema.
    - Extra columns are identified.
4.  **Review**: User sees validation success/error and a list of any extra columns found.
5.  **Finish**: User clicks "Finish Upload".
    - Data is sent to the backend.
    - Local storage is cleared upon success.
