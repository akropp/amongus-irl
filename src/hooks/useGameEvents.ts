import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';
import { Player } from '../types/game';

export function useGameEvents() {
  const { socketService, updatePlayers, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      console.log('Players updated:', updatedPlayers);
      const session = sessionManager.getSession();
      
      if (!session.playerId) return;

      // Check if our player still exists in the game
      const stillInGame = updatedPlayers.some(p => p.id === session.playerId);
      
      if (stillInGame) {
        updatePlayers(updatedPlayers);
      } else if (!sessionManager.wasPlayerRemoved()) {
        console.log('Player no longer in game, redirecting to join page');
        sessionManager.clearSession();
        reset();
        navigate('/', { replace: true });
      }
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      console.log('Player removed:', playerId);
      const session = sessionManager.getSession();
      
      if (session.playerId === playerId) {
        sessionManager.clearSession(true);
        reset();
        navigate('/', { replace: true });
      }
    };

    const handleGameEnded = () => {
      console.log('Game ended');
      sessionManager.clearSession();
      reset();
      navigate('/', { replace: true });
    };

    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [socketService, updatePlayers, reset, navigate]);
}