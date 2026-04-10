/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

describe('Frontend DOB validation logic', () => {
  let isValidDateFormat, parseDate, isDateInAllowedRange;

  beforeAll(() => {
    // Instead of matching with \n, match till next function/EOF
    const src = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
    function extractFunction(name) {
      const re = new RegExp(`function ${name}\\([^)]*\\)[\\s\\S]*?^}`, 'm');
      const match = src.match(re);
      if (!match) throw new Error(`Missing function ${name}`);
      // eslint-disable-next-line no-eval
      return eval('(' + match[0].replace(/^function /, 'function anonymous') + ')');
    }
    isValidDateFormat = extractFunction('isValidDateFormat');
    parseDate = extractFunction('parseDate');
    isDateInAllowedRange = extractFunction('isDateInAllowedRange');
  });

  test('Happy path: Valid YYYY-MM-DD, real date, range', () => {
    expect(isValidDateFormat('2010-12-31')).toBe(true);
    const d = parseDate('2010-12-31');
    expect(d instanceof Date).toBe(true);
    expect(isDateInAllowedRange(d)).toBe(true);
  });

  test('Error: Invalid format is rejected', () => {
    expect(isValidDateFormat('12/31/2010')).toBe(false);
    expect(parseDate('12/31/2010')).toBe(null);
  });

  test('Error: Impossible date is rejected', () => {
    expect(parseDate('2023-02-31')).toBe(null);
    expect(parseDate('2019-02-29')).toBe(null);
  });

  test('Edge: Date before 1900 is out of range', () => {
    const d = parseDate('1899-01-01');
    expect(d).not.toBe(null);
    expect(isDateInAllowedRange(d)).toBe(false);
  });

  test('Edge: Today is accepted as max day', () => {
    const today = new Date();
    const s = today.toISOString().split('T')[0];
    const d = parseDate(s);
    expect(isDateInAllowedRange(d)).toBe(true);
  });
});
