import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';

export default class SocketService {
  public socket: Socket;

  constructor() {
    console.log('🔌 Initializing socket service');
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      autoConnect: true // Always auto-connect
    });
    this.setupLogging();
  }

  private setupLogging() {
    this.socket.onAny((event, ...args) => {
      console.log(`📥 Socket received ${event}:`, args);
    });

    const originalEmit = this.socket.emit;
    this.socket.emit = function(event: string, ...args: any[]) {
      console.log(`📤 Socket emitting ${event}:`, args);
      return originalEmit.apply(this, [event, ...args]);
    };

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}