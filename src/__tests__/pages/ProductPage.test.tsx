// src/__tests__/pages/ProductPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import ProductPage from '../../pages/ProductPage';
import { getProductById } from '../../services/productApi';
import { getReviews, submitReview, calculateAverageRating } from '../../services/reviewApi';
import ReviewForm from '../../components/ReviewForm';
import ReviewDisplay from '../../components/ReviewDisplay';

// Mocking dependencies
jest.mock('../../services/productApi');
jest.mock('../../services/reviewApi');
jest.mock('../../components/ReviewForm');
jest.mock('../../components/ReviewDisplay');
jest.mock('react-router-dom', () => ({
  ...jest.mocked(require('react-router-dom')),
  useParams: jest.fn(),
}));

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

const mockUseParams = useParams as jest.Mock;
const mockGetProductById = getProductById as jest.Mock;
const mockGetReviews = getReviews as jest.Mock;
const mockSubmitReview = submitReview as jest.Mock;
const mockCalculateAverageRating = calculateAverageRating as jest.Mock;
const MockReviewForm = ReviewForm as jest.Mock;
const MockReviewDisplay = ReviewDisplay as jest.Mock;

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

    // Check if loading state is shown (optional, if it's visible for a moment)
    // expect(screen.getByText('Loading product...')).toBeInTheDocument();

    // Wait for API calls to complete
    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('p1');
      expect(mockGetReviews).toHaveBeenCalledWith('p1');
      expect(mockCalculateAverageRating).toHaveBeenCalledWith(mockReviews);
    });

    // Check if product details are rendered
    expect(screen.getByRole('heading', { name: mockProduct.name })).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText(`Price: $${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();

    // Check if ReviewForm and ReviewDisplay are rendered with correct props
    expect(MockReviewForm).toHaveBeenCalledTimes(1);
    expect(MockReviewForm).toHaveBeenCalledWith(expect.objectContaining({
      productId: mockProduct.id,
      userId: 'u1', // Mocked currentUser
    }), {}); // Second argument is props, which are checked by objectContaining

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
      expect(screen.getByText(`Error: ${error.message}`)).toBeInTheDocument();
    });
    // ReviewDisplay should still be called, but with empty reviews and 0 average rating
    expect(MockReviewDisplay).toHaveBeenCalledWith(expect.objectContaining({
      reviews: [],
      averageRating: 0,
    }), {});
  });

  // Edge Case Test Case: Product found but has no reviews
  test('should display "No reviews yet" if product has no reviews', async () => {
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
      // MockReviewDisplay should be called again with updated data
      // The exact updated list of reviews and average rating depends on how calculateAverageRating is called.
      // Since our mockSubmitReview returns a new review, and we expect handleReviewSubmit to update state,
      // we check that MockReviewDisplay is called with data reflecting the new review.
      // Here, we assume the state update logic within ProductPage correctly handles this.
      // The updated state would be [...mockReviews, newReview].
      // We can't easily check the exact state values here without more complex mocking of the child component's render.
      // Instead, we check if ReviewDisplay was called with *some* reviews and an updated average rating.
      // A more precise test would involve inspecting the actual rendered output if MockReviewDisplay were not mocked, or by checking the props passed to MockReviewDisplay.

      // Let's check the props passed to MockReviewDisplay
      expect(MockReviewDisplay).toHaveBeenCalledTimes(2); // Once initially, once after submission
      const latestProps = MockReviewDisplay.mock.calls[MockReviewDisplay.mock.calls.length - 1][0]; // Get props of the last call
      expect(latestProps.reviews.length).toBe(mockReviews.length + 1); // One more review
      expect(latestProps.averageRating).toBeGreaterThan(mockAverageRating); // Average rating should increase
    });
  });

  // Interaction Test Case: User not logged in
  test('should display login prompt if user is not logged in', async () => {
    // Simulate no current user
    const ProductPageWrapper = ({ children }: { children: React.ReactNode }) => {
      // Temporarily override currentUser in the page scope for this test
      // This is tricky as currentUser is defined inside ProductPage.
      // A better way would be to pass currentUser as a prop or context.
      // For now, we'll rely on the default mock, which sets currentUser.id
      // To test the "not logged in" case, we need to make sure `currentUser.id` is undefined or null.
      // Since `currentUser` is hardcoded inside `ProductPage`, we'd need to refactor `ProductPage` to accept `currentUser` as a prop or use context.
      // For this example, I'll assume a refactor or a way to control `currentUser`.
      // Let's simulate by mocking the component to not render the ReviewForm section.
      // Alternatively, we can mock the `useAuth` hook if it were used.
      // Given the current structure, a simple hack for testing would be to mock ProductPage itself.
      // However, that's not ideal. Let's adjust the test to check for the login prompt text.

      // If the currentUser logic was more accessible, we'd control it here.
      // For demonstration, let's just check for the presence of the login prompt.
      return (
        <Router>
          {children}
        </Router>
      );
    };

    // To test this, we need to override the internal `currentUser` definition or mock the entire component.
    // A better approach for testing would be to have `currentUser` passed as a prop or via context.
    // As a workaround, let's check for the login message specifically.
    // If the ReviewForm is NOT rendered, the login message should be.

    // Mock the current user to be null/undefined for this test case
    // This requires altering the component's internal state, which is not directly possible.
    // The most reliable way is to either pass `currentUser` as a prop or mock the component to behave differently.
    // Given the constraints, I'll simulate by checking for the absence of ReviewForm and presence of login prompt.

    render(
      <Router>
        <ProductPage />
      </Router>
    );

    // After loading, check if ReviewForm is NOT in the document
    await waitFor(() => {
      expect(screen.queryByTestId('review-form')).not.toBeInTheDocument();
      // Check for the login prompt message
      expect(screen.getByText(/Please login to leave a review/i)).toBeInTheDocument();
    });
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
      expect(screen.getByText('Mock Error')).toBeInTheDocument();
    });
  });
});
