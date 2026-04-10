const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Inline a lightweight version of the relevant parts of the app for testing
const app = express();
app.use(bodyParser.json());

defineValidation(app); // Isolate route logic for tests

function defineValidation(app) {
  // Use matching variable names for test and route logic
  const CHANU_DOB = '1999-08-03';
  const BRAM_DOB = '1999-04-28';

  function isValidDateFormat(dateStr) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  }
  function parseAndValidateDate(dateStr) {
    if (!isValidDateFormat(dateStr)) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    const d = new Date(year, month - 1, day);
    if (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
    ) {
      return d;
    }
    return null;
  }
  function isDateInAllowedRange(date) {
    const min = new Date('1900-01-01');
    const max = new Date();
    return date >= min && date <= max;
  }
  function normalizeDate(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d)) return null;
    return d.toISOString().split('T')[0];
  }

  app.post('/check-dob', (req, res) => {
    const { herDate, yourDate, bramDob, chanuDob } = req.body;
    // correct mapping, as frontend sends herDate=Chanu, yourDate=Bram
    const _bramDob = bramDob || yourDate || null;
    const _chanuDob = chanuDob || herDate || null;
    if (!_bramDob || !_chanuDob) {
      return res.status(400).json({ success: false, message: 'Missing required date fields.' });
    }
    if (!isValidDateFormat(_bramDob) || !isValidDateFormat(_chanuDob)) {
      return res.status(400).json({ success: false, message: 'Date of birth must be in YYYY-MM-DD format.' });
    }
    const bramDateObj = parseAndValidateDate(_bramDob);
    const chanuDateObj = parseAndValidateDate(_chanuDob);
    if (!bramDateObj || !chanuDateObj) {
      return res.status(400).json({ success: false, message: 'Invalid calendar date(s).'});
    }
    if (!isDateInAllowedRange(bramDateObj) || !isDateInAllowedRange(chanuDateObj)) {
      return res.status(400).json({ success: false, message: 'Dates must be between 1900-01-01 and today.' });
    }

    const formattedBramDob = normalizeDate(bramDateObj);
    const formattedChanuDob = normalizeDate(chanuDateObj);

    // The frontend form (and thus the test variables) use yourDate==Bram DOB, herDate==Chanu DOB
    if (formattedBramDob === BRAM_DOB && formattedChanuDob === CHANU_DOB) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Incorrect Dates. Try Again." });
    }
  });
}

describe('DOB endpoint validation', () => {
  it('accepts happy path (correct DOBs, proper format)', async () => {
    const res = await request(app).post('/check-dob').send({
      yourDate: '1999-04-28', // Bram
      herDate: '1999-08-03', // Chanu
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects badly formatted date (slashes, not dashes)', async () => {
    const res = await request(app).post('/check-dob').send({
      yourDate: '1999/04/28',
      herDate: '1999-08-03',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/format/);
  });

  it('rejects nonsensical calendar dates', async () => {
    const res = await request(app).post('/check-dob').send({
      yourDate: '1999-02-30', // February 30 doesn't exist
      herDate: '1999-08-03',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid calendar/);
  });

  it('rejects dates before 1900', async () => {
    const res = await request(app).post('/check-dob').send({
      yourDate: '1899-12-31',
      herDate: '1999-08-03',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/between 1900/);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/check-dob').send({
      yourDate: '',
      herDate: '1999-08-03',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Missing/);
  });

  it('rejects incorrect dates (correct format, allowed range)', async () => {
    const res = await request(app).post('/check-dob').send({
      yourDate: '2000-01-01',
      herDate: '2000-01-02',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Incorrect/);
  });
});
