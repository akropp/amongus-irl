import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketService = useGameStore(state => state.socketService);

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected, ID:', socketService.socket.id);
      setIsConnected(true);

      // Register session on connect if valid
      if (sessionManager.isValidSession()) {
        const session = sessionManager.getSession();
        console.log('Registering session on connect:', session);
        
        socketService.socket.emit('register-session', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId(),
          isAdmin: session.isAdmin
        });
      }
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    // Connect socket if not connected
    if (!socketService.socket.connected) {
      socketService.connect();
    } else {
      setIsConnected(true);
      handleConnect(); // Handle initial connection
    }

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
    };
  }, [socketService]);

  return isConnected;
}