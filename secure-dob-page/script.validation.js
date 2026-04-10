// Extracted DOB validation helpers for testing
define(function () {
  function isValidDateFormat(dateStr) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  }

  function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    const d = new Date(year, month - 1, day);
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
    const min = new Date('1900-01-01');
    const max = new Date();
    return date >= min && date <= max;
  }

  return { isValidDateFormat, parseDate, isDateInAllowedRange };
});
// For NodeJS tests
if (typeof module !== 'undefined') {
  module.exports = {
    isValidDateFormat,
    parseDate,
    isDateInAllowedRange
  };
}
