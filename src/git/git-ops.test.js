// src/git/git-ops.test.js
import {
  getPullRequestDiff,
  getPullRequestDetails,
  postReviewComment,
  postPullRequestComment,
  getChangedFiles
} from './git-ops.js';

// A very basic test runner simulation
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
    }
  };
}


describe('git-ops.js', () => {
  test('getPullRequestDiff should return a string', async () => {
    const diff = await getPullRequestDiff(123);
    expect(diff).toBeString();
    expect(diff.startsWith('--- a/')).toBe(true);
  });

  test('getPullRequestDetails should return an object with expected properties', async () => {
    const details = await getPullRequestDetails(123);
    expect(details).toBeInstanceOf(Object);
    expect(details).toHaveProperty('id', 123);
    expect(details).toHaveProperty('title');
    expect(details).toHaveProperty('author');
    expect(details).toHaveProperty('filesChanged');
    expect(Array.isArray(details.filesChanged)).toBe(true);
  });

  test('postReviewComment should return success: true', async () => {
    const result = await postReviewComment(123, "file.js", 5, "Great change!");
    expect(result).toHaveProperty('success', true);
  });

  test('postPullRequestComment should return success: true', async () => {
    const result = await postPullRequestComment(123, "Overall review comment.");
    expect(result).toHaveProperty('success', true);
  });

  test('getChangedFiles should return an array of strings', async () => {
    const files = await getChangedFiles(123);
    expect(files).toBeArray();
    expect(files.length > 0).toBe(true);
    expect(typeof files[0]).toBe('string');
  });
});