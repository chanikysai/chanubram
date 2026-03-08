// src/analysis/codebase-analyzer.test.js
import {
  performCodebaseAnalysis,
  analyzePullRequestChanges
} from './codebase-analyzer.js';

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
    toBeGreaterThan: (expected) => {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    }
  };
}


describe('codebase-analyzer.js', () => {
  test('performCodebaseAnalysis should analyze the entire codebase when no files are specified', () => {
    const result = performCodebaseAnalysis();
    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('files');
    expect(result.files).toBeArray();
    expect(result.files.length).toBeGreaterThan(0);
    expect(result.files.includes("app.js")).toBe(true);
  });

  test('performCodebaseAnalysis should analyze specific files when provided', () => {
    const files = ["src/componentA.js", "src/utils.js"];
    const result = performCodebaseAnalysis(files);
    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('files');
    expect(result.files).toBeArray();
    expect(result.files).toBe(files); // Should return the exact files provided
  });

  test('analyzePullRequestChanges should return a summary and empty issues/improvements', () => {
    const diff = `--- a/file1.js
+++ b/file1.js
@@ -1,4 +1,6 @@
 function oldFunction() {
-  console.log("old code");
+  console.log("updated code line 1");
+  console.log("updated code line 2");
 }
+
+function newFunction() { /* ... */ }
`;
    const changedFiles = ["file1.js", "file2.js"];
    const result = analyzePullRequestChanges(diff, changedFiles);

    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('summary');
    expect(result.summary).toBeString();
    expect(result.summary.startsWith('Analyzed changes across 2 files.')).toBe(true);
    expect(result).toHaveProperty('potentialIssues');
    expect(result.potentialIssues).toBeArray();
    expect(result.potentialIssues.length).toBe(0);
    expect(result).toHaveProperty('suggestedImprovements');
    expect(result.suggestedImprovements).toBeArray();
    expect(result.suggestedImprovements.length).toBe(0);
  });
});
