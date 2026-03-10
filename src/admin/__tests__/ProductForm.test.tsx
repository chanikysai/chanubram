import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductForm from '../components/ProductForm';
import { Product } from '../types/product';

describe('ProductForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  // Happy Path: Add new product
  test('should call onSubmit with correct product data when adding a new product', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const productNameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock Quantity/i);
    const imageUrlInput = screen.getByLabelText(/Image URL \(Optional\)/i);
    const submitButton = screen.getByRole('button', { name: /Add Product/i });

    fireEvent.change(productNameInput, { target: { value: 'New Gadget' } });
    fireEvent.change(descriptionInput, { target: { value: 'A cool new gadget for everyone.' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(stockInput, { target: { value: '150' } });
    fireEvent.change(imageUrlInput, { target: { value: 'http://example.com/image.jpg' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: '', // ID should be empty for new product submission
        name: 'New Gadget',
        description: 'A cool new gadget for everyone.',
        price: 99.99,
        stock: 150,
        imageUrl: 'http://example.com/image.jpg',
      });
    });
  });

  // Happy Path: Edit existing product
  test('should pre-fill form with product data and call onSubmit when editing', async () => {
    const existingProduct: Product = {
      id: 'prod-123',
      name: 'Old Gadget',
      description: 'An older version of the gadget.',
      price: 50.00,
      stock: 50,
      imageUrl: 'http://example.com/old_image.jpg',
    };
    render(<ProductForm product={existingProduct} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const productNameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock Quantity/i);
    const imageUrlInput = screen.getByLabelText(/Image URL \(Optional\)/i);
    const submitButton = screen.getByRole('button', { name: /Update Product/i });

    // Verify form is pre-filled
    expect(productNameInput).toHaveValue('Old Gadget');
    expect(descriptionInput).toHaveValue('An older version of the gadget.');
    expect(priceInput).toHaveValue('50');
    expect(stockInput).toHaveValue('50');
    expect(imageUrlInput).toHaveValue('http://example.com/old_image.jpg');

    // Modify a field
    fireEvent.change(priceInput, { target: { value: '55.50' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: 'prod-123',
        name: 'Old Gadget',
        description: 'An older version of the gadget.',
        price: 55.50,
        stock: 50,
        imageUrl: 'http://example.com/old_image.jpg',
      });
    });
  });

  // Edge Case: Empty required fields
  test('should show an error message when required fields are empty', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /Add Product/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
    });
  });

  // Error Handling: Invalid price
  test('should show an error message for invalid price input', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const priceInput = screen.getByLabelText(/Price/i);
    const submitButton = screen.getByRole('button', { name: /Add Product/i });

    fireEvent.change(priceInput, { target: { value: '-10' } }); // Negative price
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Price must be a non-negative number.')).toBeInTheDocument();
    });

    fireEvent.change(priceInput, { target: { value: 'abc' } }); // Non-numeric price
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Price must be a non-negative number.')).toBeInTheDocument();
    });
  });

  // Error Handling: Invalid stock
  test('should show an error message for invalid stock input', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const stockInput = screen.getByLabelText(/Stock Quantity/i);
    const submitButton = screen.getByRole('button', { name: /Add Product/i });

    fireEvent.change(stockInput, { target: { value: '-5' } }); // Negative stock
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Stock must be a non-negative integer.')).toBeInTheDocument();
    });

    fireEvent.change(stockInput, { target: { value: 'xyz' } }); // Non-numeric stock
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Stock must be a non-negative integer.')).toBeInTheDocument();
    });
  });

  // Cancel button functionality
  test('should call onCancel when the cancel button is clicked', () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Test with missing optional imageUrl
  test('should handle submission when imageUrl is empty', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const productNameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock Quantity/i);
    const submitButton = screen.getByRole('button', { name: /Add Product/i });

    fireEvent.change(productNameInput, { target: { value: 'Basic Item' } });
    fireEvent.change(descriptionInput, { target: { value: 'A simple item.' } });
    fireEvent.change(priceInput, { target: { value: '10.00' } });
    fireEvent.change(stockInput, { target: { value: '100' } });
    // imageUrl is left empty

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: '',
        name: 'Basic Item',
        description: 'A simple item.',
        price: 10.00,
        stock: 100,
        imageUrl: undefined, // imageUrl should be undefined when empty
      });
    });
  });
});
