import React, { useState, useEffect } from 'react';
import { Users, PlayCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAdminStore } from '../store/adminStore';
import HomeAssistantSetup from '../components/admin/HomeAssistantSetup';
import RoomManager from '../components/admin/RoomManager';
import TaskCreator from '../components/admin/TaskCreator';
import GameSettings from '../components/admin/GameSettings';
import SabotageManager from '../components/admin/SabotageManager';

export default function AdminPanel() {
  const { 
    gameCode,
    players,
    setGameCode,
    removePlayer,
    reset,
    socketService
  } = useGameStore();

  const {
    isConnected: isHAConnected,
    rooms,
  } = useAdminStore();

  // Clear game state when mounting admin panel
  useEffect(() => {
    const savedGameCode = localStorage.getItem('currentGameCode');
    if (savedGameCode) {
      setGameCode(savedGameCode);
    } else {
      reset();
    }
  }, [reset, setGameCode]);

  // Listen for player updates
  useEffect(() => {
    socketService.onPlayersUpdated((updatedPlayers) => {
      useGameStore.getState().updatePlayers(updatedPlayers);
    });
  }, [socketService]);

  const handleCreateGame = () => {
    const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameCode(newGameCode);
    localStorage.setItem('currentGameCode', newGameCode);
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
          Among Us - Admin Panel
        </h1>

        <HomeAssistantSetup />
        <GameSettings />
        <RoomManager />
        <TaskCreator />
        <SabotageManager />

        {gameCode ? (
          <>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Connected Players
              </h2>
              {players.length === 0 ? (
                <p className="text-gray-400">No players have joined yet</p>
              ) : (
                <ul className="space-y-2">
                  {players.map((player) => (
                    <li 
                      key={player.id}
                      className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
                    >
                      <span>{player.name}</span>
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-semibold mb-4">Game Code</h2>
              <p className="text-4xl font-mono font-bold text-purple-400">
                {gameCode}
              </p>
              <p className="mt-2 text-slate-400">
                Share this code with players to join the game
              </p>
            </div>
          </>
        ) : (
          <button
            onClick={handleCreateGame}
            disabled={!isHAConnected || rooms.length === 0}
            className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlayCircle className="w-5 h-5" />
            Create Game
          </button>
        )}

        {(!isHAConnected || rooms.length === 0) && (
          <p className="text-sm text-red-400 text-center">
            {!isHAConnected && "Please connect to Home Assistant first. "}
            {rooms.length === 0 && "Add at least one room before creating the game."}
          </p>
        )}
      </div>
    </div>
  );
}