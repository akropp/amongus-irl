import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;

  constructor() {
    const clientId = sessionManager.getClientId();
    
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: { clientId }
    });

    // Log connection events for debugging
    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public getClientId(): string | null {
    return sessionManager.getClientId();
  }

  public connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}