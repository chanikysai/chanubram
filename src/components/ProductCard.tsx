import React from 'react';
import { Product } from '../types/search';
import './ProductCard.css'; // Assuming CSS will be added

interface ProductCardProps {
  product: Product;
  onClick: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = () => {
    onClick(product.id);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <img src={product.imageUrl} alt={product.name} className="product-card__image" />
      <div className="product-card__details">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          {/* Display attributes that might be relevant for filtering */}
          {product.brand && <span className="product-card__attribute">Brand: {product.brand}</span>}
          {product.color && <span className="product-card__attribute">Color: {product.color}</span>}
          {product.size && <span className="product-card__attribute">Size: {product.size}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
