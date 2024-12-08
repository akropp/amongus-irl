import { io, Socket } from 'socket.io-client';
import { Player } from '../types/game';

const SOCKET_URL = 'https://amongus-irl.onrender.com';

class SocketService {
  private static instance: SocketService;
  private socket: Socket;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;
  private gameCreatedCallback: ((data: { code: string }) => void) | null = null;
  private connectionAttempts = 0;
  private readonly maxRetries = 3;

  private constructor() {
    console.log('Initializing socket connection to:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: this.maxRetries,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
      transports: ['polling', 'websocket'],
      path: '/socket.io',
      withCredentials: true
    });

    this.setupListeners();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private setupListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to server with socket ID:', this.socket.id);
      this.connectionAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionAttempts++;
      
      if (this.connectionAttempts >= this.maxRetries) {
        console.error('Max connection attempts reached');
        this.socket.disconnect();
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

    this.socket.on('error', (error: { message: string }) => {
      console.error('Server error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server');
    });
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]): void {
    if (!this.socket.connected) {
      console.error('Socket not connected. Cannot create game.');
      return;
    }
    
    console.log('Creating game:', { code, maxPlayers, rooms });
    this.socket.emit('create-game', { code, maxPlayers, rooms });
  }

  public joinGame(gameCode: string, player: Player): void {
    if (!this.socket.connected) {
      console.error('Socket not connected. Cannot join game.');
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

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public reconnect(): void {
    if (!this.socket.connected && this.connectionAttempts < this.maxRetries) {
      console.log('Attempting to reconnect...');
      this.socket.connect();
    }
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}

export default SocketService;