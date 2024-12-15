import { io, Socket } from 'socket.io-client';
import { Player } from '../types/game';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;
  private gameCreatedCallback: ((data: { code: string }) => void) | null = null;
  private joinGameSuccessCallback: ((data: { player: Player, gameCode: string }) => void) | null = null;
  private joinGameErrorCallback: ((error: { message: string }) => void) | null = null;

  constructor() {
    console.log('Initializing socket service with URL:', SOCKET_URL);
    this.initializeSocket();
  }

  private initializeSocket(): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('players-updated', (players: Player[]) => {
      console.log('Players updated:', players);
      if (this.playersUpdateCallback) {
        this.playersUpdateCallback(players);
      }
    });

    this.socket.on('game-created', (data: { code: string }) => {
      console.log('Game created:', data);
      if (this.gameCreatedCallback) {
        this.gameCreatedCallback(data);
      }
    });

    this.socket.on('join-game-success', (data: { player: Player, gameCode: string }) => {
      console.log('Join game success:', data);
      if (this.joinGameSuccessCallback) {
        this.joinGameSuccessCallback(data);
      }
    });

    this.socket.on('join-game-error', (error: { message: string }) => {
      console.error('Join game error:', error);
      if (this.joinGameErrorCallback) {
        this.joinGameErrorCallback(error);
      }
    });
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]): void {
    console.log('Creating game:', { code, maxPlayers, rooms });
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to reconnect...');
      this.initializeSocket();
      setTimeout(() => this.createGame(code, maxPlayers, rooms), 1000);
      return;
    }
    this.socket.emit('create-game', { code, maxPlayers, rooms });
  }

  public joinGame(gameCode: string, player: Player): void {
    console.log('Joining game:', { gameCode, player });
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to reconnect...');
      this.initializeSocket();
      setTimeout(() => this.joinGame(gameCode, player), 1000);
      return;
    }
    this.socket.emit('join-game', { gameCode, player });
  }

  public startGame(gameCode: string, players: Player[]): void {
    console.log('Starting game:', { gameCode, players });
    if (!this.socket?.connected) return;
    this.socket.emit('start-game', { gameCode, players });
  }

  public onPlayersUpdated(callback: (players: Player[]) => void): void {
    this.playersUpdateCallback = callback;
  }

  public onGameCreated(callback: (data: { code: string }) => void): void {
    this.gameCreatedCallback = callback;
  }

  public onJoinGameSuccess(callback: (data: { player: Player, gameCode: string }) => void): void {
    this.joinGameSuccessCallback = callback;
  }

  public onJoinGameError(callback: (error: { message: string }) => void): void {
    this.joinGameErrorCallback = callback;
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  public reconnect(): void {
    console.log('Manually reconnecting socket...');
    this.initializeSocket();
  }
}

export default SocketService;