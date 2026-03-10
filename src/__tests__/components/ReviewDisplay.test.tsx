// src/__tests__/components/ReviewDisplay.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewDisplay from '../../components/ReviewDisplay';
import { Review } from '../../types/review';

describe('ReviewDisplay', () => {
  const mockReviews: Review[] = [
    { id: 'r1', productId: 'p1', userId: 'u1', rating: 5, comment: 'Excellent product!', createdAt: new Date('2023-01-15T10:00:00Z') },
    { id: 'r2', productId: 'p1', userId: 'u2', rating: 4, comment: 'Good value for money.', createdAt: new Date('2023-01-20T11:30:00Z') },
    { id: 'r3', productId: 'p1', userId: 'u3', rating: 3, comment: 'It works okay.', createdAt: new Date('2023-02-01T09:00:00Z') },
  ];

  // Happy Path Test Case: Displays average rating and individual reviews
  test('should display average rating and individual reviews correctly', () => {
    const averageRating = 4.0;
    render(<ReviewDisplay reviews={mockReviews} averageRating={averageRating} />);

    // Check for average rating section
    const avgRatingSection = screen.getByTestId('average-rating-section');
    expect(avgRatingSection).toBeInTheDocument();
    expect(screen.getByText('Average Rating:')).toBeInTheDocument();
    expect(screen.getByText('4.0 / 5.0')).toBeInTheDocument();
    // Check if stars are rendered for the average rating
    expect(avgRatingSection.querySelector('.stars')).toHaveTextContent('★★★★☆'); // 4 filled, 1 empty

    // Check for individual reviews
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    expect(screen.getAllByText(/Excellent product!|Good value for money.|It works okay./i)).toHaveLength(3);

    // Check a specific review's details
    const firstReview = screen.getByText('Excellent product!');
    expect(firstReview).toBeInTheDocument();
    // Find the parent review item to check related elements
    const firstReviewItem = firstReview.closest('.review-item');
    expect(firstReviewItem).toHaveTextContent('u1'); // User ID
    expect(firstReviewItem).toHaveTextContent(new Date(mockReviews[0].createdAt).toLocaleDateString()); // Date
    expect(firstReviewItem.querySelector('.review-rating')).toHaveTextContent('★★★★★'); // 5 filled stars
  });

  // Edge Case Test Case: No reviews are provided
  test('should display "No reviews yet" message when there are no reviews', () => {
    const averageRating = 0;
    render(<ReviewDisplay reviews={[]} averageRating={averageRating} />);

    expect(screen.getByText('No reviews yet for this product.')).toBeInTheDocument();
    expect(screen.queryByTestId('average-rating-section')).not.toBeInTheDocument();
    expect(screen.queryByText('Customer Reviews')).toBeInTheDocument(); // Section header is still present
  });

  // Edge Case Test Case: Average rating is 0
  test('should display average rating as 0.0 with zero stars when averageRating is 0', () => {
    const averageRating = 0;
    render(<ReviewDisplay reviews={[{ ...mockReviews[0], rating: 0, comment: 'No rating' }]} averageRating={averageRating} />); // Example review that results in 0 avg.

    const avgRatingSection = screen.getByTestId('average-rating-section');
    expect(avgRatingSection).toBeInTheDocument();
    expect(screen.getByText('0.0 / 5.0')).toBeInTheDocument();
    expect(avgRatingSection.querySelector('.stars')).toHaveTextContent('☆☆☆☆☆'); // 0 filled, 5 empty
  });

  // Edge Case Test Case: Average rating is a non-integer (e.g., 4.33)
  test('should display average rating correctly with decimal places and rounded stars', () => {
    const averageRating = 4.33; // e.g., (5+4+4)/3
    render(<ReviewDisplay reviews={[{...mockReviews[0], rating: 5}, {...mockReviews[1], rating: 4}, {...mockReviews[1], rating: 4}]} averageRating={averageRating} />);

    const avgRatingSection = screen.getByTestId('average-rating-section');
    expect(avgRatingSection).toBeInTheDocument();
    expect(screen.getByText('4.3 / 5.0')).toBeInTheDocument();
    // Math.round(4.33) is 4, so it should render 4 filled stars
    expect(avgRatingSection.querySelector('.stars')).toHaveTextContent('★★★★☆');
  });

  // Edge Case Test Case: Average rating is a high decimal (e.g., 4.66)
  test('should display average rating correctly with high decimal and rounded stars', () => {
    const averageRating = 4.66; // e.g., (5+5+4)/3
    render(<ReviewDisplay reviews={[{...mockReviews[0], rating: 5}, {...mockReviews[0], rating: 5}, {...mockReviews[1], rating: 4}]} averageRating={averageRating} />);

    const avgRatingSection = screen.getByTestId('average-rating-section');
    expect(avgRatingSection).toBeInTheDocument();
    expect(screen.getByText('4.7 / 5.0')).toBeInTheDocument();
    // Math.round(4.66) is 5, so it should render 5 filled stars
    expect(avgRatingSection.querySelector('.stars')).toHaveTextContent('★★★★★');
  });

  // Test case for renderStars helper with edge ratings
  test('renderStars helper should handle ratings outside 1-5 range gracefully', () => {
    // Render component to use the helper, though helper could be tested in isolation
    render(<ReviewDisplay reviews={[]} averageRating={0} />);
    const avgRatingSection = screen.getByTestId('average-rating-section'); // Use existing element to test helper contextually

    // Mock the helper directly for isolated testing if needed, but for now we check its output in component context
    // Test with rating 0
    const starsForZero = avgRatingSection.querySelector('.stars') as HTMLElement; // Assume it renders for 0 avg rating
    expect(starsForZero).toHaveTextContent('☆☆☆☆☆');

    // Test with rating 5
    const mockReviewWith5Stars: Review = { ...mockReviews[0], rating: 5 };
    render(<ReviewDisplay reviews={[mockReviewWith5Stars]} averageRating={5} />);
    const reviewItemWith5Stars = screen.getByText('Excellent product!').closest('.review-item');
    expect(reviewItemWith5Stars?.querySelector('.review-rating')?.querySelector('.stars')).toHaveTextContent('★★★★★');

    // Test with rating 1
    const mockReviewWith1Star: Review = { ...mockReviews[0], rating: 1, comment: 'Terrible' };
    render(<ReviewDisplay reviews={[mockReviewWith1Star]} averageRating={1} />);
    const reviewItemWith1Star = screen.getByText('Terrible').closest('.review-item');
    expect(reviewItemWith1Star?.querySelector('.review-rating')?.querySelector('.stars')).toHaveTextContent('★☆☆☆☆');

    // Test with rating > 5 (should clamp to 5)
    const mockReviewWith6Stars: Review = { ...mockReviews[0], rating: 6, comment: 'Too many stars' };
    render(<ReviewDisplay reviews={[mockReviewWith6Stars]} averageRating={6} />);
    const reviewItemWith6Stars = screen.getByText('Too many stars').closest('.review-item');
    expect(reviewItemWith6Stars?.querySelector('.review-rating')?.querySelector('.stars')).toHaveTextContent('★★★★★'); // Clamped to 5

    // Test with rating < 0 (should clamp to 0)
    const mockReviewWith0Stars: Review = { ...mockReviews[0], rating: -1, comment: 'No stars' };
    render(<ReviewDisplay reviews={[mockReviewWith0Stars]} averageRating={-1} />);
    const reviewItemWith0Stars = screen.getByText('No stars').closest('.review-item');
    expect(reviewItemWith0Stars?.querySelector('.review-rating')?.querySelector('.stars')).toHaveTextContent('☆☆☆☆☆'); // Clamped to 0
  });
});
