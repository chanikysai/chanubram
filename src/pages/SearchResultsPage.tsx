import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProducts } from '../services/searchApi';
import { Product, Facet, SearchResults } from '../types/search';
import ProductCard from '../components/ProductCard';
import FacetFilter from '../components/FacetFilter';
import './SearchResultsPage.css';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10); // Fixed for now

  const query = new URLSearchParams(location.search).get('q') || '';

  const fetchResults = useCallback(async (searchQuery: string, filters: Record<string, any>, page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data: SearchResults = await searchProducts(searchQuery, filters, page, itemsPerPage);
      setSearchResults(data);
      setCurrentFilters(filters); // Update current filters state
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError("Could not fetch search results. Please try again later.");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Effect to fetch results when query or filters change
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const q = urlParams.get('q') || '';

    // Parse filters from URL if they exist (simplified parsing for demonstration)
    // In a real app, you'd want more robust parsing, e.g., for ranges
    const initialFilters: Record<string, any> = {};
    const brands = urlParams.getAll('brand');
    if (brands.length > 0) initialFilters.brand = brands;
    const colors = urlParams.getAll('color');
    if (colors.length > 0) initialFilters.color = colors;
    const sizes = urlParams.getAll('size');
    if (sizes.length > 0) initialFilters.size = sizes;
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');
    if (minPrice !== null && maxPrice !== null) {
        initialFilters.price = [parseFloat(minPrice), parseFloat(maxPrice)];
    }

    setCurrentFilters(initialFilters); // Set filters from URL
    setCurrentPage(1); // Reset to first page on new search/filter
    fetchResults(q, initialFilters, 1);

  }, [location.search, fetchResults]);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('q', query); // Keep the current query

    // Update URL with new filters
    urlParams.delete('brand'); // Clear existing filter params
    urlParams.delete('color');
    urlParams.delete('size');
    urlParams.delete('minPrice');
    urlParams.delete('maxPrice');

    Object.keys(newFilters).forEach(key => {
      const value = newFilters[key];
      if (value && value.length > 0) { // For arrays (checkboxes)
        if (Array.isArray(value)) {
          value.forEach(item => urlParams.append(key, item));
        } else if (typeof value === 'object' && value.length === 2) { // For ranges
            urlParams.set('minPrice', value[0]);
            urlParams.set('maxPrice', value[1]);
        }
      }
    });

    // Navigate to update URL, which will trigger useEffect again
    navigate(`?${urlParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResults(query, currentFilters, page);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const totalPages = searchResults ? Math.ceil(searchResults.totalCount / itemsPerPage) : 0;

  return (
    <div className="search-results-page">
      <div className="search-results-content">
        <aside className="search-results-filters">
          {loading && <div className="filter-loading-placeholder">Loading filters...</div>}
          {!loading && searchResults && searchResults.facets && (
            <FacetFilter
              facets={searchResults.facets}
              currentFilters={currentFilters}
              onFilterChange={handleFilterChange}
            />
          )}
          {error && <div className="filter-error">{error}</div>}
        </aside>

        <main className="search-results-main">
          <div className="search-results-header">
            <h2>
              Search Results for: "<span>{query}</span>"
            </h2>
            <p>Total Products: {searchResults?.totalCount || 0}</p>
          </div>

          {loading && <div className="loading-spinner"></div>}
          {error && <div className="error-message">{error}</div>}
          {!loading && !error && searchResults && searchResults.products.length === 0 && (
            <p className="no-results-message">No products found matching your criteria.</p>
          )}
          {!loading && !error && searchResults && (
            <div className="product-list">
              {searchResults.products.map(product => (
                <ProductCard key={product.id} product={product} onClick={handleProductClick} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && searchResults && searchResults.totalCount > itemsPerPage && (
            <div className="pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResultsPage;
