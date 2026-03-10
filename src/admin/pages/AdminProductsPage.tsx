// src/admin/pages/AdminProductsPage.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types/product';
import * as adminProductApi from '../services/adminProductApi';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminProductApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    setLoading(true);
    try {
      if (editingProduct) {
        await adminProductApi.updateProduct(editingProduct.id, productData);
        alert('Product updated successfully!');
        setEditingProduct(null); // Exit edit mode
      } else if (isAddingNew) {
        await adminProductApi.createProduct(productData);
        alert('Product added successfully!');
        setIsAddingNew(false); // Exit add mode
      }
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error("Failed to save product:", err);
      setError('Failed to save product. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditOrAdd = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingNew(false); // Ensure we are not in 'add new' mode
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await adminProductApi.deleteProduct(productId);
        alert('Product deleted successfully!');
        fetchProducts(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete product:", err);
        setError('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAddProductForm = () => {
    setEditingProduct(null); // Close edit form if open
    setIsAddingNew(!isAddingNew);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h1>

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={toggleAddProductForm}
          className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {isAddingNew ? 'Close Add Product' : 'Add New Product'}
        </button>
        {loading && <p className="text-blue-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      {(isAddingNew || editingProduct) && (
        <div className="mb-6">
          <ProductForm
            product={editingProduct || undefined}
            onSubmit={handleSaveProduct}
            onCancel={handleCancelEditOrAdd}
          />
        </div>
      )}

      <ProductTable
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default AdminProductsPage;
