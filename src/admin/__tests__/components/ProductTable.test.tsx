import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductTable from '../../components/ProductTable';
import { Product } from '../../types/product';

// Mock data
const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Laptop', description: 'High performance laptop', price: 1200, stock: 50, imageUrl: 'http://example.com/laptop.jpg' },
  { id: 'prod-2', name: 'Keyboard', description: 'Mechanical keyboard', price: 75, stock: 120 },
];

describe('ProductTable', () => {
  const mockEdit = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    mockEdit.mockClear();
    mockDelete.mockClear();
  });

  // Happy Path: Render table with products
  test('should render table with products and their details', () => {
    render(<ProductTable products={mockProducts} onEdit={mockEdit} onDelete={mockDelete} />);

    // Check if table headers are rendered
    expect(screen.getByText(/image/i)).toBeInTheDocument();
    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/price/i)).toBeInTheDocument();
    expect(screen.getByText(/stock/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();

    // Check if product data is rendered
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('High performance laptop')).toBeInTheDocument();
    expect(screen.getByText('$1200.00')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Mechanical keyboard')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();

    // Check if image is rendered for the first product
    const imgElement = screen.getByAltText('Laptop');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', 'http://example.com/laptop.jpg');
  });

  // Happy Path: Click Edit button
  test('should call onEdit with the correct product when Edit button is clicked', () => {
    render(<ProductTable products={mockProducts} onEdit={mockEdit} onDelete={mockDelete} />);

    const firstProductEditButton = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(firstProductEditButton);

    expect(mockEdit).toHaveBeenCalledTimes(1);
    expect(mockEdit).toHaveBeenCalledWith(mockProducts[0]); // Should be called with the first product
  });

  // Happy Path: Click Delete button
  test('should call onDelete with the correct product ID when Delete button is clicked', () => {
    // Mock window.confirm to auto-confirm deletion
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<ProductTable products={mockProducts} onEdit={mockEdit} onDelete={mockDelete} />);

    const secondProductDeleteButton = screen.getAllByRole('button', { name: /delete/i })[1];
    fireEvent.click(secondProductDeleteButton);

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith('prod-2'); // Should be called with the ID of the second product

    confirmSpy.mockRestore();
  });

  // Edge Case: No products provided
  test('should display a message when no products are available', () => {
    render(<ProductTable products={[]} onEdit={mockEdit} onDelete={mockDelete} />);
    expect(screen.getByText(/no products available/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // Error Handling: Image placeholder for missing URL
  test('should display a placeholder if imageUrl is missing', () => {
    const productsWithoutImage: Product[] = [
      { id: 'prod-3', name: 'Mouse', description: 'Wireless mouse', price: 25, stock: 200 }
    ];
    render(<ProductTable products={productsWithoutImage} onEdit={mockEdit} onDelete={mockDelete} />);

    const noImgDiv = screen.getByText('NoImg');
    expect(noImgDiv).toBeInTheDocument();
    expect(noImgDiv).toHaveClass('w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500');
  });

  // Error Handling: Clicking Delete without confirming
  test('should not call onDelete if user cancels deletion confirmation', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => false); // User cancels

    render(<ProductTable products={mockProducts} onEdit={mockEdit} onDelete={mockDelete} />);

    const firstProductDeleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(firstProductDeleteButton);

    expect(mockDelete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
