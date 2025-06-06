import React from 'react';

export function Loader({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  let sizeClasses = 'w-5 h-5'; // default
  
  if (size === 'small') {
    sizeClasses = 'w-4 h-4';
  } else if (size === 'large') {
    sizeClasses = 'w-6 h-6';
  }
  
  return (
    <div className={`${sizeClasses} animate-spin`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
}