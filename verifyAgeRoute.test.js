// verifyAgeRoute.test.js
const request = require('supertest');
const express = require('express');
const { expect } = require('chai'); // Require chai for assertions

// Re-creating the app setup for testing purposes without calling app.listen()
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure the route handler is required correctly
const verifyAgeRoute = require('./routes/verifyAgeRoute');
app.use('/api', verifyAgeRoute);

// Today's date for context: March 31, 2026

describe('POST /api/verify-age', () => {
    // Test case 1: User is adult, minAge = 18 -> Redirect to /success
    it('should redirect to /success for a valid adult DOB with minAge 18', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '1990-01-01', minAge: 18 }); // Born in 1990, is 36 in 2026
        expect(response.status).to.equal(302); // Expecting a redirect
        expect(response.headers.location).to.equal('/success'); // Expecting redirect to /success
    });

    // Test case 2: User is minor, minAge = 18 -> Redirect to /special
    it('should redirect to /special for a DOB of someone under 18 with minAge 18', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2010-01-01', minAge: 18 }); // Born in 2010, will be 16 in 2026
        expect(response.status).to.equal(302); // Expecting a redirect
        expect(response.headers.location).to.equal('/special'); // Expecting redirect to /special
    });

    // Test case 3: Invalid DOB format -> JSON error response
    it('should return 400 with JSON error for an invalid DOB format', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: 'invalid-date', minAge: 18 });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            meetsThreshold: false,
            currentAge: null,
            minimumAge: null,
            message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.'
        });
    });

    // Test case 4: Missing DOB -> JSON error response
    it('should return 400 with JSON error if DOB is missing', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ minAge: 18 }); // Empty body for DOB
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            meetsThreshold: false,
            currentAge: null,
            minimumAge: null,
            message: 'DOB is required.'
        });
    });

    // Test case 5: Edge case - exactly 18 years old today (March 31, 2026), minAge = 18 -> Redirect to /success
    it('should redirect to /success for DOB that makes user exactly 18 today, with minAge 18', async () => {
        // Today is 2026-03-31. A person born on 2008-03-31 is exactly 18.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2008-03-31', minAge: 18 });
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/success');
    });

    // Test case 6: Edge case - just under 18 today (March 31, 2026), minAge = 18 -> Redirect to /special
    it('should redirect to /special for DOB that makes user just under 18 today, with minAge 18', async () => {
        // Today is 2026-03-31. A person born on 2008-04-01 is 17.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2008-04-01', minAge: 18 });
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/special');
    });

    // Test case 7: Adult with a higher minimum age threshold (e.g., 21) -> Redirect to /success
    it('should redirect to /success for adult DOB with minAge 21', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '1990-01-01', minAge: 21 }); // User is 36, meets 21
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/success');
    });

    // Test case 8: User turns exactly 21 today, minAge = 21 -> Redirect to /success
    it('should redirect to /success for DOB that makes user exactly 21 today, with minAge 21', async () => {
        // Today is 2026-03-31. A person born on 2005-03-31 is exactly 21.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2005-03-31', minAge: 21 });
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/success');
    });

    // Test case 9: User is just under 21 today, minAge = 21 -> Redirect to /special
    it('should redirect to /special for DOB that makes user just under 21 today, with minAge 21', async () => {
        // Today is 2026-03-31. A person born on 2005-04-01 is 20.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2005-04-01', minAge: 21 });
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/special');
    });

    // Test case 10: Invalid minAge (not a number) -> JSON error response
    it('should return 400 with JSON error for an invalid minAge (non-numeric)', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '1990-01-01', minAge: 'twenty-one' });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            meetsThreshold: false,
            currentAge: 36, // Age is calculated before minAge validation fails
            minimumAge: null,
            message: 'Minimum age must be a non-negative number.'
        });
    });

    // Test case 11: Invalid minAge (negative number) -> JSON error response
    it('should return 400 with JSON error for an invalid minAge (negative number)', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '1990-01-01', minAge: -5 });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            meetsThreshold: false,
            currentAge: 36, // Age is calculated before minAge validation fails
            minimumAge: null,
            message: 'Minimum age must be a non-negative number.'
        });
    });

    // Test case 12: Missing minAge -> JSON error response
    it('should return 400 with JSON error if minAge is missing', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '1990-01-01' }); // minAge is missing
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            meetsThreshold: false,
            currentAge: 36, // Age is calculated before minAge validation fails
            minimumAge: null,
            message: 'Minimum age threshold is required.'
        });
    });

    // Test case 13: Minimum age is 0 -> Redirect to /success for anyone
    it('should redirect to /success when minAge is 0', async () => {
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2025-01-01', minAge: 0 }); // Even a baby is 0 in this context
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/success');
    });

    // Test case 14: User is exactly 0 years old (born today), minAge = 0
    it('should redirect to /success when user is 0 years old and minAge is 0', async () => {
        // Assuming today is 2026-03-31, born today means born on 2026-03-31
        const today = new Date();
        const dobToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: dobToday, minAge: 0 });
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/success');
    });
});
