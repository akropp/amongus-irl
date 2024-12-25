import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export function useGameVerification() {
  const navigate = useNavigate();
  const { socketService, gameCode, setGameCode, reset } = useGameStore();

  useEffect(() => {
    const verifyGame = () => {
      if (!gameCode) return;

      console.log('🔍 Verifying game:', gameCode);
      socketService.socket.emit('verify-game', { code: gameCode }, (response) => {
        if (!response.exists) {
          console.log('🚫 Game not found, resetting state');
          reset();
          navigate('/', { replace: true });
        }
      });
    };

    if (socketService.socket.connected) {
      verifyGame();
    }

    socketService.socket.on('connect', verifyGame);
    socketService.socket.on('game-error', (error) => {
      if (error.message.includes('Game not found')) {
        console.log('🚫 Game error, resetting state');
        reset();
        navigate('/', { replace: true });
      }
    });
    
    return () => {
      socketService.socket.off('connect', verifyGame);
      socketService.socket.off('game-error');
    };
  }, [socketService, gameCode, setGameCode, reset, navigate]);
}