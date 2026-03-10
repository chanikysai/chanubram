// src/services/reviewApi.ts
import { Review } from '../types/review'; // Assuming review.ts is in ../types

// Mock data storage - in a real app, this would be a database
let mockReviews: Review[] = [
  { id: 'r1', productId: 'p1', userId: 'u1', rating: 5, comment: 'Fantastic product! Highly recommend.', createdAt: new Date('2023-01-15T10:00:00Z') },
  { id: 'r2', productId: 'p1', userId: 'u2', rating: 4, comment: 'Good value for money.', createdAt: new Date('2023-01-20T11:30:00Z') },
  { id: 'r3', productId: 'p2', userId: 'u1', rating: 3, comment: 'It works as expected, but nothing special.', createdAt: new Date('2023-02-01T09:00:00Z') },
];

let nextReviewId = 4;

// Helper to simulate network delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches all reviews for a given product.
 * @param productId The ID of the product to fetch reviews for.
 * @returns A promise that resolves to an array of Review objects.
 */
export const getReviews = async (productId: string): Promise<Review[]> => {
  await simulateDelay(100); // Simulate network latency
  console.log(`API: Fetching reviews for product \${productId}`);
  const productReviews = mockReviews.filter(review => review.productId === productId);
  return productReviews;
};

/**
 * Submits a new review for a product.
 * @param productId The ID of the product being reviewed.
 * @param userId The ID of the user submitting the review.
 * @param rating The star rating (1-5).
 * @param comment The detailed review comment.
 * @returns A promise that resolves to the newly created Review object.
 * @throws Error if rating is out of bounds or comment is empty.
 */
export const submitReview = async (productId: string, userId: string, rating: number, comment: string): Promise<Review> => {
  await simulateDelay(150); // Simulate network latency

  if (rating < 1 || rating > 5) {
    console.error(`API Error: Rating must be between 1 and 5. Received: \${rating}`);
    throw new Error('Rating must be between 1 and 5.');
  }
  if (!comment || comment.trim().length === 0) {
    console.error('API Error: Comment cannot be empty.');
    throw new Error('Comment cannot be empty.');
  }

  const newReview: Review = {
    id: `r\${nextReviewId++}`,
    productId,
    userId,
    rating,
    comment: comment.trim(),
    createdAt: new Date(),
  };
  mockReviews.push(newReview);
  console.log(`API: Submitted review for product \${productId} by user \${userId}`);
  return newReview;
};

// Helper to calculate average rating
export const calculateAverageRating = (reviews: Review[]): number => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};
