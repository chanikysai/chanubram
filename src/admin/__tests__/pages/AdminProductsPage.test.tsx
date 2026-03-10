import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminProductsPage from '../pages/AdminProductsPage';
import * as adminProductApi from '../services/adminProductApi';

// Mocking the API calls
jest.mock('../services/adminProductApi');

const mockProducts = [
    { id: '1', name: 'Laptop', description: 'High performance laptop', price: 1200.00, stock: 10 },
    { id: '2', name: 'Keyboard', description: 'Mechanical keyboard', price: 75.50, stock: 50 },
];

const mockNewProduct = {
    id: '3',
    name: 'New Product',
    description: 'A new product for testing',
    price: 100.00,
    stock: 25,
};

const mockUpdatedProduct = {
    id: '1',
    name: 'Updated Laptop',
    description: 'Updated high performance laptop',
    price: 1150.00,
    stock: 8,
};

const mockApi = adminProductApi as jest.Mocked<typeof adminProductApi>;

describe('AdminProductsPage', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mocking default implementations for API calls
        mockApi.getProducts.mockResolvedValue(mockProducts);
        mockApi.addProduct.mockResolvedValue(mockNewProduct);
        mockApi.editProduct.mockResolvedValue(mockUpdatedProduct);
        mockApi.deleteProduct.mockResolvedValue(undefined);
    });

    // Happy Path Test Case 1: Page renders and fetches products
    it('should render product management page and fetch products on mount', async () => {
        render(<AdminProductsPage />);

        expect(screen.getByText('Product Management')).toBeInTheDocument();
        expect(screen.getByText('Loading products...')).toBeInTheDocument();

        // Wait for the products to be loaded and displayed
        await waitFor(() => {
            expect(mockApi.getProducts).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Laptop')).toBeInTheDocument();
            expect(screen.getByText('Keyboard')).toBeInTheDocument();
            expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
        });
    });

    // Happy Path Test Case 2: Clicking "Add New Product" shows the form
    it('should display the product form when "Add New Product" button is clicked', async () => {
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        const addButton = screen.getByRole('button', { name: 'Add New Product' });
        fireEvent.click(addButton);

        expect(screen.getByText('Add New Product')).toBeInTheDocument(); // Check for form title
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Product' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    // Happy Path Test Case 3: Submitting the add product form adds a new product
    it('should add a new product successfully when form is submitted', async () => {
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        const addButton = screen.getByRole('button', { name: 'Add New Product' });
        fireEvent.click(addButton);

        // Fill the form
        fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'New Product' } });
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A new product for testing' } });
        fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '100.00' } });
        fireEvent.change(screen.getByLabelText('Stock Quantity'), { target: { value: '25' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

        await waitFor(() => {
            expect(mockApi.addProduct).toHaveBeenCalledTimes(1);
            expect(mockApi.addProduct).toHaveBeenCalledWith({
                name: 'New Product',
                description: 'A new product for testing',
                price: 100.00,
                stock: 25,
            });
            // Check if the new product appears in the table
            expect(screen.getByText('New Product')).toBeInTheDocument();
            expect(screen.getByText('$100.00')).toBeInTheDocument();
            expect(screen.getByText('25')).toBeInTheDocument();
        });
    });

    // Happy Path Test Case 4: Clicking "Edit" on a product shows the form with pre-filled data
    it('should display product form with pre-filled data when "Edit" is clicked', async () => {
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        // Find the edit button for the first product and click it
        const editButton = screen.getAllByText('Edit')[0];
        fireEvent.click(editButton);

        expect(screen.getByText('Edit Product')).toBeInTheDocument();
        expect(screen.getByLabelText('Product Name')).toHaveValue('Laptop');
        expect(screen.getByLabelText('Price ($)')).toHaveValue('1200');
        expect(screen.getByRole('button', { name: 'Update Product' })).toBeInTheDocument();
    });

    // Happy Path Test Case 5: Submitting the edit form updates the product
    it('should update an existing product successfully when form is submitted', async () => {
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        // Click edit on the first product
        const editButton = screen.getAllByText('Edit')[0];
        fireEvent.click(editButton);

        // Modify fields
        fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Updated Laptop Name' } });
        fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '1150.00' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Update Product' }));

        await waitFor(() => {
            expect(mockApi.editProduct).toHaveBeenCalledTimes(1);
            expect(mockApi.editProduct).toHaveBeenCalledWith('1', {
                name: 'Updated Laptop Name',
                description: 'High performance laptop', // Description is not changed in this test
                price: 1150.00,
                stock: 10, // Stock is not changed in this test
            });
            // Check if the updated product details are reflected in the table
            expect(screen.getByText('Updated Laptop Name')).toBeInTheDocument();
            expect(screen.getByText('$1150.00')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument(); // Original stock should still be there if not changed
        });
    });

    // Happy Path Test Case 6: Clicking "Delete" on a product calls deleteProduct API
    it('should delete a product when delete button is clicked and confirmed', async () => {
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        // Mock window.confirm to return true
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

        // Find the delete button for the first product and click it
        const deleteButton = screen.getAllByText('Delete')[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalledTimes(1);
            expect(mockApi.deleteProduct).toHaveBeenCalledTimes(1);
            expect(mockApi.deleteProduct).toHaveBeenCalledWith('1');
            // Check if the product is removed from the table
            expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });

    // Happy Path Test Case 7: Clicking "Cancel" on the form hides it
    it('should hide the product form when "Cancel" button is clicked', async () => {
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        // Open the add form
        fireEvent.click(screen.getByRole('button', { name: 'Add New Product' }));
        expect(screen.getByText('Add New Product')).toBeInTheDocument(); // Form title visible

        // Click cancel
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            // Form should be hidden, table should be visible
            expect(screen.queryByText('Add New Product')).not.toBeInTheDocument(); // Form title not visible
            expect(screen.getByText('Laptop')).toBeInTheDocument(); // Product table visible
        });
    });

    // Edge Case Test Case 8: Page shows error message when fetching products fails
    it('should display an error message if fetching products fails', async () => {
        mockApi.getProducts.mockRejectedValue(new Error('Network Error'));
        render(<AdminProductsPage />);

        await waitFor(() => {
            expect(mockApi.getProducts).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Failed to load products. Please try again later.')).toBeInTheDocument();
            expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
        });
    });

    // Edge Case Test Case 9: Page shows error message when adding a product fails
    it('should display an error message if adding a product fails', async () => {
        mockApi.addProduct.mockRejectedValue(new Error('Failed to add product'));
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        // Open add form
        fireEvent.click(screen.getByRole('button', { name: 'Add New Product' }));

        // Fill and submit form
        fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'New Product' } });
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A new product for testing' } });
        fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '100.00' } });
        fireEvent.change(screen.getByLabelText('Stock Quantity'), { target: { value: '25' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

        await waitFor(() => {
            expect(mockApi.addProduct).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Failed to save product. Please check the details and try again.')).toBeInTheDocument();
        });
    });

    // Edge Case Test Case 10: Page shows error message when deleting a product fails
    it('should display an error message if deleting a product fails', async () => {
        mockApi.deleteProduct.mockRejectedValue(new Error('Failed to delete'));
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        // Mock confirm to true and click delete
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
        const deleteButton = screen.getAllByText('Delete')[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockApi.deleteProduct).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Failed to delete product. Please try again.')).toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });

    // Edge Case Test Case 11: No products found message when getProducts returns empty
    it('should display "No products found" when the product list is empty', async () => {
        mockApi.getProducts.mockResolvedValue([]);
        render(<AdminProductsPage />);

        await waitFor(() => {
            expect(mockApi.getProducts).toHaveBeenCalledTimes(1);
            expect(screen.getByText('No products found.')).toBeInTheDocument();
            expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
        });
    });

    // Error Handling (covered by previous tests, but ensuring form validation works)
    // Test Case 12: Form validation errors are displayed (this is tested by ProductForm tests, but good to ensure page doesn't crash)
    it('should not crash when form validation errors occur', async () => {
        render(<AdminProductsPage />);
        await waitFor(() => expect(mockApi.getProducts).toHaveBeenCalled());

        // Open add form
        fireEvent.click(screen.getByRole('button', { name: 'Add New Product' }));

        // Submit with empty fields
        fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

        await waitFor(() => {
            expect(mockApi.addProduct).not.toHaveBeenCalled();
            expect(screen.getByText('All fields are required.')).toBeInTheDocument();
        });
    });
});
