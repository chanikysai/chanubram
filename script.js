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

    const herDate = document.getElementById('herDate').value;
    const yourDate = document.getElementById('yourDate').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    // Basic validation for masked dates (optional but good practice)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(herDate) || !dateRegex.test(yourDate)) {
        alert('Please enter dates in MM/DD/YYYY format.');
        return;
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
