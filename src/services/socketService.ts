import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';

export default class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(SERVER_URL, SOCKET_OPTIONS);
    this.setupReconnection();
  }

  private setupReconnection() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      const gameCode = localStorage.getItem('currentGameCode');
      const playerId = localStorage.getItem('currentPlayerId');
      
      if (gameCode && playerId) {
        this.socket.emit('register-player', { gameCode, playerId });
      }
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public removePlayer(gameCode: string, playerId: string) {
    if (this.socket.connected) {
      localStorage.setItem('playerRemoved', 'true');
      this.socket.emit('remove-player', { gameCode, playerId });
    }
  }

  public verifyGame(code: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket.connected) {
        resolve(false);
        return;
      }
      
      this.socket.emit('verify-game', { code }, (response: { exists: boolean }) => {
        resolve(response.exists);
      });
    });
  }
}