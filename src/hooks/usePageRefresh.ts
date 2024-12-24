import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export function usePageRefresh() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, players } = useGameStore();

  useEffect(() => {
    // Check if we're on an admin page
    if (location.pathname === '/admin') {
      return; // Admin page doesn't need game state checks
    }

    // For player pages, check if we have valid game state
    const savedGameCode = localStorage.getItem('currentGameCode');
    
    if (!gameCode && savedGameCode) {
      useGameStore.getState().setGameCode(savedGameCode);
    } else if (!gameCode && !savedGameCode) {
      navigate('/'); // Redirect to join page if no game code exists
      return;
    }

    // If we're on a player page but have no players, redirect to join
    if (location.pathname.includes('/lobby/') || location.pathname.includes('/game/')) {
      if (players.length === 0) {
        navigate('/');
      }
    }
  }, [gameCode, location.pathname, navigate, players]);
}