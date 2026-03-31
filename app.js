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
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // Extract YYYY-MM-DD
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
    const { bramDob, chanuDob, latitude, longitude } = req.body;
  
    // Input validation for dates
    if (!bramDob || isNaN(new Date(bramDob).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Bram DOB. Please provide a valid date string.' });
    }
    if (!chanuDob || isNaN(new Date(chanuDob).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Chanu DOB. Please provide a valid date string.' });
    }
  
    // Input validation for coordinates
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
  
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ success: false, message: 'Invalid or missing latitude. Please provide a number between -90 and 90.' });
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({ success: false, message: 'Invalid or missing longitude. Please provide a number between -180 and 180.' });
    }
  
    const formattedBramDob = normalizeDate(bramDob);
    const formattedChanuDob = normalizeDate(chanuDob);
  
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
