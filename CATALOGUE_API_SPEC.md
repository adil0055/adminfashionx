# Catalogue Module API Specification

This document outlines the backend API endpoints required to support the Catalogue Management module (Upload & Manage).

## Base URL
`/api/internal`

---

## 1. Upload Catalogue
**Endpoint:** `POST /catalogues/upload`

**Description:**
Handles the bulk upload of product data via CSV and images via Zip. This endpoint must parse the CSV, handle the zip file extraction/storage, and associate products with the specified client and locations.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `client_id` | Text | Yes | The UUID of the client the catalogue belongs to. |
| `file` | File | Yes | The processed **CSV file** containing product data. |
| `images_zip` | File | Yes | A **Zip file** containing product images. Structure: `garments/{id}/{filename}`. |
| `location_ids` | Text | No | Comma-separated list of location UUIDs (e.g., `uuid1,uuid2`). <br> **Note:** If this field is missing or empty, the backend **MUST** look for a `locations` column inside the CSV file for per-row location assignment. |
| `extra_data` | File | No | A **JSON file** containing any extra columns detected in the CSV that do not match the standard schema. |

**CSV Schema (Standard Columns):**
The CSV `file` will contain the following headers (normalized by frontend):
- `id` (SKU/Product ID)
- `Name`
- `Brand`
- `MRP`
- `Discount %`
- `Category`
- `Sub_Category`
- `Gender`
- `Color`
- `Description`
- `Material Care`
- `sizes` (Semicolon separated, e.g., "S;M;L")
- `Thumbnail Image Filename`
- `Vton Ready Image Filename`
- `Other images filename`
- `locations` (Only if `location_ids` form field is not provided)

**Processing Logic:**
1.  **Validate Client:** Ensure `client_id` exists.
2.  **Handle Locations:**
    *   If `location_ids` is provided: Assign all products in this upload to these specific locations.
    *   If `location_ids` is missing: Parse the `locations` column in the CSV for each row. Validate that the locations exist for the client.
3.  **Process Images:**
    *   Unzip `images_zip`.
    *   For each product `id` in CSV, look for `garments/{id}/` folder in the zip.
    *   Upload images to object storage (S3/MinIO) and link them to the product.
4.  **Save Product:** Create/Update product records in the database.
5.  **Handle Extra Data:** If `extra_data` JSON is provided, store it (e.g., in a JSONB column `metadata` or similar).

**Response:**
*   `200 OK`: Upload successful.
*   `400 Bad Request`: Validation failed (missing files, invalid CSV format, etc.).

---

## 2. List Products
**Endpoint:** `GET /catalogues/client/{clientId}/products`

**Description:**
Fetches a list of all products associated with a specific client.

**Parameters:**
*   `clientId` (Path): UUID of the client.

**Response:**
*   `200 OK`: JSON array of product objects.

```json
[
  {
    "id": "945531067",
    "name": "3-pack Regular Fit T-shirts",
    "brand": "H&M",
    "price": 1199,
    "category": "tshirts",
    "image": "https://s3-bucket.../0945531067.jpg", // URL to thumbnail
    "locations": ["Location A", "Location B"]
  },
  ...
]
```

---

## 3. Delete Product
**Endpoint:** `DELETE /catalogues/products/{productId}`

**Description:**
Deletes a specific product and its associated data.

**Parameters:**
*   `productId` (Path): The unique ID (SKU) or database UUID of the product.

**Response:**
*   `200 OK`: Product deleted successfully.
*   `404 Not Found`: Product does not exist.

---

## 4. Update Product
**Endpoint:** `PUT /catalogues/products/{productId}`

**Description:**
Updates details of a specific product.

**Parameters:**
*   `productId` (Path): The unique ID of the product.

**Body (JSON):**
Partial update object.

```json
{
  "name": "New Product Name",
  "price": 1499,
  "discount": 20
  // ... any other editable fields
}
```

**Response:**
*   `200 OK`: Product updated successfully.

---

## 5. Client & Location Dependencies (Existing)
Ensure these existing endpoints are functioning as they are used by the Catalogue module:

*   `GET /clients`: List all clients.
*   `GET /clients/{id}`: Get client details, **MUST include a `locations` array** in the response.

**Expected `GET /clients/{id}` Response Structure:**
```json
{
  "id": "uuid...",
  "name": "Client Name",
  "locations": [
    { "id": "loc_1", "name": "Downtown Store", "address": "..." },
    { "id": "loc_2", "name": "Mall Outlet", "address": "..." }
  ]
}
```
