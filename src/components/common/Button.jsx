import React from 'react';

const variants = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  icon,
  ...props 
}) => {
  return (
    <button
      className={`
        flex items-center justify-center rounded-lg font-medium transition-colors
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};




