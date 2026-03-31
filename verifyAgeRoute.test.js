// verifyAgeRoute.test.js
const request = require('supertest');
const express = require('express');
const { expect } = require('chai');
// Note: path is not directly used in this test file for route testing,
// but is kept in case of future modifications that might need it.

// Re-creating the app setup for testing purposes
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock today's date for consistent age calculation in tests.
// The original test context mentioned March 31, 2026.
const mockDate = new Date('2026-03-31T12:00:00Z'); // Using UTC for consistency
const originalDate = Date;

// Override Date globally for the scope of these tests
global.Date = class extends Date {
    constructor(dateString) {
        if (dateString) {
            // If a date string is provided, use the original Date constructor
            return new originalDate(dateString);
        }
        // Otherwise, return the mock date
        return new originalDate(mockDate.getTime());
    }
};

// Ensure the route handler is required correctly
const verifyAgeRoute = require('./routes/verifyAgeRoute');
app.use('/api', verifyAgeRoute); // Mount the route under /api

// --- Test Suite for POST /api/verify-age ---
describe('POST /api/verify-age (Age Bracket Determination)', () => {

    // Clean up the mock Date after tests are complete
    after(() => {
        global.Date = originalDate;
    });

    // Test case 1: DOB for someone under 18 (e.g., 16 years old)
    it('should return UNDER_18 bracket for a user aged 16', async () => {
        // Born in 2010, on March 31st -> 16 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2010-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 16,
            bracket: 'UNDER_18',
            content: 'youth_content'
        });
    });

    // Test case 2: DOB for someone exactly 17 years old (boundary of UNDER_18)
    it('should return UNDER_18 bracket for a user aged 17', async () => {
        // Born in 2009, on March 31st -> 17 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2009-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 17,
            bracket: 'UNDER_18',
            content: 'youth_content'
        });
    });

    // Test case 3: DOB for someone exactly 18 years old (boundary of EIGHTEEN_TO_TWENTY_FIVE)
    it('should return EIGHTEEN_TO_TWENTY_FIVE bracket for a user aged 18', async () => {
        // Born in 2008, on March 31st -> 18 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2008-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 18,
            bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
            content: 'young_adult_content'
        });
    });
    
    // Test case 4: DOB for someone between 18 and 25 (e.g., 22 years old)
    it('should return EIGHTEEN_TO_TWENTY_FIVE bracket for a user aged 22', async () => {
        // Born in 2004, on March 31st -> 22 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2004-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 22,
            bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
            content: 'young_adult_content'
        });
    });

    // Test case 5: DOB for someone exactly 25 years old (boundary of EIGHTEEN_TO_TWENTY_FIVE)
    it('should return EIGHTEEN_TO_TWENTY_FIVE bracket for a user aged 25', async () => {
        // Born in 2001, on March 31st -> 25 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2001-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 25,
            bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
            content: 'young_adult_content'
        });
    });

    // Test case 6: DOB for someone exactly 26 years old (boundary of OVER_TWENTY_FIVE)
    it('should return OVER_TWENTY_FIVE bracket for a user aged 26', async () => {
        // Born in 2000, on March 31st -> 26 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2000-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 26,
            bracket: 'OVER_TWENTY_FIVE',
            content: 'adult_content'
        });
    });

    // Test case 7: DOB for someone over 25 (e.g., 40 years old)
    it('should return OVER_TWENTY_FIVE bracket for a user aged 40', async () => {
        // Born in 1986, on March 31st -> 40 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '1986-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 40,
            bracket: 'OVER_TWENTY_FIVE',
            content: 'adult_content'
        });
    });

    // Test case 8: DOB for someone born today (age 0)
    it('should return UNDER_18 bracket for a user aged 0 (born today)', async () => {
        // Born on 2026-03-31 -> 0 years old on 2026-03-31
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2026-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 0,
            bracket: 'UNDER_18',
            content: 'youth_content'
        });
    });
    
    // Test case 9: Invalid DOB format -> JSON error response
    it('should return 400 with JSON error for an invalid DOB format', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: 'invalid-date' });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            currentAge: null,
            bracket: null,
            content: null,
            message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.'
        });
    });

    // Test case 10: Missing DOB -> JSON error response
    it('should return 400 with JSON error if DOB is missing', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({}); // Empty body
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            currentAge: null,
            bracket: null,
            content: null,
            message: 'DOB is required.'
        });
    });

    // Test case 11: DOB that results in age calculation just before a birthday transition (e.g. 18th bday is tomorrow)
    it('should return UNDER_18 for DOB where birthday is tomorrow (age 17.99 rounded down to 17)', async () => {
        // User born April 1st, 2008. On March 31, 2026, they are 17.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2008-04-01' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 17,
            bracket: 'UNDER_18',
            content: 'youth_content'
        });
    });
    
    // Test case 12: DOB that results in age calculation just after a birthday transition (e.g. 18th bday was today)
    it('should return EIGHTEEN_TO_TWENTY_FIVE for DOB where birthday was today (age 18)', async () => {
        // User born March 31st, 2008. On March 31, 2026, they are 18.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2008-03-31' }); 
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            currentAge: 18,
            bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
            content: 'young_adult_content'
        });
    });

});
