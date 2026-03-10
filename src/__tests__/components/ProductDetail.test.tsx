// src/__tests__/components/ProductDetail.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetail from '../../components/ProductDetail';
import { Product } from '../../services/productApi';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product Detail',
  price: 199.50,
  description: 'This is a detailed description of the test product.',
  imageUrl: 'https://via.placeholder.com/400/abcdef',
  category: 'Detail Category',
  specifications: {
    'Weight': '1kg',
    'Dimensions': '10x10x10 cm',
    'Color': 'Red',
  },
};

describe('ProductDetail', () => {
  // Happy Path: Renders all product details correctly
  test('should render product name, price, description, image, and specifications', () => {
    render(<ProductDetail product={mockProduct} isLoading={false} error={null} />);

    expect(screen.getByText('Test Product Detail')).toBeInTheDocument();
    expect(screen.getByText('$199.50')).toBeInTheDocument();
    expect(screen.getByText('This is a detailed description of the test product.')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product Detail')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product Detail')).toHaveAttribute('src', mockProduct.imageUrl);
    expect(screen.getByText('Weight:')).toBeInTheDocument();
    expect(screen.getByText('1kg')).toBeInTheDocument();
    expect(screen.getByText('Dimensions:')).toBeInTheDocument();
    expect(screen.getByText('10x10x10 cm')).toBeInTheDocument();
    expect(screen.getByText('Color:')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Category: Detail Category')).toBeInTheDocument();
  });

  // Edge Case: No product data provided (null product)
  test('should display a message when no product is provided', () => {
    render(<ProductDetail product={null} isLoading={false} error={null} />);
    expect(screen.getByText('No product selected or found.')).toBeInTheDocument();
  });

  // Edge Case: Product with no specifications
  test('should display "No specifications available" if specifications are empty or missing', () => {
    const productWithoutSpecs: Product = { ...mockProduct, specifications: {} };
    render(<ProductDetail product={productWithoutSpecs} isLoading={false} error={null} />);

    expect(screen.getByText('No specifications available.')).toBeInTheDocument();
    expect(screen.queryByText('Weight:')).not.toBeInTheDocument(); // Ensure specs are not listed
  });

  // Error Handling: Displays error message when error prop is set
  test('should display error message when error prop is provided', () => {
    const errorMessage = 'Failed to load product.';
    render(<ProductDetail product={null} isLoading={false} error={errorMessage} />);

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    expect(screen.queryByText('No product selected or found.')).not.toBeInTheDocument(); // Error message should take precedence
  });

  // Loading State: Displays loading message when isLoading is true
  test('should display loading message when isLoading is true', () => {
    render(<ProductDetail product={null} isLoading={true} error={null} />);

    expect(screen.getByText('Loading product details...')).toBeInTheDocument();
    expect(screen.queryByText('No product selected or found.')).not.toBeInTheDocument(); // Loading should take precedence
    expect(screen.queryByText('Error:')).not.toBeInTheDocument(); // Loading should take precedence
  });
});
