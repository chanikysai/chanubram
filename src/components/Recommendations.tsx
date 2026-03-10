// src/components/Recommendations.tsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../types/product';
import { getRecommendations, getPopularProducts } from '../services/recommendationApi';

interface RecommendationsProps {
  productId?: string; // Optional product ID to fetch related recommendations
}

const Recommendations: React.FC<RecommendationsProps> = ({ productId }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data: Product[] = [];
        if (productId) {
          data = await getRecommendations(productId);
        } else {
          // If no productId, fetch general popular products
          data = await getPopularProducts();
        }
        setRecommendedProducts(data);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Could not load recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]); // Re-fetch if productId changes

  return (
    <div className="recommendations-section" style={{ marginTop: '30px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '15px' }}>Recommended for You</h3>
      {isLoading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && recommendedProducts.length === 0 && (
        <p>No recommendations available at the moment.</p>
      )}
      {!isLoading && !error && recommendedProducts.length > 0 && (
        <div className="recommendations-list" style={{ display: 'flex', overflowX: 'auto', gap: '15px' }}>
          {recommendedProducts.map((product) => (
            <div key={product.id} style={{ flexShrink: 0, width: '200px' }}> {/* Fixed width for scrollable items */}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
