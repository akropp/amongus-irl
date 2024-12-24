import { Socket } from 'socket.io-client';

export interface ReconnectionConfig {
  maxAttempts?: number;
  timeout?: number;
}

export function setupSocketReconnection(socket: Socket, config: ReconnectionConfig = {}) {
  const maxAttempts = config.maxAttempts || 5;
  const timeout = config.timeout || 30000;
  let reconnectAttempts = 0;

  socket.on('connect', () => {
    console.log('Socket connected');
    reconnectAttempts = 0;
    
    const playerId = localStorage.getItem('currentPlayerId');
    const gameCode = localStorage.getItem('currentGameCode');
    
    if (playerId && gameCode) {
      socket.emit('register-player', { 
        gameCode, 
        playerId,
        timestamp: Date.now()
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  socket.on('reconnect_attempt', (attempt) => {
    reconnectAttempts = attempt;
    if (attempt > maxAttempts) {
      console.log('Max reconnection attempts reached');
      socket.disconnect();
    }
  });

  return {
    timeout,
    maxAttempts,
    getReconnectAttempts: () => reconnectAttempts
  };
}