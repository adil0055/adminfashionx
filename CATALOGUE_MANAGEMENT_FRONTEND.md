# Catalogue Management API - Frontend Integration Guide

## Overview

This guide explains how to integrate the Catalogue Management API endpoints into your admin web interface. These endpoints allow you to list, update, and delete products for clients.

---

## Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/internal/catalogues/client/{clientId}/products` | List all products for a client |
| `PUT` | `/api/internal/catalogues/products/{productId}` | Update a product |
| `DELETE` | `/api/internal/catalogues/products/{productId}` | Delete a product |

---

## 1. List Products for Client

### Endpoint
```
GET /api/internal/catalogues/client/{clientId}/products
```

### Purpose
Fetches all products associated with a specific client across all their locations.

### Request

**URL Parameters:**
- `clientId` (path): Client organization ID (integer)

**Query Parameters:**
- `limit` (optional): Results per page (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Headers:**
```typescript
{
  'Authorization': 'Bearer {JWT_TOKEN}',
  'Content-Type': 'application/json'
}
```

### Response

**Success (200 OK):**
```json
{
  "products": [
    {
      "id": "123456789",
      "name": "3-pack Regular Fit T-shirts",
      "brand": "H&M",
      "price": 1199.00,
      "category": "T-shirts",
      "image": "https://s3-presigned-url.../person.jpeg",
      "locations": ["Location A", "Location B"]
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Error (404 Not Found):**
```json
{
  "detail": "Client 1 not found"
}
```

### Frontend Implementation

#### TypeScript Types

```typescript
interface ProductListItem {
  id: string;              // External product ID
  name: string;
  brand: string | null;
  price: number | null;    // MRP
  category: string | null;
  image: string | null;    // Presigned S3 URL (7-day expiry)
  locations: string[];     // Location names where product is assigned
}

interface ProductListResponse {
  products: ProductListItem[];
  total: number;
  limit: number;
  offset: number;
}
```

#### Service Function

```typescript
// services/catalogueService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export class CatalogueService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getClientProducts(
    clientId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ProductListResponse> {
    const response = await axios.get<ProductListResponse>(
      `${API_BASE_URL}/api/internal/catalogues/client/${clientId}/products`,
      {
        headers: this.getAuthHeaders(),
        params: { limit, offset },
      }
    );
    return response.data;
  }
}
```

#### React Component Example

```typescript
// components/ClientProductsList.tsx
import React, { useState, useEffect } from 'react';
import { CatalogueService } from '../services/catalogueService';
import { ProductListItem } from '../types';

interface ClientProductsListProps {
  clientId: number;
}

export const ClientProductsList: React.FC<ClientProductsListProps> = ({ clientId }) => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
  });

  useEffect(() => {
    loadProducts();
  }, [clientId, pagination.offset]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await CatalogueService.getClientProducts(
        clientId,
        pagination.limit,
        pagination.offset
      );
      
      setProducts(response.products);
      setPagination({
        total: response.total,
        limit: response.limit,
        offset: response.offset,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="client-products-list">
      <h2>Products ({pagination.total} total)</h2>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.image && (
              <img src={product.image} alt={product.name} />
            )}
            <h3>{product.name}</h3>
            <p>Brand: {product.brand || 'N/A'}</p>
            <p>Category: {product.category || 'N/A'}</p>
            <p>Price: ₹{product.price?.toFixed(2) || 'N/A'}</p>
            <p>Locations: {product.locations.join(', ') || 'None'}</p>
            <div className="product-actions">
              <button onClick={() => handleEdit(product.id)}>Edit</button>
              <button onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          onClick={handlePreviousPage} 
          disabled={pagination.offset === 0}
        >
          Previous
        </button>
        <span>
          Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
        </span>
        <button 
          onClick={handleNextPage}
          disabled={pagination.offset + pagination.limit >= pagination.total}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## 2. Update Product

### Endpoint
```
PUT /api/internal/catalogues/products/{productId}
```

### Purpose
Updates product details. Supports partial updates - only provided fields will be updated.

### Request

**URL Parameters:**
- `productId` (path): External product ID (string, e.g., "123456789")

**Body (JSON):**
```json
{
  "name": "Updated Product Name",
  "price": 1499.00,
  "discount": 20,
  "description": "Updated description",
  "material_care": "Cotton, Machine wash",
  "base_colour": "Blue",
  "sizes": "S;M;L;XL"
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Headers:**
```typescript
{
  'Authorization': 'Bearer {JWT_TOKEN}',
  'Content-Type': 'application/json'
}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product_id": "123456789",
  "updated_fields": ["name", "price", "discount"]
}
```

**Error (404 Not Found):**
```json
{
  "detail": "Product 123456789 not found"
}
```

**Error (400 Bad Request):**
```json
{
  "detail": "No fields provided for update"
}
```

### Frontend Implementation

#### TypeScript Types

```typescript
interface ProductUpdateRequest {
  name?: string;
  price?: number;          // MRP
  discount?: number;        // Discount percentage
  description?: string;
  material_care?: string;
  base_colour?: string;
  sizes?: string;
}

interface ProductUpdateResponse {
  success: boolean;
  message: string;
  product_id: string;
  updated_fields: string[];
}
```

#### Service Function

```typescript
// services/catalogueService.ts
static async updateProduct(
  productId: string,
  updateData: ProductUpdateRequest
): Promise<ProductUpdateResponse> {
  const response = await axios.put<ProductUpdateResponse>(
    `${API_BASE_URL}/api/internal/catalogues/products/${productId}`,
    updateData,
    {
      headers: this.getAuthHeaders(),
    }
  );
  return response.data;
}
```

#### React Component Example

```typescript
// components/ProductEditForm.tsx
import React, { useState } from 'react';
import { CatalogueService } from '../services/catalogueService';

interface ProductEditFormProps {
  product: ProductListItem;
  onUpdate: () => void;
  onCancel: () => void;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  product,
  onUpdate,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price || 0,
    discount: 0, // Would need to fetch from attributes
    description: '',
    material_care: '',
    base_colour: '',
    sizes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Only send fields that changed
      const updateData: any = {};
      if (formData.name !== product.name) updateData.name = formData.name;
      if (formData.price !== product.price) updateData.price = formData.price;
      if (formData.discount > 0) updateData.discount = formData.discount;
      if (formData.description) updateData.description = formData.description;
      if (formData.material_care) updateData.material_care = formData.material_care;
      if (formData.base_colour) updateData.base_colour = formData.base_colour;
      if (formData.sizes) updateData.sizes = formData.sizes;

      const response = await CatalogueService.updateProduct(product.id, updateData);
      
      alert(`Product updated! Updated fields: ${response.updated_fields.join(', ')}`);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-edit-form">
      <h3>Edit Product: {product.name}</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Price (MRP)</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Discount (%)</label>
        <input
          type="number"
          step="0.1"
          value={formData.discount}
          onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Material & Care</label>
        <input
          type="text"
          value={formData.material_care}
          onChange={(e) => setFormData({ ...formData, material_care: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Base Colour</label>
        <input
          type="text"
          value={formData.base_colour}
          onChange={(e) => setFormData({ ...formData, base_colour: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Sizes (semicolon separated)</label>
        <input
          type="text"
          value={formData.sizes}
          onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
          placeholder="S;M;L;XL"
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Product'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
```

---

## 3. Delete Product

### Endpoint
```
DELETE /api/internal/catalogues/products/{productId}
```

### Purpose
Deletes a product and all associated data (images, attributes, location assignments).

### Request

**URL Parameters:**
- `productId` (path): External product ID (string, e.g., "123456789")

**Headers:**
```typescript
{
  'Authorization': 'Bearer {JWT_TOKEN}',
  'Content-Type': 'application/json'
}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Product 123456789 deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "detail": "Product 123456789 not found"
}
```

### Frontend Implementation

#### Service Function

```typescript
// services/catalogueService.ts
static async deleteProduct(productId: string): Promise<void> {
  await axios.delete(
    `${API_BASE_URL}/api/internal/catalogues/products/${productId}`,
    {
      headers: this.getAuthHeaders(),
    }
  );
}
```

#### React Component Example

```typescript
// components/ProductDeleteDialog.tsx
import React, { useState } from 'react';
import { CatalogueService } from '../services/catalogueService';

interface ProductDeleteDialogProps {
  product: ProductListItem;
  onDelete: () => void;
  onCancel: () => void;
}

export const ProductDeleteDialog: React.FC<ProductDeleteDialogProps> = ({
  product,
  onDelete,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await CatalogueService.deleteProduct(product.id);
      alert('Product deleted successfully');
      onDelete();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-dialog">
      <h3>Delete Product</h3>
      
      <p>Are you sure you want to delete:</p>
      <p><strong>{product.name}</strong></p>
      <p className="warning">
        This will permanently delete the product and all associated data including:
        <ul>
          <li>Product images</li>
          <li>Product attributes</li>
          <li>Location assignments</li>
        </ul>
        This action cannot be undone.
      </p>

      {error && <div className="error">{error}</div>}

      <div className="dialog-actions">
        <button 
          onClick={handleDelete} 
          disabled={loading}
          className="danger"
        >
          {loading ? 'Deleting...' : 'Delete Product'}
        </button>
        <button onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};
```

---

## Complete Example: Product Management Page

```typescript
// pages/ClientProductsPage.tsx
import React, { useState } from 'react';
import { ClientProductsList } from '../components/ClientProductsList';
import { ProductEditForm } from '../components/ProductEditForm';
import { ProductDeleteDialog } from '../components/ProductDeleteDialog';
import { ProductListItem } from '../types';

export const ClientProductsPage: React.FC = () => {
  const [clientId] = useState(1); // From route params or context
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductListItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (productId: string) => {
    // Fetch full product details or use from list
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
    }
  };

  const handleDelete = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setDeletingProduct(product);
    }
  };

  const handleUpdateComplete = () => {
    setEditingProduct(null);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const handleDeleteComplete = () => {
    setDeletingProduct(null);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="client-products-page">
      <h1>Client Products Management</h1>
      
      <ClientProductsList 
        key={refreshKey}
        clientId={clientId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingProduct && (
        <div className="modal">
          <ProductEditForm
            product={editingProduct}
            onUpdate={handleUpdateComplete}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      )}

      {deletingProduct && (
        <div className="modal">
          <ProductDeleteDialog
            product={deletingProduct}
            onDelete={handleDeleteComplete}
            onCancel={() => setDeletingProduct(null)}
          />
        </div>
      )}
    </div>
  );
};
```

---

## Error Handling

### Common Error Scenarios

1. **404 Not Found**
   - Client doesn't exist
   - Product doesn't exist
   - **Solution**: Show user-friendly message, redirect or refresh

2. **401 Unauthorized**
   - Token expired or invalid
   - **Solution**: Redirect to login, refresh token

3. **400 Bad Request**
   - Invalid request data
   - No fields provided for update
   - **Solution**: Show validation errors, highlight form fields

4. **500 Internal Server Error**
   - Server error
   - **Solution**: Show generic error, log for debugging

### Error Handling Utility

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response) {
    const status = error.response.status;
    const detail = error.response.data?.detail;

    switch (status) {
      case 404:
        return detail || 'Resource not found';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 400:
        return detail || 'Invalid request data';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return detail || 'An error occurred';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};
```

---

## Best Practices

### 1. Loading States
Always show loading indicators during API calls:
```typescript
const [loading, setLoading] = useState(false);

// In component
{loading && <Spinner />}
```

### 2. Optimistic Updates
For better UX, update UI immediately, then sync with server:
```typescript
// Update local state first
setProducts(products.filter(p => p.id !== productId));

// Then call API
try {
  await CatalogueService.deleteProduct(productId);
} catch (err) {
  // Revert on error
  setProducts(originalProducts);
  showError('Failed to delete product');
}
```

### 3. Confirmation Dialogs
Always confirm destructive actions:
```typescript
if (!confirm('Are you sure you want to delete this product?')) {
  return;
}
```

### 4. Image Handling
- Presigned URLs expire after 7 days
- Cache images locally if needed
- Handle missing images gracefully

### 5. Pagination
- Implement infinite scroll or page-based pagination
- Show total count
- Disable next/previous buttons appropriately

---

## Testing

### Unit Tests

```typescript
// __tests__/catalogueService.test.ts
import { CatalogueService } from '../services/catalogueService';

describe('CatalogueService', () => {
  it('should fetch client products', async () => {
    const products = await CatalogueService.getClientProducts(1);
    expect(products.products).toBeInstanceOf(Array);
    expect(products.total).toBeGreaterThanOrEqual(0);
  });

  it('should update product', async () => {
    const response = await CatalogueService.updateProduct('123456789', {
      name: 'Updated Name',
    });
    expect(response.success).toBe(true);
    expect(response.updated_fields).toContain('name');
  });

  it('should delete product', async () => {
    await expect(
      CatalogueService.deleteProduct('123456789')
    ).resolves.not.toThrow();
  });
});
```

---

## Summary

The Catalogue Management API provides:
- ✅ **List Products**: View all products for a client with pagination
- ✅ **Update Products**: Partial updates with field-level tracking
- ✅ **Delete Products**: Cascade deletion of all related data
- ✅ **Image URLs**: Presigned S3 URLs (7-day expiry)
- ✅ **Location Info**: Shows which locations have the product

All endpoints require admin authentication and return detailed error messages for easy debugging.

