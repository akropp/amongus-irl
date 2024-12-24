import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getGameSession, isValidGameSession, clearGameSession } from '../utils/sessionHelpers';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { gameCode, players } = useGameStore();
  const path = window.location.pathname;

  // Always allow admin access
  if (path === '/admin') {
    return <>{children}</>;
  }

  // For game routes, check if there's an active game and valid session
  const session = getGameSession();
  
  // If we're on a game route but don't have a valid session, redirect to join page
  if (!gameCode || !session.gameCode || !session.playerId) {
    clearGameSession();
    return <Navigate to="/" replace />;
  }

  // If we have a session but the player isn't in the game anymore
  if (session.playerId && players.length > 0 && !players.some(p => p.id === session.playerId)) {
    clearGameSession();
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}