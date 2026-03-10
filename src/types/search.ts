export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand?: string;
  color?: string;
  size?: string;
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface Facet {
  field: string; // e.g., 'brand', 'price', 'color'
  label: string; // e.g., 'Brand', 'Price Range', 'Color'
  type: 'range' | 'checkbox' | 'dropdown'; // Type of filter UI
  options?: FacetOption[]; // For checkbox/dropdown
  min?: number; // For range
  max?: number; // For range
}

export interface SearchResults {
  products: Product[];
  facets: Facet[];
  totalCount: number;
}

export interface AutocompleteSuggestions {
  suggestions: string[];
}
