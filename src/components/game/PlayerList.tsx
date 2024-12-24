import React from 'react';
import { Users } from 'lucide-react';
import { Player } from '../../types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
  onRemovePlayer?: (playerId: string) => void;
  showControls?: boolean;
}

export function PlayerList({ 
  players, 
  currentPlayerId,
  onRemovePlayer,
  showControls = false 
}: PlayerListProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Players ({players.length})
      </h2>
      
      {players.length === 0 ? (
        <p className="text-gray-400">No players have joined yet</p>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => (
            <li 
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                player.id === currentPlayerId 
                  ? 'bg-purple-900/50 border border-purple-500'
                  : 'bg-slate-700'
              }`}
            >
              <span>
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="ml-2 text-sm text-purple-400">(You)</span>
                )}
              </span>
              {showControls && onRemovePlayer && (
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}