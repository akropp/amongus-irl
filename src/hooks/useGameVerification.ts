import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useGameVerification() {
  const { socketService, setGameCode } = useGameStore();

  useEffect(() => {
    const verifyGame = () => {
      const session = sessionManager.getSession();
      if (session.isAdmin && session.gameCode) {
        socketService.socket.emit('verify-game', { code: session.gameCode }, (response) => {
          if (!response.exists) {
            sessionManager.clearSession();
            setGameCode(null);
          }
        });
      }
    };

    // Verify on mount and reconnection
    if (socketService.socket.connected) {
      verifyGame();
    }

    socketService.socket.on('connect', verifyGame);
    socketService.socket.on('game-ended', () => {
      sessionManager.clearSession();
      setGameCode(null);
    });
    
    return () => {
      socketService.socket.off('connect', verifyGame);
      socketService.socket.off('game-ended');
    };
  }, [socketService, setGameCode]);
}