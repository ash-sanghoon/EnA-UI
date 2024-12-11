export const ErrorMessage = ({ 
    error, 
    onRetry,
    className = '' 
  }) => {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              오류가 발생했습니다
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || '알 수 없는 오류가 발생했습니다.'}</p>
            </div>
            {onRetry && (
              <div className="mt-4">
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };