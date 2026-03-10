import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminProductsPage from '../../pages/AdminProductsPage.tsx';
import * as adminProductApi from '../../services/adminProductApi';
import { Product } from '../../types/product';

// Mock the API calls
jest.mock('../../services/adminProductApi');
const mockAdminProductApi = adminProductApi as jest.Mocked<typeof adminProductApi>;

// Mock data
const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Laptop', description: 'High performance laptop', price: 1200, stock: 50 },
  { id: 'prod-2', name: 'Keyboard', description: 'Mechanical keyboard', price: 75, stock: 120 },
];

describe('AdminProductsPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockAdminProductApi.getProducts.mockClear();
    mockAdminProductApi.createProduct.mockClear();
    mockAdminProductApi.updateProduct.mockClear();
    mockAdminProductApi.deleteProduct.mockClear();

    // Default successful mock for getProducts
    mockAdminProductApi.getProducts.mockResolvedValue(mockProducts);

    // Mock window.confirm for delete operations
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
  });

  // Happy Path: Page loads and displays products
  test('should fetch and display products on page load', async () => {
    render(<AdminProductsPage />);

    expect(mockAdminProductApi.getProducts).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument(); // Initial loading state

    // Wait for products to be displayed
    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
      expect(screen.getByText('Product Management')).toBeInTheDocument();
    });
  });

  // Happy Path: Add a new product
  test('should allow adding a new product', async () => {
    mockAdminProductApi.createProduct.mockResolvedValue({ id: 'prod-3', name: 'Monitor', description: '27 inch 4K monitor', price: 300, stock: 25 });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument()); // Ensure products are loaded

    // Click "Add New Product" button
    const addButton = screen.getByRole('button', { name: /add new product/i });
    fireEvent.click(addButton);

    // Fill out the form
    const productNameInput = screen.getByLabelText(/product name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(productNameInput, { target: { value: 'Monitor' } });
    fireEvent.change(descriptionInput, { target: { value: '27 inch 4K monitor' } });
    fireEvent.change(priceInput, { target: { value: '300' } });
    fireEvent.change(stockInput, { target: { value: '25' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Verify API call and refresh
    await waitFor(() => {
      expect(mockAdminProductApi.createProduct).toHaveBeenCalledTimes(1);
      expect(mockAdminProductApi.createProduct).toHaveBeenCalledWith({
        name: 'Monitor',
        description: '27 inch 4K monitor',
        price: 300,
        stock: 25,
      });
      // expect(screen.getByText('Product added successfully!')).toBeInTheDocument(); // Alert is used, so this won't be visible directly
    });

    // Wait for the list to refresh and show the new product
    await waitFor(() => {
      expect(mockAdminProductApi.getProducts).toHaveBeenCalledTimes(2); // Called once on load, once after creation
      expect(screen.getByText('Monitor')).toBeInTheDocument();
    });
  });

  // Happy Path: Edit an existing product
  test('should allow editing an existing product', async () => {
    mockAdminProductApi.updateProduct.mockResolvedValue({ id: 'prod-1', name: 'Gaming Laptop', description: 'High performance gaming laptop', price: 1500, stock: 45 });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument()); // Ensure products are loaded

    // Click Edit for the first product
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Verify form is pre-filled
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Laptop');

    // Change values
    const productNameInput = screen.getByLabelText(/product name/i);
    const priceInput = screen.getByLabelText(/price/i);
    const submitButton = screen.getByRole('button', { name: /update product/i });

    fireEvent.change(productNameInput, { target: { value: 'Gaming Laptop' } });
    fireEvent.change(priceInput, { target: { value: '1500' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Verify API call and refresh
    await waitFor(() => {
      expect(mockAdminProductApi.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockAdminProductApi.updateProduct).toHaveBeenCalledWith('prod-1', {
        name: 'Gaming Laptop',
        price: 1500,
        description: 'High performance laptop', // Other fields remain unchanged unless explicitly changed
        stock: 50,
      });
    });

    // Wait for the list to refresh and show the updated product
    await waitFor(() => {
      expect(mockAdminProductApi.getProducts).toHaveBeenCalledTimes(2); // Called once on load, once after update
      expect(screen.getByText('Gaming Laptop')).toBeInTheDocument();
      expect(screen.getByText('$1500.00')).toBeInTheDocument();
    });
  });

  // Happy Path: Delete a product
  test('should allow deleting a product', async () => {
    mockAdminProductApi.deleteProduct.mockResolvedValue(undefined); // Successful deletion

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument()); // Ensure products are loaded

    // Click Delete for the first product
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // This will trigger the confirm dialog

    // Wait for API call and refresh
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledTimes(1); // Check if confirmation was shown
      expect(mockAdminProductApi.deleteProduct).toHaveBeenCalledTimes(1);
      expect(mockAdminProductApi.deleteProduct).toHaveBeenCalledWith('prod-1');
    });

    // Wait for the list to refresh (Laptop should be gone)
    await waitFor(() => {
      expect(mockAdminProductApi.getProducts).toHaveBeenCalledTimes(2); // Called once on load, once after delete
      expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument(); // Other product should remain
    });
  });

  // Edge Case: No products found on load
  test('should display "No products available" when the API returns an empty list', async () => {
    mockAdminProductApi.getProducts.mockResolvedValue([]); // Simulate empty list

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
      expect(screen.getByText(/no products available/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add new product/i })).toBeInTheDocument();
    });
  });

  // Error Handling: Failed to fetch products
  test('should display an error message if fetching products fails', async () => {
    mockAdminProductApi.getProducts.mockRejectedValue(new Error('Network Error'));

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
      expect(screen.getByText(/error: failed to load products. please try again later./i)).toBeInTheDocument();
    });
  });

  // Error Handling: Failed to create a product
  test('should display an error message if creating a product fails', async () => {
    mockAdminProductApi.createProduct.mockRejectedValue(new Error('Failed to create'));

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Open add form
    fireEvent.click(screen.getByRole('button', { name: /add new product/i }));

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: 'Bad Product' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Will fail' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/stock quantity/i), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /add product/i }));

    await waitFor(() => {
      expect(mockAdminProductApi.createProduct).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/error: failed to save product. please check your inputs and try again./i)).toBeInTheDocument();
    });
  });

  // Error Handling: Failed to delete a product
  test('should display an error message if deleting a product fails', async () => {
    mockAdminProductApi.deleteProduct.mockRejectedValue(new Error('Failed to delete'));

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Click delete (confirm is mocked to true)
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    await waitFor(() => {
      expect(mockAdminProductApi.deleteProduct).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/error: failed to delete product. please try again./i)).toBeInTheDocument();
    });
  });

  // Edge Case: Cancel adding product
  test('should close the add product form when Cancel is clicked', async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Open add form
    fireEvent.click(screen.getByRole('button', { name: /add new product/i }));
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument(); // Form is open

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByLabelText(/product name/i)).not.toBeInTheDocument(); // Form is closed
    expect(screen.getByRole('button', { name: /add new product/i })).toBeInTheDocument(); // Add button is visible again
  });

  // Edge Case: Cancel editing product
  test('should close the edit product form when Cancel is clicked', async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText('Laptop')).toBeInTheDocument());

    // Open edit form for the first product
    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Laptop'); // Form is open with data

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByLabelText(/product name/i)).not.toBeInTheDocument(); // Form is closed
    expect(screen.getByText('Laptop')).toBeInTheDocument(); // Product is still visible in the table
  });
});
