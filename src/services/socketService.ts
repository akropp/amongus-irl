import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';

export default class SocketService {
  public socket: Socket;

  constructor() {
    console.log('🔌 Initializing socket service with URL:', SERVER_URL);
    
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: false
    });

    this.setupLogging();
    this.setupErrorHandling();
  }

  private setupLogging() {
    // Log all emitted events
    const emit = this.socket.emit;
    this.socket.emit = function(eventName: string, ...args: any[]) {
      console.log(`📤 Emitting '${eventName}':`, args);
      return emit.apply(this, [eventName, ...args]);
    };

    // Log all received events
    this.socket.onAny((eventName: string, ...args: any[]) => {
      console.log(`📥 Received '${eventName}':`, args);
    });

    // Connection state logging
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log('🔄 Socket reconnection attempt:', attempt);
    });
  }

  private setupErrorHandling() {
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  public connect(): void {
    if (!this.socket.connected) {
      console.log('🔌 Connecting socket...');
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.socket.connected) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
    }
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}