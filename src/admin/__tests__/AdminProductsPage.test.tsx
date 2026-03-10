import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminProductsPage from '../pages/AdminProductsPage';
import * as adminProductApi from '../services/adminProductApi';
import { Product } from '../types/product';

// Mock the adminProductApi module
jest.mock('../services/adminProductApi');

// Define mock products
const mockProducts: Product[] = [
  { id: 'p1', name: 'Laptop', description: 'Powerful laptop', price: 1200.00, stock: 10, imageUrl: 'laptop.jpg' },
  { id: 'p2', name: 'Mouse', description: 'Wireless mouse', price: 25.50, stock: 50, imageUrl: 'mouse.jpg' },
];

// Cast to JestMocked for type safety
const mockedAdminProductApi = adminProductApi as jest.Mocked<typeof adminProductApi>;

describe('AdminProductsPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAdminProductApi.getProducts.mockClear();
    mockedAdminProductApi.createProduct.mockClear();
    mockedAdminProductApi.updateProduct.mockClear();
    mockedAdminProductApi.deleteProduct.mockClear();

    // Default successful mock for getProducts
    mockedAdminProductApi.getProducts.mockResolvedValue(mockProducts);
    // Mocking other operations to return dummy data or void for now
    mockedAdminProductApi.createProduct.mockResolvedValue({ id: 'new-p3', name: 'New Product', description: 'Newly created', price: 100, stock: 10 });
    mockedAdminProductApi.updateProduct.mockResolvedValue({ id: 'p1', name: 'Updated Laptop', price: 1300, stock: 9 });
    mockedAdminProductApi.deleteProduct.mockResolvedValue(undefined);

    // Mock window.confirm for delete confirmation
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    // Restore mocks after each test
    jest.restoreAllMocks();
  });

  // --- Initial Load and Display ---
  test('should fetch and display products on mount', async () => {
    render(<AdminProductsPage />);

    // Check if loading indicator is shown initially (optional, depends on UI)
    // expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for products to be fetched and displayed
    await waitFor(() => {
      expect(mockedAdminProductApi.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Stock for Laptop
      expect(screen.getByText('50')).toBeInTheDocument(); // Stock for Mouse
    });
  });

  // --- Add New Product Flow ---
  test('should allow adding a new product', async () => {
    render(<AdminProductsPage />);

    // Wait for initial load to complete
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Click "Add New Product"
    const addButton = screen.getByRole('button', { name: /Add New Product/i });
    fireEvent.click(addButton);

    // Fill the form
    const productNameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock Quantity/i);
    const submitButton = screen.getByRole('button', { name: /Add Product/i });

    fireEvent.change(productNameInput, { target: { value: 'Keyboard' } });
    fireEvent.change(descriptionInput, { target: { value: 'Mechanical Keyboard' } });
    fireEvent.change(priceInput, { target: { value: '75.00' } });
    fireEvent.change(stockInput, { target: { value: '30' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Verify createProduct was called
    await waitFor(() => {
      expect(mockedAdminProductApi.createProduct).toHaveBeenCalledTimes(1);
      expect(mockedAdminProductApi.createProduct).toHaveBeenCalledWith({
        name: 'Keyboard',
        description: 'Mechanical Keyboard',
        price: 75.00,
        stock: 30,
        imageUrl: undefined,
      });
    });

    // Verify the list is refreshed and shows the new product
    await waitFor(() => {
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.getByText('75.00')).toBeInTheDocument(); // Price is displayed with 2 decimals
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Close Add Product')).toBeInTheDocument(); // Form should close
    });
  });

  // --- Edit Product Flow ---
  test('should allow editing an existing product', async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Click Edit for the Laptop
    const laptopRow = screen.getByText('Laptop').closest('tr');
    const editButton = laptopRow?.querySelector('button:contains("Edit")');
    fireEvent.click(editButton!);

    // Verify form is pre-filled
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Laptop');
    expect(screen.getByLabelText(/Price/i)).toHaveValue('1200'); // Input type number can be string

    // Modify a field
    const priceInput = screen.getByLabelText(/Price/i);
    fireEvent.change(priceInput, { target: { value: '1300.00' } });

    const submitButton = screen.getByRole('button', { name: /Update Product/i });
    fireEvent.click(submitButton);

    // Verify updateProduct was called
    await waitFor(() => {
      expect(mockedAdminProductApi.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockedAdminProductApi.updateProduct).toHaveBeenCalledWith('p1', expect.objectContaining({
        price: 1300.00,
        name: 'Laptop' // Other fields should remain the same unless changed
      }));
    });

    // Verify the list is refreshed with updated data
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument(); // Name might not change
      expect(screen.getByText('$1300.00')).toBeInTheDocument(); // Updated price
      expect(screen.queryByText('Close Add Product')).not.toBeInTheDocument(); // Edit form should close
    });
  });

  // --- Delete Product Flow ---
  test('should allow deleting a product', async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Click Delete for the Mouse
    const mouseRow = screen.getByText('Mouse').closest('tr');
    const deleteButton = mouseRow?.querySelector('button:contains("Delete")');
    fireEvent.click(deleteButton!);

    // Confirm deletion (mocked to be true)
    await waitFor(() => {
      expect(mockedAdminProductApi.deleteProduct).toHaveBeenCalledTimes(1);
      expect(mockedAdminProductApi.deleteProduct).toHaveBeenCalledWith('p2');
    });

    // Verify the list is refreshed and the deleted product is gone
    await waitFor(() => {
      expect(screen.queryByText('Mouse')).not.toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument(); // Other product should remain
    });
  });

  // --- Cancel Add/Edit ---
  test('should close the form when Cancel button is clicked', async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Open Add Product form
    const addButton = screen.getByRole('button', { name: /Add New Product/i });
    fireEvent.click(addButton);
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Verify form is closed
    await waitFor(() => {
      expect(screen.queryByLabelText(/Product Name/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add New Product/i })).toBeInTheDocument(); // Add button reappears
    });

    // Test cancelling an edit form
    const laptopRow = screen.getByText('Laptop').closest('tr');
    const editButton = laptopRow?.querySelector('button:contains("Edit")');
    fireEvent.click(editButton!);
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Laptop');

    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByLabelText(/Product Name/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add New Product/i })).toBeInTheDocument(); // Add button reappears
    });
  });

  // --- Error Handling: Fetch Products ---
  test('should display error message when fetching products fails', async () => {
    mockedAdminProductApi.getProducts.mockRejectedValue(new Error('Network Error'));
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(mockedAdminProductApi.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Error: Failed to load products. Please try again later.')).toBeInTheDocument();
      expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    });
  });

  // --- Error Handling: Save Product (Create/Update) ---
  test('should display error message when saving (creating) a product fails', async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    const addButton = screen.getByRole('button', { name: /Add New Product/i });
    fireEvent.click(addButton);

    const productNameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock Quantity/i);
    const submitButton = screen.getByRole('button', { name: /Add Product/i });

    fireEvent.change(productNameInput, { target: { value: 'Faulty Item' } });
    fireEvent.change(descriptionInput, { target: { value: 'This will fail' } });
    fireEvent.change(priceInput, { target: { value: '10.00' } });
    fireEvent.change(stockInput, { target: { value: '10' } });

    mockedAdminProductApi.createProduct.mockRejectedValue(new Error('Server error during creation'));
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save product. Please check your inputs and try again.')).toBeInTheDocument();
      expect(screen.queryByText('Close Add Product')).toBeInTheDocument(); // Form should remain open to allow retry or correction
    });
  });

  test('should display error message when saving (updating) a product fails', async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    const laptopRow = screen.getByText('Laptop').closest('tr');
    const editButton = laptopRow?.querySelector('button:contains("Edit")');
    fireEvent.click(editButton!);

    const priceInput = screen.getByLabelText(/Price/i);
    fireEvent.change(priceInput, { target: { value: '1300.00' } });

    const submitButton = screen.getByRole('button', { name: /Update Product/i });
    mockedAdminProductApi.updateProduct.mockRejectedValue(new Error('Server error during update'));
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save product. Please check your inputs and try again.')).toBeInTheDocument();
      expect(screen.queryByText('Update Product')).toBeInTheDocument(); // Form should remain open
    });
  });

  // --- Error Handling: Delete Product ---
  test('should display error message when deleting a product fails', async () => {
    // Mock confirm to return true, but the API call will fail
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockedAdminProductApi.deleteProduct.mockRejectedValue(new Error('Server error during deletion'));

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    const laptopRow = screen.getByText('Laptop').closest('tr');
    const deleteButton = laptopRow?.querySelector('button:contains("Delete")');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(mockedAdminProductApi.deleteProduct).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Failed to delete product. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument(); // Product should still be there after failed delete
    });
  });

  // --- Edge case: No products initially, then add one ---
  test('should handle the case where there are no products initially', async () => {
    mockedAdminProductApi.getProducts.mockResolvedValue([]); // No products initially
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(mockedAdminProductApi.getProducts).toHaveBeenCalledTimes(1);
      expect(screen.getByText('No products available.')).toBeInTheDocument();
    });

    // Now try adding a product
    const addButton = screen.getByRole('button', { name: /Add New Product/i });
    fireEvent.click(addButton);

    const productNameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock Quantity/i);
    const submitButton = screen.getByRole('button', { name: /Add Product/i });

    fireEvent.change(productNameInput, { target: { value: 'First Product' } });
    fireEvent.change(descriptionInput, { target: { value: 'This is the first one.' } });
    fireEvent.change(priceInput, { target: { value: '10.00' } });
    fireEvent.change(stockInput, { target: { value: '5' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAdminProductApi.createProduct).toHaveBeenCalledTimes(1);
      expect(screen.getByText('First Product')).toBeInTheDocument(); // New product should be displayed
      expect(screen.queryByText('No products available.')).not.toBeInTheDocument(); // No longer shows empty message
    });
  });
});
