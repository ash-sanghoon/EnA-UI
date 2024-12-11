// src/services/processing/ProcessingManager.js
export class ProcessingManager {
    constructor(drawingId) {
      this.drawingId = drawingId;
      this.socket = new ProcessingSocket(drawingId);
      this.status = {
        current: 'idle',
        progress: 0,
        step: null,
        error: null
      };
    }
  
    async startProcessing() {
      try {
        await drawingService.processDrawing(this.drawingId);
        this.connectSocket();
      } catch (error) {
        this.handleError(error);
      }
    }
  
    connectSocket() {
      this.socket.connect();
  
      this.socket.onProgress((data) => {
        this.status = {
          ...this.status,
          current: 'processing',
          progress: data.progress,
          step: data.step
        };
        this.onStatusChange?.(this.status);
      });
  
      this.socket.onComplete((data) => {
        this.status = {
          current: 'completed',
          progress: 100,
          step: 'completed',
          result: data
        };
        this.onStatusChange?.(this.status);
        this.onComplete?.(data);
      });
  
      this.socket.onError((error) => {
        this.handleError(error);
      });
    }
  
    handleError(error) {
      this.status = {
        current: 'error',
        error: error.message
      };
      this.onStatusChange?.(this.status);
      this.onError?.(error);
    }
  
    onStatusChange(callback) {
      this.onStatusChange = callback;
    }
  
    onComplete(callback) {
      this.onComplete = callback;
    }
  
    onError(callback) {
      this.onError = callback;
    }
  
    dispose() {
      this.socket.disconnect();
    }
  }