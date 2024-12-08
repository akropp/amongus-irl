import { io, Socket } from 'socket.io-client';
import { Player } from '../types/game';

const SOCKET_URL = import.meta.env.PROD 
  ? 'https://amongus-irl.onrender.com'
  : 'http://localhost:3000';

class SocketService {
  private static instance: SocketService;
  private socket: Socket;
  private playersUpdateCallback: ((players: Player[]) => void) | null = null;
  private gameCreatedCallback: ((data: { code: string }) => void) | null = null;

  private constructor() {
    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
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
      console.log('Connected to server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
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

  public createGame(code: string, maxPlayers: number, rooms: string[]): void {
    console.log('Creating game:', { code, maxPlayers, rooms });
    this.socket.emit('create-game', { code, maxPlayers, rooms });
  }

  public joinGame(gameCode: string, player: Player): void {
    console.log('Joining game:', { gameCode, player });
    this.socket.emit('join-game', { gameCode, player });
  }

  public onPlayersUpdated(callback: (players: Player[]) => void): void {
    this.playersUpdateCallback = callback;
  }

  public onGameCreated(callback: (data: { code: string }) => void): void {
    this.gameCreatedCallback = callback;
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}

export default SocketService;