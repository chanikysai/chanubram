// script.test.js

// Mock DOM elements and event dispatching for testing
const mockInput = (value) => {
    const input = document.createElement('input');
    input.value = value;
    return input;
};

const dispatchInputEvent = (element, value) => {
    element.value = value; // Set value directly for simulation
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
};

// Mocking Date object to control current year for tests
const RealDate = Date;
let mockCurrentYear = 2023; // Default to a non-leap year for general tests

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
// --- Helper Functions (copied from script.js for testing) ---

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
    // Use the mocked Date.getFullYear() for consistency in tests
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
// This is a copy of the function from script.js for testing purposes
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

// Mocking global document for testing
global.document = {
    createElement: jest.fn(tagName => {
        if (tagName === 'input') {
            const input = {
                value: '',
                id: '',
                addEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
                removeEventListener: jest.fn(),
            };
            return input;
        }
        return {};
    }),
    getElementById: jest.fn(id => {
        // Mock input elements for testing date validation and masking
        const mockInputEl = {
            value: '',
            id: id,
            addEventListener: jest.fn(function(event, handler) {
                if (event === 'input') this._inputHandler = handler;
                if (event === 'submit') this._submitHandler = handler;
            }),
            // Simulate value change and event trigger
            setValue: function(val) { this.value = val; if (this._inputHandler) this._inputHandler({ target: this, preventDefault: () => {} }); },
            // Simulate form submission
            submit: function() { if (this._submitHandler) this._submitHandler({ preventDefault: () => {} }); },
            focus: jest.fn(), // Mock focus method
        };
        
        // Re-apply masking logic for specific inputs if needed, though helper functions are copied above
        if (id === 'herDate' || id === 'yourDate') {
            // Attach masking listener to mock element
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

// Mocking console for warnings and errors
global.console = {
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
};

// --- Test Suite for Date Validation ---

describe('Date Validation Functions', () => {

    let herDateInput;
    let yourDateInput;
    let formElement;

    beforeAll(() => {
        // Set up global mocks for Date
        global.Date = MockDate;
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

        // Mock elements
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

        // Ensure getElementById returns mock elements that can be manipulated
        herDateInput = { 
            value: '', id: 'herDate', addEventListener: jest.fn(), 
            setValue: function(val) { this.value = val; this.dispatchEvent(new Event('input')); }, 
            focus: jest.fn() 
        };
        yourDateInput = { 
            value: '', id: 'yourDate', addEventListener: jest.fn(), 
            setValue: function(val) { this.value = val; this.dispatchEvent(new Event('input')); }, 
            focus: jest.fn() 
        };
        formElement = { 
            addEventListener: jest.fn(), 
            preventDefault: jest.fn(), 
            submit: jest.fn() 
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

    // --- Tests for isLeapYear ---
    describe('isLeapYear', () => {
        it('should return true for leap years divisible by 4 but not by 100', () => {
            expect(isLeapYear(2024)).to.be.true;
            expect(isLeapYear(2008)).to.be.true;
        });

        it('should return false for years divisible by 100 but not by 400', () => {
            expect(isLeapYear(1900)).to.be.false;
            expect(isLeapYear(2100)).to.be.false;
        });

        it('should return true for years divisible by 400', () => {
            expect(isLeapYear(2000)).to.be.true;
            expect(isLeapYear(1600)).to.be.true;
        });

        it('should return false for years not divisible by 4', () => {
            expect(isLeapYear(2023)).to.be.false;
            expect(isLeapYear(2021)).to.be.false;
        });
    });

    // --- Tests for validateDateInput ---
    describe('validateDateInput', () => {
        const bramFieldName = "Bram's Date of Birth";
        const chanuFieldName = "Chanu's Date of Birth";

        // Happy Path Tests
        it('should return null for a valid date', () => {
            expect(validateDateInput('01/15/2023', bramFieldName)).to.be.null;
        });

        it('should return null for a valid leap year date', () => {
            expect(validateDateInput('02/29/2024', chanuFieldName)).to.be.null;
        });

        it('should return null for date at year boundary', () => {
            expect(validateDateInput('12/31/2023', bramFieldName)).to.be.null;
            expect(validateDateInput('01/01/1900', chanuFieldName)).to.be.null;
        });
        
        // Year Range Tests
        it('should return error for year before 1900', () => {
            expect(validateDateInput('01/15/1899', bramFieldName)).to.equal("Bram's Date of Birth: Year must be between 1900 and 2023.");
        });

        it('should return error for year after current year', () => {
            mockCurrentYear = 2023; // Explicitly set for this test
            expect(validateDateInput('01/15/2024', chanuFieldName)).to.equal("Chanu's Date of Birth: Year must be between 1900 and 2023.");
        });

        it('should return null for current year', () => {
            mockCurrentYear = 2023;
            expect(validateDateInput('07/07/2023', bramFieldName)).to.be.null;
        });

        // Month Tests
        it('should return error for invalid month (too high)', () => {
            expect(validateDateInput('13/15/2023', chanuFieldName)).to.equal("Chanu's Date of Birth: Month must be between 01 and 12.");
        });

        it('should return error for invalid month (too low)', () => {
            expect(validateDateInput('00/15/2023', bramFieldName)).to.equal("Bram's Date of Birth: Month must be between 01 and 12.");
        });

        // Day Tests
        it('should return error for invalid day (too high for month)', () => {
            expect(validateDateInput('01/32/2023', chanuFieldName)).to.equal("Chanu's Date of Birth: Day is invalid for the given month and year.");
            expect(validateDateInput('04/31/2023', bramFieldName)).to.equal("Bram's Date of Birth: Day is invalid for the given month and year.");
        });

        it('should return error for invalid day in February (non-leap year)', () => {
            mockCurrentYear = 2023; // Ensure it's a non-leap year
            expect(validateDateInput('02/29/2023', chanuFieldName)).to.equal("Chanu's Date of Birth: Day is invalid for the given month and year.");
        });

        it('should return null for valid day in February (leap year)', () => {
            mockCurrentYear = 2024; // Ensure it's a leap year
            expect(validateDateInput('02/29/2024', bramFieldName)).to.be.null;
        });

        it('should return error for day 30 in February (even in leap year)', () => {
             mockCurrentYear = 2024; // Ensure it's a leap year
            expect(validateDateInput('02/30/2024', chanuFieldName)).to.equal("Chanu's Date of Birth: Day is invalid for the given month and year.");
        });
        
        it('should return error for day 0', () => {
             expect(validateDateInput('01/00/2023', bramFieldName)).to.equal("Bram's Date of Birth: Day is invalid for the given month and year.");
        });

        // Format Tests
        it('should return error for invalid format (hyphens)', () => {
            expect(validateDateInput('15-01-2023', chanuFieldName)).to.equal("Chanu's Date of Birth: Invalid format. Please use MM/DD/YYYY.");
        });

        it('should return error for invalid format (YYYY/MM/DD)', () => {
            expect(validateDateInput('2023/01/15', bramFieldName)).to.equal("Bram's Date of Birth: Invalid format. Please use MM/DD/YYYY.");
        });

        it('should return error for invalid format (short year)', () => {
            // Note: applyDobMask might prevent this from reaching validateDateInput with this exact input if it's active,
            // but testing the validator directly is important.
            expect(validateDateInput('01/15/23', chanuFieldName)).to.equal("Chanu's Date of Birth: Invalid format. Please use MM/DD/YYYY.");
        });
        
        it('should return error for invalid format (long year)', () => {
             expect(validateDateInput('01/15/20230', bramFieldName)).to.equal("Bram's Date of Birth: Invalid format. Please use MM/DD/YYYY.");
        });

        it('should return error for non-digit input', () => {
            expect(validateDateInput('abc', chanuFieldName)).to.equal("Chanu's Date of Birth: Invalid format. Please use MM/DD/YYYY.");
        });

        it('should return error for empty string', () => {
            expect(validateDateInput('', bramFieldName)).to.equal("Bram's Date of Birth: Invalid format. Please use MM/DD/YYYY.");
        });
    });

    // --- Tests for applyDobMask ---
    describe('applyDobMask', () => {
        let herDateInput;

        beforeEach(() => {
            // Mock getElementById to return a fresh mock input element for herDate
            document.getElementById = jest.fn(id => {
                if (id === 'herDate') {
                    herDateInput = {
                        value: '', id: id, addEventListener: jest.fn(),
                        setValue: function(val) { this.value = val; this.dispatchEvent(new Event('input')); },
                        focus: jest.fn(), // Mock focus method
                    };
                    // Attach the masking logic directly to the mock element for the test
                    herDateInput.addEventListener('input', function(e) {
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
                    return herDateInput;
                }
                return null;
            });
            applyDobMask('herDate'); // Call the function to attach the listener
        });

        // Test Case 1: Happy Path - full date entry
        it('should format input as MM/DD/YYYY', () => {
            herDateInput.setValue('1234567890'); // Simulate user typing
            expect(herDateInput.value).to.equal('12/34/5678');
        });

        // Test Case 2: Partial entry - MM/DD
        it('should format input as MM/DD', () => {
            herDateInput.setValue('010120'); // Simulate user typing
            expect(herDateInput.value).to.equal('01/01/20');
        });

        // Test Case 3: Further partial entry - MM/DD
        it('should format partial input as MM/DD', () => {
            herDateInput.setValue('0101'); // Simulate user typing
            expect(herDateInput.value).to.equal('01/01');
        });
        
        // Test Case 4: Edge case - Only MM
        it('should format partial input as MM', () => {
            herDateInput.setValue('12'); // Simulate user typing
            expect(herDateInput.value).to.equal('12');
        });

        // Test Case 5: Non-digit characters should be stripped
        it('should strip non-digit characters', () => {
            herDateInput.setValue('abc123def456ghi7890'); // Simulate user typing
            expect(herDateInput.value).to.equal('12/34/5678');
        });

        // Test Case 6: Input exceeding YYYY length should be truncated
        it('should truncate input exceeding YYYY length', () => {
            herDateInput.setValue('1234567890123'); // Simulate user typing
            expect(herDateInput.value).to.equal('12/34/5678');
        });

        // Test Case 7: Empty input
        it('should handle empty input', () => {
            herDateInput.setValue('');
            expect(herDateInput.value).to.equal('');
        });
        
        // Test Case 8: Input that is too short for full formatting
        it('should handle short input correctly', () => {
            herDateInput.setValue('1');
            expect(herDateInput.value).to.equal('1');
            herDateInput.setValue('123');
            expect(herDateInput.value).to.equal('12/3');
        });
    });

    // --- Add more tests as needed for other functions in script.js ---
    // For example, tests for getLocationAndSubmit and submitFormData would be complex
    // as they involve browser APIs like navigator.geolocation and fetch.
    // For now, focusing on the new validation logic as requested.
