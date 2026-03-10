import React, { useState, FormEvent } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// CORRECTED IMPORT PATH
import VendorRegistrationForm from '../../components/VendorRegistrationForm'; // Adjust path as needed
// Import act from React for testing
import { act } from 'react';

describe('VendorRegistrationForm', () => {
  const mockSubmit = jest.fn();
  const mockError = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
    mockError.mockClear();
    // Reset any global mocks or state if necessary
  });

  test('renders the registration form correctly', () => {
    // Use act to wrap rendering and interactions that might cause state updates
    act(() => {
      render(<VendorRegistrationForm onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    });
    expect(screen.getByRole('heading', { name: /vendor registration/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact person/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register store/i })).toBeInTheDocument();
  });

  test('handles input changes', () => {
    let view;
    act(() => {
      view = render(<VendorRegistrationForm onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    });
    const businessNameInput = screen.getByLabelText(/business name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneNumberInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    const contactPersonInput = screen.getByLabelText(/contact person/i) as HTMLInputElement;

    fireEvent.change(businessNameInput, { target: { value: 'Test Vendor Inc.' } });
    fireEvent.change(emailInput, { target: { value: 'test@vendor.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '123-456-7890' } });
    fireEvent.change(contactPersonInput, { target: { value: 'John Doe' } });

    expect(businessNameInput.value).toBe('Test Vendor Inc.');
    expect(emailInput.value).toBe('test@vendor.com');
    expect(phoneNumberInput.value).toBe('123-456-7890');
    expect(contactPersonInput.value).toBe('John Doe');
  });

  test('calls onSubmit with correct data on successful submission', async () => {
    let view;
    act(() => {
      view = render(<VendorRegistrationForm onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    });
    const businessNameInput = screen.getByLabelText(/business name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneNumberInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    const contactPersonInput = screen.getByLabelText(/contact person/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /register store/i });

    fireEvent.change(businessNameInput, { target: { value: 'Test Vendor Inc.' } });
    fireEvent.change(emailInput, { target: { value: 'test@vendor.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '123-456-7890' } });
    fireEvent.change(contactPersonInput, { target: { value: 'John Doe' } });

    // Use await for waitFor to ensure assertions are made after DOM updates
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith({
        businessName: 'Test Vendor Inc.',
        email: 'test@vendor.com',
        phoneNumber: '123-456-7890',
        contactPerson: 'John Doe',
      });
    });
  });

  test('shows error message for missing required fields', async () => {
    let view;
    act(() => {
      view = render(<VendorRegistrationForm onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    });
    const submitButton = screen.getByRole('button', { name: /register store/i });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields./i)).toBeInTheDocument();
      expect(mockError).toHaveBeenCalledWith('Please fill in all required fields.');
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('shows error message for invalid email format', async () => {
    let view;
    act(() => {
      view = render(<VendorRegistrationForm onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    });
    const businessNameInput = screen.getByLabelText(/business name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneNumberInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    const contactPersonInput = screen.getByLabelText(/contact person/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /register store/i });

    // Fill in other fields to ensure they are not the cause of the error
    fireEvent.change(businessNameInput, { target: { value: 'Test Vendor Inc.' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(phoneNumberInput, { target: { value: '123-456-7890' } });
    fireEvent.change(contactPersonInput, { target: { value: 'John Doe' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Expect to find the specific email error message
      expect(screen.getByText(/Please enter a valid email address./i)).toBeInTheDocument();
      expect(mockError).toHaveBeenCalledWith('Please enter a valid email address.');
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });
    
  test('shows error message for invalid phone number format', async () => {
    let view;
    act(() => {
      view = render(<VendorRegistrationForm onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    });
    const businessNameInput = screen.getByLabelText(/business name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneNumberInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    const contactPersonInput = screen.getByLabelText(/contact person/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /register store/i });

    // Fill in other fields to ensure they are not the cause of the error
    fireEvent.change(businessNameInput, { target: { value: 'Test Vendor Inc.' } });
    fireEvent.change(emailInput, { target: { value: 'test@vendor.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: 'invalid-phone' } });
    fireEvent.change(contactPersonInput, { target: { value: 'John Doe' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Expect to find the specific phone number error message
      expect(screen.getByText(/Please enter a valid phone number./i)).toBeInTheDocument();
      expect(mockError).toHaveBeenCalledWith('Please enter a valid phone number.');
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('disables form and shows loading state when isLoading is true', () => {
    let view;
    act(() => {
      view = render(<VendorRegistrationForm onSubmit={mockSubmit} onError={mockError} isLoading={true} />);
    });
    const businessNameInput = screen.getByLabelText(/business name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneNumberInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    const contactPersonInput = screen.getByLabelText(/contact person/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /registering.../i });

    expect(businessNameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(phoneNumberInput).toBeDisabled();
    expect(contactPersonInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/registering.../i)).toBeInTheDocument();
  });
});
