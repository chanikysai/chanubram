import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetail from '../../components/ProductDetail';
import type { Product } from '../../types/product';

const mockProduct: Product = {
  id: 'p1',
  name: 'Detailed Product Name',
  price: 123.45,
  description: 'This is a detailed description of the product.',
};

const mockProductWithoutDescription: Product = {
  id: 'p2',
  name: 'Product Without Desc',
  price: 67.89,
  // No description property
};

describe('ProductDetail', () => {
  it('renders product name, description, and price correctly', () => {
    render(<ProductDetail product={mockProduct} />);

    expect(screen.getByText('Detailed Product Name')).toBeInTheDocument();
    expect(screen.getByText('This is a detailed description of the product.')).toBeInTheDocument();
    expect(screen.getByText('Price: $123.45')).toBeInTheDocument();
  });

  it('renders "No description available." if description is missing', () => {
    render(<ProductDetail product={mockProductWithoutDescription} />);

    expect(screen.getByText('Product Without Desc')).toBeInTheDocument();
    expect(screen.getByText('No description available.')).toBeInTheDocument();
    expect(screen.getByText('Price: $67.89')).toBeInTheDocument();
  });

  // Edge case: Price with zero value
  it('renders correctly with a zero price product', () => {
    const zeroPriceProduct: Product = {
      id: 'p3',
      name: 'Free Item',
      price: 0,
      description: 'Completely free!',
    };
    render(<ProductDetail product={zeroPriceProduct} />);

    expect(screen.getByText('Free Item')).toBeInTheDocument();
    expect(screen.getByText('Completely free!')).toBeInTheDocument();
    expect(screen.getByText('Price: $0.00')).toBeInTheDocument();
  });

  // Error Handling: This is a presentational component, error handling is minimal.
  // It assumes 'product' prop is always a valid Product object.
  // Type safety should prevent issues with missing properties like 'name' or 'price'.
});
