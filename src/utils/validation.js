export const validators = {
    required: (value) => {
      if (value === null || value === undefined || value === '') {
        return '필수 입력 항목입니다.';
      }
      return null;
    },
    
    email: (value) => {
      if (!value) return null;
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(value)) {
        return '올바른 이메일 형식이 아닙니다.';
      }
      return null;
    },
    
    minLength: (min) => (value) => {
      if (!value) return null;
      if (value.length < min) {
        return `최소 ${min}자 이상 입력해주세요.`;
      }
      return null;
    },
    
    maxLength: (max) => (value) => {
      if (!value) return null;
      if (value.length > max) {
        return `최대 ${max}자까지 입력 가능합니다.`;
      }
      return null;
    },
  };
  
  