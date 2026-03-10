import { searchProducts, getAutocompleteSuggestions } from '../services/searchApi';
import { Product, SearchResults, AutocompleteSuggestions } from '../types/search';

// Mocking the global fetch or a specific HTTP client if used
// For this mock API, we don't need to mock fetch as it's self-contained.

describe('searchApi', () => {
  // Mock Products for consistent testing
  const mockProducts: Product[] = [
    { id: 'p1', name: 'Classic T-Shirt', description: 'A comfortable and stylish cotton t-shirt.', price: 25, imageUrl: '/images/tshirt-classic.jpg', brand: 'CoolBrand', color: 'Blue', size: 'M' },
    { id: 'p2', name: 'Slim Fit Jeans', description: 'Modern slim fit denim jeans.', price: 60, imageUrl: '/images/jeans-slim.jpg', brand: 'DenimCo', color: 'Blue', size: 'L' },
    { id: 'p3', name: 'Running Sneakers', description: 'Lightweight sneakers for performance running.', price: 120, imageUrl: '/images/sneakers-running.jpg', brand: 'Sporty', color: 'White', size: '10' },
    { id: 'p4', name: 'Cozy Hoodie', description: 'A warm and soft hooded sweatshirt.', price: 50, imageUrl: '/images/hoodie-cozy.jpg', brand: 'CoolBrand', color: 'Gray', size: 'L' },
    { id: 'p5', name: 'Elegant Evening Dress', description: 'A sophisticated dress perfect for formal events.', price: 150, imageUrl: '/images/dress-evening.jpg', brand: 'ChicFashion', color: 'Black', size: 'S' },
  ];

  // Mock the internal mockProducts to control test data
  // This is a bit hacky, ideally the API would be injectable or use real mock data
  // For now, we'll rely on the data defined within searchApi.ts and test its filtering logic.

  // Test Case 1: Happy Path - Basic search
  test('should return products matching the search query', async () => {
    const query = 'T-Shirt';
    const result: SearchResults = await searchProducts(query);

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every(p => p.name.includes('T-Shirt') || p.description.includes('T-Shirt'))).toBe(true);
    expect(result.totalCount).toBeGreaterThan(0);
  });

  // Test Case 2: Edge Case - No results found
  test('should return an empty array if no products match the query', async () => {
    const query = 'NonExistentProduct123';
    const result: SearchResults = await searchProducts(query);

    expect(result.products).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  // Test Case 3: Error Handling - (Simulated via mock delay, not actual error throw)
  // In a real scenario, you'd test if the function handles API errors gracefully.
  // Since our mock doesn't throw errors, we'll focus on filter logic.

  // Test Case 4: Filter - Brand filter
  test('should filter products by brand', async () => {
    const query = ''; // No search query, just filter
    const filters = { brand: ['CoolBrand'] };
    const result: SearchResults = await searchProducts(query, filters);

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every(p => p.brand === 'CoolBrand')).toBe(true);
    expect(result.totalCount).toBeGreaterThan(0);
  });

  // Test Case 5: Filter - Price range filter
  test('should filter products by price range', async () => {
    const query = '';
    const filters = { price: [50, 100] }; // Between $50 and $100
    const result: SearchResults = await searchProducts(query, filters);

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every(p => p.price >= 50 && p.price <= 100)).toBe(true);
    expect(result.totalCount).toBeGreaterThan(0);
  });

  // Test Case 6: Combined Filters - Brand and Color
  test('should filter products by multiple criteria (brand and color)', async () => {
    const query = '';
    const filters = { brand: ['CoolBrand'], color: ['Blue'] };
    const result: SearchResults = await searchProducts(query, filters);

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every(p => p.brand === 'CoolBrand' && p.color === 'Blue')).toBe(true);
    expect(result.totalCount).toBeGreaterThan(0);
  });

  // Test Case 7: Pagination
  test('should return paginated results', async () => {
    const query = '';
    const filters = {};
    const page = 2;
    const limit = 3; // Assuming at least 3 items will be returned for page 1
    const result: SearchResults = await searchProducts(query, filters, page, limit);

    // The mock data has 10 products. If limit is 3, page 1 has 3, page 2 should have 3, etc.
    // Ensure we have enough products for this test to be meaningful.
    const allProducts = (await searchProducts('', {}, 1, 100)).products.length; // Get all mock products
    expect(allProducts).toBeGreaterThan(limit); // Ensure we have more than limit products

    expect(result.products.length).toBeLessThanOrEqual(limit);
    expect(result.totalCount).toBeGreaterThan(0); // Total count should reflect all matching products
  });

  // Test Case 8: Autocomplete - Basic suggestions
  test('should return autocomplete suggestions', async () => {
    const query = 'T-Shi';
    const result: AutocompleteSuggestions = await getAutocompleteSuggestions(query);

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.every(s => s.includes('T-Shirt'))).toBe(true);
  });

  // Test Case 9: Autocomplete - Empty query
  test('should return empty suggestions for an empty query', async () => {
    const query = '';
    const result: AutocompleteSuggestions = await getAutocompleteSuggestions(query);
    expect(result.suggestions).toEqual([]);
  });

  // Test Case 10: Autocomplete - No matching suggestions
  test('should return empty suggestions if no products match the query', async () => {
    const query = 'XYZ';
    const result: AutocompleteSuggestions = await getAutocompleteSuggestions(query);
    expect(result.suggestions).toEqual([]);
  });

  // Test Case 11: Facet calculation - Ensure facets are calculated correctly based on filtered data
  test('should return correctly calculated facets based on search results', async () => {
    const query = '';
    const filters = { brand: ['CoolBrand'] }; // Filter to only CoolBrand products
    const result: SearchResults = await searchProducts(query, filters);

    const brandFacet = result.facets.find(f => f.field === 'brand');
    expect(brandFacet).toBeDefined();
    // Expecting 2 CoolBrand products (Classic T-Shirt, Cozy Hoodie)
    const coolBrandOption = brandFacet?.options?.find(opt => opt.value === 'CoolBrand');
    expect(coolBrandOption?.count).toBe(2);

    const colorFacet = result.facets.find(f => f.field === 'color');
    expect(colorFacet).toBeDefined();
    // Expecting Blue (1) and Gray (1) for CoolBrand products
    const blueOption = colorFacet?.options?.find(opt => opt.value === 'Blue');
    expect(blueOption?.count).toBe(1);
    const grayOption = colorFacet?.options?.find(opt => opt.value === 'Gray');
    expect(grayOption?.count).toBe(1);
  });
});
