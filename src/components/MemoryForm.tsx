'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { uploadImage } from '@/lib/imageUploader'; // Assuming imageUploader will be created

interface MemoryFormData {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  images: File[];
}

const MemoryForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<MemoryFormData>({
    title: '',
    description: '',
    date: '',
    images: [],
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, images: Array.from(e.target.files || []) }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload images first
      const uploadedImageUrls: string[] = [];
      for (const image of formData.images) {
        const url = await uploadImage(image); // This will be a mock/placeholder function for now
        uploadedImageUrls.push(url);
      }
      setImageUrls(uploadedImageUrls);

      // 2. Prepare memory data (including uploaded URLs)
      const memoryData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(), // Convert to ISO string for backend
        photoUrls: uploadedImageUrls, // Renamed from 'photos' to 'photoUrls' for clarity with backend
      };

      // 3. Send memory data to backend API
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      // Assuming the API returns the created memory or a success status
      // const createdMemory = await response.json();

      alert('Memory created successfully!');
      // Optionally reset form or redirect
      setFormData({ title: '', description: '', date: '', images: [] });
      setImageUrls([]);
      if (onSuccess) {
        onSuccess(); // Call callback if provided
      }

    } catch (err: any) {
      console.error('Error creating memory:', err);
      setError(err.message || 'Failed to create memory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Add New Memory</h2>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="e.g., Our First Anniversary"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Describe the memory in detail..."
        ></textarea>
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
          Photos (upload one or more)
        </label>
        <input
          type="file"
          id="images"
          name="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {imageUrls.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Uploaded:</p>
            <ul className="list-disc list-inside text-xs text-blue-600">
              {imageUrls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url.substring(url.lastIndexOf('/') + 1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Add Memory'}
      </button>
    </form>
  );
};

export default MemoryForm;
