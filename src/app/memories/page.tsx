'use client';

import React, { useState, useEffect } from 'react';
import MemoryCard from '@/components/MemoryCard';
import Link from 'next/link';

// Define the structure of a Memory object, matching MemoryCard's expectation
interface Memory {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string format
  photoUrls?: string[];
}

// Mock function to simulate fetching memories from an API or database
// In a real app, this would involve fetching from /api/memories or similar
const fetchMemories = async (): Promise<Memory[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data - replace with actual API call
  const mockMemories: Memory[] = [
    {
      id: 'mem-1',
      title: 'First Trip to Kyoto',
      description: 'Exploring the bamboo forest and temples. The serene atmosphere was unforgettable.',
      date: '2023-04-15T10:00:00Z',
      photoUrls: [
        'https://via.placeholder.com/600x400/FF5733/FFFFFF?text=Kyoto+Forest',
        'https://via.placeholder.com/600x400/33FF57/FFFFFF?text=Kyoto+Temple',
      ],
    },
    {
      id: 'mem-2',
      title: 'Anniversary Dinner',
      description: 'A wonderful evening celebrating our anniversary at the Italian place downtown. The food was exquisite!',
      date: '2023-07-20T19:00:00Z',
      photoUrls: [
        'https://via.placeholder.com/600x400/3357FF/FFFFFF?text=Anniversary+Dinner',
      ],
    },
    {
      id: 'mem-3',
      title: 'Beach Day Getaway',
      description: 'Relaxing by the ocean, building sandcastles, and enjoying the sunset. Perfect escape from the city.',
      date: '2024-01-05T14:30:00Z',
      photoUrls: [
        'https://via.placeholder.com/600x400/FF33A1/FFFFFF?text=Beach+Sunset',
        'https://via.placeholder.com/600x400/A133FF/FFFFFF?text=Beach+Sandcastle',
        'https://via.placeholder.com/600x400/33FFF5/FFFFFF?text=Beach+Ocean',
      ],
    },
    {
      id: 'mem-4',
      title: 'Weekend Hike',
      description: 'Challenging but rewarding hike with stunning views from the summit. Nature at its finest.',
      date: '2024-03-10T09:00:00Z',
      // No photos for this memory
    },
  ];
  return Promise.resolve(mockMemories);
};

export default function MemoriesTimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // e.g., 'all', 'photos', 'no_photos'
  const [sortBy, setSortBy] = useState('date_desc'); // e.g., 'date_desc', 'date_asc'

  useEffect(() => {
    const loadMemories = async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchMemories();
        // Ensure dates are in a consistent format for sorting/display
        const processedData = fetchedData.map(mem => ({
          ...mem,
          date: new Date(mem.date).toISOString(), // Ensure ISO string format
        }));
        setMemories(processedData);
      } catch (err: any) {
        console.error("Failed to fetch memories:", err);
        setError("Could not load memories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, []);

  // Apply filters and sorting
  const filteredAndSortedMemories = React.useMemo(() => {
    let processedMemories = [...memories];

    // Filtering
    if (filter === 'photos') {
      processedMemories = processedMemories.filter(mem => mem.photoUrls && mem.photoUrls.length > 0);
    } else if (filter === 'no_photos') {
      processedMemories = processedMemories.filter(mem => !mem.photoUrls || mem.photoUrls.length === 0);
    }

    // Sorting
    processedMemories.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (sortBy === 'date_desc') {
        return dateB - dateA; // Descending
      } else if (sortBy === 'date_asc') {
        return dateA - dateB; // Ascending
      }
      return 0; // No sorting
    });

    return processedMemories;
  }, [memories, filter, sortBy]);

  const handleMemoryClick = (memoryId: string) => {
    // TODO: Implement navigation to memory detail page
    console.log('Navigating to memory detail for:', memoryId);
    // Example: router.push(`/memories/${memoryId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Memory Timeline
        </h1>
        <div className="flex items-center space-x-4">
          {/* Filter controls */}
          <div className="relative">
            <label htmlFor="filter" className="sr-only">Filter by:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Memories</option>
              <option value="photos">With Photos</option>
              <option value="no_photos">Without Photos</option>
            </select>
          </div>
          {/* Sort controls */}
          <div className="relative">
            <label htmlFor="sortBy" className="sr-only">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
            </select>
          </div>
          {/* Link to add new memory */}
          <Link
            href="/memories/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Memory
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading memories...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && memories.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 dark:text-gray-300">No memories found. Add your first memory!</p>
        </div>
      )}

      {!loading && !error && filteredAndSortedMemories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onClick={handleMemoryClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
