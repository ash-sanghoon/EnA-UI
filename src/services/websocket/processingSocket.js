export class ProcessingSocket {
  constructor(drawingId) {
    this.drawingId = drawingId;
    this.socket = null;
    this.callbacks = {
      onProgress: () => {},
      onComplete: () => {},
      onError: () => {}
    };
  }

  connect() {
    this.socket = new WebSocket(`${process.env.REACT_APP_WS_URL}/drawings/${this.drawingId}`);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'PROGRESS':
          this.callbacks.onProgress(data.payload);
          break;
        case 'COMPLETE':
          this.callbacks.onComplete(data.payload);
          break;
        case 'ERROR':
          this.callbacks.onError(data.payload);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    };

    this.socket.onerror = (error) => {
      this.callbacks.onError(error);
    };
  }

  onProgress(callback) {
    this.callbacks.onProgress = callback;
  }

  onComplete(callback) {
    this.callbacks.onComplete = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

