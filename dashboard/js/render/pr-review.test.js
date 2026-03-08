// dashboard/js/render/pr-review.test.js
import {
  renderPullRequestReview
} from './pr-review.js';

// Re-using the simple test runner from git-ops.test.js
function describe(name, fn) {
  console.log(`
--- ${name} ---`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    process.exit(1); // Exit on first error
  }
}

function expect(value) {
  return {
    toBe: (expected) => {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, but got ${value}`);
      }
    },
    toBeInstanceOf: (expectedClass) => {
      if (!(value instanceof expectedClass)) {
        throw new Error(`Expected instance of ${expectedClass.name}, but got ${value.constructor.name}`);
      }
    },
    toHaveProperty: (prop, expectedValue) => {
      if (!value.hasOwnProperty(prop)) {
        throw new Error(`Expected object to have property "${prop}"`);
      }
      if (expectedValue !== undefined && value[prop] !== expectedValue) {
        throw new Error(`Expected property "${prop}" to be "${expectedValue}", but got "${value[prop]}"`);
      }
    },
    toBeArray: () => {
      if (!Array.isArray(value)) {
        throw new Error(`Expected an array, but got ${typeof value}`);
      }
    },
    toBeString: () => {
      if (typeof value !== 'string') {
        throw new Error(`Expected a string, but got ${typeof value}`);
      }
    },
    toBeTrue: () => {
      if (value !== true) {
        throw new Error(`Expected true, but got ${value}`);
      }
    },
    toBeFalse: () => {
      if (value !== false) {
        throw new Error(`Expected false, but got ${value}`);
      }
    }
  };
}

describe('pr-review.js', () => {
  // Mock console.log to capture output
  const originalConsoleLog = console.log;
  let consoleOutput = [];

  beforeEach(() => {
    consoleOutput = [];
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
  });

  afterEach(() => {
    console.log = originalConsoleLog; // Restore original console.log
  });


  function beforeEach(fn) {
    fn();
  }

  function afterEach(fn) {
    fn();
  }


  test('renderPullRequestReview should log review data with inline comments', () => {
    const reviewData = {
      summary: "This is a summary of the PR review.",
      inlineComments: [{
        filePath: "file.js",
        lineNumber: 10,
        comment: "Consider refactoring this line."
      }, {
        filePath: "another.js",
        lineNumber: 5,
        comment: "Good change here."
      }, ],
    };

    renderPullRequestReview(reviewData);

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput.some(line => line.includes("Review Summary: This is a summary of the PR review."))).toBe(true);
    expect(consoleOutput.some(line => line.includes("File: file.js, Line: 10, Comment: Consider refactoring this line."))).toBe(true);
    expect(consoleOutput.some(line => line.includes("File: another.js, Line: 5, Comment: Good change here."))).toBe(true);
  });

  test('renderPullRequestReview should log review data without inline comments', () => {
    const reviewData = {
      summary: "This is a summary of the PR review with no inline comments."
    };

    renderPullRequestReview(reviewData);

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput.some(line => line.includes("Review Summary: This is a summary of the PR review with no inline comments."))).toBe(true);
    expect(consoleOutput.some(line => line.includes("No inline comments to display."))).toBe(true);
  });

  test('renderPullRequestReview should handle empty review data gracefully', () => {
    const reviewData = {
      summary: "",
      inlineComments: []
    };

    renderPullRequestReview(reviewData);

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput.some(line => line.includes("Review Summary: "))).toBe(true);
    expect(consoleOutput.some(line => line.includes("No inline comments to display."))).toBe(true);
  });
});