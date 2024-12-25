import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Sabotage } from '../types/game';

interface GameSettings {
  maxPlayers: number;
  rooms: string[];
  tasks: Task[];
  sabotages: Sabotage[];
  setMaxPlayers: (count: number) => void;
  setRooms: (rooms: string[]) => void;
  addRoom: (room: string) => void;
  removeRoom: (room: string) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setSabotages: (sabotages: Sabotage[]) => void;
  addSabotage: (sabotage: Sabotage) => void;
  removeSabotage: (sabotageId: string) => void;
}

export const useGameSettings = create<GameSettings>()(
  persist(
    (set) => ({
      maxPlayers: 15,
      rooms: [],
      tasks: [],
      sabotages: [],
      
      setMaxPlayers: (count) => set({ maxPlayers: count }),
      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      removeRoom: (room) => set((state) => ({ 
        rooms: state.rooms.filter(r => r !== room),
        tasks: state.tasks.filter(t => t.room !== room),
        sabotages: state.sabotages.filter(s => s.room !== room)
      })),
      
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      })),
      
      setSabotages: (sabotages) => set({ sabotages }),
      addSabotage: (sabotage) => set((state) => ({
        sabotages: [...state.sabotages, sabotage]
      })),
      removeSabotage: (sabotageId) => set((state) => ({
        sabotages: state.sabotages.filter(s => s.id !== sabotageId)
      }))
    }),
    {
      name: 'game-settings'
    }
  )
);