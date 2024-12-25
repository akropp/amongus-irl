import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';

export default class SocketService {
  public socket: Socket;
  private connected: boolean = false;

  constructor() {
    console.log('🔌 Initializing socket service');
    this.socket = io(SERVER_URL, SOCKET_OPTIONS);
    this.setupLogging();
    this.setupHandlers();
  }

  private setupLogging() {
    // Log all events
    this.socket.onAny((event, ...args) => {
      console.log(`📥 Received ${event}:`, args);
    });

    // Wrap emit to log outgoing events
    const originalEmit = this.socket.emit;
    this.socket.emit = function(event: string, ...args: any[]) {
      console.log(`📤 Emitting ${event}:`, args);
      return originalEmit.apply(this, [event, ...args]);
    };
  }

  private setupHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });
  }

  public connect(): void {
    if (!this.connected && !this.socket.connected) {
      console.log('🔌 Connecting socket...');
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.connected || this.socket.connected) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
    }
  }

  public isConnected(): boolean {
    return this.connected && this.socket.connected;
  }
}