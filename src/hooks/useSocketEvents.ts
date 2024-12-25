import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useSocketEvents() {
  const { socketService, updatePlayers, setGameCode, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected, checking session');
      const session = sessionManager.getSession();
      
      if (sessionManager.isValidSession()) {
        console.log('Restoring session:', session);
        socketService.socket.emit('register-session', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId(),
          isAdmin: session.isAdmin
        });
      }
    };

    const handleGameState = (state) => {
      console.log('Received game state:', state);
      setGameCode(state.gameCode);
      updatePlayers(state.players);
    };

    const handlePlayersUpdate = (players) => {
      console.log('Players updated:', players);
      const session = sessionManager.getSession();
      
      if (!session.playerId) return;

      // Check if player still exists in game
      const stillInGame = players.some(p => p.id === session.playerId);
      if (!stillInGame && !sessionManager.wasPlayerRemoved()) {
        console.log('Player no longer in game');
        sessionManager.clearSession();
        reset();
        navigate('/', { replace: true });
      } else {
        updatePlayers(players);
      }
    };

    const handlePlayerRemoved = ({ playerId }) => {
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

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('game-state', handleGameState);
    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);

    // Initial connection if needed
    if (socketService.socket.connected) {
      handleConnect();
    }

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('game-state', handleGameState);
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [socketService, updatePlayers, setGameCode, reset, navigate]);
}