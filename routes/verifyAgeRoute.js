const express = require('express');
const router = express.Router();

// Helper function to calculate age from DOB
function calculateAge(dobString) {
    const today = new Date();
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
        return -1; // Invalid date
    }
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

router.post('/verify-age', (req, res) => {
    const { dob } = req.body;

    if (!dob) {
        return res.status(400).json({ isAdult: false, message: 'DOB is required.' });
    }

    const age = calculateAge(dob);

    if (age === -1) {
        return res.status(400).json({ isAdult: false, message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.' });
    }

    const MIN_AGE = 18; // Minimum age requirement

    if (age >= MIN_AGE) {
        res.status(200).json({ isAdult: true, message: `User is ${age} years old. Verified.` });
    } else {
        res.status(400).json({ isAdult: false, message: `User is ${age} years old. Below the minimum age of ${MIN_AGE}.` });
    }
});

module.exports = router;
