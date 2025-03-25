import React from 'react';

/**
 * Spinner component for loading states
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the spinner (sm, md, lg)
 * @param {string} [props.color='primary'] - Color of the spinner (primary, secondary, white)
 * @returns {JSX.Element} - Spinner component
 */
const Spinner = ({ size = 'md', color = 'primary' }) => {
  // Determine size class
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size] || 'w-8 h-8';

  // Determine color class
  const colorClass = {
    primary: 'text-primary',
    secondary: 'text-gray-600',
    white: 'text-white'
  }[color] || 'text-primary';

  return (
    <div className="flex justify-center items-center">
      <svg 
        className={`animate-spin ${sizeClass} ${colorClass}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default Spinner;
