import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;

  constructor() {
    console.log('🔌 Initializing socket service');
    
    // Create socket instance with auth
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: {
        clientId: sessionManager.getClientId()
      }
    });

    this.setupLogging();
    this.connect();
  }

  private setupLogging() {
    // Log all incoming events
    this.socket.onAny((event, ...args) => {
      console.log(`📥 Socket [${this.socket.id}] received ${event}:`, args);
    });

    // Log all outgoing events
    const emit = this.socket.emit;
    this.socket.emit = function(event: string, ...args: any[]) {
      console.log(`📤 Socket [${this.socket.id}] emitting ${event}:`, args);
      return emit.apply(this, [event, ...args]);
    };
  }

  public connect() {
    if (!this.socket.connected) {
      console.log('🔌 Connecting socket with client ID:', sessionManager.getClientId());
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