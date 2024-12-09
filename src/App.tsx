import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import PlayerGame from './pages/PlayerGame';
import JoinGame from './pages/JoinGame';
import Lobby from './pages/Lobby';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<JoinGame />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/lobby/:playerId" element={<Lobby />} />
          <Route path="/game/:playerId" element={<PlayerGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;