import React from 'react';
import { Users } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function MaxPlayersConfig() {
  const { maxPlayers, setMaxPlayers } = useGameStore();

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Player Limit
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium mb-2">
            Maximum Players
          </label>
          <input
            type="number"
            id="maxPlayers"
            min="4"
            max="15"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Math.min(15, Math.max(4, parseInt(e.target.value))))}
            className="w-full px-3 py-2 bg-slate-700 rounded-md text-white"
          />
          <p className="mt-1 text-sm text-gray-400">
            Minimum: 4 players, Maximum: 15 players
          </p>
        </div>
      </div>
    </div>
  );
}