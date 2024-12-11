export const symbolService = {
    async getSymbols(params) {
      try {
        const response = await api.get('/symbols', { params });
        return response.data;
      } catch (error) {
        errorHandler.logError(error, { context: 'getSymbols', params });
        throw error;
      }
    },
  
    async uploadSymbol(formData) {
      try {
        const response = await api.post('/symbols/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        errorHandler.logError(error, { context: 'uploadSymbol' });
        throw error;
      }
    },
  
    async updateSymbol(id, data) {
      try {
        const response = await api.put(`/symbols/${id}`, data);
        return response.data;
      } catch (error) {
        errorHandler.logError(error, { context: 'updateSymbol', id, data });
        throw error;
      }
    }
  };