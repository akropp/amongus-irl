import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

export function useGameState(playerId?: string) {
  const navigate = useNavigate();
  const { 
    gameCode,
    players,
    phase,
    socketService
  } = useGameStore();

  useEffect(() => {
    const handleGameStart = () => {
      useGameStore.getState().setPhase('playing');
      if (playerId) {
        navigate(`/game/${playerId}`);
      }
    };

    const handlePlayersUpdate = (updatedPlayers) => {
      useGameStore.getState().updatePlayers(updatedPlayers);
    };

    socketService.onGameStarted(handleGameStart);
    socketService.onPlayersUpdated(handlePlayersUpdate);

    return () => {
      socketService.socket.off('game-started', handleGameStart);
      socketService.socket.off('players-updated', handlePlayersUpdate);
    };
  }, [socketService, navigate, playerId]);

  return {
    gameCode,
    players,
    phase,
    currentPlayer: playerId ? players.find(p => p.id === playerId) : undefined
  };
}