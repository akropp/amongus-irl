import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useSocketInit() {
  const { socketService } = useGameStore();

  useEffect(() => {
    // Ensure socket is connected
    if (!socketService.socket.connected) {
      socketService.socket.connect();
    }

    return () => {
      // Don't disconnect on cleanup - socket should persist
    };
  }, [socketService]);

  return socketService.socket.connected;
}