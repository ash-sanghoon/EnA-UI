// src/components/common/Card.jsx
const Card = ({ 
    children, 
    title, 
    className = '', 
    actions,
    ...props 
  }) => {
    return (
      <div 
        className={`bg-white rounded-lg shadow ${className}`} 
        {...props}
      >
        {title && (
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">{title}</h3>
            {actions && <div>{actions}</div>}
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    );
  };
  