// src/__tests__/components/ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../components/ProductCard';
import { Product } from '../../services/productApi';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  description: 'A test product description.',
  imageUrl: 'https://via.placeholder.com/150/aabbcc',
  category: 'Test Category',
  specifications: { 'Color': 'Blue' },
};

describe('ProductCard', () => {
  // Happy Path: Renders product information correctly
  test('should render product name, price, and category', () => {
    render(<ProductCard product={mockProduct} onClick={jest.fn()} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toHaveAttribute('src', mockProduct.imageUrl);
  });

  // Edge Case: Product with missing optional fields (like specifications, though not rendered here)
  // This test primarily focuses on rendering what's expected and ensuring no errors.
  test('should render correctly even if optional fields are missing', () => {
    const productWithoutSpecs = { ...mockProduct, specifications: undefined };
    render(<ProductCard product={productWithoutSpecs} onClick={jest.fn()} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  // Error Handling: Test click handler is called
  test('should call onClick handler when the card is clicked', () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);

    const cardElement = screen.getByText('Test Product').closest('.product-card');
    expect(cardElement).toBeInTheDocument();

    fireEvent.click(cardElement!);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockProduct);
  });

  // Add more tests if specific styling or accessibility is a concern.
  // For example, checking if styles are applied correctly or if ARIA attributes are present.
});
