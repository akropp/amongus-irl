import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useGameVerification() {
  const navigate = useNavigate();
  const { socketService, setGameCode, reset } = useGameStore();

  useEffect(() => {
    const verifyGame = () => {
      const session = sessionManager.getSession();
      if (!session.gameCode) return;

      console.log('🔍 Verifying game:', session.gameCode);
      socketService.socket.emit('verify-game', { code: session.gameCode }, (response) => {
        if (!response.exists) {
          console.log('🚫 Game not found, clearing session');
          sessionManager.clearSession();
          setGameCode(null);
          
          // Redirect to appropriate page
          if (session.isAdmin) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      });
    };

    // Verify on mount and reconnection
    if (socketService.socket.connected) {
      verifyGame();
    }

    socketService.socket.on('connect', verifyGame);
    socketService.socket.on('game-error', (error) => {
      if (error.message.includes('Game not found')) {
        console.log('🚫 Game error, clearing session');
        sessionManager.clearSession();
        setGameCode(null);
        reset();
        navigate('/', { replace: true });
      }
    });
    
    return () => {
      socketService.socket.off('connect', verifyGame);
      socketService.socket.off('game-error');
    };
  }, [socketService, setGameCode, reset, navigate]);
}