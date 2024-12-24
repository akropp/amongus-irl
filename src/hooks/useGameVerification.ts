import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameVerification() {
  const { socketService, setGameCode } = useGameStore();

  useEffect(() => {
    const verifyGame = () => {
      const storedGameCode = localStorage.getItem('adminGameCode');
      if (storedGameCode) {
        socketService.socket.emit('verify-game', { code: storedGameCode }, (response) => {
          if (response.exists) {
            setGameCode(storedGameCode);
          } else {
            localStorage.removeItem('adminGameCode');
            setGameCode(null);
          }
        });
      }
    };

    if (socketService.socket.connected) {
      verifyGame();
    }

    socketService.socket.on('connect', verifyGame);
    
    return () => {
      socketService.socket.off('connect', verifyGame);
    };
  }, [socketService, setGameCode]);
}