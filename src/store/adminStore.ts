import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HomeAssistantService } from '../services/homeAssistant';
import { Task, Sabotage } from '../types/game';

interface AdminState {
  haToken: string;
  isConnected: boolean;
  rooms: string[];
  tasks: Task[];
  sabotages: Sabotage[];
  haService: HomeAssistantService | null;
  setHaToken: (token: string) => void;
  connectToHA: (token: string) => void;
  addRoom: (room: string) => void;
  removeRoom: (room: string) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  addSabotage: (sabotage: Sabotage) => void;
  removeSabotage: (sabotageId: string) => void;
  updateSabotageStatus: (sabotageId: string, active: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      haToken: '',
      isConnected: false,
      rooms: [],
      tasks: [],
      sabotages: [],
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
          tasks: state.tasks.filter(t => t.room !== room),
          sabotages: state.sabotages.filter(s => s.room !== room)
        })),

      addTask: (task: Task) =>
        set(state => ({
          tasks: [...state.tasks, task]
        })),

      removeTask: (taskId: string) =>
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== taskId)
        })),

      addSabotage: (sabotage: Sabotage) =>
        set(state => ({
          sabotages: [...state.sabotages, sabotage]
        })),

      removeSabotage: (sabotageId: string) =>
        set(state => ({
          sabotages: state.sabotages.filter(s => s.id !== sabotageId)
        })),

      updateSabotageStatus: (sabotageId: string, active: boolean) =>
        set(state => ({
          sabotages: state.sabotages.map(s =>
            s.id === sabotageId ? { ...s, active } : s
          )
        }))
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        haToken: state.haToken,
        rooms: state.rooms,
        tasks: state.tasks,
        sabotages: state.sabotages
      })
    }
  )
);