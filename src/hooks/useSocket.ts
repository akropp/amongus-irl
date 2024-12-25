import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketService = useGameStore(state => state.socketService);

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected');
      
      // Restore session on connect
      if (sessionManager.isValidSession()) {
        const session = sessionManager.getSession();
        console.log('Restoring session:', session);
        
        socketService.socket.emit('register-session', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId(),
          isAdmin: session.isAdmin
        });
      }
      
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    // Connect socket if not already connected
    if (!socketService.isConnected()) {
      socketService.connect();
    } else {
      setIsConnected(true);
      handleConnect(); // Restore session if already connected
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