/**
 * Pad a number with leading zero if it's less than 10
 * e.g. 5 → "05"
 */
export const padZero = (num) => {
  return num.toString().padStart(2, "0");
};

/**
 * Validate if a given date string is in YYYY-MM-DD format
 */
export const isValidDate = (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

/**
 * Parse a date string into { year, month, day }
 */
export const parseDate = (dateStr) => {
  if (!isValidDate(dateStr)) return null;
  const [year, month, day] = dateStr.split("-");
  return { year, month, day };
};

/**
 * Case-insensitive string comparison
 */
export const equalsIgnoreCase = (a, b) => {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
};

/**
 * Safely get query param with fallback
 */
export const getQueryParam = (obj, key, fallback = null) => {
  return obj && obj[key] ? obj[key] : fallback;
};
