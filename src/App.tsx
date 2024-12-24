import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import PlayerGame from './pages/PlayerGame';
import JoinGame from './pages/JoinGame';
import Lobby from './pages/Lobby';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-900 text-white">
          <Navigation />
          <Routes>
            <Route path="/" element={<JoinGame />} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/lobby/:playerId" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
            <Route path="/game/:playerId" element={<ProtectedRoute><PlayerGame /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}