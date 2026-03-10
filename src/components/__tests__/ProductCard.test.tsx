import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/search';

const mockProduct: Product = {
  id: 'p1',
  name: 'Classic T-Shirt',
  description: 'A comfortable and stylish cotton t-shirt.',
  price: 25,
  imageUrl: '/images/tshirt-classic.jpg',
  brand: 'CoolBrand',
  color: 'Blue',
  size: 'M',
};

const mockProductWithoutAttributes: Product = {
  id: 'p2',
  name: 'Basic Item',
  description: 'A simple item.',
  price: 10,
  imageUrl: '/images/basic.jpg',
};

describe('ProductCard', () => {
  // Test Case 1: Happy Path - Renders product details correctly
  test('should render product details correctly', () => {
    render(<ProductCard product={mockProduct} onClick={jest.fn()} />);

    expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('A comfortable and stylish cotton t-shirt.')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByAltText('Classic T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Brand: CoolBrand')).toBeInTheDocument();
    expect(screen.getByText('Color: Blue')).toBeInTheDocument();
    expect(screen.getByText('Size: M')).toBeInTheDocument();
  });

  // Test Case 2: Edge Case - Renders without optional attributes
  test('should render without optional attributes if they are not provided', () => {
    render(<ProductCard product={mockProductWithoutAttributes} onClick={jest.fn()} />);

    expect(screen.getByText('Basic Item')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByAltText('Basic Item')).toBeInTheDocument();

    // Ensure attributes that are not present are not rendered
    expect(screen.queryByText(/Brand:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Color:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Size:/)).not.toBeInTheDocument();
  });

  // Test Case 3: Event Handling - Calls onClick when clicked
  test('should call onClick prop with product ID when clicked', () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);

    const cardElement = screen.getByText('Classic T-Shirt').closest('.product-card');
    expect(cardElement).toBeInTheDocument();

    fireEvent.click(cardElement!);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockProduct.id);
  });
});
