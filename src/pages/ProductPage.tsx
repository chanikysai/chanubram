// src/pages/ProductPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { Review } from '../types/review'; // Import the Review type
import { getReviews, submitReview, calculateAverageRating } from '../services/reviewApi'; // Import mock review API functions
import ReviewForm from '../components/ReviewForm'; // Import the ReviewForm component
import ReviewDisplay from '../components/ReviewDisplay'; // Import the ReviewDisplay component
import { Product } from '../types/product'; // Import the Product type
import { getProductById } from '../services/productApi'; // Import mock product API function
import Recommendations from '../components/Recommendations'; // Import the Recommendations component
import ProductDetail from '../components/ProductDetail'; // Import the ProductDetail component

// Mock current user for demonstration purposes. In a real app, this would come from auth context.
const currentUser = { id: 'u1', name: 'Alice' };

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>(); // Get productId from URL params
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch product details and reviews on mount
  const loadProductData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setReviewError(null);
    try {
      // Use the actual API call to fetch product details
      const fetchedProduct = await getProductById(id);
      setProduct(fetchedProduct);

      // Fetch reviews for the product
      const fetchedReviews = await getReviews(id);
      setReviews(fetchedReviews);
      setAverageRating(calculateAverageRating(fetchedReviews));
    } catch (err: any) {
      setError(err.message || 'Failed to load product data.');
      setProduct(null); // Clear product data on error
      setReviews([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  }, []); // useCallback to memoize

  useEffect(() => {
    if (productId) {
      loadProductData(productId);
    } else {
      setError('Product ID is missing.');
      setLoading(false);
    }
  }, [productId, loadProductData]);

  // Handle review submission
  const handleReviewSubmit = async (reviewData: { productId: string; userId: string; rating: number; comment: string }) => {
    setReviewError(null);
    try {
      const newReview = await submitReview(reviewData.productId, reviewData.userId, reviewData.rating, reviewData.comment);
      // Update local state with the new review and recalculate average
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      setAverageRating(calculateAverageRating(updatedReviews));
    } catch (err: any) {
      setReviewError(err.message || 'An unexpected error occurred during review submission.');
      throw err; // Re-throw to be caught by ReviewForm's error handling
    }
  };

  if (loading) {
    return <div>Loading product...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!product) {
    // This case should ideally be covered by the error state, but good as a fallback
    return <div>Product not found or an unknown error occurred.</div>;
  }

  return (
    <div className="product-page" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Product Information Section - Replaced with ProductDetail component */}
      <ProductDetail product={product} />

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

      {/* Recommendations Section */}
      <Recommendations productId={product.id} />

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

      {/* Reviews Section */}
      <div className="reviews-section" style={{ marginTop: '40px' }}>
        {currentUser?.id ? (
          <ReviewForm
            productId={product.id}
            userId={currentUser.id}
            onSubmit={handleReviewSubmit}
            onError={setReviewError}
          />
        ) : (
          <p>Please <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>log in</a> to leave a review.</p>
        )}

        {reviewError && <p className="error-message" style={{ color: 'red', marginTop: '15px' }}>{reviewError}</p>}

        <ReviewDisplay reviews={reviews} averageRating={averageRating} />
      </div>
    </div>
  );
};

export default ProductPage;
