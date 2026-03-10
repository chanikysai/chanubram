// src/vendor/pages/__tests__/VendorProductsPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorProductsPage from '../VendorProductsPage';
import { vendorApi } from '../../../services/vendorApi';
import { Product } from '../../../types/product';

// Mock vendorApi methods
jest.mock('../../../services/vendorApi');
const mockVendorApi = vendorApi as jest.Mocked<typeof vendorApi>;

// Mock Product type
const mockProducts: Product[] = [
    { id: 'prod_1', vendorId: 'vendor_abc', name: 'Gourmet Coffee Beans', description: '1kg bag of premium Arabica beans.', price: 25.99, inventory: 150, imageUrl: 'https://via.placeholder.com/150/coffee.png' },
    { id: 'prod_2', vendorId: 'vendor_abc', name: 'Artisan Ceramic Mug', description: 'Handcrafted ceramic mug with unique glaze.', price: 18.50, inventory: 75, imageUrl: 'https://via.placeholder.com/150/mug.png' },
];

describe('VendorProductsPage', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Set default successful API responses
        mockVendorApi.getProducts.mockResolvedValue(mockProducts);
        mockVendorApi.createProduct.mockResolvedValue({
            id: 'prod_new',
            vendorId: 'vendor_abc',
            name: 'New Product',
            description: 'A brand new product.',
            price: 50.00,
            inventory: 10,
            imageUrl: 'https://via.placeholder.com/150/new.png',
        });
        mockVendorApi.updateProduct.mockResolvedValue({ ...mockProducts[0], price: 27.99 });
        mockVendorApi.deleteProduct.mockResolvedValue(undefined);
    });

    // Test Case 1: Loading state and successful product fetch
    test('should display loading message then list products', async () => {
        render(<VendorProductsPage />);

        // Initially, show loading message
        expect(screen.getByText(/Loading products.../i)).toBeInTheDocument();
        expect(mockVendorApi.getProducts).toHaveBeenCalledTimes(1);

        // Wait for products to be loaded and displayed
        await waitFor(() => {
            expect(screen.queryByText(/Loading products.../i)).not.toBeInTheDocument();
            expect(screen.getByText(/Gourmet Coffee Beans/i)).toBeInTheDocument();
            expect(screen.getByText(/Artisan Ceramic Mug/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Add New Product/i })).toBeEnabled();
        });
    });

    // Test Case 2: Empty product list
    test('should display message when there are no products', async () => {
        mockVendorApi.getProducts.mockResolvedValue([]); // No products
        render(<VendorProductsPage />);

        await waitFor(() => {
            expect(screen.queryByText(/Loading products.../i)).not.toBeInTheDocument();
            expect(screen.getByText(/You haven't added any products yet./i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Add New Product/i })).toBeEnabled();
        });
    });

    // Test Case 3: Error handling during product fetch
    test('should display error message if products fail to load', async () => {
        mockVendorApi.getProducts.mockRejectedValue(new Error('Network Error'));
        render(<VendorProductsPage />);

        await waitFor(() => {
            expect(screen.queryByText(/Loading products.../i)).not.toBeInTheDocument();
            expect(screen.getByText(/Could not load products. Please try again later./i)).toBeInTheDocument();
        });
    });

    // Test Case 4: Add New Product functionality
    test('should open form and add a new product', async () => {
        render(<VendorProductsPage />);
        await waitFor(() => expect(screen.getByText('Gourmet Coffee Beans')).toBeInTheDocument()); // Wait for initial load

        const addButton = screen.getByRole('button', { name: /Add New Product/i });
        fireEvent.click(addButton);

        // Wait for form to appear
        await waitFor(() => expect(screen.getByLabelText(/Product Name:/i)).toBeInTheDocument());

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/Product Name:/i), { target: { value: 'New Awesome Gadget' } });
        fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'This gadget is amazing.' } });
        fireEvent.change(screen.getByLabelText(/Price \(\$\):/i), { target: { value: '75.50' } });
        fireEvent.change(screen.getByLabelText(/Inventory:/i), { target: { value: '25' } });

        const submitButton = screen.getByRole('button', { name: /Add Product/i });
        fireEvent.click(submitButton);

        // Wait for API call and product list update
        await waitFor(() => {
            expect(mockVendorApi.createProduct).toHaveBeenCalledTimes(1);
            expect(mockVendorApi.createProduct).toHaveBeenCalledWith({
                name: 'New Awesome Gadget',
                description: 'This gadget is amazing.',
                price: 75.50,
                inventory: 25,
                imageUrl: 'https://via.placeholder.com/150/default.png', // Default placeholder
            });
            expect(screen.queryByText(/New Awesome Gadget/i)).toBeInTheDocument(); // New product is visible
            expect(screen.getByText('Gourmet Coffee Beans')).toBeInTheDocument(); // Old products still visible
            expect(screen.queryByLabelText(/Product Name:/i)).not.toBeInTheDocument(); // Form is closed
        });
    });

    // Test Case 5: Edit Product functionality
    test('should open form with pre-filled data and update a product', async () => {
        render(<VendorProductsPage />);
        await waitFor(() => expect(screen.getByText('Gourmet Coffee Beans')).toBeInTheDocument()); // Wait for initial load

        // Click edit on the first product
        const editButton = screen.getAllByRole('button', { name: /Edit/i })[0];
        fireEvent.click(editButton);

        // Wait for form to appear and be pre-filled
        await waitFor(() => expect(screen.getByLabelText(/Product Name:/i)).toHaveValue('Gourmet Coffee Beans'));
        expect(screen.getByLabelText(/Price \(\$\):/i)).toHaveValue('25.99');

        // Change a field
        const newPrice = '27.99';
        fireEvent.change(screen.getByLabelText(/Price \(\$\):/i), { target: { value: newPrice } });

        const updateButton = screen.getByRole('button', { name: /Update Product/i });
        fireEvent.click(updateButton);

        // Wait for API call and product list update
        await waitFor(() => {
            expect(mockVendorApi.updateProduct).toHaveBeenCalledTimes(1);
            expect(mockVendorApi.updateProduct).toHaveBeenCalledWith('prod_1', expect.objectContaining({ price: parseFloat(newPrice) }));
            expect(screen.getByText(`$${parseFloat(newPrice).toFixed(2)}`)).toBeInTheDocument(); // Price updated in table
            expect(screen.queryByLabelText(/Product Name:/i)).not.toBeInTheDocument(); // Form is closed
        });
    });

    // Test Case 6: Delete Product functionality
    test('should delete a product when delete button is clicked and confirmed', async () => {
        render(<VendorProductsPage />);
        await waitFor(() => expect(screen.getByText('Gourmet Coffee Beans')).toBeInTheDocument()); // Wait for initial load

        // Mock window.confirm to return true for confirmation
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

        // Click delete on the first product
        const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
        fireEvent.click(deleteButton);

        // Wait for API call and product list update
        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalledTimes(1);
            expect(mockVendorApi.deleteProduct).toHaveBeenCalledTimes(1);
            expect(mockVendorApi.deleteProduct).toHaveBeenCalledWith('prod_1');
            expect(screen.queryByText('Gourmet Coffee Beans')).not.toBeInTheDocument(); // Product removed from list
            expect(screen.getByText('Artisan Ceramic Mug')).toBeInTheDocument(); // Other products remain
        });

        confirmSpy.mockRestore(); // Clean up the spy
    });

    // Test Case 7: Cancel form submission
    test('should close form and not submit when cancel button is clicked', async () => {
        render(<VendorProductsPage />);
        await waitFor(() => expect(screen.getByText('Gourmet Coffee Beans')).toBeInTheDocument()); // Wait for initial load

        const addButton = screen.getByRole('button', { name: /Add New Product/i });
        fireEvent.click(addButton);

        // Wait for form to appear
        await waitFor(() => expect(screen.getByLabelText(/Product Name:/i)).toBeInTheDocument());

        // Change a field to ensure it's not submitted
        fireEvent.change(screen.getByLabelText(/Product Name:/i), { target: { value: 'Temporary Name' } });

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        // Wait for form to close and check that no API calls were made for submission
        await waitFor(() => {
            expect(screen.queryByLabelText(/Product Name:/i)).not.toBeInTheDocument(); // Form is closed
            expect(mockVendorApi.createProduct).not.toHaveBeenCalled();
            expect(mockVendorApi.updateProduct).not.toHaveBeenCalled();
        });
    });

    // Test Case 8: Error handling during product creation
    test('should display error message if adding a new product fails', async () => {
        mockVendorApi.createProduct.mockRejectedValue(new Error('API Error'));
        render(<VendorProductsPage />);
        await waitFor(() => expect(screen.getByText('Gourmet Coffee Beans')).toBeInTheDocument());

        const addButton = screen.getByRole('button', { name: /Add New Product/i });
        fireEvent.click(addButton);
        await waitFor(() => expect(screen.getByLabelText(/Product Name:/i)).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/Product Name:/i), { target: { value: 'Failing Product' } });
        fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'This will fail.' } });
        fireEvent.change(screen.getByLabelText(/Price \(\$\):/i), { target: { value: '10.00' } });
        fireEvent.change(screen.getByLabelText(/Inventory:/i), { target: { value: '5' } });

        const submitButton = screen.getByRole('button', { name: /Add Product/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to save product. Please check your inputs and try again./i)).toBeInTheDocument();
            expect(mockVendorApi.createProduct).toHaveBeenCalledTimes(1);
            expect(screen.getByLabelText(/Product Name:/i)).toBeInTheDocument(); // Form remains open
        });
    });
});
