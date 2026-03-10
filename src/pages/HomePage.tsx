// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProducts, Product } from '../services/productApi';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts); // Initialize filtered products with all products
      } catch (err: any) {
        setError(err.message || 'Failed to load products.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Effect to update filtered products when searchTerm or selectedCategory changes
  useEffect(() => {
    let results = products;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, products]);

  const handleProductClick = (product: Product) => {
    navigate(`/products/${product.id}`); // Navigate to product detail page
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Our Products</h1>

      {/* Search and Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '300px', maxWidth: '80%' }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '200px', maxWidth: '80%' }}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>}
      {error && <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>}

      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', justifyContent: 'center' }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onClick={handleProductClick} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              No products found matching your search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
