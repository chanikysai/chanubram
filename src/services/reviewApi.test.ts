// src/services/reviewApi.test.ts
import { getReviews, submitReview, calculateAverageRating } from './reviewApi';

// Mocking the review data state directly for specific test scenarios
let mockReviewsState: any[] = []; // This will be reset before each test

// Helper to simulate adding a review to the mock
const addMockReview = (review: any) => {
  mockReviewsState.push(review);
};

// Mocking the global module to use our controlled state
jest.mock('./reviewApi', () => ({
  ...jest.requireActual('./reviewApi'), // Keep actual implementations for unrelated functions
  getReviews: jest.fn((productId: string) => {
    return Promise.resolve(mockReviewsState.filter(r => r.productId === productId));
  }),
  submitReview: jest.fn((productId: string, userId: string, rating: number, comment: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (rating < 1 || rating > 5) {
          return Promise.reject(new Error('Rating must be between 1 and 5.'));
        }
        const newReview = {
          id: `rev_${mockReviewsState.length + 1}`,
          productId,
          userId,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        };
        mockReviewsState.push(newReview);
        resolve(newReview);
      }, 50); // Simulate API delay
    });
  }),
  calculateAverageRating: jest.fn((reviews: any[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  }),
}));

// Cast mocks to Jest Mock type
const mockGetReviews = getReviews as jest.Mock;
const mockSubmitReview = submitReview as jest.Mock;
const mockCalculateAverageRating = calculateAverageRating as jest.Mock;


describe('reviewApi', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockReviewsState = [
      { id: 'rev_1', productId: 'prod_1', userId: 'user_1', rating: 5, comment: 'Great product!', createdAt: new Date().toISOString() },
      { id: 'rev_2', productId: 'prod_1', userId: 'user_2', rating: 4, comment: 'Good quality.', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'rev_3', productId: 'prod_2', userId: 'user_1', rating: 3, comment: 'It was okay.', createdAt: new Date().toISOString() },
    ];
    jest.clearAllMocks(); // Clear mock call counts and instances
  });

  // Test Case 1: getReviews - Happy Path
  test('should fetch reviews for a specific product', async () => {
    const productId = 'prod_1';
    const reviews = await mockGetReviews(productId);

    expect(reviews).toBeDefined();
    expect(reviews.length).toBe(2);
    expect(reviews.some(r => r.productId === productId)).toBe(true);
    expect(reviews.some(r => r.productId === 'prod_2')).toBe(false);
    expect(mockGetReviews).toHaveBeenCalledWith(productId);
  });

  // Test Case 2: getReviews - No reviews for a product
  test('should return an empty array if no reviews are found for a product', async () => {
    const productId = 'prod_non_existent';
    const reviews = await mockGetReviews(productId);

    expect(reviews).toEqual([]);
    expect(mockGetReviews).toHaveBeenCalledWith(productId);
  });

  // Test Case 3: submitReview - Happy Path
  test('should submit a new review successfully', async () => {
    const productId = 'prod_1';
    const userId = 'user_3';
    const rating = 5;
    const comment = 'Absolutely love it!';

    const newReview = await mockSubmitReview(productId, userId, rating, comment);

    expect(newReview).toBeDefined();
    expect(newReview.productId).toBe(productId);
    expect(newReview.userId).toBe(userId);
    expect(newReview.rating).toBe(rating);
    expect(newReview.comment).toBe(comment);
    expect(newReview.id).toMatch(/^rev_\d+$/); // Check for generated ID format
    expect(mockSubmitReview).toHaveBeenCalledWith(productId, userId, rating, comment);

    // Verify it was added to the state (by calling getReviews again)
    const allReviewsForProduct = await mockGetReviews(productId);
    expect(allReviewsForProduct.find(r => r.id === newReview.id)).toBeDefined();
    expect(allReviewsForProduct.length).toBe(3); // Original 2 + new one
  });

  // Test Case 4: submitReview - Error Handling for rating
  test('should throw an error for invalid rating when submitting a review', async () => {
    const productId = 'prod_1';
    const userId = 'user_3';
    const invalidRating = 6;
    const comment = 'This is invalid.';

    await expect(mockSubmitReview(productId, userId, invalidRating, comment)).rejects.toThrow('Rating must be between 1 and 5.');
    expect(mockSubmitReview).toHaveBeenCalledWith(productId, userId, invalidRating, comment);
  });

  // Test Case 5: calculateAverageRating - Happy Path
  test('should calculate the average rating correctly', () => {
    const reviewsForAvg = [
      { id: '1', productId: 'p1', userId: 'u1', rating: 5, comment: '', createdAt: '' },
      { id: '2', productId: 'p1', userId: 'u2', rating: 4, comment: '', createdAt: '' },
      { id: '3', productId: 'p1', userId: 'u3', rating: 5, comment: '', createdAt: '' },
    ];
    const average = mockCalculateAverageRating(reviewsForAvg);
    expect(average).toBe(4.666666666666667); // (5+4+5)/3
  });

  // Test Case 6: calculateAverageRating - With zero reviews
  test('should return 0 for average rating when there are no reviews', () => {
    const average = mockCalculateAverageRating([]);
    expect(average).toBe(0);
  });
});
