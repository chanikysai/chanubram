// src/components/ReviewForm.tsx
import React, { useState } from 'react';

interface ReviewFormProps {
  productId: string;
  userId: string; // Assuming user ID is passed down
  onSubmit: (reviewData: { productId: string; userId: string; rating: number; comment: string }) => void;
  onError: (error: string) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, userId, onSubmit, onError }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRating = parseInt(event.target.value, 10);
    setRating(isNaN(newRating) ? 0 : newRating);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      onError('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      onError('Please enter a comment.');
      return;
    }
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ productId, userId, rating, comment });
      // Clear form after successful submission
      setRating(0);
      setComment('');
    } catch (error: any) {
      onError(error.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate star rating options
  const starOptions = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Leave a Review</h3>
      <div className="rating-input">
        <label>Rating:</label>
        <div className="stars">
          {starOptions.map((star) => (
            <button
              key={star}
              type="button"
              className={`star-button \${star <= rating ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              disabled={isSubmitting}
              aria-label={`${star} out of 5 stars`}
            >
              &#9733; {/* Star character */}
            </button>
          ))}
        </div>
        {rating === 0 && <span className="error-message"> (Please select a rating)</span>}
      </div>
      <div className="comment-input">
        <label htmlFor="review-comment">Comment:</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={handleCommentChange}
          rows={4}
          placeholder="Share your thoughts on this product..."
          disabled={isSubmitting}
        />
        {comment.trim().length === 0 && rating > 0 && <span className="error-message"> (Comment is required)</span>}
      </div>
      <button type="submit" disabled={isSubmitting || rating === 0 || !comment.trim()}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
