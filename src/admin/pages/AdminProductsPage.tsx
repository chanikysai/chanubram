import React, { useState, useEffect, useCallback } from 'react';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';
import { getProducts, addProduct, editProduct, deleteProduct } from '../services/adminProductApi';
import { Product } from '../types/product'; // Assuming Product type is defined in ../types/product

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to load products. Please try again later.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddProductClick = () => {
        setEditingProduct(null);
        setIsAddingNew(true);
    };

    const handleEditProductClick = (product: Product) => {
        setEditingProduct(product);
        setIsAddingNew(false);
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setError(null);
            try {
                await deleteProduct(id);
                // Optimistically update UI or re-fetch
                setProducts(products.filter(product => product.id !== id));
            } catch (err) {
                setError('Failed to delete product. Please try again.');
                console.error('Error deleting product:', err);
            }
        }
    };

    const handleFormSubmit = async (productDetails: Omit<Product, 'id'>) => {
        setError(null);
        try {
            if (editingProduct) {
                const updatedProduct = await editProduct(editingProduct.id, productDetails);
                setProducts(products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
                setEditingProduct(null);
            } else {
                const newProduct = await addProduct(productDetails);
                setProducts([...products, newProduct]);
                setIsAddingNew(false);
            }
        } catch (err) {
            setError('Failed to save product. Please check the details and try again.');
            console.error('Error saving product:', err);
        }
    };

    const handleFormCancel = () => {
        setEditingProduct(null);
        setIsAddingNew(false);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Product Management</h1>

            <div className="mb-6">
                <button
                    onClick={handleAddProductClick}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Add New Product
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading && <div className="text-center py-4">Loading products...</div>}

            {!loading && !error && (
                <>
                    {(isAddingNew || editingProduct) && (
                        <div className="mb-6">
                            <ProductForm
                                productToEdit={editingProduct || undefined}
                                onSubmit={handleFormSubmit}
                                onCancel={handleFormCancel}
                            />
                        </div>
                    )}

                    {!isAddingNew && !editingProduct && (
                        <ProductTable
                            products={products}
                            onEdit={handleEditProductClick}
                            onDelete={handleDeleteProduct}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default AdminProductsPage;
