'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { setReminder } from '@/lib/reminderService'; // Import the reminder service

interface OccasionFormData {
  name: string;
  date: string; // YYYY-MM-DD format
  reminderDate?: string; // Optional, for setting a reminder
}

const OccasionForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<OccasionFormData>({
    name: '',
    date: '',
    reminderDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const occasionData = {
        name: formData.name,
        date: new Date(formData.date).toISOString(), // Convert to ISO string for backend
        reminderDate: formData.reminderDate ? new Date(formData.reminderDate).toISOString() : null,
      };

      // Simulate API call to save the occasion
      const response = await fetch('/api/occasions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(occasionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save occasion');
      }

      const createdOccasion = await response.json(); // Expecting { id: string, ... }

      // If a reminder date is set, call the reminder service
      if (formData.reminderDate && createdOccasion.id) {
        await setReminder(
          createdOccasion.id,
          formData.name,
          occasionData.date, // Use ISO string for consistency
          occasionData.reminderDate // Use ISO string for consistency
        );
      }

      alert('Occasion added successfully!');
      setFormData({ name: '', date: '', reminderDate: '' }); // Reset form

      if (onSuccess) {
        onSuccess(); // Call callback if provided
      }

    } catch (err: any) {
      console.error('Error adding occasion:', err);
      setError(err.message || 'Failed to add occasion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get today's date for default min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Add Special Occasion</h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Occasion Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="e.g., Anniversary, Partner's Birthday"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
          min={today} // Prevent selecting past dates
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700">
          Reminder Date (Optional)
        </label>
        <input
          type="date"
          id="reminderDate"
          name="reminderDate"
          value={formData.reminderDate}
          onChange={handleInputChange}
          min={today} // Prevent selecting past dates
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <p className="text-xs text-gray-500 mt-1">Set a date for a reminder notification.</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Add Occasion'}
      </button>
    </form>
  );
};

export default OccasionForm;
