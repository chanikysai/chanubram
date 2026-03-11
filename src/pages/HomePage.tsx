import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getProductById } from '../services/productApi'; // Import product API functions
import { Product } from '../types/product'; // Import Product type
import ProductCard from '../components/ProductCard'; // Import the new ProductCard component
import './HomePage.css'; // Assuming CSS for styling

// Mock categories - in a real app, these would come from an API or be defined elsewhere
const mockCategories = [
  { id: 'cat_1', name: 'Apparel' },
  { id: 'cat_2', name: 'Footwear' },
  { id: 'cat_3', name: 'Accessories' },
];

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch products and initial data on component mount
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts); // Initialize filtered products with all products
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle category selection
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  // Apply filters based on search query and selected category
  useEffect(() => {
    let currentFilteredProducts = products;

    // Apply search filter
    if (searchQuery) {
      currentFilteredProducts = currentFilteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      // This assumes products have a 'category' property or can be mapped to categories
      // For now, we'll use a placeholder logic, assuming a category ID maps to a product
      // In a real scenario, product objects would likely have category IDs.
      // Let's assume a simplified mapping:
      if (selectedCategory === 'cat_1') { // Apparel
        currentFilteredProducts = currentFilteredProducts.filter(p => ['prod_1'].includes(p.id));
      } else if (selectedCategory === 'cat_2') { // Footwear
        currentFilteredProducts = currentFilteredProducts.filter(p => ['prod_3'].includes(p.id));
      } else if (selectedCategory === 'cat_3') { // Accessories
        currentFilteredProducts = currentFilteredProducts.filter(p => ['prod_4'].includes(p.id));
      } else {
        // If no category or unknown, show all (or nothing depending on desired behavior)
        // For now, no specific products for categories implies we show all if category is unselected.
        // If a category doesn't match any of our mock products, the list will be empty.
      }
    }

    setFilteredProducts(currentFilteredProducts);
  }, [searchQuery, selectedCategory, products]);

  // Handle clicking on a product card to navigate to its detail page
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Render loading state
  if (loading) {
    return <div className="home-page__loading">Loading products...</div>;
  }

  // Render error state
  if (error) {
    return <div className="home-page__error">Error: {error}</div>;
  }

  return (
    <div className="home-page">
      <header className="home-page__header">
        <h1>Product Catalog</h1>
        <p>Explore our wide range of products.</p>
      </header>

      <div className="home-page__controls">
        {/* Search Input */}
        <div className="home-page__search-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products by name or description..."
            className="home-page__search-input"
            aria-label="Search products"
          />
        </div>

        {/* Category Filter */}
        <div className="home-page__filter-wrapper">
          <label htmlFor="category-select" className="home-page__filter-label">Filter by Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="home-page__filter-select"
          >
            <option value="">All Categories</option>
            {mockCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="home-page__product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))
        ) : (
          <p className="home-page__no-products">
            {searchQuery || selectedCategory ? 'No products found matching your criteria.' : 'No products available at the moment.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
