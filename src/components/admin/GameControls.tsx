import React from 'react';
import { PlayCircle, XCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface GameControlsProps {
  onCreateGame: () => void;
  isSocketInitialized: boolean;
}

export default function GameControls({ onCreateGame, isSocketInitialized }: GameControlsProps) {
  const { gameCode, setGameCode, updatePlayers } = useGameStore();

  const handleEndGame = () => {
    setGameCode(null);
    updatePlayers([]);
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      {!gameCode ? (
        <button
          onClick={onCreateGame}
          disabled={!isSocketInitialized}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <PlayCircle className="w-5 h-5" />
          Create New Game
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-xl">
            Game Code: <span className="font-mono font-bold text-purple-400">{gameCode}</span>
          </p>
          <button
            onClick={handleEndGame}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
          >
            <XCircle className="w-5 h-5" />
            End Game
          </button>
        </div>
      )}
    </div>
  );
}