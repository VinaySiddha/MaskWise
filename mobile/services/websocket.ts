export class WebSocketClient {
  private ws: WebSocket | null = null;

  constructor(private url: string, private onMessage: (msg: string) => void) {}

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (event) => this.onMessage(event.data);
    this.ws.onerror = (error) => console.error('WebSocket error:', error);
  }

  send(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
