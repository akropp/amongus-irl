import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketService = useGameStore(state => state.socketService);

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const handleError = (error: Error) => {
      console.error('Socket error:', error);
      setIsConnected(false);
    };

    // Connect socket if not already connected
    if (!socketService.isConnected()) {
      socketService.connect();
    } else {
      setIsConnected(true);
    }

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);
    socketService.socket.on('connect_error', handleError);

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
      socketService.socket.off('connect_error', handleError);
    };
  }, [socketService]);

  return isConnected;
}