import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Player } from '../types/game';

export function useSocketEvents() {
  const { socketService, updatePlayers, setGameCode, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      console.log('Players updated:', updatedPlayers);
      const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || 'null');
      
      if (!currentPlayer?.id) return;

      const stillInGame = updatedPlayers.some(p => p.id === currentPlayer.id);
      if (stillInGame) {
        updatePlayers(updatedPlayers);
      } else if (!localStorage.getItem('playerRemoved')) {
        console.log('Player no longer in game, redirecting');
        localStorage.clear();
        reset();
        navigate('/', { replace: true });
      }
    };

    const handleGameEnded = () => {
      console.log('Game ended');
      localStorage.clear();
      reset();
      navigate('/', { replace: true });
    };

    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [socketService, updatePlayers, reset, navigate]);
}