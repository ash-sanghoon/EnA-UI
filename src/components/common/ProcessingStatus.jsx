// src/components/common/ProcessingStatus.jsx
export const ProcessingStatus = ({ 
    status, 
    progress, 
    step,
    className = '' 
  }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'processing':
          return 'text-blue-600';
        case 'completed':
          return 'text-green-600';
        case 'error':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    };
  
    const getStatusMessage = (status, step) => {
      switch (status) {
        case 'processing':
          return `처리 중: ${step || ''}`;
        case 'completed':
          return '처리 완료';
        case 'error':
          return '처리 실패';
        default:
          return '대기 중';
      }
    };
  
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`flex items-center ${getStatusColor(status)}`}>
          {status === 'processing' && <LoadingSpinner size="sm" />}
          {status === 'completed' && <CheckCircle className="w-5 h-5" />}
          {status === 'error' && <AlertCircle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">
            {getStatusMessage(status, step)}
          </div>
          {progress !== undefined && status === 'processing' && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  