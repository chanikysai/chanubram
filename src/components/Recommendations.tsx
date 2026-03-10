// src/components/Recommendations.tsx
import React, { useState, useEffect } from 'react';
import { Product, getRecommendations } from '../services/recommendationApi';
import ProductCard from './ProductCard'; // Assuming ProductCard exists and accepts Product props

// Define a prop type for the component
interface RecommendationsProps {
  productId: string; // The current product ID being viewed
  // Potentially userId if we want user-based recommendations later
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
        // In a real app, you might also pass a userId if available
        const data = await getRecommendations(productId);
        setRecommendedProducts(data);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError('Could not load recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    } else {
      setIsLoading(false); // No product ID, so no recommendations to fetch
    }
  }, [productId]); // Re-fetch if productId changes

  if (isLoading) {
    return <div className="recommendations-loading">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="recommendations-error">{error}</div>;
  }

  if (recommendedProducts.length === 0) {
    return <div className="recommendations-empty">No recommendations available at this time.</div>;
  }

  return (
    <div className="recommendations-section">
      <h2>Recommended for You</h2>
      <div className="recommendations-list">
        {recommendedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <style>{`
        .recommendations-section {
          margin-top: 40px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .recommendations-section h2 {
          margin-bottom: 20px;
          font-size: 1.5em;
          color: #333;
        }
        .recommendations-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        .recommendations-loading, .recommendations-error, .recommendations-empty {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        .recommendations-error {
          color: #d9534f;
        }
      `}</style>
    </div>
  );
};

export default Recommendations;
