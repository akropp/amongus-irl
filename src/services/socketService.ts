import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';

export default class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(SERVER_URL, SOCKET_OPTIONS);
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]) {
    if (this.socket.connected) {
      this.socket.emit('create-game', { code, maxPlayers, rooms });
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
        this.socket.emit('verify-game', { code }, (response) => {
          resolve(response.exists);
        });
      } else {
        resolve(false);
      }
    });
  }

  public onGameCreated(callback: (data: { code: string; maxPlayers: number; rooms: string[] }) => void) {
    this.socket.on('game-created', callback);
  }

  public offGameCreated() {
    this.socket.off('game-created');
  }

  public onJoinGameSuccess(callback: (data: { player: Player; gameCode: string; players: Player[] }) => void) {
    this.socket.on('join-game-success', callback);
  }

  public onJoinGameError(callback: (error: { message: string }) => void) {
    this.socket.on('join-game-error', callback);
  }

  public onPlayersUpdated(callback: (players: Player[]) => void) {
    this.socket.on('players-updated', callback);
  }

  public onGameStarted(callback: () => void) {
    this.socket.on('game-started', callback);
  }

  public offJoinGameSuccess() {
    this.socket.off('join-game-success');
  }

  public offJoinGameError() {
    this.socket.off('join-game-error');
  }

  public offPlayersUpdated() {
    this.socket.off('players-updated');
  }

  public offGameStarted() {
    this.socket.off('game-started');
  }
}