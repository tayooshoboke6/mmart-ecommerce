/**
 * Formatting utility functions for M-Mart+ e-commerce platform
 */

/**
 * Format a number as Nigerian Naira currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount with Naira symbol (₦)
 */
export const formatNaira = (amount) => {
  // Handle undefined or null values
  if (amount === undefined || amount === null) {
    return '₦0.00';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format the number with Nigerian Naira symbol and thousands separators
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

/**
 * Format a date in Nigerian style (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format a phone number in Nigerian style
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on Nigerian phone number patterns
  if (digits.length === 11) {
    // Standard Nigerian format: 0801 234 5678
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  } else if (digits.length === 10) {
    // Without leading zero: 801 234 5678
    return `0${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
  } else if (digits.length === 13 && digits.startsWith('234')) {
    // International format: +234 801 234 5678
    return `+234 ${digits.substring(3, 6)} ${digits.substring(6, 9)} ${digits.substring(9)}`;
  }
  
  // Return original if it doesn't match known patterns
  return phone;
};
