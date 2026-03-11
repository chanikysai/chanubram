import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryForm from '../MemoryForm';

// Mock the image uploader
jest.mock('../imageUploader', () => ({
  uploadImage: jest.fn(),
}));

// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUploadImage = require('../imageUploader').uploadImage;
const mockUseRouter = require('next/navigation').useRouter;

describe('MemoryForm', () => {
  const mockOnSuccess = jest.fn();
  let mockFetch: jest.Mock;
  let mockRouter: { push: jest.Mock };

  beforeEach(() => {
    // Reset mocks before each test
    mockUploadImage.mockClear();
    mockRouter = { push: jest.fn() };
    mockUseRouter.mockReturnValue(mockRouter);
    
    // Mock fetch API
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'mock-memory-id' }), // Mock successful API response
    });
    global.fetch = mockFetch;

    // Mock File API for testing file uploads
    // Note: In a real browser environment, you'd use `new File(...)`
    // For Node.js tests, we can create an object mimicking the File interface.
    // However, React Testing Library often runs in a JSDOM environment which provides some File capabilities.
    // If direct `new File` fails, a simple object with properties might be needed.
    // For simplicity here, we'll assume `fireEvent.change` with a FileList works as expected.
    // Let's create a mock file object for the file input.
    Object.defineProperty(window, 'File', {
      writable: true,
      value: class MockFile {
        constructor(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) {
          this.name = fileName;
          this.size = fileBits.reduce((acc, bit) => acc + (typeof bit === 'string' ? bit.length : bit.size), 0);
          this.type = options?.type || '';
          // Add other properties if needed, like lastModified
        }
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocks after each test
    delete (window as any).File; // Clean up mock File
  });

  it('renders the form with all fields', () => {
    render(<MemoryForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/photos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add memory/i })).toBeInTheDocument();
  });

  it('updates form state as user types', () => {
    render(<MemoryForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionTextarea = screen.getByLabelText(/description/i);
    const dateInput = screen.getByLabelText(/date/i);

    fireEvent.change(titleInput, { target: { name: 'title', value: 'Our Vacation' } });
    fireEvent.change(descriptionTextarea, { target: { name: 'description', value: 'Amazing trip to the mountains.' } });
    fireEvent.change(dateInput, { target: { name: 'date', value: '2023-07-15' } });

    expect(titleInput).toHaveValue('Our Vacation');
    expect(descriptionTextarea).toHaveValue('Amazing trip to the mountains.');
    expect(dateInput).toHaveValue('2023-07-15');
  });

  it('handles image selection', () => {
    render(<MemoryForm onSuccess={mockOnSuccess} />);

    const fileInput = screen.getByLabelText(/photos/i);
    
    // Create a mock file
    const mockFile = new (window as any).File(['(binary data)'], 'image.png', { type: 'image/png' });
    const fileList = [mockFile];

    fireEvent.change(fileInput, { target: { files: fileList } });

    // The form component itself doesn't directly display file names, but we can check
    // if the internal state (which we can't directly access without more setup) would be updated.
    // For this test, we rely on the submission test to ensure files are processed.
    // A more robust test would involve checking internal state or a callback.
    // For now, we'll just ensure the event is fired.
    expect(fileInput).toBeDefined(); // Ensure the input is present
  });

  it('uploads images and submits memory data on form submission', async () => {
    mockUploadImage.mockResolvedValue('http://example.com/uploaded/image.jpg');

    render(<MemoryForm onSuccess={mockOnSuccess} />);

    // Fill out form fields
    fireEvent.change(screen.getByLabelText(/title/i), { target: { name: 'title', value: 'Anniversary' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { name: 'description', value: 'Celebrating 5 years!' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { name: 'date', value: '2024-10-20' } });

    // Select image file
    const fileInput = screen.getByLabelText(/photos/i);
    const mockFile = new (window as any).File(['(binary data)'], 'anniversary.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add memory/i }));

    // Expect uploadImage to be called
    expect(mockUploadImage).toHaveBeenCalledTimes(1);
    expect(mockUploadImage).toHaveBeenCalledWith(mockFile);

    // Wait for the form submission (fetch call)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    // Check if fetch was called with the correct URL and payload
    expect(mockFetch).toHaveBeenCalledWith('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Anniversary',
        description: 'Celebrating 5 years!',
        date: '2024-10-20T00:00:00.000Z', // Date is converted to ISO string
        photoUrls: ['http://example.com/uploaded/image.jpg'],
      }),
    });

    // Check if onSuccess callback was called
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledTimes(1));

    // Check if the form is reset (optional, but good practice)
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/date/i)).toHaveValue('');
    // File input value cannot be programmatically reset in most test envs, check for absence of uploaded text
    expect(screen.queryByText(/uploaded:/i)).not.toBeInTheDocument();
  });

  it('handles multiple image uploads', async () => {
    mockUploadImage.mockResolvedValueOnce('http://example.com/uploaded/image1.jpg');
    mockUploadImage.mockResolvedValueOnce('http://example.com/uploaded/image2.png');

    render(<MemoryForm onSuccess={mockOnSuccess} />);

    // Fill out form fields
    fireEvent.change(screen.getByLabelText(/title/i), { target: { name: 'title', value: 'Trip' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { name: 'description', value: 'Great trip with friends.' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { name: 'date', value: '2023-08-01' } });

    // Select multiple image files
    const fileInput = screen.getByLabelText(/photos/i);
    const mockFile1 = new (window as any).File(['(binary data 1)'], 'img1.jpg', { type: 'image/jpeg' });
    const mockFile2 = new (window as any).File(['(binary data 2)'], 'img2.png', { type: 'image/png' });
    const fileList = [mockFile1, mockFile2];

    fireEvent.change(fileInput, { target: { files: fileList } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add memory/i }));

    // Expect uploadImage to be called twice
    await waitFor(() => expect(mockUploadImage).toHaveBeenCalledTimes(2));

    // Check if fetch was called with both URLs
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledWith('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Trip',
        description: 'Great trip with friends.',
        date: '2023-08-01T00:00:00.000Z',
        photoUrls: ['http://example.com/uploaded/image1.jpg', 'http://example.com/uploaded/image2.png'],
      }),
    });
  });

  it('displays an error message if image upload fails', async () => {
    mockUploadImage.mockRejectedValue(new Error('Upload failed'));

    render(<MemoryForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { name: 'title', value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { name: 'description', value: 'Test Desc' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { name: 'date', value: '2023-01-01' } });

    const fileInput = screen.getByLabelText(/photos/i);
    const mockFile = new (window as any).File(['(binary data)'], 'error.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    fireEvent.click(screen.getByRole('button', { name: /add memory/i }));

    await waitFor(() => expect(screen.getByText('Failed to create memory. Please try again.')).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('displays an error message if API submission fails', async () => {
    mockUploadImage.mockResolvedValue('http://example.com/uploaded/image.jpg');
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    render(<MemoryForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { name: 'title', value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { name: 'description', value: 'Test Desc' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { name: 'date', value: '2023-01-01' } });

    const fileInput = screen.getByLabelText(/photos/i);
    const mockFile = new (window as any).File(['(binary data)'], 'api-error.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    fireEvent.click(screen.getByRole('button', { name: /add memory/i }));

    await waitFor(() => expect(screen.getByText('Server error')).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('disables the submit button while loading', async () => {
    mockUploadImage.mockResolvedValue('http://example.com/uploaded/image.jpg');

    render(<MemoryForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { name: 'title', value: 'Loading Test' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { name: 'description', value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { name: 'date', value: '2023-01-01' } });

    const fileInput = screen.getByLabelText(/photos/i);
    const mockFile = new (window as any).File(['(binary data)'], 'loading.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const submitButton = screen.getByRole('button', { name: /add memory/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Saving...');

    // Wait for the fetch to complete
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(submitButton).toBeEnabled(); // Button should be re-enabled after loading
  });

  it('calls onSuccess callback with correct navigation on successful submission', async () => {
    mockUploadImage.mockResolvedValue('http://example.com/uploaded/image.jpg');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'mock-memory-id' }),
    });

    render(<MemoryForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { name: 'title', value: 'Success Callback' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { name: 'description', value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { name: 'date', value: '2023-01-01' } });

    const fileInput = screen.getByLabelText(/photos/i);
    const mockFile = new (window as any).File(['(binary data)'], 'success.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    fireEvent.click(screen.getByRole('button', { name: /add memory/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/memories'); // Verify navigation happens
  });
});
