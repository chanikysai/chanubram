import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductForm from '../../components/ProductForm';
import { Product } from '../../types/product';

describe('ProductForm', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
    mockCancel.mockClear();
  });

  // Happy Path: Add New Product
  test('should allow adding a new product and submit', async () => {
    render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const productNameInput = screen.getByLabelText(/product name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(productNameInput, { target: { value: 'New Gadget' } });
    fireEvent.change(descriptionInput, { target: { value: 'A very useful new gadget.' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(stockInput, { target: { value: '150' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'New Gadget',
        description: 'A very useful new gadget.',
        price: 99.99,
        stock: 150,
        imageUrl: undefined, // Should be undefined as it was empty
      });
    });
  });

  // Happy Path: Edit Existing Product
  test('should pre-fill form with existing product data for editing', async () => {
    const existingProduct: Product = {
      id: 'edit-1',
      name: 'Old Device',
      description: 'An older but reliable device.',
      price: 49.50,
      stock: 30,
      imageUrl: 'http://example.com/old.jpg',
    };

    render(<ProductForm product={existingProduct} onSubmit={mockSubmit} onCancel={mockCancel} />);

    expect(screen.getByLabelText(/product name/i)).toHaveValue('Old Device');
    expect(screen.getByLabelText(/description/i)).toHaveValue('An older but reliable device.');
    expect(screen.getByLabelText(/price/i)).toHaveValue('49.50');
    expect(screen.getByLabelText(/stock quantity/i)).toHaveValue('30');
    expect(screen.getByLabelText(/image url/i)).toHaveValue('http://example.com/old.jpg');
    expect(screen.getByRole('button', { name: /update product/i })).toBeInTheDocument();
  });

  // Happy Path: Cancel button
  test('should call onCancel when cancel button is clicked', () => {
    render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  // Edge Case: Image URL handling
  test('should handle empty imageUrl correctly when submitting', async () => {
    render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const productNameInput = screen.getByLabelText(/product name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(productNameInput, { target: { value: 'No Image Product' } });
    fireEvent.change(descriptionInput, { target: { value: 'This product has no image.' } });
    fireEvent.change(priceInput, { target: { value: '10.00' } });
    fireEvent.change(stockInput, { target: { value: '100' } });
    // imageUrl input is left empty

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        imageUrl: undefined, // Ensure it's undefined, not an empty string
      }));
    });
  });

  // Error Handling: Invalid price (e.g., negative)
  test('should show an alert for invalid price input', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const priceInput = screen.getByLabelText(/price/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(priceInput, { target: { value: '-10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields correctly. Price and stock must be non-negative numbers.');
      expect(mockSubmit).not.toHaveBeenCalled();
    });
    alertSpy.mockRestore();
  });

  // Error Handling: Invalid stock (e.g., non-numeric)
  test('should show an alert for invalid stock input', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const stockInput = screen.getByLabelText(/stock quantity/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(stockInput, { target: { value: 'abc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields correctly. Price and stock must be non-negative numbers.');
      expect(mockSubmit).not.toHaveBeenCalled();
    });
    alertSpy.mockRestore();
  });

  // Error Handling: Missing required field (name)
  test('should show an alert for missing required fields', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(descriptionInput, { target: { value: 'Some description' } });
    fireEvent.change(priceInput, { target: { value: '50.00' } });
    fireEvent.change(stockInput, { target: { value: '50' } });
    // Name is left empty

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields correctly. Price and stock must be non-negative numbers.');
      expect(mockSubmit).not.toHaveBeenCalled();
    });
    alertSpy.mockRestore();
  });
});
