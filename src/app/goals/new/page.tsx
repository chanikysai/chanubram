'use client';

import React from 'react';
import GoalForm from '@/components/GoalForm';
import { useRouter } from 'next/navigation';

export default function NewGoalPage() {
  const router = useRouter();

  const handleAddGoal = async (goalData: {
    title: string;
    description?: string;
    targetDate?: Date;
    progress?: string;
    status?: string;
  }) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add goal');
      }

      // Redirect to the goals list page after successful creation
      router.push('/goals');
      
    } catch (error: any) {
      console.error('Error adding goal:', error);
      // TODO: Display error message to the user
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Relationship Goal</h1>
      <GoalForm onSubmit={handleAddGoal} />
    </div>
  );
}
