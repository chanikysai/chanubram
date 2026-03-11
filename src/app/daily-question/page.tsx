// src/app/daily-question/page.tsx

'use client'; // This is a Client Component

import { useState, useEffect, FormEvent } from 'react';

interface Answer {
  id: string;
  questionId: string;
  userId: string;
  text: string;
  createdAt: string; // ISO string from API
}

interface Question {
  id: string;
  text: string;
  createdAt: string; // ISO string from API
  answers: Answer[];
}

export default function DailyQuestionPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  const fetchDailyQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/daily-question');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch question');
      }
      const data: Question = await response.json();
      setQuestion(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswerText(event.target.value);
  };

  const handleSubmitAnswer = async (event: FormEvent) => {
    event.preventDefault();
    if (!question || !answerText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/daily-question/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          text: answerText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit answer');
      }

      const newAnswer: Answer = await response.json();
      
      // Optimistically update the UI or refetch
      // For simplicity, refetching is safer to ensure consistency
      await fetchDailyQuestion(); 
      setAnswerText(''); // Clear input after successful submission

    } catch (err: any) {
      setError(err.message);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString; // fallback if date parsing fails
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {question && !loading && !error && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Daily Question</h1>
          <p className="text-lg text-gray-700 mb-2">Date: {formatDate(question.createdAt)}</p>
          <p className="text-xl font-semibold mb-6 text-blue-600">{question.text}</p>

          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Answer</h2>
          <form onSubmit={handleSubmitAnswer} className="mb-8">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm mb-4"
              rows={4}
              placeholder="Share your thoughts..."
              value={answerText}
              onChange={handleAnswerChange}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              disabled={isSubmitting || !answerText.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Responses</h2>
            {question.answers.length === 0 ? (
              <p className="text-gray-500">No responses yet. Be the first!</p>
            ) : (
              <ul className="space-y-4">
                {question.answers.map((answer) => (
                  <li key={answer.id} className="bg-gray-50 p-4 rounded-md shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-600">
                        {/* TODO: Display partner name or 'You' based on userId */}
                        Partner Response ({answer.userId.substring(0, 4)}...) {/* Placeholder for user */}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(answer.createdAt)}</p>
                    </div>
                    <p className="text-gray-800">{answer.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
