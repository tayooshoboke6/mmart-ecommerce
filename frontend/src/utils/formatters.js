/**
 * Format a number as Nigerian Naira currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the Naira symbol (₦)
 * @returns {string} Formatted currency string
 */
export const formatNaira = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return showSymbol ? '₦0.00' : '0.00';
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    // For older browsers that don't support the Naira symbol
    currencyDisplay: showSymbol ? 'symbol' : 'code'
  }).format(amount);
};

/**
 * Format a date string to a human-readable format
 * @param {string} dateString - The date string to format
 * @param {string} format - The format to use (short, medium, long)
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  const options = {
    short: { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    },
    medium: { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    },
    long: { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return date.toLocaleDateString('en-NG', options[format]);
};

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - The maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - The original price
 * @param {number} discountedPrice - The discounted price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) return 0;
  
  const discount = originalPrice - discountedPrice;
  const percentage = (discount / originalPrice) * 100;
  
  return Math.round(percentage);
};

/**
 * Format a phone number in Nigerian format
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format based on Nigerian phone number pattern
  if (digits.length === 11) {
    return digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (digits.length === 13 && digits.startsWith('234')) {
    return '+' + digits.replace(/(\d{3})(\d{4})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }
  
  return phoneNumber;
};
