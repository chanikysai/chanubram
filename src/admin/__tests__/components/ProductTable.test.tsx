import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductTable from '../components/ProductTable';

const mockProducts = [
    { id: '1', name: 'Laptop', description: 'High performance laptop', price: 1200.00, stock: 10 },
    { id: '2', name: 'Keyboard', description: 'Mechanical keyboard', price: 75.50, stock: 50 },
    { id: '3', name: 'Mouse', description: 'Wireless mouse', price: 25.00, stock: 100 },
];

describe('ProductTable', () => {
    // Happy Path Test Case 1: Renders table with products
    it('should render a table with product data', () => {
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        render(<ProductTable products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Mechanical keyboard')).toBeInTheDocument();
        expect(screen.getByText('$1200.00')).toBeInTheDocument();
        expect(screen.getByText('75.50')).toBeInTheDocument(); // Price formatting test
        expect(screen.getByText('100')).toBeInTheDocument();

        // Ensure all edit/delete buttons are present for each product
        expect(screen.getAllByText('Edit').length).toBe(3);
        expect(screen.getAllByText('Delete').length).toBe(3);
    });

    // Happy Path Test Case 2: Clicking Edit button calls onEdit handler
    it('should call onEdit handler when Edit button is clicked', () => {
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        render(<ProductTable products={[mockProducts[0]]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        expect(mockOnEdit).toHaveBeenCalledTimes(1);
        expect(mockOnEdit).toHaveBeenCalledWith(mockProducts[0]);
    });

    // Happy Path Test Case 3: Clicking Delete button calls onDelete handler
    it('should call onDelete handler when Delete button is clicked', () => {
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        // Mock window.confirm to return true for deletion confirmation
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

        render(<ProductTable products={[mockProducts[0]]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalledTimes(1); // Check if confirm was called
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(mockProducts[0].id);

        confirmSpy.mockRestore(); // Clean up the mock
    });

    // Edge Case Test Case 4: Renders "No products found" when products array is empty
    it('should display "No products found" when the products array is empty', () => {
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        render(<ProductTable products={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        expect(screen.getByText('No products found.')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    // Edge Case Test Case 5: Deletion confirmation is handled
    it('should not call onDelete if user cancels deletion confirmation', () => {
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        // Mock window.confirm to return false for deletion confirmation
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => false);

        render(<ProductTable products={[mockProducts[0]]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    // Error Handling (though not directly testable from component's perspective without props for errors)
    // We test the UI rendering logic based on the 'products' prop.
    // Any error handling for API calls is within the parent component or service.
    // This test focuses on the table's reaction to data, including empty data.

    // Test Case 6: Correctly displays stock quantity
    it('should display the correct stock quantity', () => {
        render(<ProductTable products={[mockProducts[0]]} onEdit={jest.fn()} onDelete={jest.fn()} />);
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    // Test Case 7: Correctly displays price with two decimal places
    it('should display price with two decimal places', () => {
        render(<ProductTable products={[mockProducts[1]]} onEdit={jest.fn()} onDelete={jest.fn()} />);
        expect(screen.getByText('$75.50')).toBeInTheDocument();
    });
});
