// src/services/reviewApi.ts
import { Review } from '../types/review';

// Mock review data
let mockReviews: Review[] = [
  { id: 'rev_1', productId: 'prod_1', userId: 'user_1', rating: 5, comment: 'Great product, highly recommend!', createdAt: new Date().toISOString() },
  { id: 'rev_2', productId: 'prod_1', userId: 'user_2', rating: 4, comment: 'Good quality, but a bit pricey.', createdAt: new Date(Date.now() - 86400000).toISOString() }, // 1 day ago
];

let nextReviewId = 3;

export const getReviews = async (productId: string): Promise<Review[]> => {
  console.log(`Mock API: Fetching reviews for product ID ${productId}`);
  await new Promise(resolve => setTimeout(resolve, 200));
  // Filter reviews for the specified product
  return mockReviews.filter(review => review.productId === productId);
};

export const submitReview = async (productId: string, userId: string, rating: number, comment: string): Promise<Review> => {
  console.log(`Mock API: Submitting review for product ID ${productId} by user ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 400));

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }

  const newReview: Review = {
    id: `rev_${nextReviewId++}`,
    productId,
    userId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };
  mockReviews.push(newReview);
  return newReview;
};

export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) {
    return 0;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};
