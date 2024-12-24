import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useSocket } from './useSocket';

export function usePageRefresh() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, players, phase } = useGameStore();
  const isConnected = useSocket();

  useEffect(() => {
    const checkSession = () => {
      // Handle admin page separately
      if (location.pathname === '/admin') return;

      // Always allow access to join page
      if (location.pathname === '/') return;

      const savedGameCode = localStorage.getItem('currentGameCode');
      const savedPlayerId = localStorage.getItem('currentPlayerId');
      const savedPlayer = localStorage.getItem('currentPlayer');

      // If no saved session, redirect to join page
      if (!savedGameCode || !savedPlayerId || !savedPlayer) {
        if (location.pathname !== '/') {
          navigate('/');
        }
        return;
      }

      // Check if player is in current game
      const isPlayerInGame = players.some(p => p.id === savedPlayerId);
      
      // If player is not in game, clear session and redirect
      if (!isPlayerInGame) {
        localStorage.removeItem('currentGameCode');
        localStorage.removeItem('currentPlayerId');
        localStorage.removeItem('currentPlayer');
        localStorage.removeItem('gamePhase');
        if (location.pathname !== '/') {
          navigate('/');
        }
      }
    };

    if (isConnected) {
      checkSession();
    }
  }, [location.pathname, navigate, players, isConnected]);
}