import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PencilSimple, Trash, Eye, CircleNotch, ArrowLeft, ArrowRight, X, CheckCircle, Warning } from '@phosphor-icons/react';
import Modal from '../common/Modal';

const ManageCatalogues = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('clients'); // 'clients' or 'products'
    
    // Pagination state
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 50,
        offset: 0
    });
    
    // Edit modal state
    const [editingProduct, setEditingProduct] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    
    // Delete confirmation state
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClient && viewMode === 'products') {
            fetchProducts(selectedClient.id, pagination.limit, pagination.offset);
        }
    }, [pagination.offset, pagination.limit, selectedClient, viewMode]);

    const fetchClients = async () => {
        try {
            const response = await api.clients.list();
            setClients(response.data || []);
        } catch (error) {
            console.error("Failed to fetch clients", error);
            setError("Failed to load clients");
        }
    };

    const handleViewCatalogue = async (client) => {
        setSelectedClient(client);
        setViewMode('products');
        setPagination({ total: 0, limit: 50, offset: 0 });
        setError(null);
    };

    const fetchProducts = async (clientId, limit = 50, offset = 0) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.catalogues.listProducts(clientId, limit, offset);
            
            // Handle response structure: { products: [], total, limit, offset }
            if (response.products) {
                setProducts(response.products);
                setPagination({
                    total: response.total || 0,
                    limit: response.limit || limit,
                    offset: response.offset || offset
                });
            } else if (Array.isArray(response)) {
                // Fallback for old response format
                setProducts(response);
                setPagination(prev => ({ ...prev, total: response.length }));
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            const errorMessage = error.data?.detail || error.message || "Failed to load products";
            setError(errorMessage);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setEditFormData({
            name: product.name || '',
            price: product.price || 0,
            discount: product.discount || 0,
            description: product.description || '',
            material_care: product.material_care || '',
            base_colour: product.base_colour || product.color || '',
            sizes: product.sizes || ''
        });
        setSaveError(null);
    };

    const handleSaveProduct = async () => {
        if (!editingProduct) return;
        
        setIsSaving(true);
        setSaveError(null);
        
        try {
            // Only send fields that have values
            const updateData = {};
            if (editFormData.name && editFormData.name !== editingProduct.name) {
                updateData.name = editFormData.name;
            }
            if (editFormData.price !== undefined && editFormData.price !== editingProduct.price) {
                updateData.price = parseFloat(editFormData.price);
            }
            if (editFormData.discount !== undefined) {
                updateData.discount = parseFloat(editFormData.discount);
            }
            if (editFormData.description) {
                updateData.description = editFormData.description;
            }
            if (editFormData.material_care) {
                updateData.material_care = editFormData.material_care;
            }
            if (editFormData.base_colour) {
                updateData.base_colour = editFormData.base_colour;
            }
            if (editFormData.sizes) {
                updateData.sizes = editFormData.sizes;
            }
            
            if (Object.keys(updateData).length === 0) {
                setSaveError("No changes to save");
                setIsSaving(false);
                return;
            }
            
            const response = await api.catalogues.updateProduct(editingProduct.id, updateData);
            
            if (response.success) {
                // Refresh products list
                await fetchProducts(selectedClient.id, pagination.limit, pagination.offset);
                setEditingProduct(null);
                alert(`Product updated successfully! Updated fields: ${response.updated_fields?.join(', ') || 'N/A'}`);
            } else {
                setSaveError(response.message || "Failed to update product");
            }
        } catch (error) {
            console.error("Failed to update product", error);
            const errorMessage = error.data?.detail || error.message || "Failed to update product";
            setSaveError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!deletingProduct) return;
        
        setIsDeleting(true);
        try {
            const response = await api.catalogues.deleteProduct(deletingProduct.id);
            
            if (response.success || !response.detail) {
                // Optimistically update UI
                setProducts(products.filter(p => p.id !== deletingProduct.id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                setDeletingProduct(null);
                alert("Product deleted successfully");
            } else {
                throw new Error(response.detail || "Failed to delete product");
            }
        } catch (error) {
            console.error("Failed to delete product", error);
            const errorMessage = error.data?.detail || error.message || "Failed to delete product";
            alert(`Delete failed: ${errorMessage}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePageChange = (newOffset) => {
        setPagination(prev => ({ ...prev, offset: newOffset }));
    };

    const handleNextPage = () => {
        if (pagination.offset + pagination.limit < pagination.total) {
            handlePageChange(pagination.offset + pagination.limit);
        }
    };

    const handlePreviousPage = () => {
        if (pagination.offset > 0) {
            handlePageChange(Math.max(0, pagination.offset - pagination.limit));
        }
    };

    return (
        <div className="animate-fade-in">
            {viewMode === 'clients' ? (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Email</th>
                                <th>ID</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {error ? error : "No clients found."}
                                    </td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id}>
                                        <td><span style={{ fontWeight: 600 }}>{client.display_name || client.name}</span></td>
                                        <td>{client.contact_email || client.email}</td>
                                        <td><code style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{client.id}</code></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleViewCatalogue(client)}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.85rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <Eye size={16} />
                                                View Catalogue
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="space-y-6">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    setViewMode('clients');
                                    setSelectedClient(null);
                                    setProducts([]);
                                    setError(null);
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                                Catalogue: <span style={{ color: 'var(--primary)' }}>{selectedClient?.display_name}</span>
                            </h3>
                        </div>
                        {pagination.total > 0 && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            background: 'rgba(244, 63, 94, 0.1)', 
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            color: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Warning size={20} weight="fill" />
                            <span>{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <CircleNotch size={32} className="spin" />
                            <p style={{ marginTop: '1rem' }}>Loading products...</p>
                        </div>
                    ) : (
                        <>
                            <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '80px' }}>Image</th>
                                            <th>Name</th>
                                            <th>Brand</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Locations</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <div style={{ 
                                                        width: '64px', 
                                                        height: '64px', 
                                                        borderRadius: '6px', 
                                                        overflow: 'hidden', 
                                                        backgroundColor: '#333',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<div style="color: #666; font-size: 0.75rem;">No Image</div>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center' }}>No Image</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td><span style={{ fontWeight: 500 }}>{product.name}</span></td>
                                                <td>{product.brand || 'N/A'}</td>
                                                <td>
                                                    <span className="status-capsule status-neutral">
                                                        {product.category || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>₹{product.price ? product.price.toFixed(2) : 'N/A'}</td>
                                                <td>
                                                    {product.locations && product.locations.length > 0 ? (
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                            {product.locations.slice(0, 2).join(', ')}
                                                            {product.locations.length > 2 && ` +${product.locations.length - 2} more`}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>None</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button 
                                                            onClick={() => handleEditProduct(product)}
                                                            className="icon-btn" 
                                                            title="Edit"
                                                        >
                                                            <PencilSimple size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingProduct(product)}
                                                            className="icon-btn"
                                                            title="Delete"
                                                            style={{ color: 'var(--danger)' }}
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No products found in this catalogue.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {pagination.total > pagination.limit && (
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={pagination.offset === 0}
                                        className="btn btn-secondary"
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '6px',
                                            opacity: pagination.offset === 0 ? 0.5 : 1,
                                            cursor: pagination.offset === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <ArrowLeft size={16} />
                                        Previous
                                    </button>
                                    
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                                    </span>
                                    
                                    <button
                                        onClick={handleNextPage}
                                        disabled={pagination.offset + pagination.limit >= pagination.total}
                                        className="btn btn-secondary"
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '6px',
                                            opacity: pagination.offset + pagination.limit >= pagination.total ? 0.5 : 1,
                                            cursor: pagination.offset + pagination.limit >= pagination.total ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Next
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <Modal
                    show={true}
                    onClose={() => setEditingProduct(null)}
                    title={`Edit Product: ${editingProduct.name}`}
                >
                    <div style={{ padding: '1.5rem' }}>
                        {saveError && (
                            <div style={{ 
                                padding: '0.75rem', 
                                borderRadius: '6px', 
                                background: 'rgba(244, 63, 94, 0.1)', 
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                color: 'var(--danger)',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Warning size={18} weight="fill" />
                                <span>{saveError}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Price (MRP)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editFormData.price || 0}
                                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Discount (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editFormData.discount || 0}
                                        onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={editFormData.description || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="form-input"
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Material & Care</label>
                                <input
                                    type="text"
                                    value={editFormData.material_care || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, material_care: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Base Colour</label>
                                <input
                                    type="text"
                                    value={editFormData.base_colour || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, base_colour: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Sizes (semicolon separated, e.g., S;M;L;XL)</label>
                                <input
                                    type="text"
                                    value={editFormData.sizes || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, sizes: e.target.value })}
                                    className="form-input"
                                    placeholder="S;M;L;XL"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="btn btn-secondary"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                className="btn btn-primary"
                                disabled={isSaving}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                {isSaving ? (
                                    <>
                                        <CircleNotch size={18} className="spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletingProduct && (
                <Modal
                    show={true}
                    onClose={() => setDeletingProduct(null)}
                    title="Delete Product"
                >
                    <div style={{ padding: '1.5rem' }}>
                        <p style={{ marginBottom: '1rem' }}>Are you sure you want to delete:</p>
                        <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>{deletingProduct.name}</p>
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            background: 'rgba(244, 63, 94, 0.1)', 
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{ color: 'var(--danger)', fontWeight: 500, marginBottom: '0.5rem' }}>
                                This will permanently delete:
                            </p>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                <li>Product images</li>
                                <li>Product attributes</li>
                                <li>Location assignments</li>
                            </ul>
                            <p style={{ color: 'var(--danger)', fontWeight: 500, marginTop: '0.5rem', marginBottom: 0 }}>
                                This action cannot be undone.
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={() => setDeletingProduct(null)}
                                className="btn btn-secondary"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                className="btn"
                                disabled={isDeleting}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    background: 'var(--danger)',
                                    color: '#fff',
                                    border: 'none'
                                }}
                            >
                                {isDeleting ? (
                                    <>
                                        <CircleNotch size={18} className="spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash size={18} />
                                        Delete Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ManageCatalogues;
