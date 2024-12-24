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
      console.log('Socket connected');
      const session = sessionManager.getSession();
      
      if (session.isValid()) {
        console.log('Restoring session:', session);
        socketService.socket.emit('register-session', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId(),
          isAdmin
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
      
      if (!isAdmin) {
        const session = sessionManager.getSession();
        if (!session.playerId) return;

        const stillInGame = updatedPlayers.some(p => p.id === session.playerId);
        if (!stillInGame && !sessionManager.wasPlayerRemoved()) {
          sessionManager.clearSession();
          reset();
          navigate('/', { replace: true });
        }
      }
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      console.log('Player removed:', playerId);
      if (!isAdmin) {
        const session = sessionManager.getSession();
        if (session.playerId === playerId) {
          sessionManager.clearSession(true);
          reset();
          navigate('/', { replace: true });
        }
      }
    };

    const handleGameEnded = () => {
      console.log('Game ended');
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
    };
  }, [socketService, updatePlayers, setGameCode, reset, navigate, isAdmin]);
}