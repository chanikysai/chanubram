import React, { useState, useEffect } from 'react';
// Assuming Product type might be defined elsewhere or can be inferred for now.
// If it's needed, we'll create a type file later or import if available.
// For now, let's define a local interface that matches the structure seen in AdminProductForm.
interface VendorProduct {
  id?: string; // ID is optional for new products
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface VendorProductFormProps {
  product?: VendorProduct; // Product to edit, if any
  onSubmit: (productData: Omit<VendorProduct, 'id'>) => void; // Handler for form submission
  onCancel: () => void; // Handler for cancelling the form
}

const VendorProductForm: React.FC<VendorProductFormProps> = ({ product, onSubmit, onCancel }) => {
  // Initialize form state from the product prop, or empty for new products
  const [name, setName] = useState<string>(product?.name || '');
  const [description, setDescription] = useState<string>(product?.description || '');
  const [price, setPrice] = useState<string>(product?.price.toString() || '');
  const [stock, setStock] = useState<string>(product?.stock.toString() || '');
  const [imageUrl, setImageUrl] = useState<string>(product?.imageUrl || '');
  const [error, setError] = useState<string>('');

  // Effect to update form state if the 'product' prop changes (e.g., when switching from edit to add)
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setImageUrl(product.imageUrl || '');
    } else {
      // Reset form for new product creation
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageUrl('');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Basic validation
    if (!name || !description || !price || !stock) {
      setError('All fields except Image URL are required.');
      return;
    }

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock, 10);

    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Price must be a non-negative number.');
      return;
    }
    if (isNaN(numericStock) || numericStock < 0) {
      setError('Stock must be a non-negative integer.');
      return;
    }

    // Prepare product data for submission
    const productData = {
      name,
      description,
      price: numericPrice,
      stock: numericStock,
      imageUrl: imageUrl || undefined, // Use undefined if imageUrl is an empty string
    };

    onSubmit(productData); // Call the parent's submit handler
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        {product ? 'Edit Your Product' : 'Add a New Product'}
      </h2>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-1">
          <label htmlFor="vendorProductName" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="vendorProductName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="vendorProductPrice" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            id="vendorProductPrice"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="vendorProductStock" className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            id="vendorProductStock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="0"
            required
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="vendorProductImageUrl" className="block text-sm font-medium text-gray-700">
            Image URL (Optional)
          </label>
          <input
            type="text"
            id="vendorProductImageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="vendorProductDescription" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="vendorProductDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
        >
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
};

export default VendorProductForm;
