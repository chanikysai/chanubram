// src/vendor/components/__tests__/VendorProductForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorProductForm from '../VendorProductForm';
import { Product } from '../../../types/product';

// Mock the Product type for tests
const mockProduct: Product = {
    id: 'prod_123',
    vendorId: 'vendor_xyz',
    name: 'Existing Gadget',
    description: 'A very useful gadget.',
    price: 99.99,
    inventory: 50,
    imageUrl: 'https://via.placeholder.com/150/gadget.png'
};

describe('VendorProductForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
        mockOnCancel.mockClear();
        jest.resetAllMocks(); // Reset all mocks before each test
    });

    // Test Case 1: Happy Path - Adding a new product
    test('should call onSubmit with correct product data when adding a new product', async () => {
        render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const productNameInput = screen.getByLabelText(/Product Name:/i);
        const productDescriptionInput = screen.getByLabelText(/Description:/i);
        const productPriceInput = screen.getByLabelText(/Price \(\$\):/i);
        const productInventoryInput = screen.getByLabelText(/Inventory:/i);
        const submitButton = screen.getByRole('button', { name: /Add Product/i });

        fireEvent.change(productNameInput, { target: { value: 'New Widget' } });
        fireEvent.change(productDescriptionInput, { target: { value: 'A fantastic new widget.' } });
        fireEvent.change(productPriceInput, { target: { value: '49.99' } });
        fireEvent.change(productInventoryInput, { target: { value: '100' } });

        fireEvent.click(submitButton);

        // Wait for submission to potentially trigger async operations and state updates
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledTimes(1);
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: 'New Widget',
                description: 'A fantastic new widget.',
                price: 49.99,
                inventory: 100,
                imageUrl: 'https://via.placeholder.com/150/default.png', // Default placeholder
            });
        });
        expect(screen.queryByText(/All fields are required./i)).not.toBeInTheDocument();
    });

    // Test Case 2: Happy Path - Editing an existing product
    test('should pre-fill form fields and call onSubmit with updated data when editing', async () => {
        render(<VendorProductForm product={mockProduct} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Check if fields are pre-filled
        expect(screen.getByLabelText(/Product Name:/i)).toHaveValue(mockProduct.name);
        expect(screen.getByLabelText(/Description:/i)).toHaveValue(mockProduct.description);
        expect(screen.getByLabelText(/Price \(\$\):/i)).toHaveValue(mockProduct.price.toString());
        expect(screen.getByLabelText(/Inventory:/i)).toHaveValue(mockProduct.inventory.toString());
        // Image URL is used for preview, not directly for edit input usually
        expect(screen.getByAltText(/Product Preview/i)).toHaveAttribute('src', mockProduct.imageUrl);

        const newDescription = 'An updated, very useful gadget.';
        const newPrice = '109.99';
        const submitButton = screen.getByRole('button', { name: /Update Product/i });

        // Modify some fields
        fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: newDescription } });
        fireEvent.change(screen.getByLabelText(/Price \(\$\):/i), { target: { value: newPrice } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledTimes(1);
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: mockProduct.name, // Unchanged
                description: newDescription,
                price: parseFloat(newPrice),
                inventory: mockProduct.inventory, // Unchanged
                imageUrl: mockProduct.imageUrl, // Unchanged (since no new image uploaded)
            });
        });
    });

    // Test Case 3: Validation - Required fields
    test('should display error message for required fields when submitting empty form', async () => {
        render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const submitButton = screen.getByRole('button', { name: /Add Product/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).not.toHaveBeenCalled();
            expect(screen.getByText(/All fields are required./i)).toBeInTheDocument();
        });

        // Ensure fields are still empty or show required attribute implicitly
        expect(screen.getByLabelText(/Product Name:/i)).toHaveValue('');
        expect(screen.getByLabelText(/Description:/i)).toHaveValue('');
        expect(screen.getByLabelText(/Price \(\$\):/i)).toHaveValue('');
        expect(screen.getByLabelText(/Inventory:/i)).toHaveValue('');
    });

    // Test Case 4: Validation - Invalid price and inventory
    test('should display error messages for invalid price and inventory', async () => {
        render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const productPriceInput = screen.getByLabelText(/Price \(\$\):/i);
        const productInventoryInput = screen.getByLabelText(/Inventory:/i);
        const submitButton = screen.getByRole('button', { name: /Add Product/i });

        // Invalid price
        fireEvent.change(productPriceInput, { target: { value: '-10.50' } });
        fireEvent.change(productInventoryInput, { target: { value: '50' } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(mockOnSubmit).not.toHaveBeenCalled();
            expect(screen.getByText(/Price must be a positive number./i)).toBeInTheDocument();
        });

        // Invalid inventory
        fireEvent.change(productPriceInput, { target: { value: '25.00' } });
        fireEvent.change(productInventoryInput, { target: { value: '-5' } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(mockOnSubmit).not.toHaveBeenCalled();
            expect(screen.getByText(/Inventory must be a non-negative integer./i)).toBeInTheDocument();
        });

        // Invalid price and inventory
        fireEvent.change(productPriceInput, { target: { value: 'abc' } });
        fireEvent.change(productInventoryInput, { target: { value: 'xyz' } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(mockOnSubmit).not.toHaveBeenCalled();
            // The first error encountered might be shown, or both if validation is sequential.
            // Let's expect the price error first, as it's checked first.
            expect(screen.getByText(/Price must be a positive number./i)).toBeInTheDocument();
        });
    });

    // Test Case 5: Cancel Button
    test('should call onCancel when the Cancel button is clicked', async () => {
        render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    // Test Case 6: Image Upload Preview
    test('should display an image preview when a file is selected', async () => {
        render(<VendorProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const fileInput = screen.getByLabelText(/Image:/i);
        const mockFile = new File(['(⌐■_■)'], 'test.png', { type: 'image/png' });
        
        // Mocking FileReader and URL.createObjectURL for the blob URL
        const mockFileReader = {
            readAsDataURL: jest.fn(function(this: any) {
                // Simulate onload being called with base64 data
                this.onload({ target: { result: 'data:image/png;base64,fake-image-data' } });
            }),
            onload: null, // Property to hold the onload handler
            onerror: null, // Property to hold the onerror handler
        };
        
        // Mock FileReader constructor
        const FileReaderSpy = jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);
        // Mock URL.createObjectURL
        const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/fake-url');

        // Trigger the file input change
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Wait for the preview to be rendered
        await waitFor(() => {
            const previewImage = screen.getByAltText(/Product Preview/i);
            expect(previewImage).toBeInTheDocument();
            // The src attribute will be a blob URL created by URL.createObjectURL
            expect(previewImage).toHaveAttribute('src', 'blob:http://localhost/fake-url');
        });

        // Clean up the mocks
        FileReaderSpy.mockRestore();
        createObjectURLSpy.mockRestore();
    });
});
