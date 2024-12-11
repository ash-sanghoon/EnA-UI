export const formatters = {
    date: (date, options = {}) => {
      if (!date) return '';
      const defaultOptions = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(date).toLocaleString('ko-KR', { ...defaultOptions, ...options });
    },
    
    fileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    number: (number, options = {}) => {
      const defaultOptions = { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      };
      return number.toLocaleString('ko-KR', { ...defaultOptions, ...options });
    },
  };
  
  