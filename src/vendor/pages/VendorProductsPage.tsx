import React, { useState, useEffect } from 'react';
import VendorProductForm from '../components/VendorProductForm'; // Import the new form component

// Define a type for VendorProduct matching the form's internal type
interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

// --- Mock API Functions for Vendor Products ---
// In a real application, these would be replaced by actual API calls
// to endpoints like /api/vendor/products, scoped to the logged-in vendor.

let vendorProductsData: Record<string, VendorProduct> = {
  'vp1': { id: 'vp1', name: 'Vendor Item A', description: 'A great product from Vendor A.', price: 15.75, stock: 100, imageUrl: '/images/vendor_a_1.png' },
  'vp2': { id: 'vp2', name: 'Vendor Item B', description: 'Another top-tier product from Vendor A.', price: 22.00, stock: 50, imageUrl: '/images/vendor_a_2.png' },
};
let nextVendorProductId = 3; // To generate IDs for new products

const mockFetchVendorProducts = async (): Promise<VendorProduct[]> => {
  console.log("Mock API: Fetching vendor products...");
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  // In a real app, this would fetch products specific to the logged-in vendor
  return Object.values(vendorProductsData);
};

const mockAddVendorProduct = async (productData: Omit<VendorProduct, 'id'>): Promise<VendorProduct> => {
  console.log("Mock API: Adding vendor product...", productData);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const newProduct: VendorProduct = {
    id: `vp${nextVendorProductId++}`,
    ...productData,
  };
  vendorProductsData[newProduct.id] = newProduct;
  return newProduct;
};

const mockUpdateVendorProduct = async (productId: string, productData: Omit<VendorProduct, 'id'>): Promise<VendorProduct> => {
  console.log(`Mock API: Updating vendor product \${productId}...`, productData);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  if (!vendorProductsData[productId]) {
    throw new Error('Product not found for update');
  }
  const updatedProduct: VendorProduct = {
    id: productId,
    ...productData,
  };
  vendorProductsData[productId] = updatedProduct;
  return updatedProduct;
};

const mockDeleteVendorProduct = async (productId: string): Promise<void> => {
  console.log(`Mock API: Deleting vendor product \${productId}...`);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  if (!vendorProductsData[productId]) {
    throw new Error('Product not found for deletion');
  }
  delete vendorProductsData[productId];
};
// --- End Mock API Functions ---

const VendorProductsPage: React.FC = () => {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products when the component mounts
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockFetchVendorProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch vendor products:", err);
      setError('Failed to load your products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productData: Omit<VendorProduct, 'id'>) => {
    setLoading(true);
    try {
      if (editingProduct) {
        await mockUpdateVendorProduct(editingProduct.id, productData);
        alert('Product updated successfully!');
        setEditingProduct(null); // Exit edit mode
      } else if (isAddingNew) {
        await mockAddVendorProduct(productData);
        alert('Product added successfully!');
        setIsAddingNew(false); // Exit add mode
      }
      fetchProducts(); // Refresh the product list
    } catch (err: any) {
      console.error("Failed to save product:", err);
      setError(`Failed to save product: ${err.message || 'Please check your inputs and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
  };

  const handleEditProduct = (product: VendorProduct) => {
    setEditingProduct(product);
    setIsAddingNew(false); // Ensure we are not in 'add new' mode
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await mockDeleteVendorProduct(productId);
        alert('Product deleted successfully!');
        fetchProducts(); // Refresh the list
      } catch (err: any) {
        console.error("Failed to delete product:", err);
        setError(`Failed to delete product: ${err.message || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAddProductForm = () => {
    setEditingProduct(null); // Close edit form if open
    setIsAddingNew(!isAddingNew);
  };

  // Placeholder for ProductTable component. In a real scenario, this would be imported.
  // For now, we'll render a simple list.
  const renderProductList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden p-4">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />
          )}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          </div>
          <div className="flex justify-end gap-x-2">
            <button
              onClick={() => handleEditProduct(product)}
              className="px-3 py-1 bg-yellow-400 text-white rounded-md shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {products.length === 0 && !loading && (
        <p className="text-center text-gray-500 col-span-full">You haven't added any products yet.</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Your Products</h1>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={toggleAddProductForm}
          className="px-5 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          {isAddingNew ? 'Cancel Adding Product' : 'Add New Product'}
        </button>
        {loading && <p className="text-blue-500">Loading...</p>}
        {error && <p className="text-red-500 w-full sm:w-auto text-center">Error: {error}</p>}
      </div>

      {(isAddingNew || editingProduct) && (
        <VendorProductForm
          product={editingProduct || undefined}
          onSubmit={handleSaveProduct}
          onCancel={handleCancelForm}
        />
      )}

      {/* Render the list of products */}
      {!loading && !error && renderProductList()}
      {loading && <p className="text-center text-gray-500">Loading your products...</p>}
    </div>
  );
};

export default VendorProductsPage;
