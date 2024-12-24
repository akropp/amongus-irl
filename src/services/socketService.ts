import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';

export default class SocketService {
  public socket: Socket;
  private joinGameSuccessCallback: ((data: { player: Player; gameCode: string; players: Player[] }) => void) | null = null;
  private joinGameErrorCallback: ((error: { message: string }) => void) | null = null;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;
  private disconnectCallback: (() => void) | null = null;
  private removedCallback: ((data: { playerId: string }) => void) | null = null;
  private gameStartedCallback: (() => void) | null = null;
  private gameCreatedCallback: ((data: { code: string; maxPlayers: number; rooms: string[] }) => void) | null = null;

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

    this.socket.on('player-removed', (data) => {
      if (this.removedCallback) {
        this.removedCallback(data);
      }
    });

    this.socket.on('game-started', () => {
      if (this.gameStartedCallback) {
        this.gameStartedCallback();
      }
    });

    this.socket.on('game-created', (data) => {
      if (this.gameCreatedCallback) {
        this.gameCreatedCallback(data);
      }
    });
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public joinGame(gameCode: string, player: Player) {
    if (this.socket.connected) {
      this.socket.emit('join-game', { gameCode, player });
    }
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]) {
    if (this.socket.connected) {
      this.socket.emit('create-game', { code, maxPlayers, rooms });
    }
  }

  public removePlayer(gameCode: string, playerId: string) {
    if (this.socket.connected) {
      this.socket.emit('remove-player', { gameCode, playerId });
    }
  }

  public onGameCreated(callback: (data: { code: string; maxPlayers: number; rooms: string[] }) => void): void {
    this.gameCreatedCallback = callback;
  }

  public offGameCreated(): void {
    this.gameCreatedCallback = null;
  }

  // ... rest of the event handlers remain the same ...
}