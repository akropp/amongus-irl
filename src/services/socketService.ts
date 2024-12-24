import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;
  private reconnectTimer: NodeJS.Timeout | null = null;

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

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Restore session on reconnect
      const session = sessionManager.getSession();
      if (session.gameCode) {
        this.socket.emit('restore-session', {
          clientId: sessionManager.getClientId(),
          gameCode: session.gameCode,
          playerId: session.playerId,
          isAdmin: session.isAdmin
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.scheduleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.scheduleReconnect();
      }
    });

    // Force initial connection
    this.connect();
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.connect();
      }, 1000);
    }
  }

  public connect(): void {
    if (!this.socket.connected) {
      console.log('Initiating socket connection...');
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket.disconnect();
  }
}