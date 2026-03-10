import { Product, Facet, SearchResults, AutocompleteSuggestions } from '../types/search';

// Simulate API calls to a backend endpoint, e.g., /api/search
// In a real app, this would use fetch or an HTTP client like Axios.

const mockProducts: Product[] = [
  { id: 'p1', name: 'Classic T-Shirt', description: 'A comfortable and stylish cotton t-shirt.', price: 25, imageUrl: '/images/tshirt-classic.jpg', brand: 'CoolBrand', color: 'Blue', size: 'M' },
  { id: 'p2', name: 'Slim Fit Jeans', description: 'Modern slim fit denim jeans.', price: 60, imageUrl: '/images/jeans-slim.jpg', brand: 'DenimCo', color: 'Blue', size: 'L' },
  { id: 'p3', name: 'Running Sneakers', description: 'Lightweight sneakers for performance running.', price: 120, imageUrl: '/images/sneakers-running.jpg', brand: 'Sporty', color: 'White', size: '10' },
  { id: 'p4', name: 'Cozy Hoodie', description: 'A warm and soft hooded sweatshirt.', price: 50, imageUrl: '/images/hoodie-cozy.jpg', brand: 'CoolBrand', color: 'Gray', size: 'L' },
  { id: 'p5', name: 'Elegant Evening Dress', description: 'A sophisticated dress perfect for formal events.', price: 150, imageUrl: '/images/dress-evening.jpg', brand: 'ChicFashion', color: 'Black', size: 'S' },
  { id: 'p6', name: 'Summer Shorts', description: 'Breathable shorts for warm weather.', price: 30, imageUrl: '/images/shorts-summer.jpg', brand: 'SummerVibes', color: 'Red', size: 'M' },
  { id: 'p7', name: 'Graphic T-Shirt', description: 'T-shirt with a cool graphic print.', price: 30, imageUrl: '/images/tshirt-graphic.jpg', brand: 'CoolBrand', color: 'Black', size: 'M' },
  { id: 'p8', name: 'High-Waisted Jeans', description: 'Trendy high-waisted denim jeans.', price: 70, imageUrl: '/images/jeans-highwaist.jpg', brand: 'DenimCo', color: 'Black', size: 'M' },
  { id: 'p9', name: 'Casual Sneakers', description: 'Everyday casual sneakers.', price: 80, imageUrl: '/images/sneakers-casual.jpg', brand: 'Sporty', color: 'Gray', size: '9' },
  { id: 'p10', name: 'Zip-Up Hoodie', description: 'A versatile zip-up hoodie.', price: 55, imageUrl: '/images/hoodie-zipup.jpg', brand: 'CoolBrand', color: 'Blue', size: 'L' },
];

const ALL_AVAILABLE_FACETS: Facet[] = [
  { field: 'brand', label: 'Brand', type: 'checkbox', options: [] },
  { field: 'price', label: 'Price Range', type: 'range', min: 0, max: 200 },
  { field: 'color', label: 'Color', type: 'checkbox', options: [] },
  { field: 'size', label: 'Size', type: 'checkbox', options: [] },
];

// Helper to update facet options based on available products
const getUpdatedFacets = (products: Product[]): Facet[] => {
  const facetMap: Record<string, Facet> = {};
  ALL_AVAILABLE_FACETS.forEach(facet => {
    facetMap[facet.field] = { ...facet, options: [] };
  });

  products.forEach(product => {
    if (product.brand && facetMap.brand.options) {
      const optionIndex = facetMap.brand.options?.findIndex(opt => opt.value === product.brand);
      if (optionIndex !== -1) {
        facetMap.brand.options![optionIndex].count++;
      } else {
        facetMap.brand.options?.push({ value: product.brand, count: 1 });
      }
    }
    if (product.color && facetMap.color.options) {
      const optionIndex = facetMap.color.options?.findIndex(opt => opt.value === product.color);
      if (optionIndex !== -1) {
        facetMap.color.options![optionIndex].count++;
      } else {
        facetMap.color.options?.push({ value: product.color, count: 1 });
      }
    }
    if (product.size && facetMap.size.options) {
      const optionIndex = facetMap.size.options?.findIndex(opt => opt.value === product.size);
      if (optionIndex !== -1) {
        facetMap.size.options![optionIndex].count++;
      } else {
        facetMap.size.options?.push({ value: product.size, count: 1 });
      }
    }
  });

  // For price range, we might want to set min/max based on current products
  const prices = products.map(p => p.price);
  if (prices.length > 0) {
      facetMap.price.min = Math.min(...prices);
      facetMap.price.max = Math.max(...prices);
  }

  return Object.values(facetMap).map(facet => ({
      ...facet,
      // Sort options alphabetically for checkboxes, important for consistent UI
      options: facet.options?.sort((a, b) => a.value.localeCompare(b.value))
  }));
};


export const searchProducts = async (query: string, filters: Record<string, any> = {}, page: number = 1, limit: number = 10): Promise<SearchResults> => {
  console.log(`API: Searching for "${query}" with filters:`, filters);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let results = [...mockProducts];

  // Apply search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Apply filters
  if (filters.brand) {
    results = results.filter(p => filters.brand.includes(p.brand));
  }
  if (filters.color) {
    results = results.filter(p => filters.color.includes(p.color));
  }
  if (filters.size) {
    results = results.filter(p => filters.size.includes(p.size));
  }
  if (filters.price && filters.price.length === 2) {
    const [minPrice, maxPrice] = filters.price;
    results = results.filter(p => p.price >= minPrice && p.price <= maxPrice);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  // Get facets based on the filtered results
  const dynamicFacets = getUpdatedFacets(results);

  return {
    products: paginatedResults,
    facets: dynamicFacets,
    totalCount: results.length,
  };
};

export const getAutocompleteSuggestions = async (query: string): Promise<AutocompleteSuggestions> => {
  console.log(`API: Getting suggestions for "${query}"`);
  await new Promise(resolve => setTimeout(resolve, 200));

  if (!query) {
    return { suggestions: [] };
  }

  const lowerQuery = query.toLowerCase();
  const suggestions = mockProducts
    .filter(p => p.name.toLowerCase().includes(lowerQuery))
    .slice(0, 5) // Limit to 5 suggestions
    .map(p => p.name);

  return { suggestions };
};

// Note: fetchFacets might be redundant if searchProducts always returns facets.
// However, in a real app, you might have a separate endpoint to get facets for a given category or search context.
// For this feature, we'll assume searchProducts handles facet generation.
