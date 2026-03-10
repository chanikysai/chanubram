// src/pages/HomePage.tsx - Updated to use Product type correctly
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard'; // Import ProductCard
import Recommendations from '../components/Recommendations'; // Import the Recommendations component
import type { Product } from '../types/product'; // Import Product type

// Mock product data for demonstration
const mockProducts: Record<string, Product> = {
  'p1': { id: 'p1', name: 'Awesome Gadget', price: 49.99, description: 'A truly awesome gadget.' },
  'p2': { id: 'p2', name: 'Super Widget', price: 19.50, description: 'A super widget for all your needs.' },
  'p3': { id: 'p3', name: 'Mega Tool', price: 120.00, description: 'The ultimate tool for professionals.' },
  'p4': { id: 'p4', name: 'Mini Gizmo', price: 15.75, description: 'A small, handy gizmo.' },
};

const HomePage: React.FC = () => {
  const products = Object.values(mockProducts);

  return (
    <div>
      <h1>Welcome to Our Store</h1>
      <p>Explore our products and add them to your cart!</p>

      <div className="product-list" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '20px' }}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Render the Recommendations component */}
      <div className="recommendations-container">
        <Recommendations />
      </div>

      <nav style={{ textAlign: 'center', marginTop: '20px' }}>
        <ul>
          <li>
            <Link to="/cart">Go to Cart</Link>
          </li>
          {/* Example links to specific product pages */}
          {products.map(product => (
            <li key={product.id}>
              <Link to={`/products/${product.id}`}>View {product.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;

