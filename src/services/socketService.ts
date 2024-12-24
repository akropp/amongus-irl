import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;

  constructor() {
    const clientId = sessionManager.getClientId();
    
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: { clientId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Force initial connection
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public connect(): void {
    if (!this.socket.connected) {
      console.log('Forcing socket connection...');
      this.socket.connect();
    }
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}