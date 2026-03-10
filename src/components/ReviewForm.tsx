// src/components/ReviewForm.tsx
import React, { useState } from 'react';

interface ReviewFormProps {
  productId: string;
  userId: string;
  onSubmit: (reviewData: { productId: string; userId: string; rating: number; comment: string }) => Promise<void>;
  onError: (error: string | null) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, userId, onSubmit, onError }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null); // Clear previous errors
    if (rating === 0) {
      onError('Please select a rating.');
      return;
    }
    if (!comment.trim()) {
      onError('Please enter a comment.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ productId, userId, rating, comment });
      setRating(0); // Reset form
      setComment('');
    } catch (err) {
      // Error is already set by the parent onError handler or API throw
      console.error('Review submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
      <h3>Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="rating">Rating: </label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={isSubmitting}
            style={{ marginLeft: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value={0}>Select Rating</option>
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>
                {star} {star === 1 ? 'star' : 'stars'}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="comment">Comment: </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            disabled={isSubmitting}
            placeholder="Share your thoughts about this product..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: isSubmitting || rating === 0 || !comment.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting || rating === 0 || !comment.trim() ? 'not-allowed' : 'pointer',
            fontSize: '1em'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
