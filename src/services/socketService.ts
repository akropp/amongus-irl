import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';
import { Player } from '../types/game';

export default class SocketService {
  public socket: Socket;
  private reconnectAttempts: number = 0;
  private MAX_RECONNECT_ATTEMPTS: number = 5;

  constructor() {
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      auth: {
        playerId: localStorage.getItem('currentPlayerId'),
        gameCode: localStorage.getItem('currentGameCode')
      }
    });

    this.setupReconnection();
  }

  private setupReconnection() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      
      const playerId = localStorage.getItem('currentPlayerId');
      const gameCode = localStorage.getItem('currentGameCode');
      
      if (playerId && gameCode) {
        this.socket.emit('register-player', { gameCode, playerId });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt;
      if (attempt > this.MAX_RECONNECT_ATTEMPTS) {
        this.socket.disconnect();
      }
    });
  }

  // ... rest of the existing methods ...
}