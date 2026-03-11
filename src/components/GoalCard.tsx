import React from 'react';
import Link from 'next/link';

// Interface matching the Prisma Goal model
interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date | string; // Allow string for API response, Date for internal use
  createdAt: Date | string;
  updatedAt: Date | string;
  status: string;
  progress?: string;
}

interface GoalCardProps {
  goal: Goal;
}

const formatDate = (date?: Date | string): string => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    // Check for invalid date
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", date, e);
    return 'Invalid Date';
  }
};

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const targetDateObj = goal.targetDate ? new Date(goal.targetDate) : null;
  const createdAtObj = new Date(goal.createdAt);
  
  const daysUntilTarget = targetDateObj
    ? Math.ceil((targetDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColorClass = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
  }[goal.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="border rounded-lg p-5 shadow-sm bg-white hover:shadow-md transition-shadow duration-200 ease-in-out">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium capitalize ${statusColorClass}`}>
          {goal.status}
        </span>
      </div>

      {goal.description && (
        <p className="text-gray-600 mb-4 text-sm">{goal.description}</p>
      )}

      {goal.progress && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Progress:</p>
          <p className="text-gray-500 text-sm italic">{goal.progress}</p>
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-500">
        <div className="space-y-1">
          {targetDateObj && (
            <>
              <p>Target: {formatDate(targetDateObj)}</p>
              {daysUntilTarget !== null && (
                daysUntilTarget >= 0
                  ? <p className="text-xs text-green-600">({daysUntilTarget} days left)</p>
                  : <p className="text-xs text-red-600">({Math.abs(daysUntilTarget)} days overdue)</p>
              )}
            </>
          )}
          <p>Created: {formatDate(createdAtObj)}</p>
        </div>
        
        {/* Link to edit the goal. Assuming an edit route like /goals/[id]/edit */}
        <Link href={`/goals/${goal.id}/edit`} passHref className="text-indigo-600 hover:text-indigo-800 self-end">
          View/Edit
        </Link>
      </div>
    </div>
  );
};

export default GoalCard;
