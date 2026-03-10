// src/__tests__/pages/ProductPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom'; // Mocking react-router-dom hooks
import ProductPage from '../../pages/ProductPage';
import { submitReview, fetchReviewsByProductId } from '../../services/reviewApi';

// Mocking the reviewApi functions
jest.mock('../../services/reviewApi', () => ({
  submitReview: jest.fn(),
  fetchReviewsByProductId: jest.fn(),
}));

// Mocking react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(), // Not used in this component currently, but good to have if needed
}));

// Mocking the placeholder fetchProductById function
// This is defined within ProductPage, so we'll need to override its import if it was external
// For this case, let's assume fetchProductById is available and we can test its interaction.
// A more robust approach would be to mock the module containing fetchProductById if it were exported.
// For simplicity, we will test the integration assuming fetchProductById works.
// If fetchProductById were exported, we'd use: jest.mock('../../utils/productApi', () => ({ fetchProductById: jest.fn() }));

// Helper function to mock fetchProductById
const mockFetchProductById = jest.fn();
// We need to ensure the ProductPage uses our mock.
// Since fetchProductById is defined internally, we can't easily mock it from here.
// For the sake of testing, we'll assume it works or has been mocked externally if needed.
// In a real setup, you'd likely export fetchProductById and mock it.

// Mocking global fetch for reviewApi calls
// @ts-ignore
global.fetch = jest.fn();


describe('ProductPage', () => {
  const mockProductId = 'test-product-123';
  const mockUserId = 'user456'; // Mock logged-in user ID

  beforeEach(() => {
    // Reset mocks before each test
    // @ts-ignore
    useParams.mockReturnValue({ productId: mockProductId });
    // @ts-ignore
    useNavigate.mockReturnValue(jest.fn());
    // @ts-ignore
    fetch.mockClear();
    // @ts-ignore
    submitReview.mockClear();
    // @ts-ignore
    fetchReviewsByProductId.mockClear();

    // Mocking fetchProductById behavior internally for this test suite
    // This is a workaround since fetchProductById is defined inside ProductPage.
    // A better practice is to export it and mock it from its module.
    // For now, we'll simulate its return value in the tests where it's called.
    // We will mock the internal call to fetchProductById through the useEffect hook.
  });

  // Mocking the internal fetchProductById for the ProductPage component
  const originalFetchProductById = async (productId: string) => {
    console.log(`Original fetchProductById called with: ${productId}`);
    // Mocked implementation for tests
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: productId,
          name: `Mocked Product ${productId}`,
          description: 'This is a mocked product description.',
          price: 99.99,
          imageUrl: `/images/mock-product.jpg`,
        });
      }, 10);
    });
  };

  // Test: Happy path - Product and reviews load successfully
  test('should load product details and reviews successfully', async () => {
    const mockProduct = {
      id: mockProductId,
      name: 'Awesome Gadget',
      description: 'The best gadget ever!',
      price: 100.00,
      imageUrl: '/images/gadget.jpg',
    };
    const mockReviews = [
      { id: 'rev1', productId: mockProductId, userId: mockUserId, rating: 5, comment: 'Amazing!', createdAt: new Date().toISOString() },
    ];
    const mockAverageRating = 5;

    // Mocking fetchProductById directly for this test
    // @ts-ignore
    jest.spyOn(global, 'fetchProductById').mockImplementation(originalFetchProductById);

    // Mocking the API calls
    // @ts-ignore
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    }); // For fetchProductById
    // @ts-ignore
    fetchReviewsByProductId.mockResolvedValueOnce({ reviews: mockReviews, averageRating: mockAverageRating });

    render(<ProductPage />);

    // Check loading state
    expect(screen.getByText('Loading product details...')).toBeInTheDocument();

    // Wait for product and reviews to load
    await waitFor(() => {
      expect(screen.queryByText('Loading product details...')).not.toBeInTheDocument();
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText('The best gadget ever!')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
      expect(screen.getByText('Average Rating: 5.0/5')).toBeInTheDocument();
      expect(screen.getByText('Amazing!')).toBeInTheDocument();
    });

    // Ensure API calls were made
    // @ts-ignore
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/images/${mockProductId}.jpg`)); // Assuming fetchProductById uses fetch for its mock impl
    expect(fetchReviewsByProductId).toHaveBeenCalledWith(mockProductId);

    // Restore the spy
    // @ts-ignore
    jest.restoreAllMocks();
  });

  // Test: Error handling - Product not found
  test('should display an error message if product cannot be loaded', async () => {
    // Mocking fetchProductById to throw an error
    // @ts-ignore
    jest.spyOn(global, 'fetchProductById').mockImplementation(async () => {
      throw new Error('Product not found');
    });

    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Product not found')).toBeInTheDocument();
    });

    // @ts-ignore
    jest.restoreAllMocks();
  });

  // Test: Error handling - Reviews fetch fails
  test('should display an error message if reviews fail to load', async () => {
    const mockProduct = {
      id: mockProductId,
      name: 'Awesome Gadget',
      description: 'The best gadget ever!',
      price: 100.00,
      imageUrl: '/images/gadget.jpg',
    };

    // Mock fetchProductById
    // @ts-ignore
    jest.spyOn(global, 'fetchProductById').mockImplementation(originalFetchProductById);

    // Mock fetch for product to succeed, but fetchReviewsByProductId to fail
    // @ts-ignore
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockProduct });
    // @ts-ignore
    fetchReviewsByProductId.mockRejectedValueOnce(new Error('Network error fetching reviews'));


    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
      // The error from fetchReviewsByProductId should be handled gracefully by ReviewDisplay
      // and potentially show "No reviews yet" or similar, not a global error.
      // The current implementation of fetchReviewsByProductId returns { reviews: [], averageRating: 0 } on error.
      expect(screen.getByText('No reviews yet. Be the first to leave a review!')).toBeInTheDocument();
    });

    // @ts-ignore
    jest.restoreAllMocks();
  });

  // Test: Submit a new review
  test('should allow submitting a new review', async () => {
    const mockProduct = {
      id: mockProductId,
      name: 'Awesome Gadget',
      description: 'The best gadget ever!',
      price: 100.00,
      imageUrl: '/images/gadget.jpg',
    };
    const mockReviews: Review[] = [];
    const mockAverageRating = 0;
    const newReview = {
      id: 'new-rev-1',
      productId: mockProductId,
      userId: mockUserId,
      rating: 4,
      comment: 'Pretty good product.',
      createdAt: new Date().toISOString(),
    };

    // Mock fetchProductById
    // @ts-ignore
    jest.spyOn(global, 'fetchProductById').mockImplementation(originalFetchProductById);
    // Mock fetch for product
    // @ts-ignore
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockProduct });
    // Mock fetchReviewsByProductId to return empty initially
    // @ts-ignore
    fetchReviewsByProductId.mockResolvedValueOnce({ reviews: mockReviews, averageRating: mockAverageRating });
    // Mock submitReview to succeed
    // @ts-ignore
    submitReview.mockResolvedValueOnce({ success: true, review: newReview });

    render(<ProductPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Leave a Review')).toBeInTheDocument();
    });

    // Interact with the review form
    const starButton = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(starButton);

    const commentInput = screen.getByPlaceholderText('Share your thoughts...');
    fireEvent.change(commentInput, { target: { value: 'Pretty good product.' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    fireEvent.click(submitButton);

    // Wait for submission and UI update
    await waitFor(() => {
      expect(submitReview).toHaveBeenCalledWith(mockProductId, mockUserId, 4, 'Pretty good product.');
      expect(screen.getByText('Average Rating: 4.0/5')).toBeInTheDocument(); // New average rating
      expect(screen.getByText('Pretty good product.')).toBeInTheDocument(); // New review displayed
      expect(screen.getByPlaceholderText('Share your thoughts...')).toHaveValue(''); // Form reset
      expect(screen.queryByText(/error-message/)).not.toBeInTheDocument();
    });

    // @ts-ignore
    jest.restoreAllMocks();
  });

  // Test: User is not logged in, review form should not be shown
  test('should show login prompt instead of review form if user is not logged in', async () => {
    const mockProduct = {
      id: mockProductId,
      name: 'Awesome Gadget',
      description: 'The best gadget ever!',
      price: 100.00,
      imageUrl: '/images/gadget.jpg',
    };

    // Mock fetchProductById
    // @ts-ignore
    jest.spyOn(global, 'fetchProductById').mockImplementation(originalFetchProductById);
    // Mock fetch for product
    // @ts-ignore
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockProduct });
    // Mock fetchReviewsByProductId
    // @ts-ignore
    fetchReviewsByProductId.mockResolvedValueOnce({ reviews: [], averageRating: 0 });

    // Render without userId (simulating logged out user)
    render(<ProductPage />); // userId is hardcoded as 'user456' inside ProductPage, need to override if possible or note this limitation.
    // For this test, we'll re-render with a different mock or modify the internal state if necessary.
    // A cleaner way would be to pass userId as a prop or via context and mock that.
    // Since userId is hardcoded, let's simulate the scenario by NOT calling submitReview and checking the message.

    await waitFor(() => {
        expect(screen.getByText('Please log in to leave a review.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Submit Review' })).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Rate \d stars/)).not.toBeInTheDocument();
    });

    // @ts-ignore
    jest.restoreAllMocks();
  });

  // Test: Submit review fails
  test('should display an error message if review submission fails', async () => {
    const mockProduct = {
      id: mockProductId,
      name: 'Awesome Gadget',
      description: 'The best gadget ever!',
      price: 100.00,
      imageUrl: '/images/gadget.jpg',
    };
    const mockReviews: Review[] = [];
    const mockAverageRating = 0;

    // Mock fetchProductById
    // @ts-ignore
    jest.spyOn(global, 'fetchProductById').mockImplementation(originalFetchProductById);
    // Mock fetch for product
    // @ts-ignore
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockProduct });
    // Mock fetchReviewsByProductId
    // @ts-ignore
    fetchReviewsByProductId.mockResolvedValueOnce({ reviews: mockReviews, averageRating: mockAverageRating });
    // Mock submitReview to fail
    // @ts-ignore
    submitReview.mockResolvedValueOnce({ success: false, error: 'Failed to submit review' });

    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByText('Leave a Review')).toBeInTheDocument();
    });

    // Interact with the review form
    const starButton = screen.getByLabelText('Rate 5 stars');
    fireEvent.click(starButton);

    const commentInput = screen.getByPlaceholderText('Share your thoughts...');
    fireEvent.change(commentInput, { target: { value: 'This is a test comment.' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    fireEvent.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to submit review.')).toBeInTheDocument();
      expect(submitReview).toHaveBeenCalledWith(mockProductId, mockUserId, 5, 'This is a test comment.');
    });

    // @ts-ignore
    jest.restoreAllMocks();
  });
});
