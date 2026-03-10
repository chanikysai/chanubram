// src/components/ReviewForm.tsx
import React, { useState } from 'react';
import { submitReview } from '../services/reviewApi'; // Assuming reviewApi is correctly imported

interface ReviewFormProps {
  productId: string;
  userId: string;
  onSubmit: (review: { productId: string; userId: string; rating: number; comment: string }) => Promise<void>;
  onError: (errorMessage: string | null) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, userId, onSubmit, onError }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRating(Number(event.target.value));
    onError(null); // Clear error when user starts typing
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
    onError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0 || comment.trim().length === 0) {
      onError('Please provide a rating and a comment.');
      return;
    }

    setIsSubmitting(true);
    onError(null); // Clear previous errors

    try {
      await onSubmit({ productId, userId, rating, comment });
      // Optionally reset form after successful submission
      setRating(0);
      setComment('');
    } catch (error: any) {
      onError(error.message || 'An unexpected error occurred while submitting the review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render stars for rating selection
  const renderStarSelector = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <label key={i}>
          <input
            type="radio"
            name="rating"
            value={i}
            checked={rating === i}
            onChange={handleRatingChange}
            disabled={isSubmitting}
            style={{ display: 'none' }} // Hide actual radio buttons
          />
          <span
            style={{
              cursor: 'pointer',
              fontSize: '2em',
              color: i <= rating ? 'gold' : 'grey',
              margin: '0 2px',
            }}
          >
            ★
          </span>
        </label>
      );
    }
    return <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>{stars}</div>;
  };


  return (
    <div className="review-form-container">
      <h4>Leave a Review</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="rating">Rating: </label>
          {renderStarSelector()}
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="comment">Your Review:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={handleCommentChange}
            rows={4}
            placeholder="Share your thoughts about this product..."
            disabled={isSubmitting}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc' }}
          />
        </div>

        <button type="submit" disabled={isSubmitting || rating === 0 || comment.trim().length === 0}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
