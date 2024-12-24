import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useSocket } from './useSocket';
import { getGameSession, clearGameSession } from '../utils/sessionHelpers';

export function usePageRefresh() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, players, socketService } = useGameStore();
  const isConnected = useSocket();

  useEffect(() => {
    const handleReconnection = async () => {
      const session = getGameSession();
      
      // Handle admin page separately
      if (location.pathname === '/admin') return;

      // Always allow access to join page
      if (location.pathname === '/') return;

      if (!session.gameCode || !session.playerId || !session.player) {
        clearGameSession();
        navigate('/');
        return;
      }

      // If we're connected but not in a game, try to rejoin
      if (isConnected && !gameCode && session.gameCode && session.player) {
        socketService.joinGame(session.gameCode, session.player);
      }

      // Only check player existence if we have players loaded
      if (players.length > 0) {
        const isPlayerInGame = players.some(p => p.id === session.playerId);
        if (!isPlayerInGame) {
          clearGameSession();
          navigate('/');
        }
      }
    };

    handleReconnection();
  }, [location.pathname, navigate, players, gameCode, isConnected, socketService]);
}