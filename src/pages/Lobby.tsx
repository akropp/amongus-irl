import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, PlayCircle, Hash } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { usePageRefresh } from '../hooks/usePageRefresh';

export default function Lobby() {
  const { playerId } = useParams();
  const { players, phase, gameCode } = useGameStore();
  const navigate = useNavigate();
  
  // Handle page refresh and navigation
  usePageRefresh();

  const currentPlayer = players.find(p => p.id === playerId);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          Player not found. Please rejoin the game.
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    navigate(`/game/${playerId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">
            Game Lobby
          </h1>

          {/* Game Code Display */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/50 rounded-lg border border-purple-500">
              <Hash className="w-5 h-5 text-purple-400" />
              <span className="font-mono text-xl font-bold text-purple-400">{gameCode}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players in Lobby
            </h2>
            <div className="space-y-2">
              {players.map(player => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg ${
                    player.id === currentPlayer.id
                      ? 'bg-purple-900/50 border border-purple-500'
                      : 'bg-slate-700'
                  }`}
                >
                  <span className="font-medium">{player.name}</span>
                  {player.id === currentPlayer.id && (
                    <span className="ml-2 text-sm text-purple-400">(You)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-gray-400">
            <PlayCircle className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p>Waiting for the game to start...</p>
          </div>
        </div>
      </div>
    </div>
  );
}