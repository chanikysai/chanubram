// src/vendor/pages/VendorProductsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../../types/product';
import { vendorApi } from '../../services/vendorApi';
import VendorProductForm from '../components/VendorProductForm';
import './VendorProductsPage.css'; // For page styling

const VendorProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form submission state

    // Fetch products on component mount
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await vendorApi.getProducts();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError('Could not load products. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddProductClick = () => {
        setEditingProduct(null); // Ensure it's for adding, not editing
        setIsFormOpen(true);
    };

    const handleEditProductClick = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleSubmitProduct = async (productData: Omit<Product, 'id' | 'vendorId'>) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (editingProduct) {
                // Update existing product
                const updatedProduct = await vendorApi.updateProduct(editingProduct.id, productData);
                setProducts(products.map(p => (p.id === editingProduct.id ? updatedProduct : p)));
            } else {
                // Add new product
                const newProduct = await vendorApi.createProduct(productData);
                setProducts([...products, newProduct]);
            }
            handleCloseForm(); // Close form after successful submission
        } catch (err) {
            console.error("Failed to save product:", err);
            setError('Failed to save product. Please check your inputs and try again.');
        } finally {
            setIsSubmitting(false);
            // Don't reset editingProduct here, as it's used to know if we are editing
        }
    };

    const handleDeleteProductClick = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setError(null);
            try {
                await vendorApi.deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
            } catch (err) {
                console.error("Failed to delete product:", err);
                setError('Failed to delete product. Please try again.');
            }
        }
    };

    return (
        <div className="vendor-products-page">
            <h1>My Products</h1>

            <button onClick={handleAddProductClick} className="add-product-button" disabled={isFormOpen || isLoading}>
                Add New Product
            </button>

            {error && <p className="error-message">{error}</p>}

            {isLoading && <p className="loading-message">Loading products...</p>}

            {!isLoading && !error && products.length === 0 && (
                <p>You haven't added any products yet. Click "Add New Product" to get started!</p>
            )}

            {!isLoading && !error && products.length > 0 && (
                <div className="products-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Inventory</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td><img src={product.imageUrl} alt={product.name} className="product-thumbnail" /></td>
                                    <td>{product.name}</td>
                                    <td>{product.description.substring(0, 50)}{product.description.length > 50 ? '...' : ''}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.inventory}</td>
                                    <td>
                                        <button onClick={() => handleEditProductClick(product)} disabled={isFormOpen || isSubmitting}>Edit</button>
                                        <button onClick={() => handleDeleteProductClick(product.id)} disabled={isFormOpen || isSubmitting}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isFormOpen && (
                <div className="product-form-overlay">
                    <VendorProductForm
                        product={editingProduct || undefined}
                        onSubmit={handleSubmitProduct}
                        onCancel={handleCloseForm}
                        isLoading={isSubmitting}
                    />
                </div>
            )}
        </div>
    );
};

export default VendorProductsPage;