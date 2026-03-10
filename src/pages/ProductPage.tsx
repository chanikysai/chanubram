// src/pages/ProductPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { Review } from '../types/review'; // Adjust path as needed
import { getReviews, submitReview, calculateAverageRating } from '../services/reviewApi'; // Adjust path as needed
import ReviewForm from '../components/ReviewForm'; // Adjust path as needed
import ReviewDisplay from '../components/ReviewDisplay'; // Adjust path as needed
import { Product } from '../types/product'; // Assuming a Product type exists
import { getProductById } from '../services/productApi'; // Assuming productApi.ts and Product type exist
import Recommendations from '../components/Recommendations'; // Import the Recommendations component

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>(); // Get productId from URL params
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Assuming a current user ID is available, e.g., from context or auth service
  const currentUser = { id: 'u1' }; // Mock user

  // Fetch product details and reviews on mount
  const loadProductData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setReviewError(null);
    try {
      // Use the actual API call to fetch product details
      const fetchedProduct = await getProductById(id);
      setProduct(fetchedProduct);

      const fetchedReviews = await getReviews(id);
      setReviews(fetchedReviews);
      setAverageRating(calculateAverageRating(fetchedReviews));
    } catch (err: any) {
      setError(err.message || 'Failed to load product data.');
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
      setReviewError(err.message || 'An unexpected error occurred.');
      throw err; // Re-throw to be caught by ReviewForm's onError
    }
  };

  if (loading) {
    return <div>Loading product...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    // This case should ideally be covered by the error state, but good as a fallback
    return <div>Product not found or an unknown error occurred.</div>;
  }

  return (
    <div className="product-page">
      <h1>{product.name}</h1>
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '300px', marginBottom: '20px' }} />}
      <p>{product.description}</p>
      <p><strong>Price: ${product.price.toFixed(2)}</strong></p>

      <hr />

      {/* Render Recommendations component here */}
      <Recommendations productId={product.id} />

      <hr />

      {currentUser?.id ? (
        <ReviewForm
          productId={product.id}
          userId={currentUser.id}
          onSubmit={handleReviewSubmit}
          onError={setReviewError}
        />
      ) : (
        <p>Please <a href="/login">log in</a> to leave a review.</p> // Placeholder for login link
      )}

      {reviewError && <p className="error-message" style={{ color: 'red' }}>{reviewError}</p>}

      <hr />

      <ReviewDisplay reviews={reviews} averageRating={averageRating} />
    </div>
  );
};

export default ProductPage;
