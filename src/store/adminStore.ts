import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HomeAssistantService } from '../services/homeAssistant';
import { Task } from '../types/game';

interface AdminState {
  haToken: string;
  isConnected: boolean;
  rooms: string[];
  tasks: Task[];
  haService: HomeAssistantService | null;
  setHaToken: (token: string) => void;
  connectToHA: (token: string) => void;
  addRoom: (room: string) => void;
  removeRoom: (room: string) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      haToken: '',
      isConnected: false,
      rooms: [],
      tasks: [],
      haService: null,

      setHaToken: (token: string) => set({ haToken: token }),

      connectToHA: (token: string) => {
        try {
          const service = new HomeAssistantService({ token });
          set({ 
            haService: service,
            isConnected: true,
            haToken: token
          });
        } catch (error) {
          console.error('Failed to initialize Home Assistant:', error);
          set({ isConnected: false });
        }
      },

      addRoom: (room: string) => 
        set(state => ({
          rooms: [...state.rooms, room]
        })),

      removeRoom: (room: string) =>
        set(state => ({
          rooms: state.rooms.filter(r => r !== room),
          tasks: state.tasks.filter(t => t.room !== room)
        })),

      addTask: (task: Task) =>
        set(state => ({
          tasks: [...state.tasks, task]
        })),

      removeTask: (taskId: string) =>
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== taskId)
        }))
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        haToken: state.haToken,
        rooms: state.rooms,
        tasks: state.tasks
      })
    }
  )
);