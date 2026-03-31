const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Mocking the app.js for testing the new route in isolation if needed,
// but for simplicity, we'll assume the route is correctly mounted in app.js
// and test the mounted route. If app.js were complex, we'd need a mock app.

// --- Replicate App Setup and Route Mounting ---
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (not directly relevant for this API test, but part of app setup)
app.use(express.static(path.join(__dirname, 'public')));

// Mock predefined dates for context if needed, but the route calculates age from input.
// const BRAM_DOB = '1999-04-28';
// const CHANU_DOB = '1999-08-03';

// Import the route handler to be tested
const ageContentRoute = require('./routes/ageContentRoute');

// Mount the route handler under '/api/v1'
app.use('/api/v1', ageContentRoute);
// --- End App Setup ---


describe('Feature 1.9: Age Content API Route', () => {
    // --- Test Cases ---

    // Happy Path: User under 18
    it('should return youth content for a user under 18', async () => {
        const dob = '2009-05-15'; // 15 years old
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('currentAge', 17); // Assuming current date is after May 15, 2026
        expect(res.body).toHaveProperty('bracket', 'UNDER_18');
        expect(res.body).toHaveProperty('contentId', 'youth_content');
        expect(res.body).toHaveProperty('message', 'Welcome to our youth section! Discover exciting content tailored for you.');
        expect(res.body).toHaveProperty('specialMessageAvailable', false);
    });

    // Happy Path: User in the 18-25 bracket
    it('should return young adult content for a user aged 18-25', async () => {
        const dob = '2006-01-01'; // 20 years old (assuming current date is Jan 1, 2026)
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('currentAge', 20); // Assuming current date is Jan 1, 2026
        expect(res.body).toHaveProperty('bracket', 'EIGHTEEN_TO_TWENTY_FIVE');
        expect(res.body).toHaveProperty('contentId', 'young_adult_content');
        expect(res.body).toHaveProperty('message', 'Welcome, young adult! Explore opportunities and resources designed for your stage of life.');
        expect(res.body).toHaveProperty('specialMessageAvailable', false);
    });

    // Happy Path: User over 25
    it('should return adult content and indicate special message availability for a user over 25', async () => {
        const dob = '1996-07-20'; // 30 years old (assuming current date is July 20, 2026)
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('currentAge', 30); // Assuming current date is July 20, 2026
        expect(res.body).toHaveProperty('bracket', 'OVER_TWENTY_FIVE');
        expect(res.body).toHaveProperty('contentId', 'adult_content');
        expect(res.body).toHaveProperty('message', 'Welcome! You have access to our full range of adult content. For a special personal message, visit /special.');
        expect(res.body).toHaveProperty('specialMessageAvailable', true);
    });

    // Edge Case: User exactly 17 years old
    it('should return youth content for a user exactly 17 years old', async () => {
        const dob = '2009-03-31'; // Exactly 17 years old on March 31, 2026
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('currentAge', 17);
        expect(res.body).toHaveProperty('bracket', 'UNDER_18');
        expect(res.body).toHaveProperty('contentId', 'youth_content');
    });

    // Edge Case: User exactly 18 years old
    it('should return young adult content for a user exactly 18 years old', async () => {
        const dob = '2008-03-31'; // Exactly 18 years old on March 31, 2026
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('currentAge', 18);
        expect(res.body).toHaveProperty('bracket', 'EIGHTEEN_TO_TWENTY_FIVE');
        expect(res.body).toHaveProperty('contentId', 'young_adult_content');
    });

    // Edge Case: User exactly 25 years old
    it('should return young adult content for a user exactly 25 years old', async () => {
        const dob = '2001-03-31'; // Exactly 25 years old on March 31, 2026
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('currentAge', 25);
        expect(res.body).toHaveProperty('bracket', 'EIGHTEEN_TO_TWENTY_FIVE');
        expect(res.body).toHaveProperty('contentId', 'young_adult_content');
    });

    // Edge Case: User exactly 26 years old
    it('should return adult content for a user exactly 26 years old', async () => {
        const dob = '2000-03-31'; // Exactly 26 years old on March 31, 2026
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('currentAge', 26);
        expect(res.body).toHaveProperty('bracket', 'OVER_TWENTY_FIVE');
        expect(res.body).toHaveProperty('contentId', 'adult_content');
        expect(res.body).toHaveProperty('specialMessageAvailable', true);
    });

    // Error Handling: Invalid DOB format
    it('should return an error for an invalid DOB format', async () => {
        const dob = '2000/01/01'; // Invalid format for Date constructor in this context
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({ dob: dob });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.');
        expect(res.body).toHaveProperty('currentAge', null);
        expect(res.body).toHaveProperty('bracket', null);
        expect(res.body).toHaveProperty('contentId', null);
    });

    // Error Handling: Missing DOB
    it('should return an error if DOB is missing', async () => {
        const res = await request(app)
            .post('/api/v1/age-content')
            .send({}); // Empty body

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'DOB is required.');
        expect(res.body).toHaveProperty('currentAge', null);
        expect(res.body).toHaveProperty('bracket', null);
        expect(res.body).toHaveProperty('contentId', null);
    });
});
