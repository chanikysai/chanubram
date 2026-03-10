import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FacetFilter from '../components/FacetFilter';
import { Facet, FacetOption } from '../types/search';

const mockFacets: Facet[] = [
  {
    field: 'brand',
    label: 'Brand',
    type: 'checkbox',
    options: [
      { value: 'CoolBrand', count: 5 },
      { value: 'DenimCo', count: 3 },
    ],
  },
  {
    field: 'price',
    label: 'Price Range',
    type: 'range',
    min: 0,
    max: 200,
  },
  {
    field: 'color',
    label: 'Color',
    type: 'checkbox',
    options: [
      { value: 'Blue', count: 7 },
      { value: 'Black', count: 2 },
    ],
  },
  {
    field: 'size',
    label: 'Size',
    type: 'checkbox',
    options: [], // Empty options for testing
  },
];

describe('FacetFilter', () => {
  // Test Case 1: Happy Path - Renders all facets and their options
  test('should render all facets and their options', () => {
    render(<FacetFilter facets={mockFacets} currentFilters={{}} onFilterChange={jest.fn()} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();

    // Check for options within Brand facet
    expect(screen.getByLabelText('CoolBrand (5)')).toBeInTheDocument();
    expect(screen.getByLabelText('DenimCo (3)')).toBeInTheDocument();

    // Check for Price Range inputs
    expect(screen.getByPlaceholderText('Min ($0)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max ($200)')).toBeInTheDocument();

    // Check for options within Color facet
    expect(screen.getByLabelText('Blue (7)')).toBeInTheDocument();
    expect(screen.getByLabelText('Black (2)')).toBeInTheDocument();

    // Check for empty options message
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  // Test Case 2: Event Handling - Toggling facet expansion
  test('should toggle facet expansion when header is clicked', () => {
    render(<FacetFilter facets={mockFacets} currentFilters={{}} onFilterChange={jest.fn()} />);

    const brandHeader = screen.getByText('Brand').parentElement!; // Get the header div
    expect(screen.getByLabelText('CoolBrand (5)')).toBeVisible(); // Initially visible

    fireEvent.click(brandHeader); // Collapse
    expect(screen.queryByLabelText('CoolBrand (5)')).not.toBeVisible();

    fireEvent.click(brandHeader); // Expand again
    expect(screen.getByLabelText('CoolBrand (5)')).toBeVisible();
  });

  // Test Case 3: Event Handling - Checkbox filter change
  test('should call onFilterChange with updated filters when checkbox is toggled', () => {
    const mockOnFilterChange = jest.fn();
    render(<FacetFilter facets={mockFacets} currentFilters={{}} onFilterChange={mockOnFilterChange} />);

    const coolBrandCheckbox = screen.getByLabelText('CoolBrand (5)');
    fireEvent.click(coolBrandCheckbox); // Select CoolBrand

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith({ brand: ['CoolBrand'] });

    fireEvent.click(coolBrandCheckbox); // Deselect CoolBrand
    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
    expect(mockOnFilterChange).toHaveBeenCalledWith({}); // Should remove filter if empty
  });

  // Test Case 4: Event Handling - Range filter change
  test('should call onFilterChange with updated price range when inputs change', async () => {
    const mockOnFilterChange = jest.fn();
    render(<FacetFilter facets={mockFacets} currentFilters={{}} onFilterChange={mockOnFilterChange} />);

    const minInput = screen.getByPlaceholderText('Min ($0)');
    const maxInput = screen.getByPlaceholderText('Max ($200)');

    // Update min price
    fireEvent.change(minInput, { target: { value: '50' } });
    await waitFor(() => expect(mockOnFilterChange).toHaveBeenCalledWith({ price: [50, 200] }));

    // Update max price
    fireEvent.change(maxInput, { target: { value: '150' } });
    await waitFor(() => expect(mockOnFilterChange).toHaveBeenCalledWith({ price: [50, 150] }));
  });

  // Test Case 5: Initialization - Sets initial expanded facets
  test('should initialize with all facets expanded', () => {
    const { rerender } = render(<FacetFilter facets={mockFacets} currentFilters={{}} onFilterChange={jest.fn()} />);

    // Check if options are visible by default
    expect(screen.getByLabelText('CoolBrand (5)')).toBeVisible();
    expect(screen.getByLabelText('Blue (7)')).toBeVisible();

    // Test re-rendering with new facets, ensuring initialization logic works
    const newFacets: Facet[] = [
      { field: 'newFacet', label: 'New Filter', type: 'checkbox', options: [{ value: 'A', count: 1 }] },
    ];
    rerender(<FacetFilter facets={newFacets} currentFilters={{}} onFilterChange={jest.fn()} />);
    expect(screen.getByText('New Filter')).toBeInTheDocument();
    expect(screen.getByLabelText('A (1)')).toBeVisible();
  });

  // Test Case 6: Current Filters - Renders with pre-selected filters
  test('should render with pre-selected filters applied', () => {
    const initialFilters = {
      brand: ['DenimCo'],
      color: ['Black'],
      price: [100, 180],
    };
    render(<FacetFilter facets={mockFacets} currentFilters={initialFilters} onFilterChange={jest.fn()} />);

    // Check if checkboxes are checked
    expect(screen.getByLabelText('DenimCo (3)')).toBeChecked();
    expect(screen.getByLabelText('CoolBrand (5)')).not.toBeChecked();
    expect(screen.getByLabelText('Black (2)')).toBeChecked();
    expect(screen.getByLabelText('Blue (7)')).not.toBeChecked();

    // Check if range inputs reflect current filters
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('180')).toBeInTheDocument();
  });

  // Test Case 7: Edge Case - Handling invalid range input
  test('should handle invalid range input gracefully', async () => {
    const mockOnFilterChange = jest.fn();
    render(<FacetFilter facets={mockFacets} currentFilters={{ price: [50, 150] }} onFilterChange={mockOnFilterChange} />);

    const minInput = screen.getByDisplayValue('50'); // initial value from currentFilters
    const maxInput = screen.getByDisplayValue('150');

    // Enter non-numeric value for min
    fireEvent.change(minInput, { target: { value: 'abc' } });
    await waitFor(() => expect(mockOnFilterChange).not.toHaveBeenCalled()); // Should not call if input is invalid

    // Enter value that makes min > max
    fireEvent.change(minInput, { target: { value: '160' } });
    await waitFor(() => expect(mockOnFilterChange).toHaveBeenCalledWith({ price: [160, 150] })); // Should update based on logic
  });
});
