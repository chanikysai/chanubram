// src/__tests__/components/ProductDetail.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetail from '../components/ProductDetail';

// Mock Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inventory: number;
}

const mockProduct: Product = {
  id: 'prod_1',
  name: 'Stylish T-Shirt',
  description: 'A comfortable and stylish t-shirt made from 100% cotton.',
  price: 25.00,
  imageUrl: '/images/product1.jpg',
  inventory: 50,
};

const mockProductWithNoDescription: Product = {
  id: 'prod_2',
  name: 'Comfortable Jeans',
  description: '', // Empty description
  price: 50.50,
  imageUrl: '/images/product2.jpg',
  inventory: 30,
};

const mockProductWithNoImage: Product = {
  id: 'prod_3',
  name: 'Classic Sneakers',
  description: 'Timeless sneakers perfect for any casual outfit.',
  price: 75.00,
  imageUrl: '', // Empty image URL
  inventory: 20,
};

const mockProductOutOfStock: Product = {
  id: 'prod_4',
  name: 'Winter Jacket',
  description: 'Warm and waterproof jacket for cold weather.',
  price: 120.00,
  imageUrl: '/images/product4.jpg',
  inventory: 0, // Out of stock
};

describe('ProductDetail', () => {
  // Happy Path Test: Renders all product details correctly
  test('renders product name, description, price, and image', () => {
    render(<ProductDetail product={mockProduct} />);

    expect(screen.getByText('Stylish T-Shirt')).toBeInTheDocument();
    expect(screen.getByText(/A comfortable and stylish t-shirt/i)).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    const imgElement = screen.getByAltText('Stylish T-Shirt');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/images/product1.jpg');
    expect(screen.getByText('Stock: 50')).toBeInTheDocument();
  });

  // Edge Case Test: Renders with default message if description is missing
  test('renders with "No description available" message if description is empty', () => {
    render(<ProductDetail product={mockProductWithNoDescription} />);

    expect(screen.getByText('Comfortable Jeans')).toBeInTheDocument();
    expect(screen.getByText('No description available for this product.')).toBeInTheDocument();
    expect(screen.getByText('$50.50')).toBeInTheDocument();
  });

  // Edge Case Test: Renders with a placeholder image if imageUrl is missing
  test('renders with a placeholder image if imageUrl is empty', () => {
    render(<ProductDetail product={mockProductWithNoImage} />);

    expect(screen.getByText('Classic Sneakers')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    const imgElement = screen.getByAltText('Classic Sneakers');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', 'https://via.placeholder.com/400');
  });

  // Edge Case Test: Displays "Out of Stock" message correctly
  test('displays "Out of Stock" when inventory is 0', () => {
    render(<ProductDetail product={mockProductOutOfStock} />);

    expect(screen.getByText('Winter Jacket')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  // Edge Case Test: Displays correct stock count when inventory is low but available
  test('displays correct stock count when inventory is low but available', () => {
    const productWithLowStock: Product = { ...mockProduct, inventory: 5 };
    render(<ProductDetail product={productWithLowStock} />);

    expect(screen.getByText('Stock: 5')).toBeInTheDocument();
    // Check if the color style (orange) is applied if relevant CSS/inline styles exist
    // For simplicity, we test the text content here.
  });

  // Test for dynamic styling based on inventory (e.g., color)
  test('applies specific styling for low stock items', () => {
    const productWithLowStock: Product = { ...mockProduct, inventory: 5 };
    render(<ProductDetail product={productWithLowStock} />);

    const stockElement = screen.getByText('Stock: 5');
    expect(stockElement).toBeInTheDocument();
    // Check if the parent paragraph has an inline style with orange color
    expect(stockElement.parentElement).toHaveStyle('color: orange');
  });
});
