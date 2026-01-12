import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PencilSimple, Trash, Eye, CircleNotch } from '@phosphor-icons/react';

const ManageCatalogues = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('clients'); // 'clients' or 'products'

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.clients.list();
            setClients(response.data || []);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        }
    };

    const handleViewCatalogue = async (client) => {
        setSelectedClient(client);
        setViewMode('products');
        fetchProducts(client.id);
    };

    const fetchProducts = async (clientId) => {
        setIsLoading(true);
        try {
            const data = await api.catalogues.listProducts(clientId);
            setProducts(data || []);
        } catch (error) {
            console.error("Failed to fetch products", error);
            setProducts([
                { id: '945531067', name: '3-pack Regular Fit T-shirts', brand: 'H&M', price: 1199, category: 'tshirts', image: '0945531067.jpg' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.catalogues.deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
            } catch (error) {
                console.error("Failed to delete product", error);
                alert("Failed to delete product");
            }
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
                                        No clients found.
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
                                onClick={() => setViewMode('clients')}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px' }}
                            >
                                &larr; Back
                            </button>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                                Catalogue: <span style={{ color: 'var(--primary)' }}>{selectedClient?.display_name}</span>
                            </h3>
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <CircleNotch size={32} className="spin" />
                            <p style={{ marginTop: '1rem' }}>Loading products...</p>
                        </div>
                    ) : (
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>Image</th>
                                        <th>Name</th>
                                        <th>Brand</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id}>
                                            <td>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#333' }}>
                                                    <img
                                                        src={product.image || 'placeholder.jpg'}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            </td>
                                            <td><span style={{ fontWeight: 500 }}>{product.name}</span></td>
                                            <td>{product.brand}</td>
                                            <td><span className="status-capsule status-neutral">{product.category}</span></td>
                                            <td>₹{product.price || product.MRP}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button className="icon-btn" title="Edit">
                                                        <PencilSimple size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
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
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No products found in this catalogue.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ManageCatalogues;
