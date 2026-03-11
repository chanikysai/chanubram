// src/lib/__tests__/questions.test.ts

import { getDailyQuestion, ALL_QUESTIONS } from '../questions';

describe('questions library', () => {
  // Test case 1: Verify ALL_QUESTIONS export
  test('ALL_QUESTIONS should export the correct array of questions', () => {
    expect(ALL_QUESTIONS).toHaveLength(10); // Based on current QUESTIONS array length
    expect(ALL_QUESTIONS).toContain('What's one thing you admire about me today, and why?');
  });

  // Test case 2: Verify getDailyQuestion for the first day of a month
  test('getDailyQuestion should return the first question for the first day of the month', () => {
    const firstDay = new Date(2023, 0, 1); // January 1st, 2023 (Month is 0-indexed)
    expect(getDailyQuestion(firstDay)).toBe(ALL_QUESTIONS[0]);
  });

  // Test case 3: Verify getDailyQuestion cycles through questions
  test('getDailyQuestion should cycle through questions based on day of the month', () => {
    // Example: Use a date that should map to the 3rd question (index 2)
    const thirdDay = new Date(2023, 4, 3); // May 3rd, 2023
    expect(getDailyQuestion(thirdDay)).toBe(ALL_QUESTIONS[2]);

    // Example: Use a date that should map to the last question (index 9)
    const tenthDay = new Date(2023, 6, 10); // July 10th, 2023
    expect(getDailyQuestion(tenthDay)).toBe(ALL_QUESTIONS[9]);

    // Example: Test wrap-around for a month with more than 10 days
    // Let's say a month has 31 days. The 11th day should map to the first question again.
    const eleventhDay = new Date(2023, 8, 11); // September 11th, 2023
    expect(getDailyQuestion(eleventhDay)).toBe(ALL_QUESTIONS[0]); // (11-1) % 10 = 0

    // Test with a day that would exceed the list length if not for modulo
    const twentyFifthDay = new Date(2023, 11, 25); // December 25th, 2023
    // (25-1) % 10 = 24 % 10 = 4
    expect(getDailyQuestion(twentyFifthDay)).toBe(ALL_QUESTIONS[4]);
  });

  // Edge case: Test with February 29th in a leap year
  test('getDailyQuestion should handle leap year dates correctly', () => {
    const leapDay = new Date(2024, 1, 29); // February 29th, 2024 (Month is 0-indexed)
    // (29-1) % 10 = 28 % 10 = 8
    expect(getDailyQuestion(leapDay)).toBe(ALL_QUESTIONS[8]);
  });
});
