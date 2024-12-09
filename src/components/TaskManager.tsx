import React, { useState } from 'react';
import { ClipboardList, Plus, X } from 'lucide-react';

interface Task {
  id: string;
  description: string;
  room: string;
}

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onRemoveTask: (taskId: string) => void;
  rooms: string[];
}

export default function TaskManager({ tasks, onAddTask, onRemoveTask, rooms }: TaskManagerProps) {
  const [description, setDescription] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(rooms[0] || '');

  const handleAddTask = () => {
    if (description.trim() && selectedRoom) {
      onAddTask({
        id: Math.random().toString(36).substring(2),
        description: description.trim(),
        room: selectedRoom
      });
      setDescription('');
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" />
        Task Management
      </h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="flex-1 px-3 py-2 bg-slate-700 rounded-md"
          />
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 bg-slate-700 rounded-md"
          >
            {rooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
          <button
            onClick={handleAddTask}
            disabled={!description.trim() || !selectedRoom}
            className="p-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{task.description}</p>
                <p className="text-sm text-gray-400">Location: {task.room}</p>
              </div>
              <button
                onClick={() => onRemoveTask(task.id)}
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