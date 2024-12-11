// src/components/common/Input.jsx
const Input = ({ 
    label, 
    error, 
    className = '', 
    ...props 
  }) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          className={`
            w-full px-3 py-2 border rounded-lg text-sm focus:outline-none
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
              : 'border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };
  
  // src/components/common/Select.jsx
  const Select = ({ 
    label, 
    options = [], 
    error,
    className = '', 
    ...props 
  }) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          className={`
            w-full px-3 py-2 border rounded-lg text-sm focus:outline-none
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
              : 'border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}
          `}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };
  