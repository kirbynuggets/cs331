/**
 * Format a date string or timestamp to a readable format
 * @param {string|number|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      // Default options
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
      };
      
      return new Intl.DateTimeFormat('en-IN', defaultOptions).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };
  
  /**
   * Format a number as currency
   * @param {number} amount - The amount to format
   * @param {string} currency - Currency code (e.g., 'INR', 'USD')
   * @param {string} locale - Locale code (e.g., 'en-IN', 'en-US')
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
    if (amount === null || amount === undefined) return 'N/A';
    
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      return formatter.format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount}`;
    }
  };
  
  /**
   * Format a phone number in Indian format
   * @param {string} phone - Phone number to format
   * @returns {string} Formatted phone number
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    
    // Remove non-numeric characters
    const cleaned = ('' + phone).replace(/\D/g, '');
    
    // Check if it's a valid Indian number (10 digits)
    if (cleaned.length !== 10) {
      return phone; // Return original if not valid
    }
    
    // Format as: +91 XXXXX XXXXX
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };