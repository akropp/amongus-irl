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
        clientId: sessionManager.getClientId(),
        session: sessionManager.getSession()
      }
    });

    this.setupLogging();
    this.setupReconnection();
  }

  private setupLogging() {
    this.socket.onAny((event, ...args) => {
      console.log(`📥 Socket [${this.socket.id}] received ${event}:`, args);
    });
  }

  private setupReconnection() {
    this.socket.on('connect', () => {
      console.log('Socket connected, registering session...');
      const session = sessionManager.getSession();
      
      if (sessionManager.isValidSession()) {
        this.socket.emit('register-session', {
          clientId: sessionManager.getClientId(),
          ...session
        });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  public connect() {
    if (!this.socket.connected) {
      console.log('Connecting socket...');
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