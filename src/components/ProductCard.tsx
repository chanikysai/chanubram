// src/components/ProductCard.tsx
import React from 'react';
import { Product } from '../services/recommendationApi'; // Using the same Product interface for consistency

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', margin: '10px', textAlign: 'center', backgroundColor: '#fff' }}>
      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
      <h4 style={{ fontSize: '1.1em', margin: '10px 0 5px 0', color: '#333' }}>{product.name}</h4>
      <p style={{ fontSize: '1em', color: '#666', fontWeight: 'bold' }}>${product.price.toFixed(2)}</p>
      {/* Add a link to the product page, assuming routing is set up */}
      <a href={`/products/${product.id}`} style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
        View Details
      </a>
    </div>
  );
};

export default ProductCard;
