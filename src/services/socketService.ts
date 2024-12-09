import { io, Socket } from 'socket.io-client';
import { Player } from '../types/game';

// Use environment-aware socket URL
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://amongus-irl.onrender.com'
  : 'http://localhost:3000';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;
  private gameCreatedCallback: ((data: { code: string }) => void) | null = null;
  private joinGameSuccessCallback: ((data: { player: Player, gameCode: string }) => void) | null = null;
  private joinGameErrorCallback: ((error: { message: string }) => void) | null = null;
  private connectionAttempts = 0;
  private readonly maxRetries = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isReconnecting = false;

  private constructor() {
    console.log('Initializing socket connection to:', SOCKET_URL);
    this.initializeSocket();
  }

  private initializeSocket(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected, skipping initialization');
      return;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
    }

    console.log('Creating new socket connection...');
    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: this.maxRetries,
      reconnectionDelay: 2000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      autoConnect: true
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.connectionAttempts = 0;
      this.isReconnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleConnectionError();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.handleConnectionError();
      }
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

  private handleConnectionError(): void {
    this.connectionAttempts++;
    console.log(`Connection attempt ${this.connectionAttempts} failed`);
    
    if (this.connectionAttempts >= this.maxRetries && !this.isReconnecting) {
      this.isReconnecting = true;
      console.log('Maximum connection attempts reached, scheduling reconnect...');
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.connectionAttempts = 0;
        this.initializeSocket();
      }, 5000);
    }
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]): void {
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to connect...');
      this.initializeSocket();
      setTimeout(() => this.createGame(code, maxPlayers, rooms), 1000);
      return;
    }
    console.log('Creating game:', { code, maxPlayers, rooms });
    this.socket.emit('create-game', { code, maxPlayers, rooms });
  }

  public joinGame(gameCode: string, player: Player): void {
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to connect...');
      this.initializeSocket();
      setTimeout(() => this.joinGame(gameCode, player), 1000);
      return;
    }
    console.log('Joining game:', { gameCode, player });
    this.socket.emit('join-game', { gameCode, player });
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
    console.log('Manually triggering reconnection...');
    this.connectionAttempts = 0;
    this.isReconnecting = false;
    this.initializeSocket();
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default SocketService;