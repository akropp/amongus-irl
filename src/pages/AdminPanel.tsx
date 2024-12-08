import React, { useState, useEffect } from 'react';
import { Settings, Users, PlayCircle, Key } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function AdminPanel() {
  const [playerCount, setPlayerCount] = useState(4);
  const [roomInput, setRoomInput] = useState('');
  const [haToken, setHaToken] = useState('');
  const { 
    setMaxPlayers, 
    setRooms, 
    rooms, 
    gameCode,
    players, 
    setGameCode,
    removePlayer,
    initializeHomeAssistant,
    haService 
  } = useGameStore();

  // Clear game code when component unmounts
  useEffect(() => {
    return () => setGameCode('');
  }, [setGameCode]);

  const handleCreateGame = () => {
    setMaxPlayers(playerCount);
    // Generate a 6-character game code
    const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Generated game code:', newGameCode); // Debug log
    setGameCode(newGameCode);
  };

  const addRoom = () => {
    if (roomInput.trim()) {
      setRooms([...rooms, roomInput.trim()]);
      setRoomInput('');
    }
  };

  const handleConnectHA = () => {
    if (haToken) {
      initializeHomeAssistant(haToken);
    }
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

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Key className="w-6 h-6" />
            Home Assistant Connection
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Home Assistant Token
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={haToken}
                  onChange={(e) => setHaToken(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 rounded-md"
                  placeholder="Enter your Home Assistant token"
                />
                <button
                  onClick={handleConnectHA}
                  disabled={!haToken}
                  className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Connect
                </button>
              </div>
            </div>
            {haService && (
              <p className="text-green-400 text-sm">✓ Connected to Home Assistant</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Game Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Players (4-15)
              </label>
              <input
                type="number"
                min="4"
                max="15"
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Add Rooms
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 rounded-md"
                  placeholder="Enter room name"
                />
                <button
                  onClick={addRoom}
                  className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Added Rooms:</h3>
              <div className="flex flex-wrap gap-2">
                {rooms.map((room, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600 rounded-full text-sm"
                  >
                    {room}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {gameCode ? (
          <>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Connected Players ({players.length}/{playerCount})
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
              <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                Game Code
              </h2>
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
            disabled={!haService || rooms.length === 0}
            className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlayCircle className="w-5 h-5" />
            Create Game
          </button>
        )}

        {(!haService || rooms.length === 0) && (
          <p className="text-sm text-red-400 text-center">
            {!haService && "Please connect to Home Assistant first. "}
            {rooms.length === 0 && "Add at least one room before creating the game."}
          </p>
        )}
      </div>
    </div>
  );
}