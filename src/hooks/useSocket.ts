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

    // Force connect if not already connected
    if (!socketService.socket.connected) {
      console.log('Initiating socket connection...');
      socketService.socket.connect();
    } else {
      setIsConnected(true);
    }

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);
    socketService.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
      socketService.socket.off('connect_error');
    };
  }, [socketService]);

  return isConnected;
}