// src/analysis/llm-analyzer.test.ts

import { analyzeCodebaseForRoadmap } from './llm-analyzer.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`Test Failed: ${message}`);
    process.exit(1);
  }
}

function runTests() {
  console.log('Running tests for llm-analyzer.js...');

  // Test Case 1: Happy path - valid inputs
  try {
    const codebaseAnalysis = { files: ['index.js'], functions: ['init'] };
    const userInput = 'Generate roadmap for authentication feature';
    const result = analyzeCodebaseForRoadmap(codebaseAnalysis, userInput);

    assert(result !== null, "Test Case 1 Failed: Result should not be null.");
    assert(typeof result === 'object', "Test Case 1 Failed: Result should be an object.");
    assert(result.llmSuggestions.includes('Suggested roadmap'), "Test Case 1 Failed: Incorrect suggestions.");
    assert(result.confidence > 0 && result.confidence <= 1, "Test Case 1 Failed: Confidence should be between 0 and 1.");
    console.log('Test Case 1 Passed: Valid inputs produce expected output.');
  } catch (error) {
    console.error('Test Case 1 Failed with exception:', error);
    process.exit(1);
  }

  // Test Case 2: Edge case - empty codebase analysis
  try {
    const codebaseAnalysis = { files: [], functions: [] };
    const userInput = 'Generate roadmap';
    const result = analyzeCodebaseForRoadmap(codebaseAnalysis, userInput);

    assert(result !== null, "Test Case 2 Failed: Result should not be null for empty codebase analysis.");
    assert(result.llmSuggestions.includes('Suggested roadmap'), "Test Case 2 Failed: Suggestions missing for empty analysis.");
    console.log('Test Case 2 Passed: Handles empty codebase analysis gracefully.');
  } catch (error) {
    console.error('Test Case 2 Failed with exception:', error);
    process.exit(1);
  }

  // Test Case 3: Edge case - empty user input
  try {
    const codebaseAnalysis = { files: ['app.js'], functions: ['render'] };
    const userInput = '';
    const result = analyzeCodebaseForRoadmap(codebaseAnalysis, userInput);

    assert(result !== null, "Test Case 3 Failed: Result should not be null for empty user input.");
    assert(result.llmSuggestions.includes('Suggested roadmap'), "Test Case 3 Failed: Suggestions missing for empty user input.");
    console.log('Test Case 3 Passed: Handles empty user input gracefully.');
  } catch (error) {
    console.error('Test Case 3 Failed with exception:', error);
    process.exit(1);
  }

  console.log('All llm-analyzer.ts tests passed!');
}

runTests();
