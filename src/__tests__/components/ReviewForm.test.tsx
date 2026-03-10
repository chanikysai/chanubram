// src/__tests__/components/ReviewForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewForm from '../../components/ReviewForm';

// Mock the submitReview API call
const mockSubmitReview = jest.fn();
jest.mock('../../services/reviewApi', () => ({
  ...jest.mocked(require('../../services/reviewApi')), // Preserve other exports if any
  submitReview: (productId: string, userId: string, rating: number, comment: string) => mockSubmitReview(productId, userId, rating, comment),
}));

const mockProductId = 'p1';
const mockUserId = 'u1';
const mockOnSubmit = jest.fn();
const mockOnError = jest.fn();

describe('ReviewForm', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockSubmitReview.mockClear();
    mockOnSubmit.mockClear();
    mockOnError.mockClear();
    // Reset mock implementation for submitReview
    mockSubmitReview.mockResolvedValue({ id: 'r4', productId: mockProductId, userId: mockUserId, rating: 5, comment: 'Great!', createdAt: new Date() });
  });

  // Happy Path Test Case: Successful review submission
  test('should submit a review successfully with valid rating and comment', async () => {
    render(<ReviewForm productId={mockProductId} userId={mockUserId} onSubmit={mockOnSubmit} onError={mockOnError} />);

    // Select rating (e.g., 5 stars)
    const starLabel = screen.getByLabelText('★', { selector: 'label:nth-child(5)' }); // The 5th star label
    fireEvent.click(starLabel);

    // Enter comment
    const commentInput = screen.getByPlaceholderText('Share your thoughts about this product...');
    fireEvent.change(commentInput, { target: { value: 'This is a great product!' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);

    // Wait for the submitReview call to complete and for the form to reset
    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledTimes(1);
      expect(mockSubmitReview).toHaveBeenCalledWith(mockProductId, mockUserId, 5, 'This is a great product!');
    });

    // Check if onSubmit prop was called with correct data
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      productId: mockProductId,
      userId: mockUserId,
      rating: 5,
      comment: 'This is a great product!',
    });

    // Check if form fields are reset and error is cleared
    expect(screen.queryByText(/Please provide a rating/i)).not.toBeInTheDocument();
    expect(commentInput).toHaveValue('');
    // The star rating is not directly queryable by value, but its visual state implies reset if it reverts to default or is cleared.
    // For simplicity, we check the comment reset and rely on the fact that onSubmit would be called with cleared state if form reset worked.
    // A more robust check would involve ensuring the star selector resets its internal state if it's managed by a separate component or if its visual representation changes.
    // In this implementation, rating state will be 0 after reset.
    await waitFor(() => {
        // Re-render to check state changes if needed, but `onSubmit` should handle the reset.
        // The `onError(null)` is called within `handleSubmit` if submission is successful.
        expect(mockOnError).toHaveBeenCalledWith(null);
    });
  });

  // Edge Case Test Case: No rating selected
  test('should display an error if no rating is selected', () => {
    render(<ReviewForm productId={mockProductId} userId={mockUserId} onSubmit={mockOnSubmit} onError={mockOnError} />);

    // Enter comment
    const commentInput = screen.getByPlaceholderText('Share your thoughts about this product...');
    fireEvent.change(commentInput, { target: { value: 'This is a great product!' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);

    // Check if error message is displayed and API is not called
    expect(mockOnError).toHaveBeenCalledWith('Please provide a rating and a comment.');
    expect(mockSubmitReview).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Edge Case Test Case: Empty comment
  test('should display an error if the comment is empty', () => {
    render(<ReviewForm productId={mockProductId} userId={mockUserId} onSubmit={mockOnSubmit} onError={mockOnError} />);

    // Select rating (e.g., 3 stars)
    const starLabel = screen.getByLabelText('★', { selector: 'label:nth-child(3)' });
    fireEvent.click(starLabel);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);

    // Check if error message is displayed and API is not called
    expect(mockOnError).toHaveBeenCalledWith('Please provide a rating and a comment.');
    expect(mockSubmitReview).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Error Handling Test Case: API submission failure
  test('should display an error message if API submission fails', async () => {
    const apiError = new Error('Network error: Failed to submit review.');
    mockSubmitReview.mockRejectedValue(apiError); // Simulate API failure

    render(<ReviewForm productId={mockProductId} userId={mockUserId} onSubmit={mockOnSubmit} onError={mockOnError} />);

    // Select rating
    const starLabel = screen.getByLabelText('★', { selector: 'label:nth-child(4)' });
    fireEvent.click(starLabel);

    // Enter comment
    const commentInput = screen.getByPlaceholderText('Share your thoughts about this product...');
    fireEvent.change(commentInput, { target: { value: 'This is a good review.' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);

    // Wait for the API call and error handling
    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(apiError.message);
      expect(mockOnSubmit).not.toHaveBeenCalled(); // onSubmit prop should not be called on error
    });

    // Check if the submit button text changes to "Submitting..." and then back
    expect(screen.getByRole('button', { name: /Submitting.../i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit Review/i })).toBeInTheDocument();
    });
  });

  // Edge case: User clicks on stars multiple times or in different orders
  test('should correctly update rating when stars are clicked multiple times', async () => {
    render(<ReviewForm productId={mockProductId} userId={mockUserId} onSubmit={mockOnSubmit} onError={mockOnError} />);

    // Click 3 stars
    let starLabel = screen.getByLabelText('★', { selector: 'label:nth-child(3)' });
    fireEvent.click(starLabel);
    expect(screen.getByText('★').parentElement).toHaveStyle('color: grey'); // Check initial state if possible

    // Re-render or re-query to ensure state updates are reflected visually
    // The current implementation relies on the React state `rating` which is updated by handleRatingChange.
    // To visually confirm, we'd need to check the rendered stars' color.
    // Let's check the `rating` state indirectly by attempting submission.
    // However, direct visual check is better if possible.
    // For now, we trust `handleRatingChange` updates `rating` state.

    // Click 5 stars
    starLabel = screen.getByLabelText('★', { selector: 'label:nth-child(5)' });
    fireEvent.click(starLabel);

    // Enter comment
    const commentInput = screen.getByPlaceholderText('Share your thoughts about this product...');
    fireEvent.change(commentInput, { target: { value: 'Updated rating' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledTimes(1);
      expect(mockSubmitReview).toHaveBeenCalledWith(mockProductId, mockUserId, 5, 'Updated rating');
    });
  });

  // Edge case: Empty comment with rating, then add comment
  test('should allow submission after initially submitting with empty comment and then adding one', async () => {
    render(<ReviewForm productId={mockProductId} userId={mockUserId} onSubmit={mockOnSubmit} onError={mockOnError} />);

    // Select rating
    const starLabel = screen.getByLabelText('★', { selector: 'label:nth-child(3)' });
    fireEvent.click(starLabel);

    // Submit with empty comment
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Please provide a rating and a comment.');
      expect(mockSubmitReview).not.toHaveBeenCalled();
    });

    // Now add a comment
    const commentInput = screen.getByPlaceholderText('Share your thoughts about this product...');
    fireEvent.change(commentInput, { target: { value: 'This is a valid review now.' } });

    // Submit again
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledTimes(1);
      expect(mockSubmitReview).toHaveBeenCalledWith(mockProductId, mockUserId, 3, 'This is a valid review now.');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        productId: mockProductId,
        userId: mockUserId,
        rating: 3,
        comment: 'This is a valid review now.',
      });
    });
  });
});
