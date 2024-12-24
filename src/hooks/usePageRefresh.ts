import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function usePageRefresh() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socketService, gameCode, players } = useGameStore();

  useEffect(() => {
    const handleReconnection = async () => {
      const session = sessionManager.getSession();
      
      // Handle admin page separately
      if (location.pathname === '/admin') {
        if (session.isAdmin && session.gameCode) {
          return; // Stay on admin page
        }
        return; // Allow access to admin page
      }

      // Always allow access to join page
      if (location.pathname === '/') {
        sessionManager.clearSession();
        return;
      }

      if (!session.isValid()) {
        console.log('Invalid session, redirecting to join page');
        sessionManager.clearSession();
        navigate('/', { replace: true });
        return;
      }

      // If we're connected but not in a game, try to rejoin
      if (socketService.socket.connected && !gameCode && session.gameCode) {
        console.log('Attempting to rejoin game');
        socketService.socket.emit('rejoin-game', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId()
        });
      }

      // Only verify player existence if we have players loaded
      if (players.length > 0 && session.playerId) {
        const isPlayerInGame = players.some(p => p.id === session.playerId);
        if (!isPlayerInGame && !sessionManager.wasPlayerRemoved()) {
          console.log('Player not found in game, redirecting to join page');
          sessionManager.clearSession();
          navigate('/', { replace: true });
        }
      }
    };

    handleReconnection();
  }, [location.pathname, navigate, gameCode, players, socketService.socket]);
}