import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductForm from '../components/ProductForm';

const mockProductToEdit = {
    id: '1',
    name: 'Existing Product',
    description: 'Description for existing product',
    price: 100.00,
    stock: 10,
};

describe('ProductForm', () => {
    // Happy Path Test Case 1: Renders form with empty fields for adding a new product
    it('should render with empty fields when no productToEdit is provided', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
        expect(screen.getByLabelText('Stock Quantity')).toBeInTheDocument();

        expect(screen.getByRole('textbox', { name: 'Product Name' })).toHaveValue('');
        expect(screen.getByLabelText('Description')).toHaveValue('');
        expect(screen.getByLabelText('Price ($)')).toHaveValue('');
        expect(screen.getByLabelText('Stock Quantity')).toHaveValue('');

        expect(screen.getByText('Add New Product')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Product' })).toBeInTheDocument();
    });

    // Happy Path Test Case 2: Renders form with pre-filled data for editing a product
    it('should render with pre-filled data when productToEdit is provided', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm productToEdit={mockProductToEdit} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText('Product Name')).toHaveValue(mockProductToEdit.name);
        expect(screen.getByLabelText('Description')).toHaveValue(mockProductToEdit.description);
        expect(screen.getByLabelText('Price ($)')).toHaveValue(String(mockProductToEdit.price));
        expect(screen.getByLabelText('Stock Quantity')).toHaveValue(String(mockProductToEdit.stock));
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Update Product' })).toBeInTheDocument();
    });

    // Happy Path Test Case 3: Submitting the form with valid data calls onSubmit
    it('should call onSubmit with correct data when form is submitted with valid inputs', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const productNameInput = screen.getByLabelText('Product Name');
        const descriptionInput = screen.getByLabelText('Description');
        const priceInput = screen.getByLabelText('Price ($)');
        const stockInput = screen.getByLabelText('Stock Quantity');
        const submitButton = screen.getByRole('button', { name: 'Add Product' });

        fireEvent.change(productNameInput, { target: { value: 'New Gadget' } });
        fireEvent.change(descriptionInput, { target: { value: 'A cool new gadget' } });
        fireEvent.change(priceInput, { target: { value: '49.99' } });
        fireEvent.change(stockInput, { target: { value: '25' } });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
            name: 'New Gadget',
            description: 'A cool new gadget',
            price: 49.99,
            stock: 25,
        });
    });

    // Happy Path Test Case 4: Clicking Cancel button calls onCancel
    it('should call onCancel when Cancel button is clicked', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    // Edge Case Test Case 5: Form submission with empty required fields shows error
    it('should display an error message if required fields are empty on submit', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const submitButton = screen.getByRole('button', { name: 'Add Product' });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('All fields are required.')).toBeInTheDocument();
    });

    // Edge Case Test Case 6: Form submission with invalid price (non-numeric)
    it('should display an error message for invalid price input', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const priceInput = screen.getByLabelText('Price ($)');
        const submitButton = screen.getByRole('button', { name: 'Add Product' });

        fireEvent.change(priceInput, { target: { value: 'abc' } });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Price must be a non-negative number.')).toBeInTheDocument();
    });

    // Edge Case Test Case 7: Form submission with invalid stock (non-numeric)
    it('should display an error message for invalid stock input', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const stockInput = screen.getByLabelText('Stock Quantity');
        const submitButton = screen.getByRole('button', { name: 'Add Product' });

        fireEvent.change(stockInput, { target: { value: 'xyz' } });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Stock must be a non-negative integer.')).toBeInTheDocument();
    });

    // Edge Case Test Case 8: Form submission with negative price
    it('should display an error message for negative price input', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const priceInput = screen.getByLabelText('Price ($)');
        const submitButton = screen.getByRole('button', { name: 'Add Product' });

        fireEvent.change(priceInput, { target: { value: '-10' } });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Price must be a non-negative number.')).toBeInTheDocument();
    });

    // Edge Case Test Case 9: Form submission with negative stock
    it('should display an error message for negative stock input', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const stockInput = screen.getByLabelText('Stock Quantity');
        const submitButton = screen.getByRole('button', { name: 'Add Product' });

        fireEvent.change(stockInput, { target: { value: '-5' } });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Stock must be a non-negative integer.')).toBeInTheDocument();
    });

    // Error Handling Test Case 10: Updates form correctly when editing existing product
    it('should update form fields correctly when editing an existing product', () => {
        const mockOnSubmit = jest.fn();
        const mockOnCancel = jest.fn();
        render(<ProductForm productToEdit={mockProductToEdit} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const productNameInput = screen.getByLabelText('Product Name');
        const descriptionInput = screen.getByLabelText('Description');
        const priceInput = screen.getByLabelText('Price ($)');
        const stockInput = screen.getByLabelText('Stock Quantity');
        const submitButton = screen.getByRole('button', { name: 'Update Product' });

        // Change only one field to test updates
        fireEvent.change(productNameInput, { target: { value: 'Updated Gadget Name' } });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
            name: 'Updated Gadget Name',
            description: mockProductToEdit.description,
            price: mockProductToEdit.price,
            stock: mockProductToEdit.stock,
        });
    });
});
