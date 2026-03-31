// Helper function to check for leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Helper function to validate a single date input string (MM/DD/YYYY)
function validateDateInput(dateString, fieldName) {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) {
        return `${fieldName}: Invalid format. Please use MM/DD/YYYY.`;
    }

    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // 1. Year Range Check (e.g., 1900 to current year)
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
        return `${fieldName}: Year must be between 1900 and ${currentYear}.`;
    }

    // 2. Month Check
    if (month < 1 || month > 12) {
        return `${fieldName}: Month must be between 01 and 12.`;
    }

    // 3. Day Check (considering month and leap year)
    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (isLeapYear(year)) {
        daysInMonth[2] = 29; // February has 29 days in a leap year
    }

    if (day < 1 || day > daysInMonth[month]) {
        return `${fieldName}: Day is invalid for the given month and year.`;
    }

    // If all checks pass
    return null; // Indicate no error
}

// Function to apply MM/DD/YYYY masking to an input element
function applyDobMask(elementId) {
    const inputElement = document.getElementById(elementId);
    if (!inputElement) {
        console.warn(`Element with ID "${elementId}" not found for input masking.`);
        return;
    }

    inputElement.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

        // Limit month to 2 digits, day to 2 digits, year to 4 digits
        let month = value.substring(0, 2);
        let day = value.substring(2, 4);
        let year = value.substring(4, 8);

        let formattedValue = '';

        if (month) {
            formattedValue += month;
            if (month.length === 2 && day) {
                formattedValue += '/' + day;
                if (day.length === 2 && year) {
                    formattedValue += '/' + year;
                }
            }
        }
        
        e.target.value = formattedValue;
    });
}

// Function to get user's geolocation and submit form data
function getLocationAndSubmit(formElement) {
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitudeInput.value = position.coords.latitude;
                longitudeInput.value = position.coords.longitude;
                console.log(`Captured Location - Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
                
                // Proceed to submit the form data after location is captured
                submitFormData(formElement);
            },
            (error) => {
                console.error("Error getting location:", error.message);
                alert("Please allow location access to proceed. Submission might be incomplete without it.");
                // Optionally, allow form submission without location if not strictly required
                // submitFormData(formElement); 
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        // Optionally, allow form submission without location if not strictly required
        // submitFormData(formElement); 
    }
}

// Function to handle the actual form submission via fetch
async function submitFormData(formElement) {
    // Ensure masks are applied if not already by event listener (e.g., on initial load if values were pre-filled)
    applyDobMask('herDate');
    applyDobMask('yourDate');

    const herDateInput = document.getElementById('herDate');
    const yourDateInput = document.getElementById('yourDate');
    const herDate = herDateInput.value;
    const yourDate = yourDateInput.value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    // Perform new client-side date validation
    const herDateError = validateDateInput(herDate, 'Bram's Date of Birth');
    const yourDateError = validateDateInput(yourDate, 'Chanu's Date of Birth');

    if (herDateError || yourDateError) {
        alert(herDateError || yourDateError); // Show the first error encountered
        if (herDateError) herDateInput.focus();
        else yourDateInput.focus();
        return; // Prevent submission if validation fails
    }

    try {
        const response = await fetch('/check-dob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ herDate, yourDate, latitude, longitude }),
        });

        const result = await response.json();

        if (result.success) {
            // Show secret content
            const secretContent = document.getElementById('secret-content');
            if (secretContent) {
                secretContent.classList.remove('hidden');
            } else {
                console.warn("Element with id 'secret-content' not found. Cannot display secret content.");
            }
        } else {
            alert('Incorrect dates. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred. Please try again.');
    }
}

// Main execution block
document.addEventListener('DOMContentLoaded', () => {
    const formElement = document.getElementById('dob-form');
    if (formElement) {
        // Add input masking to the date fields
        applyDobMask('herDate');
        applyDobMask('yourDate');

        // Modify form submission to handle geolocation and then submit
        formElement.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent default form submission
            getLocationAndSubmit(formElement); // Call the function to get location and submit
        });
    } else {
        console.error("Form with ID 'dob-form' not found. Cannot attach event listeners.");
    }
});
