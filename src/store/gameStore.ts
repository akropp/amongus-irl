import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Task } from '../types/game';
import { HomeAssistantService } from '../services/homeAssistant';
import SocketService from '../services/socketService';

interface GameStore extends GameState {
  haService: HomeAssistantService | null;
  socketService: SocketService;
  setGameCode: (code: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayers: (players: Player[]) => void;
  setMaxPlayers: (count: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  updatePlayerTask: (playerId: string, taskId: string, completed: boolean) => void;
  setRooms: (rooms: string[]) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  assignRoles: () => void;
  assignTasks: () => void;
  initializeHomeAssistant: (token: string) => void;
  startGame: () => void;
  reset: () => void;
}

const initialState = {
  gameCode: '',
  players: [],
  maxPlayers: 15,
  phase: 'lobby' as const,
  rooms: [],
  tasks: [],
  haService: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      socketService: new SocketService(),

      setGameCode: (code) => {
        const normalizedCode = code.trim().toUpperCase();
        set({ gameCode: normalizedCode });
        
        if (normalizedCode) {
          get().socketService.createGame(
            normalizedCode,
            get().maxPlayers,
            get().rooms
          );
        }
      },
      
      addPlayer: (player) => {
        set(state => ({
          players: state.players.find(p => p.id === player.id)
            ? state.players
            : [...state.players, player]
        }));
      },
      
      updatePlayers: (players) => {
        set({ players });
      },
        
      removePlayer: (playerId) =>
        set(state => ({
          players: state.players.filter(p => p.id !== playerId)
        })),
        
      setMaxPlayers: (count) => set({ maxPlayers: count }),
      
      setPhase: (phase) => set({ phase }),
      
      updatePlayerTask: (playerId, taskId, completed) =>
        set(state => ({
          players: state.players.map(player =>
            player.id === playerId
              ? {
                  ...player,
                  tasks: player.tasks.map(task =>
                    task.id === taskId ? { ...task, completed } : task
                  )
                }
              : player
          )
        })),
        
      setRooms: (rooms) => set({ rooms }),

      addTask: (task) =>
        set(state => ({
          tasks: [...state.tasks, task]
        })),

      removeTask: (taskId) =>
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        })),

      assignRoles: () => {
        const { players } = get();
        const numPlayers = players.length;
        const numImpostors = Math.max(1, Math.floor(numPlayers / 5));
        
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        const updatedPlayers = shuffledPlayers.map((player, index) => ({
          ...player,
          role: index < numImpostors ? 'impostor' : 'crewmate'
        }));

        set({ players: updatedPlayers });
      },

      assignTasks: () => {
        const { players, tasks } = get();
        const crewmates = players.filter(p => p.role === 'crewmate');
        const impostors = players.filter(p => p.role === 'impostor');
        
        const updatedCrewmates = crewmates.map(player => ({
          ...player,
          tasks: tasks.map(task => ({ ...task, completed: false }))
        }));

        const updatedImpostors = impostors.map(player => ({
          ...player,
          tasks: tasks
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.ceil(tasks.length * 0.7))
            .map(task => ({ ...task, completed: false }))
        }));

        set({ players: [...updatedCrewmates, ...updatedImpostors] });
      },

      startGame: () => {
        const store = get();
        store.assignRoles();
        store.assignTasks();
        store.setPhase('playing');
        store.socketService.startGame(store.gameCode, store.players);
      },

      initializeHomeAssistant: (token) => {
        try {
          const service = new HomeAssistantService({ token });
          set({ haService: service });
        } catch (error) {
          console.error('Failed to initialize Home Assistant:', error);
        }
      },

      reset: () => {
        const socketService = get().socketService;
        set({ ...initialState, socketService });
      }
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        gameCode: state.gameCode,
        players: state.players,
        phase: state.phase,
        rooms: state.rooms,
        tasks: state.tasks,
        maxPlayers: state.maxPlayers
      })
    }
  )
);