import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';

export default class SocketService {
  public socket: Socket;
  private clientId: string;

  constructor() {
    // Get or generate client ID
    this.clientId = localStorage.getItem('socketClientId') || this.generateClientId();
    localStorage.setItem('socketClientId', this.clientId);

    // Initialize socket with client ID
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: { clientId: this.clientId }
    });
    
    this.setupLogging();
  }

  private generateClientId(): string {
    return 'client_' + Math.random().toString(36).substring(2, 15);
  }

  private setupLogging() {
    this.socket.on('connect', () => {
      console.log(`Socket connected - Client ID: ${this.clientId}, Socket ID: ${this.socket.id}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected - Client ID: ${this.clientId}, Reason: ${reason}`);
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public getClientId(): string {
    return this.clientId;
  }
}