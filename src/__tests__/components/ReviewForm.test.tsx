// src/__tests__/components/ReviewForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewForm from '../../components/ReviewForm';

describe('ReviewForm', () => {
  const mockProductId = 'test-product-id';
  const mockUserId = 'test-user-id';
  const mockOnSubmit = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    render(<ReviewForm productId={mockProductId} userId={mockUserId} onSubmit={mockOnSubmit} onError={mockOnError} />);
  });

  // Happy path: Valid submission
  test('should submit review with valid rating and comment', async () => {
    // Select rating
    const starButton = screen.getByLabelText('3 out of 5 stars');
    fireEvent.click(starButton);

    // Enter comment
    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: 'This is a great product!' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    // Wait for submission to complete and form to clear
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        productId: mockProductId,
        userId: mockUserId,
        rating: 3,
        comment: 'This is a great product!',
      });
    });

    // Check if form fields are cleared
    // The rating display might change after clearing, so checking the button state or rating input value is more reliable.
    // The form state will reset, so the 'Please select a rating' message might reappear if rating is reset to 0.
    const currentRatingButton = screen.getByLabelText('0 out of 5 stars'); // Or check if the rating state is reset to 0
    expect(currentRatingButton).toBeInTheDocument(); // Assuming a visual indicator of rating reset
    expect((screen.getByPlaceholderText('Share your thoughts on this product...') as HTMLTextAreaElement).value).toBe('');
    expect(screen.getByRole('button', { name: /submit review/i })).toBeEnabled(); // Button should be enabled again
  });

  // Edge case: Rating not selected
  test('should show error message if rating is not selected', async () => {
    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: 'Some comment' } });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please select a star rating.');
      expect(screen.getByText('(Please select a rating)')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  // Edge case: Comment is empty
  test('should show error message if comment is empty', async () => {
    const starButton = screen.getByLabelText('4 out of 5 stars');
    fireEvent.click(starButton);

    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: '' } }); // Empty comment

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please enter a comment.');
      expect(screen.getByText('(Comment is required)')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  // Edge case: Comment is just whitespace
  test('should show error message if comment is only whitespace', async () => {
    const starButton = screen.getByLabelText('2 out of 5 stars');
    fireEvent.click(starButton);

    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: '   ' } }); // Whitespace comment

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please enter a comment.');
      expect(screen.getByText('(Comment is required)')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  // Test submission disabled state
  test('submit button should be disabled when rating is 0 or comment is empty', () => {
    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled(); // Initially disabled

    // Select rating
    const starButton = screen.getByLabelText('1 out of 5 stars');
    fireEvent.click(starButton);
    expect(submitButton).toBeDisabled(); // Still disabled because comment is empty

    // Enter comment
    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: 'Valid comment' } });
    expect(submitButton).toBeEnabled(); // Now enabled
  });

  // Test handling submission error from onSubmit prop
  test('should display error message if onSubmit callback throws an error', async () => {
    const submitError = new Error('Network error during submission');
    mockOnSubmit.mockRejectedValueOnce(submitError); // Mock submission to fail

    const starButton = screen.getByLabelText('5 out of 5 stars');
    fireEvent.click(starButton);

    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: 'Successful submission simulation' } });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Network error during submission');
    });
  });
});
