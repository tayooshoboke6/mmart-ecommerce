/**
 * Formats a number as Nigerian Naira currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with Naira symbol (₦)
 */
const formatNaira = (amount) => {
  // Handle undefined or null values
  if (amount === undefined || amount === null) {
    return '₦0.00';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with Nigerian Naira symbol and thousand separators
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
};

export default formatNaira;
