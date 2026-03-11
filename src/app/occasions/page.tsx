'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Define the interface for an Occasion
interface Occasion {
  id: string;
  name: string;
  date: string; // Stored as ISO string, will parse to Date
  reminderDate: string | null; // Optional
  createdAt: string;
  updatedAt: string;
}

export default function OccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        const response = await fetch('/api/occasions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Occasion[] = await response.json();
        // Ensure dates are parsed correctly if needed for sorting/display
        const parsedData = data.map(occasion => ({
          ...occasion,
          date: new Date(occasion.date).toISOString(), // Keep as ISO string for consistency, or parse to Date object if needed for complex operations
          reminderDate: occasion.reminderDate ? new Date(occasion.reminderDate).toISOString() : null,
        }));
        setOccasions(parsedData);
      } catch (err: any) {
        console.error('Failed to fetch occasions:', err);
        setError('Failed to load occasions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOccasions();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Helper to format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Sort occasions by date for prominent display
  const sortedOccasions = [...occasions].sort((a, b) => {
    // Compare dates as Date objects for proper sorting
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter for upcoming occasions (optional, but good for "prominently")
  const today = new Date();
  const upcomingOccasions = sortedOccasions.filter(occasion => new Date(occasion.date) >= today);


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Upcoming Special Occasions</h1>
        <Link href="/occasions/new">
          <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add New Occasion
          </button>
        </Link>
      </div>

      {isLoading && <p className="text-center text-gray-500">Loading occasions...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && upcomingOccasions.length === 0 && (
        <p className="text-center text-gray-500">
          No upcoming occasions found. Add one to get started!
        </p>
      )}

      {!isLoading && !error && upcomingOccasions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingOccasions.map((occasion) => (
            <div
              key={occasion.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{occasion.name}</h2>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Date:</span> {formatDate(occasion.date)}
              </p>
              {occasion.reminderDate && (
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Reminder:</span> {formatDate(occasion.reminderDate)}
                </p>
              )}
              <div className="mt-4">
                <Link href={`/occasions/${occasion.id}`}>
                  <a className="text-indigo-600 hover:text-indigo-800 font-medium">View Details</a>
                </Link>
                {/* TODO: Add Edit/Delete functionality */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
