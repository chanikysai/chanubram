// src/tasks/roadmap-generator.test.ts

import { generateProjectRoadmap } from './roadmap-generator.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`Test Failed: ${message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log('Running tests for roadmap-generator.js...');

  // Test Case 1: Happy path - basic roadmap generation
  try {
    const goals = "Develop a new e-commerce platform";
    const context = { userId: "testUser1" };
    const roadmap = await generateProjectRoadmap(goals, context);

    assert(roadmap !== null, "Test Case 1 Failed: Roadmap should not be null.");
    assert(typeof roadmap === 'object', "Test Case 1 Failed: Roadmap should be an object.");
    assert(roadmap.title === "Generated Project Roadmap", "Test Case 1 Failed: Incorrect roadmap title.");
    assert(roadmap.epics.length > 0, "Test Case 1 Failed: Roadmap should contain epics.");
    assert(roadmap.epics[0].name === "Core Infrastructure Setup", "Test Case 1 Failed: Incorrect epic name.");
    console.log('Test Case 1 Passed: Basic roadmap generation works.');
  } catch (error) {
    console.error('Test Case 1 Failed with exception:', error);
    process.exit(1);
  }

  // Test Case 2: Edge case - empty goals
  try {
    const goals = "";
    const context = { userId: "testUser2" };
    const roadmap = await generateProjectRoadmap(goals, context);

    assert(roadmap !== null, "Test Case 2 Failed: Roadmap should not be null for empty goals.");
    assert(roadmap.epics.length > 0, "Test Case 2 Failed: Roadmap should still contain default epics for empty goals.");
    console.log('Test Case 2 Passed: Handles empty goals gracefully.');
  } catch (error) {
    console.error('Test Case 2 Failed with exception:', error);
    process.exit(1);
  }

  // Test Case 3: Error handling - simulate an error (though dummy implementation doesn't throw)
  // For actual error handling, one would mock dependencies to force errors.
  try {
    const goals = "Goals that might cause an error";
    const context = { userId: "errorTest" };
    // Assuming generateProjectRoadmap might return a specific error structure or throw
    const roadmap = await generateProjectRoadmap(goals, context);
    
    // In a real scenario, we'd expect a specific error or a fallback.
    // For this dummy, we just check it doesn't crash and returns a valid structure.
    assert(roadmap !== null, "Test Case 3 Failed: Roadmap should not be null even with potential error conditions.");
    console.log('Test Case 3 Passed: Dummy error handling scenario works.');
  } catch (error) {
    console.error('Test Case 3 Failed with unexpected exception:', error);
    process.exit(1);
  }

  console.log('All roadmap-generator.ts tests passed!');
}

runTests();
