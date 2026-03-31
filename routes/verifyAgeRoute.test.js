const request = require('supertest');
const express = require('express');
const verifyAgeRoute = require('./verifyAgeRoute'); // Assuming verifyAgeRoute.js is in the same directory

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/api', verifyAgeRoute); // Mount the router under /api

// Mock dates for testing purposes (not directly used in tests, but good for context)
const VALID_DOB = '1995-07-15'; // A valid DOB
const INVALID_DOB_FORMAT = '15/07/1995'; // Invalid format
const INVALID_DOB_DATE = '1995-02-30'; // Invalid date (Feb 30th)

describe('POST /api/verify-age', () => {

    // Happy Path Test: Valid DOB
    test('should return success status for a valid DOB', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: VALID_DOB });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'success',
            message: 'DOB processed and verified.'
        });
    });

    // Error Handling Test: Missing DOB
    test('should return error status for missing DOB', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({}); // Empty body, no DOB

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: 'error',
            message: 'DOB is required.'
        });
    });

    // Error Handling Test: Invalid DOB format
    test('should return error status for invalid DOB format', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: INVALID_DOB_FORMAT });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: 'error',
            message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.'
        });
    });

    // Error Handling Test: Invalid DOB date
    test('should return error status for invalid DOB date', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: INVALID_DOB_DATE });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: 'error',
            message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.'
        });
    });

    // Edge Case Test: DOB that might result in specific age brackets
    // For example, a DOB that makes the user just turn 18 or just under 18.
    // The current logic doesn't need specific age values for this feature,
    // but it's good practice to have tests for boundary conditions.
    // Let's test a DOB that results in someone being exactly 18.
    test('should process DOB correctly for boundary age 18', async () => {
        // Calculate a DOB that would make someone exactly 18 today (assuming today is March 31, 2026)
        const today = new Date('2026-03-31');
        const dobFor18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        const dobStringFor18 = dobFor18.toISOString().split('T')[0]; // YYYY-MM-DD format

        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: dobStringFor18 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'success',
            message: 'DOB processed and verified.'
        });
    });

     // Test case for a DOB that results in an age outside defined brackets (should not happen with current logic but good for robustness)
     // The current AGE_BRACKETS cover 0 to Infinity, so this is unlikely to fail unless calculateAge has an issue.
     // We can test a very old date, expecting it to fall into OVER_TWENTY_FIVE. The actual bracket doesn't matter for the success message.
    test('should process very old DOB correctly', async () => {
        const veryOldDob = '1900-01-01'; // A DOB from a long time ago
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: veryOldDob });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'success',
            message: 'DOB processed and verified.'
        });
    });
});
