import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';

export default class SocketService {
  private socket: Socket;
  private joinGameSuccessCallback: ((data: { player: Player; gameCode: string }) => void) | null = null;
  private joinGameErrorCallback: ((error: { message: string }) => void) | null = null;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;

  constructor() {
    this.socket = io(SERVER_URL, SOCKET_OPTIONS);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('join-game-success', (data) => {
      console.log('Socket: join-game-success received', data);
      if (this.joinGameSuccessCallback) {
        this.joinGameSuccessCallback(data);
      }
    });

    this.socket.on('join-game-error', (error) => {
      console.log('Socket: join-game-error received', error);
      if (this.joinGameErrorCallback) {
        this.joinGameErrorCallback(error);
      }
    });

    this.socket.on('players-updated', (players) => {
      console.log('Socket: players-updated received', players);
      if (this.playersUpdateCallback) {
        this.playersUpdateCallback(players);
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
    console.log('Socket: creating game', { code, maxPlayers, rooms });
    this.socket.emit('create-game', { code, maxPlayers, rooms });
  }

  public joinGame(gameCode: string, player: Player): void {
    console.log('Socket: joining game', { gameCode, player });
    this.socket.emit('join-game', { gameCode, player });
  }

  public startGame(gameCode: string, players: Player[]): void {
    console.log('Socket: starting game', { gameCode, players });
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

  public offJoinGameSuccess(): void {
    this.joinGameSuccessCallback = null;
  }

  public offJoinGameError(): void {
    this.joinGameErrorCallback = null;
  }

  public offPlayersUpdated(): void {
    this.playersUpdateCallback = null;
  }
}