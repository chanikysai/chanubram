// check-dob.test.js
const request = require('supertest');
const express = require('express');
const path = require('path');
const { expect } = require('chai'); // Use chai assertions

// Assume app.js is in the same directory and exports the express app
// If app.js is in a different location, adjust the require path accordingly.
const app = require('./app'); // Assuming app.js is in the root

describe('POST /check-dob', () => {

    // Happy Path Test
    it('should return success.html for valid DOBs and coordinates', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-04-28', // Matches BRAM_DOB after normalization
                chanuDob: '1999-08-03', // Matches CHANU_DOB after normalization
                latitude: 34.0522,
                longitude: -118.2437
            });

        // The server sends the file, so we check for 200 status and potentially the file path if supertest exposed it,
        // but checking the status code is the primary way to confirm success for file sends.
        expect(response.status).to.equal(200);
        // Optionally, if we were serving JSON for success, we'd check content.
        // For serving a file, checking status is sufficient.
    });

    // Error Handling Tests

    // Test Case 1: Missing Bram DOB
    it('should return 400 for missing Bram DOB', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                // bramDob is missing
                chanuDob: '1999-08-03',
                latitude: 34.0522,
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing Bram DOB. Please provide a valid date string.');
    });

    // Test Case 2: Invalid Bram DOB format
    it('should return 400 for invalid Bram DOB format', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '28/04/1999', // Incorrect format for normalizeDate
                chanuDob: '1999-08-03',
                latitude: 34.0522,
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing Bram DOB. Please provide a valid date string.');
    });
    
    // Test Case 3: Invalid Bram DOB date (e.g., day out of range)
    it('should return 400 for invalid Bram DOB date', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-02-30', // Feb 30th is invalid
                chanuDob: '1999-08-03',
                latitude: 34.0522,
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing Bram DOB. Please provide a valid date string.');
    });

    // Test Case 4: Missing Chanu DOB
    it('should return 400 for missing Chanu DOB', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-04-28',
                // chanuDob is missing
                latitude: 34.0522,
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing Chanu DOB. Please provide a valid date string.');
    });

    // Test Case 5: Invalid Chanu DOB format
    it('should return 400 for invalid Chanu DOB format', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-04-28',
                chanuDob: '03/08/1999', // Incorrect format for normalizeDate
                latitude: 34.0522,
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing Chanu DOB. Please provide a valid date string.');
    });

    // Test Case 6: Invalid Latitude (non-numeric)
    it('should return 400 for invalid latitude (non-numeric)', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-04-28',
                chanuDob: '1999-08-03',
                latitude: 'not-a-number',
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing latitude. Please provide a number between -90 and 90.');
    });

    // Test Case 7: Invalid Latitude (out of range)
    it('should return 400 for invalid latitude (out of range)', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-04-28',
                chanuDob: '1999-08-03',
                latitude: 95.0, // Out of range
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing latitude. Please provide a number between -90 and 90.');
    });

    // Test Case 8: Invalid Longitude (non-numeric)
    it('should return 400 for invalid longitude (non-numeric)', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-04-28',
                chanuDob: '1999-08-03',
                latitude: 34.0522,
                longitude: 'not-a-number'
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing longitude. Please provide a number between -180 and 180.');
    });

    // Test Case 9: Invalid Longitude (out of range)
    it('should return 400 for invalid longitude (out of range)', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '1999-04-28',
                chanuDob: '1999-08-03',
                latitude: 34.0522,
                longitude: 190.0 // Out of range
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing longitude. Please provide a number between -180 and 180.');
    });

    // Test Case 10: Incorrect Dates provided
    it('should return 400 for incorrect DOBs', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({
                bramDob: '2000-01-01', // Incorrect
                chanuDob: '2000-01-01', // Incorrect
                latitude: 34.0522,
                longitude: -118.2437
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal("Incorrect Dates provided. Please check Bram's and Chanu's dates.");
    });
    
    // Test Case 11: Missing all fields
    it('should return 400 when all fields are missing', async () => {
        const response = await request(app)
            .post('/check-dob')
            .send({}); // Empty body

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.message).to.equal('Invalid or missing Bram DOB. Please provide a valid date string.'); // First validation error encountered
    });
});
