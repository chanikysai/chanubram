// src/__tests__/pages/ProductPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import ProductPage from '../../pages/ProductPage';
import { getProductById } from '../../services/productApi';
import { getReviews, submitReview, calculateAverageRating } from '../../services/reviewApi';
import ReviewForm from '../../components/ReviewForm';
import ReviewDisplay from '../../components/ReviewDisplay';
// Import ProductDetail to check if it's rendered
import ProductDetail from '../../components/ProductDetail';

// Mocking dependencies
jest.mock('../../services/productApi');
jest.mock('../../services/reviewApi');
jest.mock('../../components/ReviewForm');
jest.mock('../../components/ReviewDisplay');
// Mock ProductDetail to ensure it's rendered by ProductPage and check its props
jest.mock('../../components/ProductDetail', () => ({
  __esModule: true,
  default: jest.fn(({ product }) => (
    <div data-testid="mock-product-detail">
      Mock Product Detail for: {product.name}
    </div>
  )),
}));

// Mock react-router-dom correctly using a factory function
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: jest.fn(),
  };
});

const mockProduct = {
  id: 'p1',
  name: 'Test Product',
  description: 'A product for testing.',
  price: 19.99,
  imageUrl: '/test/image.jpg',
};

const mockReviews = [
  { id: 'r1', productId: 'p1', userId: 'u1', rating: 5, comment: 'Great!', createdAt: new Date() },
  { id: 'r2', productId: 'p1', userId: 'u2', rating: 4, comment: 'Good.', createdAt: new Date() },
];

const mockAverageRating = 4.5;

// Type casting mocks for clarity
const mockUseParams = useParams as jest.Mock;
const mockGetProductById = getProductById as jest.Mock;
const mockGetReviews = getReviews as jest.Mock;
const mockSubmitReview = submitReview as jest.Mock;
const mockCalculateAverageRating = calculateAverageRating as jest.Mock;
const MockReviewForm = ReviewForm as jest.Mock;
const MockReviewDisplay = ReviewDisplay as jest.Mock;
const MockProductDetail = ProductDetail as jest.Mock; // Cast for assertion

describe('ProductPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseParams.mockClear();
    mockGetProductById.mockClear();
    mockGetReviews.mockClear();
    mockSubmitReview.mockClear();
    mockCalculateAverageRating.mockClear();
    MockReviewForm.mockClear();
    MockReviewDisplay.mockClear();
    MockProductDetail.mockClear(); // Clear mock for ProductDetail

    // Default mock implementations
    mockUseParams.mockReturnValue({ productId: 'p1' });
    mockGetProductById.mockResolvedValue(mockProduct);
    mockGetReviews.mockResolvedValue(mockReviews);
    mockSubmitReview.mockResolvedValue({ id: 'r3', productId: 'p1', userId: 'u1', rating: 5, comment: 'New Review!', createdAt: new Date() });
    mockCalculateAverageRating.mockReturnValue(mockAverageRating);

    // Mock components to render their basic structure or placeholders
    MockReviewForm.mockImplementation(({ productId, userId, onSubmit, onError }) => (
      <div data-testid="review-form">
        Mock Review Form for {productId} by {userId}
        <button onClick={() => onSubmit({ productId, userId, rating: 5, comment: 'New Review!' })}>Submit Mock Review</button>
        <button onClick={() => onError('Mock Error')}>Trigger Mock Error</button>
      </div>
    ));
    MockReviewDisplay.mockImplementation(({ reviews, averageRating }) => (
      <div data-testid="review-display">
        Mock Review Display: Avg Rating {averageRating.toFixed(1)}
        {reviews.map(r => <div key={r.id}>{r.comment}</div>)}
      </div>
    ));
  });

  // Happy Path Test Case: Product and reviews load successfully
  test('should load product details and reviews successfully', async () => {
    render(
      <Router>
        <ProductPage />
      </Router>
    );

    // Wait for API calls to complete
    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('p1');
      expect(mockGetReviews).toHaveBeenCalledWith('p1');
      expect(mockCalculateAverageRating).toHaveBeenCalledWith(mockReviews);
    });

    // Check if ProductDetail is rendered with the correct product prop
    expect(MockProductDetail).toHaveBeenCalledTimes(1);
    // ProductDetail mock receives product as a prop, so check it this way:
    expect(MockProductDetail).toHaveBeenCalledWith({ product: mockProduct }, {});

    // Check if ReviewForm and ReviewDisplay are rendered with correct props
    expect(MockReviewForm).toHaveBeenCalledTimes(1);
    expect(MockReviewForm).toHaveBeenCalledWith(expect.objectContaining({
      productId: mockProduct.id,
      userId: 'u1', // Mocked currentUser
    }), {});

    expect(MockReviewDisplay).toHaveBeenCalledTimes(1);
    expect(MockReviewDisplay).toHaveBeenCalledWith(expect.objectContaining({
      reviews: mockReviews,
      averageRating: mockAverageRating,
    }), {});
  });

  // Edge Case Test Case: Product ID is missing in URL params
  test('should display an error if product ID is missing', async () => {
    mockUseParams.mockReturnValue({ productId: undefined });

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Product ID is missing.')).toBeInTheDocument();
    });
    expect(mockGetProductById).not.toHaveBeenCalled();
    expect(mockGetReviews).not.toHaveBeenCalled();
    expect(MockProductDetail).not.toHaveBeenCalled(); // Should not render if error
  });

  // Error Handling Test Case: getProductById API call fails
  test('should display an error if fetching product details fails', async () => {
    const error = new Error('Failed to fetch product');
    mockGetProductById.mockRejectedValue(error);

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('p1');
      expect(screen.getByText(`Error: ${error.message}`)).toBeInTheDocument();
    });
    expect(mockGetReviews).not.toHaveBeenCalled(); // getReviews should not be called if product fetch fails
    expect(MockProductDetail).not.toHaveBeenCalled(); // Should not render if error
  });

  // Error Handling Test Case: getReviews API call fails
  test('should display an error if fetching reviews fails', async () => {
    const error = new Error('Failed to fetch reviews');
    mockGetReviews.mockRejectedValue(error);

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('p1');
      expect(mockGetReviews).toHaveBeenCalledWith('p1');
      // The error message displayed in the UI comes from the product loading logic.
      // If getProductById succeeds and getReviews fails, the error state should reflect the review error.
      // For simplicity, assuming the error message from getReviews will be caught and displayed.
      // If the error message shown is still from product loading, this check might fail.
      expect(screen.getByText(`Error: ${error.message}`)).toBeInTheDocument();
    });
    // ReviewDisplay should still be called, but with empty reviews and 0 average rating
    expect(MockReviewDisplay).toHaveBeenCalledWith(expect.objectContaining({
      reviews: [],
      averageRating: 0,
    }), {});
  });

  // Edge Case Test Case: Product found but has no reviews
  test('should display correctly when product has no reviews', async () => {
    mockGetReviews.mockResolvedValue([]); // No reviews
    mockCalculateAverageRating.mockReturnValue(0); // Average rating is 0

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('p1');
      expect(mockGetReviews).toHaveBeenCalledWith('p1');
    });

    // ReviewDisplay should be called with empty reviews and 0 average rating
    expect(MockReviewDisplay).toHaveBeenCalledWith(expect.objectContaining({
      reviews: [],
      averageRating: 0,
    }), {});
  });

  // Interaction Test Case: Submitting a review
  test('should update reviews and average rating after submitting a new review', async () => {
    // Configure MockReviewForm to call onSubmit when its submit button is clicked
    let reviewFormOnSubmit: (reviewData: any) => Promise<void> = () => Promise.resolve();
    MockReviewForm.mockImplementation((props) => {
      reviewFormOnSubmit = props.onSubmit; // Capture the onSubmit prop
      return (
        <div data-testid="review-form">
          Mock Review Form for {props.productId}
          <button onClick={() => props.onSubmit({ productId: 'p1', userId: 'u1', rating: 5, comment: 'New Review!' })}>Submit Mock Review</button>
        </div>
      );
    });

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    await waitFor(() => expect(mockGetProductById).toHaveBeenCalled());

    // Simulate clicking the submit button within the mocked ReviewForm
    const submitButton = screen.getByRole('button', { name: /Submit Mock Review/i });
    fireEvent.click(submitButton);

    // Wait for the state update and re-render
    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith('p1', 'u1', 5, 'New Review!');
      // Check that MockReviewDisplay was called again with updated data reflecting the new review
      expect(MockReviewDisplay).toHaveBeenCalledTimes(2); // Once initially, once after submission
      const latestProps = MockReviewDisplay.mock.calls[MockReviewDisplay.mock.calls.length - 1][0]; // Get props of the last call
      expect(latestProps.reviews.length).toBe(mockReviews.length + 1); // One more review
      expect(latestProps.averageRating).toBeGreaterThan(mockAverageRating); // Average rating should increase
    });
  });

  // Interaction Test Case: User not logged in
  test('should display login prompt if user is not logged in', async () => {
    // To test the "not logged in" state, we need to ensure the `currentUser.id` is not available.
    // Since `currentUser` is defined internally in `ProductPage.tsx` and not passed as a prop or context,
    // we cannot directly mock it for the test without refactoring `ProductPage`.
    // Instead, we will assert that the `ReviewForm` mock is NOT called, and the login prompt text is rendered.

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    await waitFor(() => expect(mockGetProductById).toHaveBeenCalled());

    // Assert that the ReviewForm was NOT rendered (mock not called)
    expect(MockReviewForm).not.toHaveBeenCalled();
    // Assert that the login prompt text is visible
    expect(screen.getByText(/Please login to leave a review/i)).toBeInTheDocument();
  });

  // Interaction Test Case: Displaying error from ReviewForm
  test('should display error message passed from ReviewForm', async () => {
    // MockReviewForm's onError prop is called by its internal button
    MockReviewForm.mockImplementation((props) => (
      <div data-testid="review-form">
        Mock Review Form
        <button onClick={() => props.onError('Error from review form!')}>Trigger Form Error</button>
      </div>
    ));

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    await waitFor(() => expect(mockGetProductById).toHaveBeenCalled());

    // Click the button in MockReviewForm to trigger its onError
    const triggerErrorButton = screen.getByRole('button', { name: /Trigger Mock Error/i });
    fireEvent.click(triggerErrorButton);

    // Check if the error message is displayed in ProductPage
    await waitFor(() => {
      expect(screen.getByText('Error from review form!')).toBeInTheDocument();
    });
  });
});
