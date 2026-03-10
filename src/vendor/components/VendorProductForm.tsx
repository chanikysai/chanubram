// src/vendor/components/VendorProductForm.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Product } from '../../types/product';
import { vendorApi } from '../../services/vendorApi'; // Assuming this will be implemented
import './VendorProductForm.css'; // For basic styling

interface VendorProductFormProps {
    product?: Product; // Optional: for editing existing product
    onSubmit: (productData: Omit<Product, 'id' | 'vendorId'>) => void;
    onCancel: () => void;
    isLoading?: boolean; // To indicate if submission is in progress
}

const VendorProductForm: React.FC<VendorProductFormProps> = ({ product, onSubmit, onCancel, isLoading = false }) => {
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price.toString() || '');
    const [inventory, setInventory] = useState(product?.inventory.toString() || '');
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
    const [imageFile, setImageFile] = useState<File | null>(null); // To hold the actual file for upload
    const [error, setError] = useState('');

    const isEditing = !!product;

    // Effect to update state if 'product' prop changes (for editing)
    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price.toString() || '');
            setInventory(product.inventory.toString() || '');
            setImageUrl(product.imageUrl || '');
            setImageFile(null); // Clear file when editing to avoid re-uploading if not changed
        }
    }, [product]);

    // Basic validation function
    const validateForm = (): boolean => {
        if (!name.trim() || !description.trim() || !price || !inventory) {
            setError('All fields are required.');
            return false;
        }
        const numericPrice = parseFloat(price);
        const numericInventory = parseInt(inventory, 10);

        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError('Price must be a positive number.');
            return false;
        }
        if (isNaN(numericInventory) || numericInventory < 0) {
            setError('Inventory must be a non-negative integer.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setError(''); // Clear previous errors before submission

        const numericPrice = parseFloat(price);
        const numericInventory = parseInt(inventory, 10);

        const productData: Omit<Product, 'id' | 'vendorId'> = {
            name,
            description,
            price: numericPrice,
            inventory: numericInventory,
            // imageUrl will be handled by image upload logic, use placeholder if no image is set
            imageUrl: imageUrl || 'https://via.placeholder.com/150/default.png',
        };

        try {
            // If there's a new image file, we'd upload it here first
            // For now, we'll assume onSubmit handles the final data including imageUrl
            await onSubmit(productData);
            // On successful submit, clear form state if not editing
            if (!isEditing) {
                setName('');
                setDescription('');
                setPrice('');
                setInventory('');
                setImageUrl('');
                setImageFile(null);
            }
        } catch (err) {
            console.error("Form submission error:", err);
            setError('Failed to save product. Please check your inputs and try again.');
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file); // Store the file
            setImageUrl(URL.createObjectURL(file)); // Display a preview of the selected image
            setError(''); // Clear any previous errors
        } else {
            // If user cancels file selection
            setImageFile(null);
            // Revert to the existing imageUrl if editing, otherwise clear
            if (product && product.imageUrl) {
                setImageUrl(product.imageUrl);
            } else {
                setImageUrl('');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="vendor-product-form">
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label htmlFor="product-name">Product Name:</label>
                <input
                    type="text"
                    id="product-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="product-description">Description:</label>
                <textarea
                    id="product-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isLoading}
                ></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="product-price">Price ($):</label>
                <input
                    type="number"
                    id="product-price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="product-inventory">Inventory:</label>
                <input
                    type="number"
                    id="product-inventory"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    min="0"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="product-image">Image:</label>
                <input
                    type="file"
                    id="product-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                />
                {imageUrl && <img src={imageUrl} alt="Product Preview" className="product-image-preview" />}
            </div>
            <div className="form-actions">
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
                </button>
                <button type="button" onClick={onCancel} disabled={isLoading}>Cancel</button>
            </div>
        </form>
    );
};

export default VendorProductForm;