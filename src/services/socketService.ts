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

    this.setupReconnection();
  }

  private setupReconnection() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      const session = sessionManager.getSession();
      
      if (session.isAdmin && session.gameCode) {
        this.socket.emit('verify-game', { code: session.gameCode });
      } else if (session.isValidSession()) {
        this.socket.emit('register-player', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          player: session.player
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}