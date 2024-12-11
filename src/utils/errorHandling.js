// src/utils/errorHandling.js
export const errorHandler = {
    getErrorMessage: (error) => {
      if (error.response) {
        // 서버 응답 에러
        const { status, data } = error.response;
        switch (status) {
          case 400:
            return data.message || '잘못된 요청입니다.';
          case 401:
            return '인증이 필요합니다.';
          case 403:
            return '접근 권한이 없습니다.';
          case 404:
            return '요청한 리소스를 찾을 수 없습니다.';
          case 500:
            return '서버 오류가 발생했습니다.';
          default:
            return '알 수 없는 오류가 발생했습니다.';
        }
      }
      if (error.request) {
        // 요청 실패
        return '서버에 연결할 수 없습니다.';
      }
      // 기타 에러
      return error.message || '알 수 없는 오류가 발생했습니다.';
    },
    
    logError: (error, context = {}) => {
      // 실제 구현에서는 에러 로깅 서비스 연동
      console.error('Error:', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });
    },
  };
  
  export { api, storage, errorHandler };