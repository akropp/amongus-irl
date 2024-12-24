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

  // Allow admin access without game code check
  if (path === '/admin') {
    return <>{children}</>;
  }

  // For game routes, check if there's an active game and valid session
  const session = getGameSession();
  
  if (!gameCode || players.length === 0 || !isValidGameSession(session, players)) {
    // Clear invalid session data
    clearGameSession();
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}