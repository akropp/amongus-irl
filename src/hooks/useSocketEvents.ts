import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';
import { Player } from '../types/game';

export function useSocketEvents(isAdmin = false) {
  const { socketService, updatePlayers, setGameCode, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected, checking session...');
      const session = sessionManager.getSession();
      
      if (session.isValid()) {
        console.log('Restoring session:', { 
          gameCode: session.gameCode, 
          playerId: session.playerId,
          isAdmin: session.isAdmin 
        });
        
        socketService.socket.emit('register-session', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId(),
          isAdmin: session.isAdmin
        });
      }
    };

    const handleGameState = (state: { gameCode: string; players: Player[]; phase: string }) => {
      console.log('Received game state:', state);
      setGameCode(state.gameCode);
      updatePlayers(state.players);
    };

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      console.log('Players updated:', updatedPlayers);
      updatePlayers(updatedPlayers);
      
      // Only check player existence for non-admin sessions
      if (!isAdmin) {
        const session = sessionManager.getSession();
        if (!session.playerId) return;

        const stillInGame = updatedPlayers.some(p => p.id === session.playerId);
        if (!stillInGame && !sessionManager.wasPlayerRemoved()) {
          console.log('Player no longer in game, redirecting to join page');
          sessionManager.clearSession();
          reset();
          navigate('/', { replace: true });
        }
      }
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      console.log('Player removed:', playerId);
      const session = sessionManager.getSession();
      
      if (!isAdmin && session.playerId === playerId) {
        console.log('Current player was removed, redirecting to join page');
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

    const handleGameError = (error: { message: string }) => {
      console.error('Game error:', error);
      sessionManager.clearSession();
      reset();
      navigate('/', { replace: true });
    };

    // Set up event listeners
    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('game-state', handleGameState);
    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);
    socketService.socket.on('game-error', handleGameError);

    // Initial connection if socket is already connected
    if (socketService.socket.connected) {
      handleConnect();
    }

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('game-state', handleGameState);
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
      socketService.socket.off('game-error', handleGameError);
    };
  }, [socketService, updatePlayers, setGameCode, reset, navigate, isAdmin]);
}