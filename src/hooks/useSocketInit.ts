import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function useSocketInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { socketService } = useGameStore();

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected');
      setIsInitialized(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      // Don't set isInitialized to false on disconnect to prevent flashing
    };

    // Ensure socket is connected
    if (!socketService.socket.connected) {
      socketService.socket.connect();
    } else {
      setIsInitialized(true);
    }

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
    };
  }, [socketService]);

  return isInitialized;
}