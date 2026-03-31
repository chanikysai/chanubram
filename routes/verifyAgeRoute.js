const express = require('express');
const router = express.Router();

// Helper function to calculate age from DOB
function calculateAge(dobString) {
    const today = new Date();
    const dob = new Date(dobString);
    // Check if the date is valid
    if (isNaN(dob.getTime())) {
        return -1; // Indicate invalid date
    }
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

router.post('/verify-age', (req, res) => {
    const { dob, minAge } = req.body;

    // Validate DOB
    if (!dob) {
        return res.status(400).json({ meetsThreshold: false, currentAge: null, minimumAge: null, message: 'DOB is required.' });
    }

    const currentAge = calculateAge(dob);

    if (currentAge === -1) {
        return res.status(400).json({ meetsThreshold: false, currentAge: null, minimumAge: null, message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.' });
    }

    // Validate minAge
    if (minAge === undefined || minAge === null) {
        return res.status(400).json({ meetsThreshold: false, currentAge, minimumAge: null, message: 'Minimum age threshold is required.' });
    }

    const parsedMinAge = parseInt(minAge, 10);

    if (isNaN(parsedMinAge) || parsedMinAge < 0) {
        return res.status(400).json({ meetsThreshold: false, currentAge, minimumAge: null, message: 'Minimum age must be a non-negative number.' });
    }

    // Determine if the user meets the threshold
    const meetsThreshold = currentAge >= parsedMinAge;

    let message;
    if (meetsThreshold) {
        message = `User is ${currentAge} years old. Meets minimum age of ${parsedMinAge}.`;
    } else {
        message = `User is ${currentAge} years old. Does not meet minimum age of ${parsedMinAge}.`;
    }

    res.status(200).json({ meetsThreshold, currentAge, minimumAge: parsedMinAge, message });
});

module.exports = router;

