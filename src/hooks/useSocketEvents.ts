import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useSocketEvents() {
  const { socketService, updatePlayers, setGameCode, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGameState = (state) => {
      console.log('Received game state:', state);
      setGameCode(state.gameCode);
      updatePlayers(state.players || []);

      // Navigate to correct page based on session
      const session = sessionManager.getSession();
      if (session.isAdmin) {
        if (!window.location.pathname.includes('admin')) {
          navigate('/admin', { replace: true });
        }
      } else if (session.playerId && !window.location.pathname.includes(session.playerId)) {
        navigate(`/lobby/${session.playerId}`, { replace: true });
      }
    };

    const handlePlayersUpdate = (players) => {
      console.log('Players updated:', players);
      updatePlayers(players);
      
      // Verify player still in game
      const session = sessionManager.getSession();
      if (session.playerId && !players.some(p => p.id === session.playerId)) {
        if (!sessionManager.wasPlayerRemoved()) {
          sessionManager.clearSession();
          reset();
          navigate('/', { replace: true });
        }
      }
    };

    const handlePlayerRemoved = ({ playerId }) => {
      const session = sessionManager.getSession();
      if (session.playerId === playerId) {
        sessionManager.clearSession(true);
        reset();
        navigate('/', { replace: true });
      }
    };

    const handleGameEnded = () => {
      console.log('Game ended, clearing session');
      sessionManager.clearSession();
      reset();
      navigate('/', { replace: true });
    };

    const handleError = (error) => {
      console.error('Game error:', error);
      // Clear session and reset state for any game-related errors
      if (error.message.includes('Game') || error.message.includes('game')) {
        console.log('Game error occurred, clearing session');
        sessionManager.clearSession();
        reset();
        navigate('/', { replace: true });
      }
    };

    // Set up event listeners
    socketService.socket.on('game-state', handleGameState);
    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);
    socketService.socket.on('game-error', handleError);

    return () => {
      socketService.socket.off('game-state', handleGameState);
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
      socketService.socket.off('game-error', handleError);
    };
  }, [socketService.socket, updatePlayers, setGameCode, reset, navigate]);
}