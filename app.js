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
// Tolerant DOB parser: accepts YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY (disambiguates when first > 12)
function parseDob(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const s = dateStr.trim();

  // ISO format: YYYY-MM-DD -> create a local date (avoid forcing UTC)
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    const dateObj = new Date(y, m - 1, d);
    return isNaN(dateObj.getTime()) ? null : dateObj;
  }

  // Slash formats: either MM/DD/YYYY or DD/MM/YYYY
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    let p1 = parseInt(slashMatch[1], 10);
    let p2 = parseInt(slashMatch[2], 10);
    const y = parseInt(slashMatch[3], 10);

    // If first part is >12, treat it as day (DD/MM/YYYY)
    let month = p1;
    let day = p2;
    if (p1 > 12 && p2 <= 12) {
      month = p2;
      day = p1;
    }

    // Basic ranges
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const d = new Date(y, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback to native parsing (will handle other variations if possible)
  const d2 = new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
}

function normalizeDate(date) {
  const d = parseDob(date);
  if (!d) return null;
  // Format using local date components to avoid timezone shifts
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route for the special page - this is now directly accessible
// Feature 1.9: This page hosts a specific message for adults.
app.get('/special', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/special.html'));
});

// Route for the success page (DOB verification)
app.post('/check-dob', (req, res) => {
    // Accept either the explicit names (bramDob/chanuDob) or the form field names (herDate/yourDate)
    const rawBramDob = req.body.bramDob || req.body.herDate || req.body.her_date;
    const rawChanuDob = req.body.chanuDob || req.body.yourDate || req.body.your_date;
    const { latitude, longitude } = req.body;

    // Input validation for dates
    if (!rawBramDob || isNaN(new Date(rawBramDob).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Bram DOB. Please provide a valid date string (MM/DD/YYYY).' });
    }
    if (!rawChanuDob || isNaN(new Date(rawChanuDob).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Chanu DOB. Please provide a valid date string (MM/DD/YYYY).' });
    }


    // Input validation for coordinates — treat them as optional for users who block geolocation
    let lat = null;
    let lon = null;
    if (typeof latitude !== 'undefined' && latitude !== '') {
      const parsedLat = parseFloat(latitude);
      if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
        lat = parsedLat;
      } else {
        console.warn('Received invalid latitude:', latitude);
        // Do not block the request; proceed without location
      }
    }

    if (typeof longitude !== 'undefined' && longitude !== '') {
      const parsedLon = parseFloat(longitude);
      if (!isNaN(parsedLon) && parsedLon >= -180 && parsedLon <= 180) {
        lon = parsedLon;
      } else {
        console.warn('Received invalid longitude:', longitude);
        // Do not block the request; proceed without location
      }
    }

    const formattedBramDob = normalizeDate(rawBramDob);
    const formattedChanuDob = normalizeDate(rawChanuDob);

    console.log(`Received Bram's Date: ${formattedBramDob}, Chanu's Date: ${formattedChanuDob}`);
    console.log(`User Location - Latitude: ${lat}, Longitude: ${lon}`);

    if (formattedBramDob === BRAM_DOB && formattedChanuDob === CHANU_DOB) {
      res.sendFile(path.join(__dirname, 'public/success.html'));
    } else {
      res.status(400).json({ success: false, message: "Incorrect Dates provided. Please check Bram's and Chanu's dates." });
    }
  });
  
// Import the existing API route handler for age verification
const verifyAgeRoute = require('./routes/verifyAgeRoute');

// Mount the existing API route handler
app.use('/api', verifyAgeRoute);

// --- Feature 1.9 Implementation ---
// Import the new API route handler for age-specific content
const ageContentRoute = require('./routes/ageContentRoute');

// Mount the new API route handler for age-specific content
// This endpoint provides JSON data based on age brackets.
// For adults, it hints at the existence of the static /special page.
app.use('/api/v1', ageContentRoute);
// --- End Feature 1.9 ---

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
