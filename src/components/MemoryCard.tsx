'use client';

import React from 'react';
import Image from 'next/image'; // Assuming Next.js Image component for optimization

// Define the structure of a Memory object
interface Memory {
  id: string;
  title: string;
  description: string;
  date: string; // Should be in a displayable format, e.g., 'YYYY-MM-DD' or ISO string
  photoUrls?: string[]; // Array of URLs to photos
  // Add potential fields for interactions later, e.g., likes, comments
  // likes?: number;
  // comments?: { userId: string; text: string; createdAt: string }[];
}

interface MemoryCardProps {
  memory: Memory;
  onClick?: (memoryId: string) => void; // For navigating to detail view
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onClick }) => {
  const formattedDate = new Date(memory.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Basic interaction handlers (placeholders)
  const handleLike = () => {
    console.log('Liked memory:', memory.id);
    // TODO: Implement liking logic
  };

  const handleComment = () => {
    console.log('Commented on memory:', memory.id);
    // TODO: Implement commenting logic
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col"
      onClick={() => onClick?.(memory.id)}
    >
      {/* Photo Carousel/Grid */}
      {memory.photoUrls && memory.photoUrls.length > 0 && (
        <div className="w-full aspect-video relative">
          {/* In a real app, this would be a carousel or a grid */}
          {/* For simplicity, showing the first image */}
          <Image
            src={memory.photoUrls[0]}
            alt={`Memory photo for ${memory.title}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            // Placeholder for image loading and error handling
            unoptimized // Use if images are not optimized by Next.js Image, e.g., local dev server
          />
          {memory.photoUrls.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {memory.photoUrls.length} photos
            </span>
          )}
        </div>
      )}

      <div className={`p-4 ${memory.photoUrls && memory.photoUrls.length > 0 ? 'flex-1' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {memory.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{formattedDate}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
          {memory.description}
        </p>
      </div>

      {/* Interaction Bar */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-4">
        <button
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
        >
          {/* TODO: Add Like icon */}
          <span className="ml-1">Like</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleComment(); }}
          className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
        >
          {/* TODO: Add Comment icon */}
          <span className="ml-1">Comment</span>
        </button>
      </div>
    </div>
  );
};

export default MemoryCard;
