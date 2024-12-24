import { io, Socket } from 'socket.io-client';
import { SERVER_URL, SOCKET_OPTIONS } from '../config/constants';

export default class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(SERVER_URL, {
      ...SOCKET_OPTIONS,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Connect immediately
    this.socket.connect();
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}