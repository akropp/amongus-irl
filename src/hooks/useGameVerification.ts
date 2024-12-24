import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameVerification() {
  const { socketService, gameCode, setGameCode, reset } = useGameStore();

  useEffect(() => {
    const verifyGame = async () => {
      const storedGameCode = localStorage.getItem('adminGameCode');
      if (storedGameCode) {
        const exists = await socketService.verifyGame(storedGameCode);
        if (!exists) {
          reset();
          localStorage.removeItem('adminGameCode');
        } else if (!gameCode) {
          setGameCode(storedGameCode);
        }
      }
    };

    verifyGame();
  }, [socketService, setGameCode, gameCode, reset]);
}