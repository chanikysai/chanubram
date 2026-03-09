// Handle form submission
document.getElementById('dob-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Get user input
  const herDate = document.getElementById('herDate').value;
  const yourDate = document.getElementById('yourDate').value;

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
      alert('Incorrect dates. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});