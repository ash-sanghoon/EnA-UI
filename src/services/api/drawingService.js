export const drawingService = {
    async uploadDrawing(projectId, file, onProgress) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
  
        const response = await api.post('/drawings/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.(percentCompleted);
          }
        });
        return response.data;
      } catch (error) {
        errorHandler.logError(error, { context: 'uploadDrawing', projectId });
        throw error;
      }
    },
  
    async processDrawing(drawingId) {
      try {
        const response = await api.post(`/drawings/${drawingId}/process`);
        return response.data;
      } catch (error) {
        errorHandler.logError(error, { context: 'processDrawing', drawingId });
        throw error;
      }
    },
  
    async getProcessingStatus(drawingId) {
      try {
        const response = await api.get(`/drawings/${drawingId}/status`);
        return response.data;
      } catch (error) {
        errorHandler.logError(error, { context: 'getProcessingStatus', drawingId });
        throw error;
      }
    }
  };