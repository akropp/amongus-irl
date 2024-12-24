import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useSocket } from './useSocket';

export function usePageRefresh() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, players, socketService, phase } = useGameStore();
  const isConnected = useSocket();

  useEffect(() => {
    const checkSession = () => {
      const savedGameCode = localStorage.getItem('currentGameCode');
      const savedPlayerId = localStorage.getItem('currentPlayerId');
      const savedPhase = localStorage.getItem('gamePhase');
      
      // Handle admin page
      if (location.pathname === '/admin') {
        if (savedGameCode) {
          useGameStore.getState().setGameCode(savedGameCode);
        }
        return;
      }

      // Check if the game is actually active by verifying the player exists in the current game
      const isPlayerInGame = savedPlayerId && players.some(p => p.id === savedPlayerId);
      
      // Clear session if player is not in the game anymore
      if (savedGameCode && !isPlayerInGame) {
        localStorage.removeItem('currentGameCode');
        localStorage.removeItem('currentPlayerId');
        localStorage.removeItem('currentPlayer');
        localStorage.removeItem('gamePhase');
        if (location.pathname !== '/') {
          navigate('/');
        }
        return;
      }

      // Handle game not found - redirect to join page
      if (!gameCode && !savedGameCode && location.pathname !== '/') {
        navigate('/');
        return;
      }

      // Handle player pages
      if (location.pathname.includes('/lobby/') || location.pathname.includes('/game/')) {
        if (!isPlayerInGame) {
          navigate('/');
          return;
        }

        // Redirect based on game phase
        if (savedPhase === 'playing' && location.pathname.includes('/lobby/')) {
          navigate(`/game/${savedPlayerId}`);
        } else if (savedPhase === 'lobby' && location.pathname.includes('/game/')) {
          navigate(`/lobby/${savedPlayerId}`);
        }
      }
    };

    // Short timeout to allow socket connection and state updates
    setTimeout(checkSession, 500);
  }, [gameCode, location.pathname, navigate, players, socketService, phase, isConnected]);
}