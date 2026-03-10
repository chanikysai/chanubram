import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import { getAutocompleteSuggestions } from '../services/searchApi';
import { AutocompleteSuggestions } from '../types/search';

// Mock the API service
jest.mock('../services/searchApi');
const mockGetAutocompleteSuggestions = getAutocompleteSuggestions as jest.Mock;

// Mock navigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomePage', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockGetAutocompleteSuggestions.mockClear();
    mockNavigate.mockClear();
    // Reset mock implementation
    mockGetAutocompleteSuggestions.mockResolvedValue({ suggestions: [] });
  });

  // Test Case 1: Happy Path - Renders search input and button
  test('should render the search input and button', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );
    expect(screen.getByPlaceholderText('Search for products...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  // Test Case 2: Event Handling - Search input changes
  test('should update search query and fetch suggestions on input change', async () => {
    const mockSuggestions: AutocompleteSuggestions = { suggestions: ['Classic T-Shirt', 'Graphic T-Shirt'] };
    mockGetAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(
      <Router>
        <HomePage />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: 'T-Shirt' } });

    // Check if input value is updated
    expect(searchInput).toHaveValue('T-Shirt');

    // Wait for suggestions to be fetched and potentially displayed
    await waitFor(() => expect(mockGetAutocompleteSuggestions).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());
  });

  // Test Case 3: Event Handling - Search submission
  test('should navigate to search results page on form submission with a query', async () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: 'Jeans' } });

    const searchForm = screen.getByRole('form', { name: /Search products/i }); // Assuming form has aria-label or similar
    fireEvent.submit(searchForm);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=Jeans');
  });

  // Test Case 4: Edge Case - Submitting empty search query
  test('should not navigate if search query is empty on submission', async () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: '' } }); // Empty query

    const searchForm = screen.getByRole('form', { name: /Search products/i });
    fireEvent.submit(searchForm);

    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
  });

  // Test Case 5: Event Handling - Suggestion click
  test('should update input and navigate when a suggestion is clicked', async () => {
    const mockSuggestions: AutocompleteSuggestions = { suggestions: ['Classic T-Shirt', 'Graphic T-Shirt'] };
    mockGetAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(
      <Router>
        <HomePage />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: 'T-Shirt' } });

    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());

    const suggestionItem = screen.getByText('Classic T-Shirt');
    fireEvent.click(suggestionItem);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=Classic%20T-Shirt');
    expect(screen.queryByText('Classic T-Shirt')).not.toBeInTheDocument(); // Suggestions should hide
  });

  // Test Case 6: UI - Suggestions list is hidden when no query
  test('should not show suggestions list when search query is empty', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );
    expect(screen.queryByRole('list', { name: /suggestions/i })).not.toBeInTheDocument();
  });

  // Test Case 7: UI - Suggestions list shown when query has text
  test('should show suggestions list when search query has text and suggestions are available', async () => {
    const mockSuggestions: AutocompleteSuggestions = { suggestions: ['Classic T-Shirt'] };
    mockGetAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(
      <Router>
        <HomePage />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: 'T-Shirt' } });

    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());
  });

  // Test Case 8: UI - Suggestions list hides on blur
  test('should hide suggestions list when input loses focus', async () => {
    const mockSuggestions: AutocompleteSuggestions = { suggestions: ['Classic T-Shirt'] };
    mockGetAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(
      <Router>
        <HomePage />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: 'T-Shirt' } });
    await waitFor(() => expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument());

    // Blur the input
    fireEvent.blur(searchInput);

    // Use waitFor to ensure the setTimeout in handleBlur has time to execute
    await waitFor(() => expect(screen.queryByText('Classic T-Shirt')).not.toBeInTheDocument());
  });
});
