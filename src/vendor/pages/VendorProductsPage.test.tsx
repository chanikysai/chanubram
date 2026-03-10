import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorProductsPage from './VendorProductsPage';

// Mocking the module to control the mock API functions
jest.mock('./VendorProductsPage', () => {
  const OriginalComponent = jest.requireActual('./VendorProductsPage').default;
  // We need to mock the internal functions. This is a bit tricky as they are not exported.
  // A common approach is to access them if they are globally available or refactor.
  // For this example, we'll assume we can mock the internal functions or refactor for testability.
  // A better approach would be to export the mock functions or pass them as props.
  // For now, let's simulate by assuming we can access and spy on them.

  // NOTE: In a real-world scenario, you would likely export the mock API functions
  // from VendorProductsPage.tsx for easier mocking, or have them in a separate API module.
  // Since they are defined inside, we'll use a technique to spy on them if possible or adapt.

  // To make this testable, let's assume VendorProductsPage.tsx would export its internal mock functions
  // or we'll test the component's behavior assuming these mocks work.
  // For the sake of demonstration, we'll directly test the component's UI interactions
  // and assume the mocked API functions (defined in the actual component file) are called.

  return OriginalComponent;
});

// Helper to mock the internal functions if they were exported or accessible.
// Since they are not, we'll simulate the interaction based on expected behavior.

describe('VendorProductsPage', () => {
  // Mock data that the page should display or interact with
  const initialProducts = [
    { id: 'vp1', name: 'Vendor Item A', description: 'A great product from Vendor A.', price: 15.75, stock: 100, imageUrl: '/images/vendor_a_1.png' },
    { id: 'vp2', name: 'Vendor Item B', description: 'Another top-tier product from Vendor A.', price: 22.00, stock: 50, imageUrl: '/images/vendor_a_2.png' },
  ];

  // Mocking fetch, add, update, delete functions if they were available for spying
  // For this example, we will directly test the UI and interactions, assuming the mocks work as intended.

  // Test Case 1: Page loads and displays existing products
  test('should load and display vendor products on mount', async () => {
    // Mock the fetch function to return initialProducts
    // This requires vendorProductsPage.tsx to expose mockFetchVendorProducts for mocking
    // For now, we'll rely on the component's internal mock and check UI state.
    // In a real scenario, you'd use jest.spyOn or jest.mock if these were exported.

    // As the mocks are internal, we'll simulate the state change if fetch succeeds.
    // Let's render the page and check for the elements assuming the mock data is loaded.
    render(<VendorProductsPage />);

    // Check for loading state first
    expect(screen.getByText(/loading your products.../i)).toBeInTheDocument();

    // Wait for the products to be loaded and rendered (simulated)
    await waitFor(() => {
      expect(screen.queryByText(/loading your products.../i)).not.toBeInTheDocument();
    });

    // Check if product names are visible
    expect(screen.getByText(/vendor item a/i)).toBeInTheDocument();
    expect(screen.getByText(/vendor item b/i)).toBeInTheDocument();
    expect(screen.getByText(/price: \$15.75/i)).toBeInTheDocument();
    expect(screen.getByText(/price: \$22.00/i)).toBeInTheDocument();
  });

  // Test Case 2: Happy Path - Adding a new product
  test('should allow adding a new product and refreshing the list', async () => {
    render(<VendorProductsPage />);

    // Click "Add New Product" button
    const addProductButton = screen.getByRole('button', { name: /add new product/i });
    fireEvent.click(addProductButton);

    // Fill in the form
    const productNameInput = screen.getByLabelText(/product name/i);
    const productPriceInput = screen.getByLabelText(/price/i);
    const productStockInput = screen.getByLabelText(/stock quantity/i);
    const productDescriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add product/i });

    const newProductName = 'New Vendor Product';
    const newProductPrice = '30.50';
    const newProductStock = '200';
    const newProductDescription = 'This is a brand new item.';

    fireEvent.change(productNameInput, { target: { value: newProductName } });
    fireEvent.change(productPriceInput, { target: { value: newProductPrice } });
    fireEvent.change(productStockInput, { target: { value: newProductStock } });
    fireEvent.change(productDescriptionInput, { target: { value: newProductDescription } });

    fireEvent.click(submitButton);

    // Wait for the success alert and list refresh
    await waitFor(() => {
      expect(screen.getByText(/product added successfully!/i)).toBeInTheDocument();
    });

    // Check if the new product is now visible in the list
    expect(screen.getByText(newProductName)).toBeInTheDocument();
    expect(screen.getByText(`\$${parseFloat(newProductPrice).toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Stock: ${newProductStock}`)).toBeInTheDocument();
  });

  // Test Case 3: Happy Path - Editing an existing product
  test('should allow editing an existing product', async () => {
    render(<VendorProductsPage />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText(/vendor item a/i)).toBeInTheDocument();
    });

    // Find the "Edit" button for "Vendor Item A" and click it
    // This requires a way to identify the correct edit button. Assuming it's near the item name.
    // A more robust test would involve better selectors or custom data attributes.
    const vendorItemAElement = screen.getByText(/vendor item a/i).closest('.bg-white');
    const editButton = within(vendorItemAElement!).getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Verify the form is pre-filled
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Vendor Item A');
    expect(screen.getByLabelText(/price/i)).toHaveValue('15.75');

    // Update a field
    const updatedProductNameInput = screen.getByLabelText(/product name/i);
    const updatedProductName = 'Vendor Item A (Updated)';
    fireEvent.change(updatedProductNameInput, { target: { value: updatedProductName } });

    // Click the "Update Product" button
    const updateButton = screen.getByRole('button', { name: /update product/i });
    fireEvent.click(updateButton);

    // Wait for the success alert and list refresh
    await waitFor(() => {
      expect(screen.getByText(/product updated successfully!/i)).toBeInTheDocument();
    });

    // Check if the updated product name is visible
    expect(screen.getByText(updatedProductName)).toBeInTheDocument();
    expect(screen.queryByText(/vendor item a/i)).not.toBeInTheDocument(); // Original name should be gone
  });

  // Test Case 4: Happy Path - Deleting a product
  test('should allow deleting a product', async () => {
    render(<VendorProductsPage />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText(/vendor item a/i)).toBeInTheDocument();
    });

    // Mock window.confirm to return true for deletion
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    // Find the "Delete" button for "Vendor Item A" and click it
    const vendorItemAElement = screen.getByText(/vendor item a/i).closest('.bg-white');
    const deleteButton = within(vendorItemAElement!).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Wait for the success alert and list refresh
    await waitFor(() => {
      expect(screen.getByText(/product deleted successfully!/i)).toBeInTheDocument();
    });

    // Check if the deleted product is no longer visible
    expect(screen.queryByText(/vendor item a/i)).not.toBeInTheDocument();
    expect(screen.getByText(/vendor item b/i)).toBeInTheDocument(); // Other product should remain

    // Restore mock
    jest.restoreAllMocks();
  });

  // Test Case 5: Error Handling - Adding a product with invalid data
  test('should show error message when adding product with invalid data', async () => {
    render(<VendorProductsPage />);

    // Click "Add New Product" button
    const addProductButton = screen.getByRole('button', { name: /add new product/i });
    fireEvent.click(addProductButton);

    // Try to submit with empty required fields
    const submitButton = screen.getByRole('button', { name: /add product/i });
    fireEvent.click(submitButton);

    // Check for the error message from the form
    expect(screen.getByText(/all fields except image url are required/i)).toBeInTheDocument();
    // Ensure the form is still visible and not closed
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
  });

  // Test Case 6: Form Toggling - Add/Cancel
  test('should toggle the add product form visibility', async () => {
    render(<VendorProductsPage />);

    // Initially, the form should not be visible
    expect(screen.queryByRole('button', { name: /cancel adding product/i })).not.toBeInTheDocument();

    // Click "Add New Product"
    const addProductButton = screen.getByRole('button', { name: /add new product/i });
    fireEvent.click(addProductButton);

    // Form should now be visible
    expect(screen.getByRole('button', { name: /cancel adding product/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();

    // Click "Cancel Adding Product"
    const cancelButton = screen.getByRole('button', { name: /cancel adding product/i });
    fireEvent.click(cancelButton);

    // Form should be hidden again
    expect(screen.queryByRole('button', { name: /add new product/i })).toBeInTheDocument(); // Add button reappears
    expect(screen.queryByRole('button', { name: /cancel adding product/i })).not.toBeInTheDocument(); // Cancel button disappears
  });
});
