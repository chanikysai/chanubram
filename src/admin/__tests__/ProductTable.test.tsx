import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductTable from '../components/ProductTable';
import { Product } from '../types/product';

describe('ProductTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const products: Product[] = [
    { id: 'p1', name: 'Laptop', description: 'Powerful laptop', price: 1200.00, stock: 10, imageUrl: 'laptop.jpg' },
    { id: 'p2', name: 'Mouse', description: 'Wireless mouse', price: 25.50, stock: 50, imageUrl: 'mouse.jpg' },
    { id: 'p3', name: 'Keyboard', description: 'Mechanical keyboard', price: 75.00, stock: 30, imageUrl: '' },
  ];

  // Happy Path: Render table with multiple products
  test('should render a table with products and their details', () => {
    render(<ProductTable products={products} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Check if table headers are present
    expect(screen.getByText(/Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Price/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Actions/i)).toBeInTheDocument();

    // Check if product data is rendered
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Powerful laptop')).toBeInTheDocument();
    expect(screen.getByText('$1200.00')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.getByText('Wireless mouse')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Check image rendering (or placeholder)
    const laptopImage = screen.getByAltText('Laptop');
    expect(laptopImage).toHaveAttribute('src', 'laptop.jpg');
    const keyboardImagePlaceholder = screen.getByText('NoImg');
    expect(keyboardImagePlaceholder).toBeInTheDocument();
  });

  // Edge Case: Render table with an empty list of products
  test('should display "No products available." when the products array is empty', () => {
    render(<ProductTable products={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('No products available.')).toBeInTheDocument();
    // Ensure no table headers or rows are rendered
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // Edge Case: Render table with null or undefined products
  test('should display "No products available." when products is null or undefined', () => {
    render(<ProductTable products={null as any} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('No products available.')).toBeInTheDocument();

    render(<ProductTable products={undefined as any} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('No products available.')).toBeInTheDocument();
  });

  // Action Button: Edit
  test('should call onEdit with the correct product when Edit button is clicked', () => {
    render(<ProductTable products={products} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Find the Edit button for the first product
    const laptopRow = screen.getByText('Laptop').closest('tr');
    const editButton = laptopRow?.querySelector('button:has([aria-label="Edit"])') || laptopRow?.querySelector('button:contains("Edit")');
    
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton!);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(products[0]);
  });

  // Action Button: Delete
  test('should call onDelete with the correct product ID when Delete button is clicked', () => {
    // Mock window.confirm to bypass the confirmation dialog during testing
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ProductTable products={products} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Find the Delete button for the second product
    const mouseRow = screen.getByText('Mouse').closest('tr');
    const deleteButton = mouseRow?.querySelector('button:has([aria-label="Delete"])') || mouseRow?.querySelector('button:contains("Delete")');

    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton!);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('p2');

    // Restore the original confirm function
    confirmSpy.mockRestore();
  });

  // Action Button: Delete (User cancels confirmation)
  test('should not call onDelete if user cancels the confirmation dialog', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false); // User cancels

    render(<ProductTable products={products} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const mouseRow = screen.getByText('Mouse').closest('tr');
    const deleteButton = mouseRow?.querySelector('button:has([aria-label="Delete"])') || mouseRow?.querySelector('button:contains("Delete")');
    
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton!);

    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(confirmSpy).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });
});
