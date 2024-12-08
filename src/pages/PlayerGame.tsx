import React from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function PlayerGame() {
  const { playerId } = useParams();
  const { players } = useGameStore();
  const player = players.find(p => p.id === playerId);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Player not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {player.name}
          </h1>
          <p className={`text-xl font-semibold ${
            player.role === 'impostor' ? 'text-red-500' : 'text-green-500'
          }`}>
            You are a {player.role}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
          {player.tasks.length === 0 ? (
            <p className="text-gray-400">No tasks assigned yet</p>
          ) : (
            <ul className="space-y-4">
              {player.tasks.map(task => (
                <li
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{task.description}</p>
                    <p className="text-sm text-gray-400">Location: {task.room}</p>
                  </div>
                  {task.completed && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {player.role === 'impostor' && (
          <div className="bg-red-900/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Impostor Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-3 bg-red-600 rounded-lg hover:bg-red-700">
                Sabotage
              </button>
              <button className="p-3 bg-red-600 rounded-lg hover:bg-red-700">
                Report Body
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}