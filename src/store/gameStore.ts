import { create } from 'zustand';
import { GameState, Player, Task } from '../types/game';
import { HomeAssistantService } from '../services/homeAssistant';
import SocketService from '../services/socketService';

interface GameStore extends GameState {
  haService: HomeAssistantService | null;
  socketService: SocketService;
  tasks: Task[];
  setGameCode: (code: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
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
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameCode: '',
  players: [],
  maxPlayers: 15,
  phase: 'lobby',
  rooms: [],
  tasks: [],
  haService: null,
  socketService: SocketService.getInstance(),

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
    console.log('Adding player:', player);
    get().socketService.joinGame(get().gameCode, player);
    set(state => ({ players: [...state.players, player] }));
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
    
    // Assign real tasks to crewmates
    const updatedCrewmates = crewmates.map(player => ({
      ...player,
      tasks: tasks.map(task => ({ ...task, completed: false }))
    }));

    // Assign fake tasks to impostors
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
  }
}));

// Set up socket listeners
const socketService = SocketService.getInstance();

socketService.onPlayersUpdated((players) => {
  useGameStore.setState({ players });
});

socketService.onGameCreated(({ code }) => {
  console.log('Game created with code:', code);
});

socketService.onGameStarted(({ players }) => {
  useGameStore.setState({ players, phase: 'playing' });
});