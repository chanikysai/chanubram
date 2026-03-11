// src/components/ProductCard.tsx
import React from 'react';
import { Product } from '../types/product'; // Assuming Product type is defined in src/types/product.ts

// Placeholder for product type definition if src/types/product.ts doesn't exist or is incomplete
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   imageUrl: string;
//   inventory: number;
// }

interface ProductCardProps {
  product: Product;
  onClick: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = () => {
    onClick(product.id);
  };

  // Use placeholder image if imageUrl is missing or invalid
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/150';

  return (
    <div
      className="product-card"
      onClick={handleClick}
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%', // Ensure card takes full height of its container
      }}
      role="button"
      aria-label={`View details for ${product.name}`}
      tabIndex={0} // Make it focusable
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()} // Accessibility for keyboard users
    >
      <img
        src={imageUrl}
        alt={product.name}
        style={{
          width: '100%',
          height: '150px', // Fixed height for consistency
          objectFit: 'cover', // Cover the area, cropping if necessary
          borderRadius: '4px',
          marginBottom: '10px',
        }}
      />
      <h3 style={{ fontSize: '1.1em', margin: '10px 0 5px 0', color: '#333', fontWeight: '600' }}>
        {product.name}
      </h3>
      <p style={{ fontSize: '1em', color: '#007bff', fontWeight: 'bold', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ${product.price.toFixed(2)}
      </p>
      {/* You could add inventory status here if needed */}
      {/* <p style={{ fontSize: '0.8em', color: '#777' }}>Stock: {product.inventory}</p> */}
    </div>
  );
};

export default ProductCard;
