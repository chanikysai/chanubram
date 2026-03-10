// src/__tests__/services/reviewApi.test.ts
import { getReviews, submitReview, calculateAverageRating } from '../../services/reviewApi';
import { Review } from '../../types/review';

// Mocking the global Date object to control timestamps for predictable tests
// We need to create a fresh mock instance for each test suite if module-level state is used.
// For simplicity in this context, we'll focus on functional tests without deep mocking of Date.
// However, for robust testing, one would typically mock Date.now or other time-related functions.

// Mock data - Note: In a real test environment, you'd reset module-level state like mockReviews.
// For demonstration purposes, we'll assume tests are somewhat isolated or focus on observable outcomes.
// A common pattern for resetting is to export a reset function from the module.
// For now, we will structure tests to be as independent as possible or test mutations.

describe('reviewApi', () => {
  // To ensure isolated tests, we should ideally reset the mockReviews array.
  // Assuming we have access to modify the module's internal state or a reset function.
  // For this example, we'll proceed without explicit reset, focusing on the logic.

  // --- Tests for getReviews ---
  test('getReviews should return reviews for a specific product', async () => {
    const productId = 'p1';
    const reviews = await getReviews(productId);
    expect(reviews).toHaveLength(2);
    expect(reviews.every(r => r.productId === productId)).toBe(true);
    expect(reviews[0]).toHaveProperty('id', 'r1');
  });

  test('getReviews should return an empty array for a product with no reviews', async () => {
    const productId = 'nonexistent-product';
    const reviews = await getReviews(productId);
    expect(reviews).toEqual([]);
  });

  // --- Tests for submitReview ---
  test('submitReview should add a new review and return it', async () => {
    const productId = 'p1';
    const userId = 'u3';
    const rating = 5;
    const comment = 'Excellent!';
    
    // Get initial count to verify addition
    const initialReviews = await getReviews(productId);
    const initialCount = initialReviews.length;

    const newReview = await submitReview(productId, userId, rating, comment);

    expect(newReview).toBeDefined();
    expect(newReview.productId).toBe(productId);
    expect(newReview.userId).toBe(userId);
    expect(newReview.rating).toBe(rating);
    expect(newReview.comment).toBe(comment);
    expect(newReview.createdAt).toBeInstanceOf(Date);

    // Verify it was added to the product's reviews
    const updatedReviews = await getReviews(productId);
    expect(updatedReviews).toHaveLength(initialCount + 1);
    expect(updatedReviews.find(r => r.id === newReview.id)).toBeDefined();
  });

  test('submitReview should throw an error for an empty comment', async () => {
    const productId = 'p1';
    const userId = 'u3';
    const rating = 5;
    const comment = '';

    await expect(submitReview(productId, userId, rating, comment)).rejects.toThrow('Comment cannot be empty.');
  });

  test('submitReview should throw an error for a comment with only whitespace', async () => {
    const productId = 'p1';
    const userId = 'u3';
    const rating = 4;
    const comment = '   ';

    await expect(submitReview(productId, userId, rating, comment)).rejects.toThrow('Comment cannot be empty.');
  });

  test('submitReview should throw an error for a rating less than 1', async () => {
    const productId = 'p1';
    const userId = 'u3';
    const rating = 0;
    const comment = 'Bad rating';

    await expect(submitReview(productId, userId, rating, comment)).rejects.toThrow('Rating must be between 1 and 5.');
  });

  test('submitReview should throw an error for a rating greater than 5', async () => {
    const productId = 'p1';
    const userId = 'u3';
    const rating = 6;
    const comment = 'Too high rating';

    await expect(submitReview(productId, userId, rating, comment)).rejects.toThrow('Rating must be between 1 and 5.');
  });

  // --- Tests for calculateAverageRating ---
  test('calculateAverageRating should compute the correct average for multiple reviews', () => {
    const reviews: Review[] = [
      { id: 'r1', productId: 'p1', userId: 'u1', rating: 5, comment: 'Great', createdAt: new Date() },
      { id: 'r2', productId: 'p1', userId: 'u2', rating: 4, comment: 'Good', createdAt: new Date() },
      { id: 'r3', productId: 'p1', userId: 'u3', rating: 3, comment: 'Okay', createdAt: new Date() },
    ];
    expect(calculateAverageRating(reviews)).toBe(4); // (5+4+3)/3 = 4
  });

  test('calculateAverageRating should return 0 for an empty array of reviews', () => {
    const reviews: Review[] = [];
    expect(calculateAverageRating(reviews)).toBe(0);
  });

  test('calculateAverageRating should return the rating of a single review', () => {
    const reviews: Review[] = [
      { id: 'r1', productId: 'p1', userId: 'u1', rating: 3, comment: 'Good', createdAt: new Date() },
    ];
    expect(calculateAverageRating(reviews)).toBe(3);
  });

  test('calculateAverageRating should handle non-integer average', () => {
    const reviews: Review[] = [
      { id: 'r1', productId: 'p1', userId: 'u1', rating: 5, comment: 'Great', createdAt: new Date() },
      { id: 'r2', productId: 'p1', userId: 'u2', rating: 4, comment: 'Good', createdAt: new Date() },
    ];
    expect(calculateAverageRating(reviews)).toBe(4.5); // (5+4)/2 = 4.5
  });
});
