'use client';

import React, { useState, useEffect } from 'react';
import GoalCard from '@/components/GoalCard';
import Link from 'next/link';

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  status: string;
  progress?: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/goals');
        if (!response.ok) {
          throw new Error('Failed to fetch goals');
        }
        const data: Goal[] = await response.json();
        // Ensure dates are Date objects for consistent formatting in GoalCard
        const processedData = data.map(goal => ({
          ...goal,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
          createdAt: new Date(goal.createdAt),
          updatedAt: new Date(goal.updatedAt),
        }));
        setGoals(processedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading goals...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Relationship Goals</h1>
        <Link
          href="/goals/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Goal
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No goals set yet. Start by adding your first relationship goal!</p>
          <Link
            href="/goals/new"
            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add First Goal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
