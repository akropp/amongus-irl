import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketService = useGameStore(state => state.socketService);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);

    // Set initial connection state
    setIsConnected(socketService.isConnected());

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
    };
  }, [socketService]);

  return isConnected;
}