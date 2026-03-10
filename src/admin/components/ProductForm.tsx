import React, { useState, useEffect } from 'react';
import { Product } from '../types/product'; // Assuming Product type is defined in ../types/product

interface ProductFormProps {
    productToEdit?: Product;
    onSubmit: (productDetails: Omit<Product, 'id'>) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [stock, setStock] = useState<number | ''>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name || '');
            setDescription(productToEdit.description || '');
            setPrice(productToEdit.price || 0);
            setStock(productToEdit.stock || 0);
        } else {
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
        }
    }, [productToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !description || price === '' || stock === '') {
            setError('All fields are required.');
            return;
        }

        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const numericStock = typeof stock === 'string' ? parseInt(stock, 10) : stock;

        if (isNaN(numericPrice) || numericPrice < 0) {
            setError('Price must be a non-negative number.');
            return;
        }
        if (isNaN(numericStock) || numericStock < 0) {
            setError('Stock must be a non-negative integer.');
            return;
        }

        onSubmit({
            name,
            description,
            price: numericPrice,
            stock: numericStock,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h3>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
                    Product Name
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="product-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <div className="mt-1">
                    <textarea
                        id="product-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">
                        Price ($)
                    </label>
                    <div className="mt-1">
                        <input
                            type="number"
                            id="product-price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            step="0.01"
                            min="0"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700">
                        Stock Quantity
                    </label>
                    <div className="mt-1">
                        <input
                            type="number"
                            id="product-stock"
                            value={stock}
                            onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            min="0"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {productToEdit ? 'Update Product' : 'Add Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
