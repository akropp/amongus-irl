import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';

export default class SocketService {
  public socket: Socket;

  constructor() {
    console.log('🔌 Initializing socket service');
    
    // Initialize socket with auto-connect disabled
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      autoConnect: false
    });

    this.setupLogging();
    this.connect();
  }

  private setupLogging() {
    this.socket.onAny((event, ...args) => {
      console.log(`📥 Received ${event}:`, args);
    });

    const originalEmit = this.socket.emit;
    this.socket.emit = function(event: string, ...args: any[]) {
      console.log(`📤 Emitting ${event}:`, args);
      return originalEmit.apply(this, [event, ...args]);
    };
  }

  public connect() {
    if (!this.socket.connected) {
      console.log('🔌 Connecting socket...');
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}