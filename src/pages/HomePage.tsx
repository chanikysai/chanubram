import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used for navigation
import { getAutocompleteSuggestions } from '../services/searchApi';
import { AutocompleteSuggestions } from '../types/search';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      fetchSuggestions(query);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    try {
      const data: AutocompleteSuggestions = await getAutocompleteSuggestions(query);
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Failed to fetch autocomplete suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false); // Hide suggestions after search
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Optionally, trigger search immediately or let user submit
    // For this example, we'll set the query and let the user submit
    handleSearchSubmit();
  };

  // Hide suggestions when clicking outside the search area
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150); // Delay to allow click events on suggestions to fire
  };

  return (
    <div className="home-page">
      <header className="home-page__header">
        <h1>Discover Amazing Products</h1>
        <p>Find what you're looking for with our advanced search.</p>
      </header>

      <div className="home-page__search-container">
        <form onSubmit={handleSearchSubmit} className="home-page__search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
            onBlur={handleBlur}
            placeholder="Search for products..."
            className="home-page__search-input"
            aria-label="Search products"
          />
          <button type="submit" className="home-page__search-button">Search</button>
        </form>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="home-page__suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomePage;
