import React, { useState } from 'react';
import { Zap, Plus, X } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { Sabotage } from '../../types/game';

export default function SabotageConfig() {
  const { rooms, sabotages, addSabotage, removeSabotage } = useAdminStore();
  const [name, setName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(rooms[0] || '');
  const [duration, setDuration] = useState(30);

  const handleAddSabotage = () => {
    if (name.trim() && selectedRoom) {
      const newSabotage: Sabotage = {
        id: Math.random().toString(36).substring(2),
        name: name.trim(),
        room: selectedRoom,
        duration,
        active: false
      };
      addSabotage(newSabotage);
      setName('');
      setDuration(30);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-6 h-6" />
        Sabotage Configuration
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sabotage name"
            className="px-3 py-2 bg-slate-700 rounded-md text-white"
          />
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 bg-slate-700 rounded-md text-white"
          >
            {rooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(10, parseInt(e.target.value)))}
              placeholder="Duration (seconds)"
              className="w-full px-3 py-2 bg-slate-700 rounded-md text-white"
              min="10"
            />
            <button
              onClick={handleAddSabotage}
              disabled={!name.trim() || !selectedRoom}
              className="p-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {sabotages.map(sabotage => (
            <div
              key={sabotage.id}
              className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{sabotage.name}</p>
                <p className="text-sm text-gray-400">
                  Location: {sabotage.room} | Duration: {sabotage.duration}s
                </p>
              </div>
              <button
                onClick={() => removeSabotage(sabotage.id)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}