// src/pages/ProductPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';
import { fetchProductById, Product } from '../services/productApi';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL params
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID is missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedProduct = await fetchProductById(id);
        setProduct(fetchedProduct);
      } catch (err: any) {
        setError(err.message || 'Failed to load product.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]); // Re-run effect if ID changes

  return (
    <div style={{ padding: '20px' }}>
      <ProductDetail product={product} isLoading={isLoading} error={error} />
    </div>
  );
};

export default ProductPage;
