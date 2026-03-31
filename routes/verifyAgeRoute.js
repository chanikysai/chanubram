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
router.post('/verify-age', (req, res) => {
    const { dob } = req.body; // Removed minAge as we are defining brackets

    // Validate DOB
    if (!dob) {
        return res.status(400).json({ currentAge: null, bracket: null, content: null, message: 'DOB is required.' });
    }

    const currentAge = calculateAge(dob);

    if (currentAge === -1) {
        return res.status(400).json({ currentAge: null, bracket: null, content: null, message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.' });
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
    // return nulls for bracket and content. This should not happen with current definitions.
    if (!determinedBracket) {
        // For robustness, ensure we always return a response structure.
        // With current definitions (min 0, max Infinity), this branch is unlikely.
        // If it were possible, a default bracket or an error might be appropriate.
    }

    res.json({
        currentAge: currentAge,
        bracket: determinedBracket,
        content: determinedContent
    });
});

module.exports = router;
