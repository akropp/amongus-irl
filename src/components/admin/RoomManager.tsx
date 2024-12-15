import React, { useState } from 'react';
import { Home, X } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

export default function RoomManager() {
  const { rooms, addRoom, removeRoom } = useAdminStore();
  const [roomInput, setRoomInput] = useState('');

  const handleAddRoom = () => {
    if (roomInput.trim()) {
      addRoom(roomInput.trim());
      setRoomInput('');
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Home className="w-6 h-6" />
        Room Management
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-700 rounded-md"
            placeholder="Enter room name"
          />
          <button
            onClick={handleAddRoom}
            className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Add Room
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {rooms.map((room, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 rounded-full"
            >
              <span>{room}</span>
              <button
                onClick={() => removeRoom(room)}
                className="hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}