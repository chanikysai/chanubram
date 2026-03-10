import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorRegistrationForm from '../../vendor/components/VendorRegistrationForm';

// Mock props
const mockOnSubmit = jest.fn();
const mockOnError = jest.fn();

describe('VendorRegistrationForm', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnError.mockClear();
    // Mock the error class for styling checks if needed, or just ensure text is present.
    // For now, focusing on functionality.
  });

  // Test Case 1: Happy Path - Successful Submission
  test('should submit form successfully with valid data', async () => {
    render(
      <VendorRegistrationForm
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Business Name/i), { target: { value: 'Tech Solutions Inc.' } });
    fireEvent.change(screen.getByLabelText(/Contact Person/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane.doe@techsolutions.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Tech Way, Silicon Valley' } });
    fireEvent.change(screen.getByLabelText(/Business Description/i), { target: { value: 'Provider of innovative software solutions.' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register Store/i }));

    // Wait for form submission to be processed (validation)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        businessName: 'Tech Solutions Inc.',
        contactPerson: 'Jane Doe',
        email: 'jane.doe@techsolutions.com',
        phone: '123-456-7890',
        address: '123 Tech Way, Silicon Valley',
        businessDescription: 'Provider of innovative software solutions.',
      });
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Test Case 2: Error Handling - Missing Required Fields
  test('should display errors for missing required fields', async () => {
    render(
      <VendorRegistrationForm
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    // Attempt to submit with empty fields
    fireEvent.click(screen.getByRole('button', { name: /Register Store/i }));

    // Verify that onSubmit was not called and errors are displayed
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith('Please correct the errors in the form.');
      expect(screen.getByLabelText(/Business Name/i)).toBeInvalid();
      expect(screen.getByLabelText(/Contact Person/i)).toBeInvalid();
      expect(screen.getByLabelText(/Email/i)).toBeInvalid();
      expect(screen.getByLabelText(/Phone/i)).toBeInvalid();
      expect(screen.getByLabelText(/Address/i)).toBeInvalid();
      expect(screen.getByLabelText(/Business Description/i)).toBeInvalid();

      // Check for specific error messages if they are rendered directly by the component
      expect(screen.getByText('Business Name is required')).toBeInTheDocument();
      expect(screen.getByText('Contact Person is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Address is required')).toBeInTheDocument();
      expect(screen.getByText('Business Description is required')).toBeInTheDocument();
    });
  });

  // Test Case 3: Error Handling - Invalid Email Format
  test('should display error for invalid email format', async () => {
    render(
      <VendorRegistrationForm
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    // Fill in fields, but with an invalid email
    fireEvent.change(screen.getByLabelText(/Business Name/i), { target: { value: 'Test Business' } });
    fireEvent.change(screen.getByLabelText(/Contact Person/i), { target: { value: 'Test Person' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } }); // Invalid email
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '111-222-3333' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/Business Description/i), { target: { value: 'A test business.' } });


    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register Store/i }));

    // Verify that onSubmit was not called and the specific email error is shown
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith('Please correct the errors in the form.');
      expect(screen.getByLabelText(/Email/i)).toBeInvalid();
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
      // Ensure other fields are valid to isolate the email error
      expect(screen.getByLabelText(/Business Name/i)).toBeValid();
    });
  });

  // Test Case 4: Edge Case - Loading State
  test('should disable form elements and show loading state when isLoading is true', () => {
    render(
      <VendorRegistrationForm
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submitting.../i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Submitting...');

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => expect(input).toBeDisabled());
    expect(screen.getByLabelText(/Business Description/i)).toBeDisabled();
  });

  // Test Case 5: OnError prop is called when validation fails
  test('should call onError prop when form validation fails', async () => {
    render(
      <VendorRegistrationForm
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    // Submit with empty fields to trigger validation failure
    fireEvent.click(screen.getByRole('button', { name: /Register Store/i }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Please correct the errors in the form.');
    });
  });

  // Test Case 6: Ensure aria-invalid attribute is set correctly
  test('should set aria-invalid attribute on input fields with errors', async () => {
    render(
      <VendorRegistrationForm
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    // Submit with empty fields to trigger validation failure
    fireEvent.click(screen.getByRole('button', { name: /Register Store/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Business Name/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/Contact Person/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/Email/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/Phone/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/Address/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/Business Description/i)).toHaveAttribute('aria-invalid', 'true');
    });

    // Fill in fields correctly
    fireEvent.change(screen.getByLabelText(/Business Name/i), { target: { value: 'Valid Name' } });
    fireEvent.change(screen.getByLabelText(/Contact Person/i), { target: { value: 'Valid Person' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: 'Valid Address' } });
    fireEvent.change(screen.getByLabelText(/Business Description/i), { target: { value: 'Valid Description' } });

    // Submit again
    fireEvent.click(screen.getByRole('button', { name: /Register Store/i }));

    // After successful submission, aria-invalid should be false or removed
    await waitFor(() => {
      expect(screen.getByLabelText(/Business Name/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/Contact Person/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/Email/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/Phone/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/Address/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/Business Description/i)).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
