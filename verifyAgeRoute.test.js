// verifyAgeRoute.test.js
const request = require('supertest');
const express = require('express');
const { expect } = require('chai'); // Require chai for assertions

// Re-creating the app setup for testing purposes without calling app.listen()
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const verifyAgeRoute = require('./routes/verifyAgeRoute');
app.use('/api', verifyAgeRoute);

// Today's date for context: March 31, 2026

describe('POST /api/verify-age', () => {
    // Test case 1: User is an adult (born in 1990)
    it('should return 200 for a valid adult DOB', async () => { // Using 'it'
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '1990-01-01' });
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({ isAdult: true, message: 'User is 36 years old. Verified.' }); // Adding more specific assertion
    });

    // Test case 2: User is a minor (born in 2010)
    it('should return 400 for a DOB of someone under 18', async () => { // Using 'it'
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2010-01-01' }); // Born in 2010, will be 16 in 2026
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ isAdult: false, message: 'User is 16 years old. Below the minimum age of 18.' });
    });

    // Test case 3: Invalid DOB format
    it('should return 400 for an invalid DOB format', async () => { // Using 'it'
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: 'invalid-date' });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ isAdult: false, message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.' });
    });

    // Test case 4: Missing DOB
    it('should return 400 if DOB is missing', async () => { // Using 'it'
        const response = await request(app)
            .post('/api/verify-age')
            .send({}); // Empty body
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ isAdult: false, message: 'DOB is required.' });
    });

    // Test case 5: Edge case - exactly 18 years old today (March 31, 2026)
    it('should return true for a DOB that makes the user exactly 18 years old today', async () => { // Using 'it'
        // Today is 2026-03-31. A person born on 2008-03-31 is exactly 18.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2008-03-31' });
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({ isAdult: true, message: 'User is 18 years old. Verified.' });
    });

    // Test case 6: Edge case - just under 18 today (March 31, 2026)
    it('should return false for a DOB that makes the user just under 18 years old today', async () => { // Using 'it'
        // Today is 2026-03-31. A person born on 2008-04-01 is 17.
        const response = await request(app)
            .post('/api/verify-age')
            .send({ dob: '2008-04-01' });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ isAdult: false, message: 'User is 17 years old. Below the minimum age of 18.' });
    });
});
