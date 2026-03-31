const express = require('express');
const router = express.Router();

// --- Feature 1.8: Age Brackets ---
// Define age brackets and associated content experiences
const AGE_BRACKETS = {
    UNDER_18: { minAge: 0, maxAge: 17, content: 'youth_content' },
    EIGHTEEN_TO_TWENTY_FIVE: { minAge: 18, maxAge: 25, content: 'young_adult_content' },
    OVER_TWENTY_FIVE: { minAge: 26, maxAge: Infinity, content: 'adult_content' }
};

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

// Endpoint to determine age bracket and associated content experience
// Modified for Feature 1.10: process DOB and discard it by returning only status.
router.post('/verify-age', (req, res) => {
    const { dob } = req.body;

    // Validate DOB
    if (!dob) {
        return res.status(400).json({ status: 'error', message: 'DOB is required.' });
    }

    const currentAge = calculateAge(dob);

    if (currentAge === -1) {
        return res.status(400).json({ status: 'error', message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.' });
    }

    let determinedBracket = null;
    let determinedContent = null;

    // Determine the age bracket
    for (const bracketKey in AGE_BRACKETS) {
        const bracket = AGE_BRACKETS[bracketKey];
        if (currentAge >= bracket.minAge && currentAge <= bracket.maxAge) {
            determinedBracket = bracketKey; // Use the key name for identification
            determinedContent = bracket.content;
            break; // Found the bracket, exit loop
        }
    }
    
    // If no bracket is found (e.g., due to unexpected age or bracket definition issues),
    // return an error. This should not happen with current definitions.
    if (!determinedBracket) {
        return res.status(400).json({ status: 'error', message: 'Could not determine age bracket for the provided DOB.' });
    }

    // Feature 1.10: Process DOB and immediately discard it by returning a simple success status.
    // The DOB and derived age/bracket are not returned or persisted.
    res.json({
        status: 'success',
        message: 'DOB processed and verified.'
    });
});

module.exports = router;
