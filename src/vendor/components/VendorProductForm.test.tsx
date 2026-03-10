import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorProductForm from './VendorProductForm';

describe('VendorProductForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  // Reset mocks before each test
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  // Test Case 1: Happy Path - Adding a new product
  test('should allow adding a new product with valid data', () => {
    render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const productNameInput = screen.getByLabelText(/product name/i);
    const productPriceInput = screen.getByLabelText(/price/i);
    const productStockInput = screen.getByLabelText(/stock quantity/i);
    const productDescriptionInput = screen.getByLabelText(/description/i);
    const productImageUrlInput = screen.getByLabelText(/image url/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    const productName = 'Test Product';
    const productPrice = '19.99';
    const productStock = '100';
    const productDescription = 'A product for testing.';
    const productImageUrl = 'http://example.com/image.jpg';

    fireEvent.change(productNameInput, { target: { value: productName } });
    fireEvent.change(productPriceInput, { target: { value: productPrice } });
    fireEvent.change(productStockInput, { target: { value: productStock } });
    fireEvent.change(productDescriptionInput, { target: { value: productDescription } });
    fireEvent.change(productImageUrlInput, { target: { value: productImageUrl } });

    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      stock: parseInt(productStock, 10),
      imageUrl: productImageUrl,
    });
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  // Test Case 2: Edge Case - Editing an existing product
  test('should pre-fill and allow editing of an existing product', () => {
    const existingProduct = {
      id: 'prod-123',
      name: 'Existing Gadget',
      description: 'This is an existing gadget.',
      price: 55.50,
      stock: 25,
      imageUrl: 'http://example.com/existing.jpg',
    };
    render(<VendorProductForm product={existingProduct} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Check if fields are pre-filled
    expect(screen.getByLabelText(/product name/i)).toHaveValue(existingProduct.name);
    expect(screen.getByLabelText(/price/i)).toHaveValue(existingProduct.price.toString());
    expect(screen.getByLabelText(/stock quantity/i)).toHaveValue(existingProduct.stock.toString());
    expect(screen.getByLabelText(/description/i)).toHaveValue(existingProduct.description);
    expect(screen.getByLabelText(/image url/i)).toHaveValue(existingProduct.imageUrl);

    // Modify a field and submit
    const newProductNameInput = screen.getByLabelText(/product name/i);
    const updatedProductName = 'Updated Gadget Name';
    fireEvent.change(newProductNameInput, { target: { value: updatedProductName } });

    const submitButton = screen.getByRole('button', { name: /update product/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      id: existingProduct.id, // ID is not expected in Omit<VendorProduct, 'id'> for onSubmit
      name: updatedProductName,
      description: existingProduct.description,
      price: existingProduct.price,
      stock: existingProduct.stock,
      imageUrl: existingProduct.imageUrl,
    });
  });

  // Test Case 3: Error Handling - Missing required fields
  test('should display an error message if required fields are empty', () => {
    render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /add product/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/all fields except image url are required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Test Case 4: Error Handling - Invalid price
  test('should display an error message for invalid price', () => {
    render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const productPriceInput = screen.getByLabelText(/price/i);
    fireEvent.change(productPriceInput, { target: { value: '-10' } }); // Negative price

    const submitButton = screen.getByRole('button', { name: /add product/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/price must be a non-negative number/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Test Case 5: Error Handling - Invalid stock
  test('should display an error message for invalid stock', () => {
    render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const productStockInput = screen.getByLabelText(/stock quantity/i);
    fireEvent.change(productStockInput, { target: { value: '-5' } }); // Negative stock

    const submitButton = screen.getByRole('button', { name: /add product/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/stock must be a non-negative integer/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Test Case 6: Cancel button functionality
  test('should call onCancel when the cancel button is clicked', () => {
    render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
