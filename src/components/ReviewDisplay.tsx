// src/components/ReviewDisplay.tsx
import React from 'react';
import { Review } from '../types/review';

interface ReviewDisplayProps {
  reviews: Review[];
  averageRating: number;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({ reviews, averageRating }) => {
  return (
    <div className="review-display" style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.8em', color: '#333' }}>
        Customer Reviews
        {averageRating > 0 && (
          <span style={{ marginLeft: '15px', fontSize: '0.8em', color: '#555', fontWeight: 'normal' }}>
            (Average Rating: {averageRating.toFixed(1)}/5)
          </span>
        )}
      </h3>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="reviews-list" style={{ display: 'grid', gap: '20px' }}>
          {reviews.map((review) => (
            <div key={review.id} className="review-item" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>Rating: {review.rating}/5</span>
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: '#555', lineHeight: '1.5' }}>{review.comment}</p>
              <p style={{ fontSize: '0.9em', color: '#888', marginTop: '10px' }}>By User: {review.userId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewDisplay;
