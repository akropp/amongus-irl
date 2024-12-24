import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAdminStore } from '../store/adminStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { gameCode, players } = useGameStore();
  const { connected } = useAdminStore();
  const path = window.location.pathname;

  // Allow admin access without game code check
  if (path === '/admin') {
    return <>{children}</>;
  }

  // For game routes, check if there's an active game
  if (!gameCode || players.length === 0) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}