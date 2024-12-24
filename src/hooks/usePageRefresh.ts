import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export function usePageRefresh() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, players, socketService } = useGameStore();

  useEffect(() => {
    // Check if we're on an admin page
    if (location.pathname === '/admin') {
      return; // Admin page doesn't need game state checks
    }

    // For player pages, check if we have valid game state
    const savedGameCode = localStorage.getItem('currentGameCode');
    const savedPlayerId = localStorage.getItem('currentPlayerId');
    
    if (!gameCode && savedGameCode) {
      useGameStore.getState().setGameCode(savedGameCode);
    }

    // If we're on a player page but have no players, try to reconnect
    if (location.pathname.includes('/lobby/') || location.pathname.includes('/game/')) {
      if (players.length === 0 && savedGameCode && savedPlayerId) {
        const savedPlayerData = localStorage.getItem('currentPlayer');
        if (savedPlayerData) {
          const player = JSON.parse(savedPlayerData);
          socketService.joinGame(savedGameCode, player);
        } else {
          navigate('/');
        }
      } else if (!savedPlayerId) {
        navigate('/');
      }
    }
  }, [gameCode, location.pathname, navigate, players, socketService]);
}