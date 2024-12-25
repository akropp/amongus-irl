import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;

  constructor() {
    console.log('🔌 Initializing socket service');
    
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: {
        clientId: sessionManager.getClientId()
      }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      
      // Register session on connect if valid
      const session = sessionManager.getSession();
      if (session.playerId || session.isAdmin) {
        console.log('Registering session on connect:', {
          clientId: sessionManager.getClientId(),
          ...session
        });
        
        this.socket.emit('register-session', {
          clientId: sessionManager.getClientId(),
          playerId: session.playerId,
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
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }
}