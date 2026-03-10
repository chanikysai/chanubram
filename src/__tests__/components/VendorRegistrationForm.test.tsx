import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VendorRegistrationForm, { VendorRegistrationData } from '../components/VendorRegistrationForm'; // Adjusted import path

describe('VendorRegistrationForm', () => {
  const mockOnSubmit = jest.fn();

  // Happy Path Test: Form submission with all fields including new ones
  test('should call onSubmit with correct data when form is submitted successfully', async () => {
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} />);

    const businessNameInput = screen.getByLabelText(/Business Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number:/i);
    const contactPersonInput = screen.getByLabelText(/Contact Person:/i);
    const addressInput = screen.getByLabelText(/Address:/i); // New field
    const businessDescriptionTextarea = screen.getByLabelText(/Business Description:/i); // New field
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(businessNameInput, { target: { value: 'Awesome Gadgets Inc.' } });
    fireEvent.change(emailInput, { target: { value: 'contact@awesomegadgets.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '123-456-7890' } });
    fireEvent.change(contactPersonInput, { target: { value: 'Alice Smith' } });
    fireEvent.change(addressInput, { target: { value: '123 Main St, Anytown, USA' } }); // New field value
    fireEvent.change(businessDescriptionTextarea, { target: { value: 'We sell awesome gadgets.' } }); // New field value

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        businessName: 'Awesome Gadgets Inc.',
        email: 'contact@awesomegadgets.com',
        phoneNumber: '123-456-7890',
        contactPerson: 'Alice Smith',
        address: '123 Main St, Anytown, USA', // New field value
        businessDescription: 'We sell awesome gadgets.', // New field value
      } as VendorRegistrationData);
    });
  });

  // Edge Case Test: Required fields are empty, checking visual feedback for all fields
  test('should display required field messages and not call onSubmit if required fields are empty', async () => {
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Check for error messages for each required field
      expect(screen.getByText('Business name is required.')).toBeInTheDocument();
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
      expect(screen.getByText('Contact person is required.')).toBeInTheDocument();
      expect(screen.getByText('Address is required.')).toBeInTheDocument(); // New field check
      expect(screen.getByText('Business description is required.')).toBeInTheDocument(); // New field check

      // Check aria-invalid attribute
      expect(screen.getByLabelText(/Business Name:/i)).toBeInvalid();
      expect(screen.getByLabelText(/Email:/i)).toBeInvalid();
      expect(screen.getByLabelText(/Phone Number:/i)).toBeInvalid();
      expect(screen.getByLabelText(/Contact Person:/i)).toBeInvalid();
      expect(screen.getByLabelText(/Address:/i)).toBeInvalid(); // New field check
      expect(screen.getByLabelText(/Business Description:/i)).toBeInvalid(); // New field check
    });
  });

  // Error Handling Test: Displaying an error message from the API
  test('should display error message when provided and still allow submission of valid data', async () => {
    const errorMessage = 'Registration failed. Email already exists.';
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} error={errorMessage} />);

    const errorDisplay = screen.getByTestId('error-message');
    expect(errorDisplay).toBeInTheDocument();
    expect(errorDisplay).toHaveTextContent(errorMessage);

    // Fill the form with valid data including new fields
    const businessNameInput = screen.getByLabelText(/Business Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number:/i);
    const contactPersonInput = screen.getByLabelText(/Contact Person:/i);
    const addressInput = screen.getByLabelText(/Address:/i);
    const businessDescriptionTextarea = screen.getByLabelText(/Business Description:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(businessNameInput, { target: { value: 'Test Vendor' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '111-222-3333' } });
    fireEvent.change(contactPersonInput, { target: { value: 'Test Person' } });
    fireEvent.change(addressInput, { target: { value: '456 Oak Ave' } });
    fireEvent.change(businessDescriptionTextarea, { target: { value: 'Sells electronics.' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        businessName: 'Test Vendor',
        email: 'test@example.com',
        phoneNumber: '111-222-3333',
        contactPerson: 'Test Person',
        address: '456 Oak Ave',
        businessDescription: 'Sells electronics.',
      });
    });
  });

  // Test for loading state
  test('should disable submit button and show loading text when isLoading is true', async () => {
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /Registering.../i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Registering...');
  });

  // Test for invalid email format
  test('should display email format error if invalid email is entered', async () => {
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/Email:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
      expect(screen.getByLabelText(/Email:/i)).toBeInvalid();
    });
  });

  // Test for invalid phone number format
  test('should display phone number format error if invalid phone number is entered', async () => {
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} />);

    const phoneNumberInput = screen.getByLabelText(/Phone Number:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(phoneNumberInput, { target: { value: '1234567890' } }); // Missing hyphens
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Invalid phone number format (e.g., 123-456-7890).')).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number:/i)).toBeInvalid();
    });
  });

  // New tests for new fields
  test('should display address required error if address is empty', async () => {
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} />);

    const addressInput = screen.getByLabelText(/Address:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(addressInput, { target: { value: '' } }); // Ensure it's empty
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Address is required.')).toBeInTheDocument();
      expect(screen.getByLabelText(/Address:/i)).toBeInvalid();
    });
  });

  test('should display business description required error if description is empty', async () => {
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} />);

    const businessDescriptionTextarea = screen.getByLabelText(/Business Description:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(businessDescriptionTextarea, { target: { value: '' } }); // Ensure it's empty
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Business description is required.')).toBeInTheDocument();
      expect(screen.getByLabelText(/Business Description:/i)).toBeInvalid();
    });
  });
});
