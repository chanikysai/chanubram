// src/components/ReviewDisplay.tsx
import React from 'react';
import { Review } from '../types/review'; // Adjust path as needed

interface ReviewDisplayProps {
  reviews: Review[];
  averageRating: number;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({ reviews, averageRating }) => {
  // Helper to render stars
  const renderStars = (rating: number) => {
    // Ensure rating is within bounds for star rendering
    const clampedRating = Math.max(0, Math.min(5, rating));
    const filledStars = '★'.repeat(clampedRating);
    const emptyStars = '☆'.repeat(5 - clampedRating);
    return (
      <span className="stars" aria-label={`${rating} out of 5 stars`}>
        {filledStars}
        {emptyStars}
      </span>
    );
  };

  // Calculate the average rating, ensuring it's a number and handling potential NaN/Infinity
  const displayAverageRating = isNaN(averageRating) || !isFinite(averageRating) ? 0 : averageRating;

  return (
    <div className="review-display">
      <h3>Customer Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet for this product.</p>
      ) : (
        <>
          <div className="average-rating" data-testid="average-rating-section">
            <h4>Average Rating:</h4>
            <p>
              {displayAverageRating.toFixed(1)} / 5.0 {renderStars(Math.round(displayAverageRating))}
            </p>
          </div>

          <div className="individual-reviews">
            <h4>Reviews:</h4>
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="user-name">{review.userId}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="review-rating">{renderStars(review.rating)}</div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewDisplay;
