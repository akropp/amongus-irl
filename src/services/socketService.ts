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
  }

  // ... rest of the service implementation remains the same ...

  public onRemoved(callback: (data: { playerId: string }) => void): void {
    this.removedCallback = callback;
  }

  public onGameStarted(callback: () => void): void {
    this.gameStartedCallback = callback;
  }
}