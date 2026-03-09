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

// Route for the special page
app.get('/special', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/special.html'));
});

// Route for the success page (DOB verification)
app.post('/check-dob', (req, res) => {
    const { bramDob, chanuDob, latitude, longitude } = req.body;
  
    const formattedBramDob = normalizeDate(bramDob);
    const formattedChanuDob = normalizeDate(chanuDob);
  
    console.log(`Received Bram's Date: ${formattedBramDob}, Chanu's Date: ${formattedChanuDob}`);
    console.log(`User Location - Latitude: ${latitude}, Longitude: ${longitude}`);
  
    if (formattedBramDob === BRAM_DOB && formattedChanuDob === CHANU_DOB) {
      res.sendFile(path.join(__dirname, 'public/success.html'));
    } else {
      res.json({ success: false, message: "Incorrect Dates. Try Again." });
    }
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
