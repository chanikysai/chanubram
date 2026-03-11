import React, { useState, FormEvent } from 'react';

interface GoalData {
  title: string;
  description?: string;
  targetDate?: Date;
  progress?: string;
  status?: string;
}

interface GoalFormProps {
  initialData?: GoalData & { id: string }; // Added id for potential edit scenario
  onSubmit: (data: GoalData) => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  // Format date for input type="date"
  const initialDate = initialData?.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '';
  const [targetDate, setTargetDate] = useState(initialDate);
  const [progress, setProgress] = useState(initialData?.progress || '');
  const [status, setStatus] = useState(initialData?.status || 'active');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      progress,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg shadow-md bg-white">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Goal Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Save for vacation"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Save $5000 for a trip to Japan by next year."
        ></textarea>
      </div>

      <div>
        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
          Target Date
        </label>
        <input
          type="date"
          id="targetDate"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
          Progress Update
        </label>
        <textarea
          id="progress"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., 'Completed 2 sessions of online course', 'Saved $500 towards vacation'"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {initialData ? 'Update Goal' : 'Add Goal'}
      </button>
    </form>
  );
};

export default GoalForm;
