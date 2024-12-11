import React from 'react';
import { Loader } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="animate-spin text-purple-600">
      <Loader className={sizes[size]} />
    </div>
  );
};

export const LoadingOverlay = ({ message = '로딩 중...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const LoadingSection = ({ height = 'h-64' }) => {
  return (
    <div className={`w-full ${height} flex items-center justify-center`}>
      <LoadingSpinner />
    </div>
  );
};

