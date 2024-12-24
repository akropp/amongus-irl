import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';
import { sessionManager } from '../utils/sessionManager';

export default class SocketService {
  public socket: Socket;

  constructor() {
    const session = sessionManager.getSession();
    
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: session.isAdmin ? undefined : {
        playerId: session.playerId,
        gameCode: session.gameCode
      }
    });

    this.setupReconnection();
  }

  private setupReconnection() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      const session = sessionManager.getSession();
      
      if (session.gameCode && session.playerId) {
        this.socket.emit('register-player', { 
          gameCode: session.gameCode, 
          playerId: session.playerId
        });
      }
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public disconnect() {
    this.socket.disconnect();
  }

  public connect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public removePlayer(gameCode: string, playerId: string) {
    if (this.socket.connected) {
      sessionManager.markPlayerRemoved();
      this.socket.emit('remove-player', { gameCode, playerId });
    }
  }

  public verifyGame(code: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket.connected) {
        this.socket.emit('verify-game', { code }, (response: { exists: boolean }) => {
          resolve(response.exists);
        });
      } else {
        resolve(false);
      }
    });
  }
}