const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Predefined dates of birth for Bram and Chanu (replace with actual dates)
const BRAM_DOB = '1999-04-28'; // Replace with Bram's actual DOB
const CHANU_DOB = '1999-08-03'; // Replace with Chanu's actual DOB

// Function to convert date to YYYY-MM-DD format
function normalizeDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d)) return null;
  return d.toISOString().split('T')[0]; // Extract YYYY-MM-DD
}

// Robust date format validation (YYYY-MM-DD only)
function isValidDateFormat(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function parseAndValidateDate(dateStr) {
  if (!isValidDateFormat(dateStr)) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  // Check date correctness (handles 2023-02-30 etc)
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/special', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/special.html'));
});

// Enhanced /check-dob with validation and user-friendly messages
app.post('/check-dob', (req, res) => {
  // Accept herDate/yourDate (frontend sends these)
  const { herDate, yourDate, bramDob, chanuDob, latitude, longitude } = req.body;
  // Pick field if present, to support both old/new clients
  const _bramDob = bramDob || yourDate || null;
  const _chanuDob = chanuDob || herDate || null;

  // Format checks
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

  // For testing: log DOBS for debugging
  // console.log(`Received Bram's Date: ${formattedBramDob}, Chanu's Date: ${formattedChanuDob}`);
  // console.log(`User Location - Latitude: ${latitude}, Longitude: ${longitude}`);

  if (formattedBramDob === BRAM_DOB && formattedChanuDob === CHANU_DOB) {
    // For enhanced client, respond with JSON success
    return res.json({ success: true });
    // For legacy: res.sendFile(path.join(__dirname, 'public/success.html'));
  } else {
    return res.status(401).json({ success: false, message: "Incorrect Dates. Try Again." });
  }
});

// Export app for testing usage
if (process.env.NODE_ENV === 'test') {
  module.exports = app;
} else {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
