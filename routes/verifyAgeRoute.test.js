// verifyAgeRoute.test.js
const request = require('supertest');
const app = require('../app'); // Assuming app.js is the entry point for your Express app

// Mocking Date object to control current year for tests
const RealDate = Date;
let mockCurrentYear = 2023; // Default to a non-leap year

class MockDate extends Date {
  constructor(dateString) {
    // If called with no arguments, it should behave like `new Date()`
    if (arguments.length === 0) {
      super(new Date(`2023-01-01T00:00:00Z`)); // Use a fixed date to ensure consistency
    } else {
      super(dateString);
    }
  }

  getFullYear() {
    // If the original Date object was called without arguments, return our mock year
    // Otherwise, return the actual year from the provided dateString
    if (arguments.length === 0) {
      return mockCurrentYear;
    }
    return super.getFullYear();
  }
}

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


// --- Test Suite for verifyAgeRoute ---
describe('POST /api/verify-age (Age Bracket Determination)', () => {

    let herDateInput; // These seem to be from a previous context and not directly used here.
    let yourDateInput; // Keeping them as they might be remnants.
    let formElement;

    beforeAll(() => {
        // Set up global mocks for Date
        global.Date = MockDate;
        // Mocking global document for testing DOM manipulation functions if they were present
        global.document = {
            createElement: jest.fn(tagName => {
                if (tagName === 'input') {
                    const input = {
                        value: '', id: '', addEventListener: jest.fn(),
                        dispatchEvent: jest.fn(), removeEventListener: jest.fn(),
                    };
                    return input;
                }
                return {};
            }),
            getElementById: jest.fn(id => {
                const mockInputEl = {
                    value: '', id: id, addEventListener: jest.fn(),
                    setValue: function(val) { this.value = val; this.dispatchEvent(new Event('input')); },
                    focus: jest.fn(),
                };
                // Apply masking logic directly if needed for specific IDs
                if (id === 'herDate' || id === 'yourDate') {
                    mockInputEl.addEventListener('input', function(e) {
                        let value = e.target.value.replace(/\D/g, '');
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
                return mockInputEl;
            }),
            addEventListener: jest.fn(),
        };
        global.console = { // Mocking console for warnings and errors
            warn: jest.fn(), error: jest.fn(), log: jest.fn(),
        };
    });

    afterAll(() => {
        // Restore original Date object
        global.Date = RealDate;
    });

    beforeEach(() => {
        // Reset mocks and mock DOM for each test
        jest.clearAllMocks();
        // Mock Date to a specific year for reproducible tests
        mockCurrentYear = 2023; // Default to a non-leap year

        // Mock elements needed for the form and inputs
        herDateInput = document.getElementById('herDate');
        yourDateInput = document.getElementById('yourDate');
        formElement = { // Mock form element
            addEventListener: jest.fn(),
            preventDefault: jest.fn(),
            submit: jest.fn(),
        };
        document.getElementById.mockImplementation((id) => {
            if (id === 'herDate') return herDateInput;
            if (id === 'yourDate') return yourDateInput;
            if (id === 'dob-form') return formElement;
            return null;
        });
        
        // Re-apply masking logic to mock inputs
        applyDobMask('herDate');
        applyDobMask('yourDate');
    });

    // --- Tests for verifyAgeRoute ---
    // Testing the /api/verify-age endpoint

    // Test cases for age bracket determination
    it('should return UNDER_18 bracket for a user aged 16', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '01/15/2007' }) // User is 16 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'UNDER_18',
                    content: 'youth_content',
                    currentAge: 16
                });
            });
    });

    it('should return UNDER_18 bracket for a user aged 17', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '01/15/2006' }) // User is 17 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'UNDER_18',
                    content: 'youth_content',
                    currentAge: 17
                });
            });
    });

    it('should return EIGHTEEN_TO_TWENTY_FIVE bracket for a user aged 18', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '01/15/2005' }) // User is 18 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
                    content: 'young_adult_content',
                    currentAge: 18
                });
            });
    });

    it('should return EIGHTEEN_TO_TWENTY_FIVE bracket for a user aged 22', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '07/07/2001' }) // User is 22 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
                    content: 'young_adult_content',
                    currentAge: 22
                });
            });
    });

    it('should return EIGHTEEN_TO_TWENTY_FIVE bracket for a user aged 25', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '01/15/1998' }) // User is 25 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
                    content: 'young_adult_content',
                    currentAge: 25
                });
            });
    });

    it('should return OVER_TWENTY_FIVE bracket for a user aged 26', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '01/15/1997' }) // User is 26 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'OVER_TWENTY_FIVE',
                    content: 'adult_content',
                    currentAge: 26
                });
            });
    });

    it('should return OVER_TWENTY_FIVE bracket for a user aged 40', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '07/07/1983' }) // User is 40 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'OVER_TWENTY_FIVE',
                    content: 'adult_content',
                    currentAge: 40
                });
            });
    });

    it('should return UNDER_18 bracket for a user aged 0 (born today)', () => {
        // Use the mocked date to ensure "today" is consistently 2023
        mockCurrentYear = 2023;
        const today = new Date(mockCurrentYear, 0, 1); // Jan 1st, 2023
        const dobToday = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;

        return request(app)
            .post('/api/verify-age')
            .send({ dob: dobToday }) // User is 0 years old
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'UNDER_18',
                    content: 'youth_content',
                    currentAge: 0
                });
            });
    });

    // Test cases for error handling
    it('should return 400 with JSON error for an invalid DOB format', () => {
        return request(app)
            .post('/api/verify-age')
            .send({ dob: '15-01-2023' }) // Invalid format
            .expect(400)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'error',
                    message: "Invalid DOB format. Please use YYYY-MM-DD or a parseable date string."
                });
            });
    });

    it('should return 400 with JSON error if DOB is missing', () => {
        return request(app)
            .post('/api/verify-age')
            .send({}) // Missing DOB
            .expect(400)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'error',
                    message: "DOB is required."
                });
            });
    });

    it('should return UNDER_18 for DOB where birthday is tomorrow (age 17.99 rounded down to 17)', () => {
        // Mock date to be 2023-01-15. Birthday is 2005-01-16 (tomorrow).
        mockCurrentYear = 2023; 
        const tomorrow = new Date(mockCurrentYear, 0, 16); // Jan 16th, 2023
        const dobTomorrow = `${tomorrow.getMonth()+1}/${tomorrow.getDate()}/${tomorrow.getFullYear()}`; // Format to MM/DD/YYYY

        return request(app)
            .post('/api/verify-age')
            .send({ dob: dobTomorrow })
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'UNDER_18',
                    content: 'youth_content',
                    currentAge: 17 // Age should be 17, as the 18th birthday is tomorrow
                });
            });
    });

    it('should return EIGHTEEN_TO_TWENTY_FIVE for DOB where birthday was today (age 18)', () => {
        // Mock date to be 2023-01-15. Birthday is 2005-01-15 (today).
        mockCurrentYear = 2023;
        const today = new Date(mockCurrentYear, 0, 15); // Jan 15th, 2023
        const dobToday = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`; // Format to MM/DD/YYYY

        return request(app)
            .post('/api/verify-age')
            .send({ dob: dobToday })
            .expect(200)
            .expect(res => {
                expect(res.body).to.deep.equal({
                    status: 'success',
                    bracket: 'EIGHTEEN_TO_TWENTY_FIVE',
                    content: 'young_adult_content',
                    currentAge: 18 // Age should be exactly 18
                });
            });
    });
});
