// src/lib/questions.ts

const QUESTIONS = [
  "What's one thing you admire about me today, and why?",
  "What's a small act of kindness you've experienced or given recently?",
  "If we could travel anywhere in the world right now, where would you go and why?",
  "What's a skill you'd love to learn, and how would it benefit us?",
  "What's a favorite memory we share from the past year?",
  "What's something that made you laugh today?",
  "What's one goal you're excited about achieving in the next month?",
  "What's a simple pleasure that brought you joy today?",
  "What's a song that's been stuck in your head lately?",
  "What's something new you've learned or discovered recently?",
];

/**
 * Gets the daily question based on the provided date.
 * Uses the day of the month to cycle through the predefined questions.
 * @param date - The current date.
 * @returns The text of the daily question.
 */
export function getDailyQuestion(date: Date): string {
  const dayOfMonth = date.getDate();
  // Use (dayOfMonth - 1) because getDate() is 1-indexed and array indices are 0-indexed.
  // Modulo by QUESTIONS.length ensures we cycle through the questions.
  const questionIndex = (dayOfMonth - 1) % QUESTIONS.length;
  return QUESTIONS[questionIndex];
}

// Export all questions, useful for seeding the database or displaying a history.
export const ALL_QUESTIONS = QUESTIONS;
