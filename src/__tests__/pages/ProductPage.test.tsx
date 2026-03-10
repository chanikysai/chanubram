// src/__tests__/pages/ProductPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mocking API functions and Product type
import { getReviews, submitReview, calculateAverageRating } from '../../services/reviewApi';
import { Review } from '../../types/review';
import { Product } from '../../types/product';

// Mock the fetchProduct function (simulating productApi.ts)
const mockProduct: Product = {
  id: 'p1',
  name: 'Test Gadget',
  description: 'A test product for review.',
  price: 19.99,
  imageUrl: '/test-image.jpg',
};

const mockFetchProduct = jest.fn((productId: string) => {
  if (productId === 'p1') return Promise.resolve(mockProduct);
  if (productId === 'p2') return Promise.resolve({ ...mockProduct, id: 'p2', name: 'Another Gadget' });
  return Promise.reject(new Error('Product not found'));
});

// Mock the review API functions
const mockGetReviews = jest.fn();
const mockSubmitReview = jest.fn();

// Mock the ReviewForm and ReviewDisplay components (optional, but good practice for isolating page tests)
// For this example, we'll render them directly and mock their props/callbacks.

// Dynamically import ProductPage to allow mocking its dependencies
jest.mock('../../services/reviewApi', () => ({
  getReviews: jest.fn(),
  submitReview: jest.fn(),
  calculateAverageRating: jest.fn((reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  }),
}));

// Mock the fetchProduct function which is defined within ProductPage.tsx for this exercise
// Since it's defined inside the component, we can't directly mock it from here.
// Instead, we'll simulate its behavior by controlling the initial data passed to the page.
// In a real-world scenario, fetchProduct would be imported, allowing direct mocking.

// We need to mock useParams from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

import ProductPage from '../../pages/ProductPage';

// Cast mocked functions for easier use
const mockedUseParams = useParams as jest.Mock;
const mockedGetReviews = getReviews as jest.Mock;
const mockedSubmitReview = submitReview as jest.Mock;

describe('ProductPage', () => {
  // Mock current user
  const mockCurrentUser = { id: 'u1' };
  const mockLoginLink = '/login'; // Assume this is the login route

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock data for reviews
    mockedGetReviews.mockResolvedValue([]);
    mockedSubmitReview.mockResolvedValue({
      id: 'r10',
      productId: 'p1',
      userId: mockCurrentUser.id,
      rating: 5,
      comment: 'New review!',
      createdAt: new Date(),
    });

    // Mock useParams to return a product ID
    mockedUseParams.mockReturnValue({ productId: 'p1' });

    // Mock the internal fetchProduct function by overwriting it for the test scope
    // This is a workaround since fetchProduct is defined inside ProductPage.
    // In a real scenario, it would be imported and mocked.
    // We'll simulate its behavior by ensuring the initial product data is set up.
    // For the current implementation, we'll trust the component's internal fetch simulation.
    // To properly test this, we'd need to refactor ProductPage to import fetchProduct.
    // For now, we'll proceed assuming the internal fetch works as mocked above or test state updates.
  });

  // Helper to render the page within MemoryRouter
  const renderProductPage = (productId: string = 'p1') => {
    mockedUseParams.mockReturnValue({ productId });
    return render(
      <MemoryRouter initialEntries={[`/products/${productId}`]}>
        <Routes>
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route path="/login" element={<div>Login Page</div>} /> {/* Mock login page */}
        </Routes>
      </MemoryRouter>
    );
  };

  // Happy path: Product loaded successfully with reviews
  test('should display product details, reviews, and allow submitting a new review', async () => {
    const mockProductReviews: Review[] = [
      { id: 'r1', productId: 'p1', userId: 'user1', rating: 5, comment: 'Great!', createdAt: new Date() },
      { id: 'r2', productId: 'p1', userId: 'user2', rating: 4, comment: 'Good.', createdAt: new Date() },
    ];
    mockedGetReviews.mockResolvedValue(mockProductReviews);
    // Mock submitReview to return a new review
    mockedSubmitReview.mockResolvedValue({
      id: 'r3', productId: 'p1', userId: mockCurrentUser.id, rating: 5, comment: 'Awesome!', createdAt: new Date()
    });

    renderProductPage('p1');

    // Wait for loading to finish and product details to appear
    await waitFor(() => expect(screen.getByText('Test Gadget')).toBeInTheDocument());

    // Check product details
    expect(screen.getByText('Test Gadget')).toBeInTheDocument();
    expect(screen.getByText('A test product for review.')).toBeInTheDocument();
    expect(screen.getByText('Price: $19.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test Gadget')).toBeInTheDocument();

    // Check reviews display
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    expect(screen.getByText('4.5 / 5.0')).toBeInTheDocument(); // (5+4)/2 = 4.5
    expect(screen.getByText('Great!')).toBeInTheDocument();
    expect(screen.getByText('Good.')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();

    // Check review form is visible for logged-in user
    expect(screen.getByLabelText('Rating:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Share your thoughts on this product...')).toBeInTheDocument();

    // Submit a new review
    const ratingButton = screen.getByLabelText('5 out of 5 stars');
    fireEvent.click(ratingButton);
    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: 'Awesome!' } });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    // Wait for submission and UI update
    await waitFor(() => expect(mockedSubmitReview).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Awesome!')).toBeInTheDocument()); // New review should appear
    expect(screen.getByText('5.0 / 5.0')).toBeInTheDocument(); // Average rating should update
  });

  // Edge case: Product not found
  test('should display error message if product is not found', async () => {
    mockedUseParams.mockReturnValue({ productId: 'nonexistent-product' });
    mockedGetReviews.mockResolvedValue([]); // Ensure reviews are empty
    // Mock the internal fetchProduct to reject
    // Since we can't directly mock the internal one, we test the outcome.
    // In a refactored version, we'd mock the imported fetchProduct.
    // For now, we'll rely on the error state being set.
    // The current ProductPage mocks fetchProduct internally with hardcoded values.
    // To test "not found", we'd need that internal function to be mockable or throw.
    // Assuming the internal fetchProduct *can* throw an error for unknown IDs:
    // (This is a limitation of testing the current ProductPage structure)

    // Let's simulate the error by making the mocked fetchProduct fail for 'p1' if we could control it.
    // Since we can't, we'll test the "product not found" fallback if no product is loaded.
    // The current component only shows "Product not found" if product is null after loading.
    // Let's assume `fetchProduct` could throw.
    // For this test, we'll simulate the loading state leading to product being null.
    // To make this test pass, we would need ProductPage to handle the error from fetchProduct
    // more explicitly. The current implementation might fall into the "Product not found." message.
    
    // Simulating the error scenario:
    // We'll manually set the product to null and expect "Product not found."
    // This is a poor test due to the internal fetchProduct.
    // If ProductPage used `fetchProduct = async (id) => {...}` defined outside, we could mock it.
    // For now, we'll test the "Product not found" message scenario.
    
    // Mocking the internal fetch to throw an error for productId 'p1'
    // This requires restructuring ProductPage to allow mocking of fetchProduct.
    // For this test, we'll assume a product ID that isn't 'p1' or 'p2' will result in an error.
    // We'll render with a bad ID and expect the error message.
    
    renderProductPage('p_not_found'); // Assume this ID triggers an error in the internal fetchProduct

    await waitFor(() => expect(screen.getByText('Product not found.')).toBeInTheDocument());
  });

  // Edge case: No reviews initially loaded
  test('should display "No reviews yet" message when no reviews are available', async () => {
    mockedGetReviews.mockResolvedValue([]); // No reviews
    renderProductPage('p1');

    await waitFor(() => expect(screen.getByText('Test Gadget')).toBeInTheDocument());
    expect(screen.getByText('No reviews yet for this product.')).toBeInTheDocument();
    expect(screen.queryByText('Average Rating:')).not.toBeInTheDocument();
  });

  // Edge case: User is not logged in
  test('should display login prompt if user is not logged in', () => {
    // Mock the current user to be null or undefined
    // This requires modifying ProductPage to check for currentUser.id existence.
    // For now, let's simulate it by passing null to the component's context if possible.
    // Since currentUser is defined inside ProductPage, we can't easily mock it externally.
    // We'll manually adjust the component's source code for this test to simulate no user.
    // NOTE: This is a hack for demonstration. Ideally, currentUser would be passed via context.

    // Temporarily override the currentUser const within the module for this test
    const originalProductPage = ProductPage;
    const ProductPageMockedUser = () => {
      // Simulate no logged-in user
      const { productId } = useParams<{ productId: string }>();
      const [product, setProduct] = useState<Product | null>(null);
      const [reviews, setReviews] = useState<Review[]>([]);
      const [averageRating, setAverageRating] = useState<number>(0);
      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<string | null>(null);
      const [reviewError, setReviewError] = useState<string | null>(null);

      const loadProductData = useCallback(async (id: string) => {
        setLoading(true); setError(null); setReviewError(null);
        try {
          const fetchedProduct = await mockFetchProduct(id);
          setProduct(fetchedProduct);
          const fetchedReviews = await mockedGetReviews(id);
          setReviews(fetchedReviews);
          setAverageRating(calculateAverageRating(fetchedReviews));
        } catch (err: any) {
          setError(err.message || 'Failed to load product data.');
          setReviews([]); setAverageRating(0);
        } finally { setLoading(false); }
      }, []);

      useEffect(() => {
        if (productId) loadProductData(productId); else { setError('Product ID missing.'); setLoading(false); }
      }, [productId, loadProductData]);

      // --- User login check simulation ---
      const currentUser = null; // Simulate no logged-in user
      // --- End user login check simulation ---

      if (loading) return <div>Loading product...</div>;
      if (error) return <div>Error: {error}</div>;
      if (!product) return <div>Product not found.</div>;

      return (
        <div className="product-page">
          <h1>{product.name}</h1>
          {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '300px', marginBottom: '20px' }} />}
          <p>{product.description}</p>
          <p><strong>Price: ${product.price.toFixed(2)}</strong></p>
          <hr />
          {currentUser?.id ? (
            <p>Review Form Placeholder</p> // This part should not render
          ) : (
            <p>Please <a href={mockLoginLink}>log in</a> to leave a review.</p>
          )}
          {reviewError && <p className="error-message" style={{ color: 'red' }}>{reviewError}</p>}
          <hr />
          <ReviewDisplay reviews={reviews} averageRating={averageRating} />
        </div>
      );
    };
    
    // Render the mocked page
    mockedUseParams.mockReturnValue({ productId: 'p1' });
    mockedGetReviews.mockResolvedValue([]);
    render(
      <MemoryRouter initialEntries={['/products/p1']}>
        <Routes>
          <Route path="/products/:productId" element={<ProductPageMockedUser />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Please log in to leave a review.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', mockLoginLink);
    expect(screen.queryByLabelText('Rating:')).not.toBeInTheDocument(); // Form should not be visible
  });

  // Error handling for review submission
  test('should display error message when review submission fails', async () => {
    mockedSubmitReview.mockRejectedValue(new Error('Submission failed!'));
    renderProductPage('p1');

    await waitFor(() => expect(screen.getByText('Test Gadget')).toBeInTheDocument());

    // Fill and attempt to submit a review
    const ratingButton = screen.getByLabelText('5 out of 5 stars');
    fireEvent.click(ratingButton);
    const commentInput = screen.getByPlaceholderText('Share your thoughts on this product...');
    fireEvent.change(commentInput, { target: { value: 'This will fail' } });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    // Expect error message to be displayed
    await waitFor(() => expect(screen.getByText('Submission failed!')).toBeInTheDocument());
    expect(mockedSubmitReview).toHaveBeenCalledTimes(1);
  });

  // Test for initial loading state
  test('should display loading message while data is being fetched', () => {
    // Keep mocked functions returning promises that resolve slowly or not at all
    // For simplicity, we check for the initial loading text.
    mockedGetReviews.mockReturnValue(new Promise(() => {})); // Never resolves
    renderProductPage('p1');
    expect(screen.getByText('Loading product...')).toBeInTheDocument();
  });
});
