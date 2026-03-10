// src/components/ProductDetail.tsx - Updated to use Product type correctly
import React from 'react';
import type { Product } from '../types/product';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <p>{product.description || 'No description available.'}</p>
      <p>Price: ${product.price.toFixed(2)}</p>
    </div>
  );
};

export default ProductDetail;
