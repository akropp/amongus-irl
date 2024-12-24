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

    // Handle game not found - only redirect if no saved state
    if (!gameCode && !savedGameCode && !savedPlayerId) {
      if (location.pathname !== '/') {
        navigate('/');
      }
      return;
    }

    // Handle player pages
    if (location.pathname.includes('/lobby/') || location.pathname.includes('/game/')) {
      // Only reconnect if we have saved state and aren't already connected
      if (isConnected && savedGameCode && savedPlayerId) {
        const savedPlayerData = localStorage.getItem('currentPlayer');
        if (savedPlayerData) {
          const player = JSON.parse(savedPlayerData);
          const currentPlayer = players.find(p => p.id === savedPlayerId);
          
          // Only rejoin if player is not already in the game
          if (!currentPlayer) {
            socketService.joinGame(savedGameCode, player);
          }
        }
      }

      // Redirect based on game phase
      if (savedPhase === 'playing' && location.pathname.includes('/lobby/')) {
        navigate(`/game/${savedPlayerId}`);
      } else if (savedPhase === 'lobby' && location.pathname.includes('/game/')) {
        navigate(`/lobby/${savedPlayerId}`);
      }
    }
  }, [gameCode, location.pathname, navigate, players, socketService, phase, isConnected]);
}