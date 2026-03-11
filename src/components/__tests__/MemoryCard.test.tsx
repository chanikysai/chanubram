// Mock Next.js Image component for testing
// In a real project, you might use a library like 'next-image-mock' or configure Jest
// For simplicity, we'll mock it to render a placeholder div with the src attribute

// Mock the module
jest.mock('next/image', () => {
  return ({ src, alt, layout, objectFit, className, unoptimized }: any) => (
    <div
      data-testid="mock-image"
      data-src={src}
      data-alt={alt}
      className={className}
      style={{ width: '100%', height: 'auto', objectFit: objectFit }} // Basic styling approximation
    >
      Mock Image: {alt}
    </div>
  );
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryCard from './MemoryCard'; // Assuming MemoryCard is in the same directory

// Define the Memory type inline for tests or import if defined elsewhere
interface Memory {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string format
  photoUrls?: string[];
}

describe('MemoryCard', () => {
  const mockMemoryWithPhotos: Memory = {
    id: 'mem-1',
    title: 'Beautiful Sunset View',
    description: 'A breathtaking sunset experienced during our vacation. The colors were incredible.',
    date: '2023-10-26T18:30:00Z',
    photoUrls: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
  };

  const mockMemoryWithoutPhotos: Memory = {
    id: 'mem-2',
    title: 'Important Meeting',
    description: 'A productive meeting discussing the project roadmap and future strategies. Key decisions were made.',
    date: '2023-11-15T09:00:00Z',
    photoUrls: [], // Explicitly empty
  };

  const mockMemoryWithSinglePhoto: Memory = {
    id: 'mem-3',
    title: 'Cozy Cafe Visit',
    description: 'Enjoyed a quiet afternoon with a coffee at a new cafe.',
    date: '2023-11-01T14:00:00Z',
    photoUrls: ['https://example.com/photo3.jpg'],
  };

  // Test 1: Renders correctly with all details and photos
  test('renders memory details and photos correctly', () => {
    render(<MemoryCard memory={mockMemoryWithPhotos} />);

    // Check text content
    expect(screen.getByText('Beautiful Sunset View')).toBeInTheDocument();
    expect(screen.getByText('A breathtaking sunset experienced during our vacation. The colors were incredible.')).toBeInTheDocument();
    // Check formatted date
    expect(screen.getByText('October 26, 2023')).toBeInTheDocument();

    // Check photo indicator
    expect(screen.getByText('2 photos')).toBeInTheDocument();
    // Check if the mock image component is rendered with the correct src
    const mockImage = screen.getByTestId('mock-image');
    expect(mockImage).toBeInTheDocument();
    expect(mockImage).toHaveAttribute('data-src', 'https://example.com/photo1.jpg');
    expect(mockImage).toHaveAttribute('data-alt', 'Memory photo for Beautiful Sunset View');
  });

  // Test 2: Renders correctly with a single photo
  test('renders correctly with a single photo', () => {
    render(<MemoryCard memory={mockMemoryWithSinglePhoto} />);

    expect(screen.getByText('Cozy Cafe Visit')).toBeInTheDocument();
    expect(screen.getByText('October 1, 2023')).toBeInTheDocument();

    // Check that the photo count span is NOT present for a single photo
    expect(screen.queryByText(/photos/i)).not.toBeInTheDocument();

    const mockImage = screen.getByTestId('mock-image');
    expect(mockImage).toHaveAttribute('data-src', 'https://example.com/photo3.jpg');
  });

  // Test 3: Renders correctly without photos
  test('renders memory details correctly without photos', () => {
    render(<MemoryCard memory={mockMemoryWithoutPhotos} />);

    expect(screen.getByText('Important Meeting')).toBeInTheDocument();
    expect(screen.getByText('November 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('A productive meeting discussing the project roadmap and future strategies. Key decisions were made.')).toBeInTheDocument();

    // Ensure no photo-related elements are rendered
    expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();
    expect(screen.queryByText(/photos/i)).not.toBeInTheDocument();
  });

  // Test 4: onClick handler is called when the card is clicked
  test('calls onClick handler when the card is clicked', () => {
    const handleClick = jest.fn();
    render(<MemoryCard memory={mockMemoryWithPhotos} onClick={handleClick} />);

    const cardElement = screen.getByText('Beautiful Sunset View').closest('.shadow-md'); // Find the closest parent with shadow-md class as the card
    expect(cardElement).toBeInTheDocument();

    fireEvent.click(cardElement!);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockMemoryWithPhotos.id);
  });

  // Test 5: Interaction buttons are present and can be clicked
  test('renders and handles interaction buttons', () => {
    // Mock event.stopPropagation to prevent it from interfering with our test
    const mockStopPropagation = jest.fn();

    render(<MemoryCard memory={mockMemoryWithPhotos} />);

    // Check if Like and Comment buttons are present
    const likeButton = screen.getByRole('button', { name: /Like/i });
    const commentButton = screen.getByRole('button', { name: /Comment/i });

    expect(likeButton).toBeInTheDocument();
    expect(commentButton).toBeInTheDocument();

    // Simulate clicks on the buttons
    // We expect the internal console.log to be called, as the actual handlers are placeholders
    // We also need to ensure stopPropagation is called when clicking these buttons
    fireEvent.click(likeButton, { stopPropagation: mockStopPropagation });
    fireEvent.click(commentButton, { stopPropagation: mockStopPropagation });

    // Verify that stopPropagation was called, ensuring it doesn't trigger the card's onClick
    expect(mockStopPropagation).toHaveBeenCalledTimes(2);

    // We can't easily test the console.log calls without mocking console,
    // but we've confirmed the buttons exist and their events are fired.
  });
});
