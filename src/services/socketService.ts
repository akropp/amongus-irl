import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;

  constructor() {
    console.log('🔌 Initializing socket service');
    
    // Initialize socket with client ID from session
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: { clientId: sessionManager.getClientId() }
    });

    this.setupLogging();
    this.setupEventHandlers();
    this.connect();
  }

  private setupLogging() {
    this.socket.onAny((event, ...args) => {
      console.log(`📥 Socket received ${event}:`, args);
    });

    const emit = this.socket.emit;
    this.socket.emit = function(event: string, ...args: any[]) {
      console.log(`📤 Socket emitting ${event}:`, args);
      return emit.apply(this, [event, ...args]);
    };
  }

  private setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket connected, client ID:', sessionManager.getClientId());
      
      // Restore session on reconnect if valid
      const session = sessionManager.getSession();
      if (sessionManager.isValidSession()) {
        this.socket.emit('register-session', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId(),
          isAdmin: session.isAdmin
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