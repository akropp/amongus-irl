import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';

export default class SocketService {
  public socket: Socket;
  private joinGameSuccessCallback: ((data: { player: Player; gameCode: string }) => void) | null = null;
  private joinGameErrorCallback: ((error: { message: string }) => void) | null = null;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;
  private disconnectCallback: (() => void) | null = null;
  private removedCallback: (() => void) | null = null;

  constructor() {
    this.socket = io(SERVER_URL, SOCKET_OPTIONS);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('join-game-success', (data) => {
      if (this.joinGameSuccessCallback) {
        this.joinGameSuccessCallback(data);
      }
    });

    this.socket.on('join-game-error', (error) => {
      if (this.joinGameErrorCallback) {
        this.joinGameErrorCallback(error);
      }
    });

    this.socket.on('players-updated', (players) => {
      if (this.playersUpdateCallback) {
        this.playersUpdateCallback(players);
      }
    });

    this.socket.on('disconnect', () => {
      if (this.disconnectCallback) {
        this.disconnectCallback();
      }
    });

    this.socket.on('player-removed', () => {
      if (this.removedCallback) {
        this.removedCallback();
      }
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public reconnect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]): void {
    this.socket.emit('create-game', { code, maxPlayers, rooms });
  }

  public joinGame(gameCode: string, player: Player): void {
    this.socket.emit('join-game', { gameCode, player });
  }

  public removePlayer(gameCode: string, playerId: string): void {
    this.socket.emit('remove-player', { gameCode, playerId });
  }

  public startGame(gameCode: string, players: Player[]): void {
    this.socket.emit('start-game', { gameCode, players });
  }

  public onJoinGameSuccess(callback: (data: { player: Player; gameCode: string }) => void): void {
    this.joinGameSuccessCallback = callback;
  }

  public onJoinGameError(callback: (error: { message: string }) => void): void {
    this.joinGameErrorCallback = callback;
  }

  public onPlayersUpdated(callback: (players: Player[]) => void): void {
    this.playersUpdateCallback = callback;
  }

  public onDisconnect(callback: () => void): void {
    this.disconnectCallback = callback;
  }

  public onRemoved(callback: () => void): void {
    this.removedCallback = callback;
  }

  public offJoinGameSuccess(): void {
    this.joinGameSuccessCallback = null;
  }

  public offJoinGameError(): void {
    this.joinGameErrorCallback = null;
  }

  public offPlayersUpdated(): void {
    this.playersUpdateCallback = null;
  }

  public offDisconnect(): void {
    this.disconnectCallback = null;
  }

  public offRemoved(): void {
    this.removedCallback = null;
  }
}