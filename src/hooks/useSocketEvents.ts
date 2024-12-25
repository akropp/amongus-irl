import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useSocketEvents(isAdmin = false) {
  const { socketService, updatePlayers, setGameCode, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGameState = (state) => {
      console.log('Received game state:', state);
      setGameCode(state.gameCode);
      updatePlayers(state.players);
    };

    const handlePlayersUpdate = (players) => {
      console.log('Players updated:', players);
      updatePlayers(players);
    };

    const handleGameError = (error) => {
      console.error('Game error:', error);
      sessionManager.clearSession();
      reset();
      navigate('/', { replace: true });
    };

    socketService.socket.on('game-state', handleGameState);
    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('game-error', handleGameError);

    // Register session if we have one
    if (sessionManager.isValidSession()) {
      const session = sessionManager.getSession();
      socketService.socket.emit('register-session', {
        gameCode: session.gameCode,
        playerId: session.playerId,
        clientId: sessionManager.getClientId(),
        isAdmin: session.isAdmin
      });
    }

    return () => {
      socketService.socket.off('game-state', handleGameState);
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('game-error', handleGameError);
    };
  }, [socketService, updatePlayers, setGameCode, reset, navigate]);
}