import React from 'react';
import { ClipboardList, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types/game';

interface TaskListProps {
  tasks: Task[];
  onTaskComplete?: (taskId: string) => void;
  showLocation?: boolean;
}

export function TaskList({ tasks, onTaskComplete, showLocation = true }: TaskListProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5" />
        Tasks ({tasks.filter(t => t.completed).length}/{tasks.length})
      </h2>

      {tasks.length === 0 ? (
        <p className="text-gray-400">No tasks assigned yet</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(task => (
            <li
              key={task.id}
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
            >
              <div>
                <p className="font-medium">{task.description}</p>
                {showLocation && (
                  <p className="text-sm text-gray-400">Location: {task.room}</p>
                )}
              </div>
              {onTaskComplete && !task.completed && (
                <button
                  onClick={() => onTaskComplete(task.id)}
                  className="text-green-400 hover:text-green-300"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              )}
              {task.completed && (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}