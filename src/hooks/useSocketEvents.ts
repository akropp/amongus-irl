import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useSocketEvents() {
  const { socketService, updatePlayers, setGameCode, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers) => {
      console.log('Players updated:', updatedPlayers);
      const session = sessionManager.getSession();
      
      if (!session.playerId) return;

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

    const handleGameEnded = () => {
      console.log('Game ended');
      sessionManager.clearSession();
      reset();
      navigate('/', { replace: true });
    };

    const handleReconnectionSuccess = () => {
      console.log('Reconnection successful');
      const session = sessionManager.getSession();
      if (session.gameCode && session.player) {
        setGameCode(session.gameCode);
      }
    };

    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('game-ended', handleGameEnded);
    socketService.socket.on('reconnection-successful', handleReconnectionSuccess);

    return () => {
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('game-ended', handleGameEnded);
      socketService.socket.off('reconnection-successful', handleReconnectionSuccess);
    };
  }, [socketService, updatePlayers, setGameCode, reset, navigate]);
}