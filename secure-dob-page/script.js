// Frontend enhanced DOB validation
function isValidDateFormat(dateStr) {
  // Accepts YYYY-MM-DD only
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  // Months in JS Date are 0-based
  const d = new Date(year, month - 1, day);
  // Check date correctness
  if (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  ) {
    return d;
  }
  return null;
}

function isDateInAllowedRange(date) {
  // Reasonable DOB between 1900-01-01 and today (inclusive)
  const min = new Date('1900-01-01');
  const max = new Date(); // today
  return date >= min && date <= max;
}

// Handle form submission
document.getElementById('dob-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Get user input
  const herDate = document.getElementById('herDate').value.trim();
  const yourDate = document.getElementById('yourDate').value.trim();

  // Frontend validation
  let message = '';

  if (!isValidDateFormat(herDate) || !isValidDateFormat(yourDate)) {
    message = 'Date of birth must be in YYYY-MM-DD format.';
  } else {
    const herD = parseDate(herDate);
    const yourD = parseDate(yourDate);
    if (!herD || !yourD) {
      message = 'Invalid date. Use a real calendar day.';
    } else if (!isDateInAllowedRange(herD) || !isDateInAllowedRange(yourD)) {
      message = 'Date of birth must be between 1900-01-01 and today.';
    }
  }

  if (message) {
    alert(message);
    return;
  }

  // Send data to the server for validation
  try {
    const response = await fetch('/check-dob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ herDate, yourDate }),
    });

    const result = await response.json();

    if (result.success) {
      // Show secret content
      document.getElementById('secret-content').classList.remove('hidden');
    } else {
      alert(result.message || 'Incorrect dates. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});
