// src/__tests__/components/ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ProductCard'; // Adjust path based on your project structure

// Mock Product type based on the one used in productApi.ts
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

const mockProductWithoutImage: Product = {
  id: 'prod_2',
  name: 'Comfortable Jeans',
  description: 'Durable and soft denim jeans for everyday wear.',
  price: 50.50,
  imageUrl: '', // Empty image URL to test placeholder
  inventory: 30,
};

const mockProductWithLowInventory: Product = {
  id: 'prod_3',
  name: 'Classic Sneakers',
  description: 'Timeless sneakers perfect for any casual outfit.',
  price: 75.00,
  imageUrl: '/images/product3.jpg',
  inventory: 5, // Low stock
};


describe('ProductCard', () => {
  // Happy Path Test: Renders product details correctly
  test('renders product name, price, and image', () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    expect(screen.getByText('Stylish T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    const imgElement = screen.getByAltText('Stylish T-Shirt');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/images/product1.jpg');
  });

  // Edge Case Test: Renders with a placeholder image if imageUrl is missing
  test('renders with a placeholder image if imageUrl is empty', () => {
    render(<ProductCard product={mockProductWithoutImage} onClick={() => {}} />);

    expect(screen.getByText('Comfortable Jeans')).toBeInTheDocument();
    expect(screen.getByText('$50.50')).toBeInTheDocument();
    const imgElement = screen.getByAltText('Comfortable Jeans');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', 'https://via.placeholder.com/150');
  });

  // Edge Case Test: Click handler is called with the correct product ID
  test('calls onClick handler with product id when clicked', () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);

    // Find the closest element that represents the card and is clickable
    const cardElement = screen.getByText('Stylish T-Shirt').closest('.product-card');
    expect(cardElement).toBeInTheDocument();
    fireEvent.click(cardElement!);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('prod_1');
  });

  // Test for accessibility: keyboard interaction
  test('allows interaction via keyboard (Enter key)', () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);

    const cardElement = screen.getByText('Stylish T-Shirt').closest('.product-card');
    expect(cardElement).toBeInTheDocument();

    // Simulate pressing Enter key on the focused element
    fireEvent.keyDown(cardElement!, { key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13 });

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('prod_1');
  });

  // Optional: Test for rendering low inventory status if that feature is added to ProductCard
  // test('displays low inventory status if inventory is low', () => {
  //   render(<ProductCard product={mockProductWithLowInventory} onClick={() => {}} />);
  //   // Assuming a paragraph with text like 'Low Stock' or similar is rendered
  //   // expect(screen.getByText(/low stock/i)).toBeInTheDocument();
  // });
});
