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
        // Simple mock for getElementById, could be more sophisticated
        // For this test, we'll manually attach listeners to mock elements
        if (id === 'herDate' || id === 'yourDate') {
            const mockInputEl = {
                value: '',
                id: id,
                addEventListener: jest.fn(function(event, handler) {
                    if (event === 'input') {
                        this._inputHandler = handler;
                    }
                }),
                // Simulate value change and event trigger
                setValue: function(val) {
                    this.value = val;
                    if (this._inputHandler) {
                        const event = { target: this, preventDefault: () => {} };
                        this._inputHandler(event);
                    }
                }
            };
            // Apply the masking logic directly to the mock element
            mockInputEl.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

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
            return mockInputEl;
        }
        return null;
    }),
    addEventListener: jest.fn(),
};

// Mocking console for warnings and errors
global.console = {
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
};

// --- Test Suite ---

describe('applyDobMask', () => {
    let herDateInput;
    let yourDateInput;

    beforeEach(() => {
        // Clear mocks and reset DOM state before each test
        jest.clearAllMocks();
        
        // Re-mock getElementById to return fresh mock input elements
        document.getElementById = jest.fn(id => {
            if (id === 'herDate') {
                herDateInput = {
                    value: '', id: id, addEventListener: jest.fn(),
                    setValue: function(val) { this.value = val; this.dispatchEvent(new Event('input')); }
                };
                // Manually attach the masking logic to the mock input for the test
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
            } else if (id === 'yourDate') {
                yourDateInput = {
                    value: '', id: id, addEventListener: jest.fn(),
                    setValue: function(val) { this.value = val; this.dispatchEvent(new Event('input')); }
                };
                 yourDateInput.addEventListener('input', function(e) {
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
                return yourDateInput;
            }
            return null;
        });
        // Ensure the function is called correctly
        applyDobMask('herDate');
        applyDobMask('yourDate');
    });

    // Test Case 1: Happy Path - full date entry
    test('should format input as MM/DD/YYYY', () => {
        herDateInput.setValue('1234567890'); // Simulate user typing
        expect(herDateInput.value).toBe('12/34/5678');
    });

    // Test Case 2: Partial entry - MM/DD
    test('should format input as MM/DD', () => {
        herDateInput.setValue('010120'); // Simulate user typing
        expect(herDateInput.value).toBe('01/01/20');
    });

    // Test Case 3: Further partial entry - MM/DD
    test('should format partial input as MM/DD', () => {
        herDateInput.setValue('0101'); // Simulate user typing
        expect(herDateInput.value).toBe('01/01');
    });
    
    // Test Case 4: Edge case - Only MM
    test('should format partial input as MM', () => {
        herDateInput.setValue('12'); // Simulate user typing
        expect(herDateInput.value).toBe('12');
    });

    // Test Case 5: Non-digit characters should be stripped
    test('should strip non-digit characters', () => {
        herDateInput.setValue('abc123def456ghi7890'); // Simulate user typing
        expect(herDateInput.value).toBe('12/34/5678');
    });

    // Test Case 6: Input exceeding YYYY length should be truncated
    test('should truncate input exceeding YYYY length', () => {
        herDateInput.setValue('1234567890123'); // Simulate user typing
        expect(herDateInput.value).toBe('12/34/5678');
    });

    // Test Case 7: Empty input
    test('should handle empty input', () => {
        herDateInput.setValue('');
        expect(herDateInput.value).toBe('');
    });
    
    // Test Case 8: Input that is too short for full formatting
    test('should handle short input correctly', () => {
        herDateInput.setValue('1');
        expect(herDateInput.value).toBe('1');
        herDateInput.setValue('123');
        expect(herDateInput.value).toBe('12/3');
    });
});
