import { io, Socket } from 'socket.io-client';
import { Player } from '../types/game';

const SOCKET_URL = 'https://amongus-irl.onrender.com';

class SocketService {
  private static instance: SocketService;
  private socket: Socket;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;
  private gameCreatedCallback: ((data: { code: string }) => void) | null = null;
  private connectionAttempts = 0;
  private readonly maxRetries = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {
    console.log('Initializing socket connection to:', SOCKET_URL);
    this.initializeSocket();
  }

  private initializeSocket(): void {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: this.maxRetries,
      reconnectionDelay: 2000,
      timeout: 20000,
      transports: ['websocket', 'polling'], // Try websocket first, then polling
      forceNew: true,
      autoConnect: true
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connectionAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionAttempts++;
      
      if (this.connectionAttempts >= this.maxRetries) {
        console.log('Maximum connection attempts reached, will try to reconnect in 5 seconds');
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.connectionAttempts = 0;
            this.initializeSocket();
          }, 5000);
        }
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try reconnecting
        this.socket.connect();
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
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public createGame(code: string, maxPlayers: number, rooms: string[]): void {
    if (!this.socket.connected) {
      console.log('Socket not connected, attempting to connect...');
      this.socket.connect();
    }
    console.log('Creating game:', { code, maxPlayers, rooms });
    this.socket.emit('create-game', { code, maxPlayers, rooms });
  }

  public joinGame(gameCode: string, player: Player): void {
    if (!this.socket.connected) {
      console.log('Socket not connected, attempting to connect...');
      this.socket.connect();
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
    console.log('Manually triggering reconnection...');
    this.connectionAttempts = 0;
    this.initializeSocket();
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket.disconnect();
  }
}

export default SocketService;