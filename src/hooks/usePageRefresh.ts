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

    // Check if the game is actually active by verifying the player exists in the current game
    const isPlayerInGame = savedPlayerId && players.some(p => p.id === savedPlayerId);
    const shouldClearSession = savedGameCode && !isPlayerInGame;

    // Clear session if player is not in the game anymore
    if (shouldClearSession) {
      localStorage.removeItem('currentGameCode');
      localStorage.removeItem('currentPlayerId');
      localStorage.removeItem('currentPlayer');
      localStorage.removeItem('gamePhase');
      if (location.pathname !== '/') {
        navigate('/');
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
      if (isConnected && savedGameCode && savedPlayerId && !isPlayerInGame) {
        const savedPlayerData = localStorage.getItem('currentPlayer');
        if (savedPlayerData) {
          const player = JSON.parse(savedPlayerData);
          socketService.joinGame(savedGameCode, player);
        } else {
          // If no player data, redirect to join page
          navigate('/');
        }
      }

      // Redirect based on game phase only if player is actually in game
      if (isPlayerInGame) {
        if (savedPhase === 'playing' && location.pathname.includes('/lobby/')) {
          navigate(`/game/${savedPlayerId}`);
        } else if (savedPhase === 'lobby' && location.pathname.includes('/game/')) {
          navigate(`/lobby/${savedPlayerId}`);
        }
      } else if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [gameCode, location.pathname, navigate, players, socketService, phase, isConnected]);
}