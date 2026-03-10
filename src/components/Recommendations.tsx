// src/components/Recommendations.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types/product'; // Assuming Product type is defined in src/types/product.ts
import { getRecommendations, getPopularProducts } from '../services/recommendationApi';

interface RecommendationsProps {
  productId?: string; // Optional product ID to get related recommendations
}

const Recommendations: React.FC<RecommendationsProps> = ({ productId }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        let products: Product[] = [];
        if (productId) {
          products = await getRecommendations(productId);
        } else {
          // If no productId, fetch general popular products
          products = await getPopularProducts();
        }
        setRecommendedProducts(products);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]); // Re-run effect if productId changes

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (recommendedProducts.length === 0) {
    return <div>No recommendations available at the moment.</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', margin: '20px 0' }}>
      <h3>Recommended for You</h3>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {recommendedProducts.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '200px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {/* Image rendering can be added here if imageUrl is valid */}
            {/* <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }} /> */}
            <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>${product.price.toFixed(2)}</p>
            <a href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'blue' }}>View Details</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
