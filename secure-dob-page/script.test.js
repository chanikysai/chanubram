// Unit tests for client-side DOB validation (feature 1.1)
const { isValidDateFormat, parseDate, isDateInAllowedRange } = require('./script.validation');

describe('isValidDateFormat', () => {
  test('accepts valid YYYY-MM-DD', () => {
    expect(isValidDateFormat('1980-12-17')).toBe(true);
  });
  test('rejects DD/MM/YYYY', () => {
    expect(isValidDateFormat('17/12/1980')).toBe(false);
  });
  test('rejects short and long entries', () => {
    expect(isValidDateFormat('1980-1-1')).toBe(false);
    expect(isValidDateFormat('19800-01-01')).toBe(false);
  });
});

describe('parseDate', () => {
  test('correct real date', () => {
    const d = parseDate('2000-05-04');
    expect(d instanceof Date && d.getFullYear() === 2000).toBe(true);
  });
  test('invalid date like 2023-02-30 returns null', () => {
    expect(parseDate('2023-02-30')).toBeNull();
  });
  test('empty or nonsense returns null', () => {
    expect(parseDate('')).toBeNull();
    expect(parseDate('abc-def-hh')).toBeNull();
  });
});

describe('isDateInAllowedRange', () => {
  test('1900-01-01 is allowed', () => {
    expect(isDateInAllowedRange(new Date('1900-01-01'))).toBe(true);
  });
  test('Today is allowed', () => {
    expect(isDateInAllowedRange(new Date())).toBe(true);
  });
  test('1899-12-31 not allowed', () => {
    expect(isDateInAllowedRange(new Date('1899-12-31'))).toBe(false);
  });
});
