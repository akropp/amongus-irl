import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;
  private clientId: string;

  constructor() {
    // Get or generate client ID using sessionStorage
    this.clientId = sessionStorage.getItem('socketClientId') || this.generateClientId();
    sessionStorage.setItem('socketClientId', this.clientId);

    // Initialize socket with client ID
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: { clientId: this.clientId }
    });
    
    this.setupSessionHandling();
  }

  private generateClientId(): string {
    return 'client_' + Math.random().toString(36).substring(2, 15);
  }

  private setupSessionHandling() {
    this.socket.on('session-restored', (session) => {
      console.log('Session restored:', session);
      if (session.type === 'admin') {
        sessionManager.saveGameSession(session.gameCode, null, true);
      } else if (session.type === 'player') {
        sessionManager.saveGameSession(session.gameCode, session.player);
        window.location.href = session.page;
      }
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public getClientId(): string {
    return this.clientId;
  }
}