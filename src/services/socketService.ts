import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';
import { setupSocketReconnection } from '../utils/socketReconnection';
import { getPlayerSession } from '../utils/playerSession';

export default class SocketService {
  public socket: Socket;
  private reconnection: ReturnType<typeof setupSocketReconnection>;

  constructor() {
    const session = getPlayerSession();
    
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: session.isValid ? {
        playerId: session.playerId,
        gameCode: session.gameCode
      } : undefined
    });

    this.reconnection = setupSocketReconnection(this.socket);
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]) {
    if (this.socket.connected) {
      this.socket.emit('create-game', { code, maxPlayers, rooms });
    }
  }

  public endGame(code: string) {
    if (this.socket.connected) {
      this.socket.emit('end-game', { code });
    }
  }

  public joinGame(gameCode: string, player: Player) {
    if (this.socket.connected) {
      this.socket.emit('join-game', { gameCode, player });
    }
  }

  public removePlayer(gameCode: string, playerId: string) {
    if (this.socket.connected) {
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

  // Event handlers
  public onPlayersUpdated(callback: (players: Player[]) => void) {
    this.socket.on('players-updated', callback);
  }

  public offPlayersUpdated() {
    this.socket.off('players-updated');
  }

  public disconnect() {
    this.socket.disconnect();
  }

  public connect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public getReconnectionAttempts(): number {
    return this.reconnection.getReconnectAttempts();
  }

  public getMaxReconnectionAttempts(): number {
    return this.reconnection.maxAttempts;
  }

  public getReconnectionTimeout(): number {
    return this.reconnection.timeout;
  }
}