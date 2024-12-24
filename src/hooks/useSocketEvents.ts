import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';
import { Player } from '../types/game';

export function useSocketEvents() {
  const { socketService, updatePlayers, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected');
      const session = sessionManager.getSession();
      
      if (session.isValid) {
        socketService.socket.emit('register-player', {
          gameCode: session.gameCode,
          playerId: session.playerId
        });
      }
    };

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      const session = sessionManager.getSession();
      if (!session.playerId) return;

      const stillInGame = updatedPlayers.some(p => p.id === session.playerId);
      if (stillInGame) {
        updatePlayers(updatedPlayers);
      } else if (!sessionManager.wasPlayerRemoved()) {
        sessionManager.clearSession();
        reset();
        navigate('/', { replace: true });
      }
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      const session = sessionManager.getSession();
      if (session.playerId === playerId) {
        sessionManager.clearSession(true);
        reset();
        navigate('/', { replace: true });
      }
    };

    const handleGameEnded = () => {
      sessionManager.clearSession();
      reset();
      navigate('/', { replace: true });
    };

    // Set up event listeners
    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);

    // Initial connection if socket is already connected
    if (socketService.socket.connected) {
      handleConnect();
    }

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [socketService, updatePlayers, reset, navigate]);
}