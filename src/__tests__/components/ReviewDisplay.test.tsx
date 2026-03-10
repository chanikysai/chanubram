// src/__tests__/components/ReviewDisplay.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewDisplay from '../../components/ReviewDisplay';
import { Review } from '../../types/review';

describe('ReviewDisplay', () => {
  const mockReviews: Review[] = [
    { id: 'r1', productId: 'p1', userId: 'user1', rating: 5, comment: 'Amazing product!', createdAt: new Date('2023-01-15T10:00:00Z') },
    { id: 'r2', productId: 'p1', userId: 'user2', rating: 4, comment: 'Good value for money.', createdAt: new Date('2023-01-20T11:30:00Z') },
    { id: 'r3', productId: 'p1', userId: 'user3', rating: 3, comment: 'It was okay.', createdAt: new Date('2023-02-01T09:00:00Z') },
  ];

  // Happy path: Display reviews and average rating
  test('should display average rating and individual reviews when reviews are present', () => {
    const averageRating = 4.0; // (5+4+3)/3
    render(<ReviewDisplay reviews={mockReviews} averageRating={averageRating} />);

    // Check for average rating
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    expect(screen.getByText('Average Rating:')).toBeInTheDocument();
    expect(screen.getByText('4.0 / 5.0')).toBeInTheDocument();

    // Check for individual reviews
    expect(screen.getAllByText(/Amazing product!/i).length).toBe(1);
    expect(screen.getAllByText(/Good value for money./i).length).toBe(1);
    expect(screen.getAllByText(/It was okay./i).length).toBe(1);

    // Check for user names and dates
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('user3')).toBeInTheDocument();
    expect(screen.getByText(new Date(mockReviews[0].createdAt).toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(new Date(mockReviews[1].createdAt).toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(new Date(mockReviews[2].createdAt).toLocaleDateString())).toBeInTheDocument();
  });

  // Edge case: No reviews
  test('should display message when no reviews are present', () => {
    const averageRating = 0;
    render(<ReviewDisplay reviews={[]} averageRating={averageRating} />);

    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    expect(screen.getByText('No reviews yet for this product.')).toBeInTheDocument();
    expect(screen.queryByText('Average Rating:')).not.toBeInTheDocument();
    expect(screen.queryByText(/reviews:/i)).not.toBeInTheDocument();
  });

  // Edge case: Average rating calculation with non-integer result
  test('should display average rating with one decimal place', () => {
    const reviews: Review[] = [
      { id: 'r1', productId: 'p1', userId: 'user1', rating: 5, comment: 'Good', createdAt: new Date() },
      { id: 'r2', productId: 'p1', userId: 'user2', rating: 4, comment: 'Okay', createdAt: new Date() },
    ];
    const averageRating = 4.5; // (5+4)/2
    render(<ReviewDisplay reviews={reviews} averageRating={averageRating} />);

    expect(screen.getByText('4.5 / 5.0')).toBeInTheDocument();
  });

  // Test star rendering helper function specifically (if it were public or testable in isolation)
  // Since renderStars is a private helper, we test its output via the rendered component.
  // Testing star rendering based on rating:
  test('should render correct stars for different ratings', () => {
    const { rerender } = render(<ReviewDisplay reviews={[mockReviews[0]]} averageRating={5} />); // 5 stars
    const starsElement = screen.getAllByText('★')[0]; // Get the first star element
    expect(starsElement.textContent).toBe('★★★★★');

    rerender(<ReviewDisplay reviews={[mockReviews[2]]} averageRating={3} />); // 3 stars
    expect(screen.getByText('★★★☆☆')).toBeInTheDocument();

    rerender(<ReviewDisplay reviews={[{ ...mockReviews[0], rating: 1 }]} averageRating={1} />); // 1 star
    expect(screen.getByText('★☆☆☆☆')).toBeInTheDocument();
  });
});
