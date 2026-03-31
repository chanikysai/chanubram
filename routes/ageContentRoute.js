const express = require('express');
const router = express.Router();

// --- Feature 1.8: Age Brackets (logic replicated from verifyAgeRoute for modularity) ---
// Define age brackets and associated content experiences
const AGE_BRACKETS = {
    UNDER_18: { minAge: 0, maxAge: 17, contentId: 'youth_content' },
    EIGHTEEN_TO_TWENTY_FIVE: { minAge: 18, maxAge: 25, contentId: 'young_adult_content' },
    OVER_TWENTY_FIVE: { minAge: 26, maxAge: Infinity, contentId: 'adult_content' }
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
// This route provides JSON output for API consumers.
router.post('/age-content', (req, res) => {
    const { dob } = req.body;

    // Validate DOB
    if (!dob) {
        return res.status(400).json({ currentAge: null, bracket: null, contentId: null, message: 'DOB is required.' });
    }

    const currentAge = calculateAge(dob);

    if (currentAge === -1) {
        return res.status(400).json({ currentAge: null, bracket: null, contentId: null, message: 'Invalid DOB format. Please use YYYY-MM-DD or a parseable date string.' });
    }

    let determinedBracket = null;
    let determinedContentId = null;
    let message = '';
    let specialMessageAvailable = false;

    // Determine the age bracket
    for (const bracketKey in AGE_BRACKETS) {
        const bracket = AGE_BRACKETS[bracketKey];
        if (currentAge >= bracket.minAge && currentAge <= bracket.maxAge) {
            determinedBracket = bracketKey;
            determinedContentId = bracket.contentId;
            break;
        }
    }

    if (!determinedBracket) {
        // This case should theoretically not be reached with the current bracket definitions (0-Infinity)
        message = 'Could not determine age bracket. Please check your date of birth.';
    } else {
        // Provide specific messages or context based on bracket
        switch (determinedBracket) {
            case 'UNDER_18':
                message = 'Welcome to our youth section! Discover exciting content tailored for you.';
                break;
            case 'EIGHTEEN_TO_TWENTY_FIVE':
                message = 'Welcome, young adult! Explore opportunities and resources designed for your stage of life.';
                break;
            case 'OVER_TWENTY_FIVE':
                message = 'Welcome! You have access to our full range of adult content. For a special personal message, visit /special.';
                specialMessageAvailable = true; // Indicate that the special page is relevant for this bracket
                break;
            default:
                message = 'Welcome! Enjoy your personalized content.';
        }
    }

    res.json({
        currentAge: currentAge,
        bracket: determinedBracket,
        contentId: determinedContentId,
        message: message,
        specialMessageAvailable: specialMessageAvailable
    });
});

module.exports = router;