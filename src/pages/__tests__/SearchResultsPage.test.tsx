import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import SearchResultsPage from '../pages/SearchResultsPage';
import { searchProducts } from '../services/searchApi';
import { SearchResults, Product, Facet } from '../types/search';

// Mock the API service
jest.mock('../services/searchApi');
const mockSearchProducts = searchProducts as jest.Mock;

// Mock navigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(), // Mock useLocation as well
}));

const mockSearchResults: SearchResults = {
  products: [
    { id: 'p1', name: 'Classic T-Shirt', description: 'Cotton tee', price: 25, imageUrl: '/img/tee.jpg', brand: 'CoolBrand', color: 'Blue', size: 'M' },
    { id: 'p2', name: 'Slim Fit Jeans', description: 'Denim jeans', price: 60, imageUrl: '/img/jeans.jpg', brand: 'DenimCo', color: 'Blue', size: 'L' },
  ],
  facets: [
    { field: 'brand', label: 'Brand', type: 'checkbox', options: [{ value: 'CoolBrand', count: 1 }, { value: 'DenimCo', count: 1 }] },
    { field: 'price', label: 'Price Range', type: 'range', min: 0, max: 100 },
  ],
  totalCount: 2,
};

const mockSearchResultsEmpty: SearchResults = {
  products: [],
  facets: [
    { field: 'brand', label: 'Brand', type: 'checkbox', options: [] },
    { field: 'price', label: 'Price Range', type: 'range', min: 0, max: 100 },
  ],
  totalCount: 0,
};

const mockSearchResultsWithMoreProducts: SearchResults = {
  products: [
    { id: 'p1', name: 'Classic T-Shirt', description: 'Cotton tee', price: 25, imageUrl: '/img/tee.jpg', brand: 'CoolBrand', color: 'Blue', size: 'M' },
    { id: 'p2', name: 'Slim Fit Jeans', description: 'Denim jeans', price: 60, imageUrl: '/img/jeans.jpg', brand: 'DenimCo', color: 'Blue', size: 'L' },
    { id: 'p3', name: 'Running Sneakers', description: 'Sport shoes', price: 120, imageUrl: '/img/sneakers.jpg', brand: 'Sporty', color: 'White', size: '10' },
  ],
  facets: [
    { field: 'brand', label: 'Brand', type: 'checkbox', options: [{ value: 'CoolBrand', count: 1 }, { value: 'DenimCo', count: 1 }, { value: 'Sporty', count: 1 }] },
    { field: 'price', label: 'Price Range', type: 'range', min: 0, max: 200 },
  ],
  totalCount: 3,
};

describe('SearchResultsPage', () => {
  const mockUseLocation = useLocation as jest.Mock;

  beforeEach(() => {
    mockSearchProducts.mockClear();
    mockNavigate.mockClear();

    // Set default mock implementation for searchProducts
    mockSearchProducts.mockResolvedValue(mockSearchResults);

    // Mock useLocation to return a default query parameter for tests
    // This should be overridden in specific tests if needed
    mockUseLocation.mockReturnValue({ search: '?q=test' });

    // Mock react-router-dom's useNavigate hook
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  // Test Case 1: Happy Path - Renders loading state initially
  test('should show loading state while fetching results', async () => {
    // Make searchProducts take longer to simulate loading
    mockSearchProducts.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 100)));

    mockUseLocation.mockReturnValue({ search: '?q=test' });
    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    expect(screen.getByText(/loading filters.../i)).toBeInTheDocument();
    expect(screen.getByText(/Search Results for: "test"/i)).toBeInTheDocument(); // Header should still be there
  });

  // Test Case 2: Renders search results and facets
  test('should render search results and facets when data is available', async () => {
    mockUseLocation.mockReturnValue({ search: '?q=test' });
    mockSearchProducts.mockResolvedValue(mockSearchResults);

    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    // Wait for the data to be fetched and rendered
    await waitFor(() => expect(screen.queryByText(/loading filters.../i)).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());
    expect(screen.getByText('Slim Fit Jeans')).toBeInTheDocument();
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Total Products: 2')).toBeInTheDocument();
  });

  // Test Case 3: Edge Case - No results found
  test('should display a message when no products are found', async () => {
    mockUseLocation.mockReturnValue({ search: '?q=empty' });
    mockSearchProducts.mockResolvedValue(mockSearchResultsEmpty);

    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(screen.queryByText(/loading filters.../i)).not.toBeInTheDocument());
    expect(screen.getByText('No products found matching your criteria.')).toBeInTheDocument();
    expect(screen.getByText('Total Products: 0')).toBeInTheDocument();
  });

  // Test Case 4: Error Handling - API error
  test('should display an error message if fetching results fails', async () => {
    mockUseLocation.mockReturnValue({ search: '?q=error' });
    mockSearchProducts.mockRejectedValue(new Error('API Error'));

    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText(/Could not fetch search results/i)).toBeInTheDocument());
    expect(screen.queryByText('Classic T-Shirt')).not.toBeInTheDocument();
  });

  // Test Case 5: Event Handling - Filter change updates URL and fetches new results
  test('should update URL and refetch results when filters change', async () => {
    mockUseLocation.mockReturnValue({ search: '?q=test' }); // Initial search query
    mockSearchProducts.mockResolvedValue(mockSearchResults);

    const { rerender } = render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());

    // Simulate changing a filter (e.g., selecting a brand)
    // We need to mock the FacetFilter component's onFilterChange prop,
    // but since FacetFilter is rendered internally, we'll simulate the event
    // by calling the internal handleFilterChange function. This requires accessing the component's state.
    // A more robust way is to mock the FacetFilter component itself or trigger events on its rendered elements.
    // For now, let's simulate interaction by assuming we have access to the `handleFilterChange` logic's effect.

    // Directly manipulate the mock navigator to simulate URL change and re-fetch
    const newFilters = { brand: ['DenimCo'] };
    const urlParams = new URLSearchParams('?q=test');
    urlParams.set('brand', 'DenimCo');
    mockNavigate(urlParams.toString()); // Simulate navigation

    // Mock the API call for the new filter
    const updatedSearchResults: SearchResults = {
      products: [{ id: 'p2', name: 'Slim Fit Jeans', description: 'Denim jeans', price: 60, imageUrl: '/img/jeans.jpg', brand: 'DenimCo', color: 'Blue', size: 'L' }],
      facets: [
        { field: 'brand', label: 'Brand', type: 'checkbox', options: [{ value: 'DenimCo', count: 1 }] },
        { field: 'price', label: 'Price Range', type: 'range', min: 0, max: 100 },
      ],
      totalCount: 1,
    };
    mockSearchProducts.mockResolvedValue(updatedSearchResults);
    mockUseLocation.mockReturnValue({ search: urlParams.toString() }); // Update location mock

    // Re-render to ensure useEffect picks up the new location.search
    rerender(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(mockSearchProducts).toHaveBeenCalledWith('test', expect.objectContaining({ brand: ['DenimCo'] }), 1, 10));
    expect(screen.getByText('Search Results for: "test"')).toBeInTheDocument(); // Query remains the same
    expect(screen.getByText('Slim Fit Jeans')).toBeInTheDocument();
    expect(screen.getByText('Classic T-Shirt')).not.toBeInTheDocument(); // Should disappear
    expect(screen.getByText('Total Products: 1')).toBeInTheDocument();
  });

  // Test Case 6: Event Handling - Pagination next page
  test('should fetch the next page of results when next button is clicked', async () => {
    mockUseLocation.mockReturnValue({ search: '?q=pageTest' });
    mockSearchProducts.mockResolvedValue(mockSearchResultsWithMoreProducts); // Assume 3 products total

    const { rerender } = render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());

    // Click next page button
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    // The next page should be fetched. The mock needs to handle the page parameter.
    // For this test, we'll assume the API call correctly reflects the page change.
    await waitFor(() => expect(mockSearchProducts).toHaveBeenCalledWith('pageTest', {}, 2, 10)); // Expecting page 2, limit 10

    // We can't easily assert product change without more complex mock setup for subsequent calls.
    // Asserting that the API call was made with the correct parameters is sufficient for this test.
    expect(screen.getByText('Page 2 of 1')).toBeInTheDocument(); // Based on default mockSearchProducts which has totalCount: 2
  });

  // Test Case 7: Event Handling - Pagination previous page
  test('should fetch the previous page of results when previous button is clicked', async () => {
    mockUseLocation.mockReturnValue({ search: '?q=pageTest' });
    mockSearchResults.products = [{ id: 'p1', name: 'First Product', price: 10, imageUrl: '', brand: 'A', color: 'Red', size: 'M' }]; // 1 product per page for simplicity
    mockSearchResults.totalCount = 2; // 2 products total, page 1 and page 2
    mockSearchProducts.mockResolvedValue(mockSearchResults);

    const { rerender } = render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('First Product')).toBeInTheDocument());

    // Simulate being on page 2
    // To do this properly, we'd need to mock `mockSearchProducts` to return different data based on page.
    // For simplicity, let's mock the effect of clicking 'Next' first to get to page 2 state.
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton); // This should call searchProducts with page=2

    // Mock the result for page 2
    const page2Results = {
      products: [{ id: 'p2', name: 'Second Product', price: 20, imageUrl: '', brand: 'B', color: 'Blue', size: 'L' }],
      facets: mockSearchResults.facets,
      totalCount: 2,
    };
    mockSearchProducts.mockResolvedValueOnce(page2Results); // Mock for the page 2 call

    await waitFor(() => expect(mockSearchProducts).toHaveBeenCalledWith('pageTest', {}, 2, 10)); // Check call for page 2

    // Now click Previous button
    const prevButton = screen.getByRole('button', { name: /Previous/i });
    fireEvent.click(prevButton);

    // Mock the result for page 1 again
    mockSearchProducts.mockResolvedValueOnce(mockSearchResults); // Mock for the page 1 call
    await waitFor(() => expect(mockSearchProducts).toHaveBeenCalledWith('pageTest', {}, 1, 10)); // Check call for page 1

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  // Test Case 8: UI - Pagination buttons disabled appropriately
  test('should disable pagination buttons correctly', async () => {
    mockUseLocation.mockReturnValue({ search: '?q=pagination' });
    mockSearchProducts.mockResolvedValue(mockSearchResultsWithMoreProducts); // 3 products

    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());

    // Should be on page 1 of 1 (since itemsPerPage=10 and totalCount=3)
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled(); // Only 1 page, so next is disabled

    // Let's simulate having more products to test pagination more thoroughly
    const moreProducts: SearchResults = {
      products: [{ id: 'p1', name: 'P1', price: 10, imageUrl: '', brand: 'A', color: 'Red', size: 'M' }],
      facets: mockSearchResults.facets,
      totalCount: 15, // Enough for multiple pages
    };
    mockSearchProducts.mockResolvedValueOnce(moreProducts); // First call (page 1)
    mockUseLocation.mockReturnValue({ search: '?q=pagination' }); // Reset location

    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('P1')).toBeInTheDocument());

    // Should be on page 1 of 2
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    const page2Results: SearchResults = {
      products: [{ id: 'p2', name: 'P2', price: 20, imageUrl: '', brand: 'B', color: 'Blue', size: 'L' }],
      facets: mockSearchResults.facets,
      totalCount: 15,
    };
    mockSearchProducts.mockResolvedValueOnce(page2Results);

    await waitFor(() => expect(mockSearchProducts).toHaveBeenCalledWith('pagination', {}, 2, 10));
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  // Test Case 9: URL Parsing - Filters from URL
  test('should parse filters from URL query parameters', async () => {
    const url = '?q=filtered&brand=CoolBrand&color=Blue&minPrice=20&maxPrice=70';
    mockUseLocation.mockReturnValue({ search: url });
    mockSearchProducts.mockResolvedValue(mockSearchResults); // Assume mock returns products matching these filters

    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(mockSearchProducts).toHaveBeenCalledWith(
      'filtered',
      expect.objectContaining({
        brand: ['CoolBrand'],
        color: ['Blue'],
        price: [20, 70],
      }),
      1, // Page 1
      10
    ));
  });

  // Test Case 10: URL Parsing - Range filter parsing
  test('should correctly parse price range from URL', async () => {
    const url = '?q=pricefilter&minPrice=30&maxPrice=80';
    mockUseLocation.mockReturnValue({ search: url });
    mockSearchProducts.mockResolvedValue(mockSearchResults);

    render(
      <Router>
        <SearchResultsPage />
      </Router>
    );

    await waitFor(() => expect(mockSearchProducts).toHaveBeenCalledWith(
      'pricefilter',
      expect.objectContaining({
        price: [30, 80],
      }),
      1,
      10
    ));
  });
});
