export interface Player {
  id: string;
  name: string;
  role: 'crewmate' | 'impostor';
  isAlive: boolean;
  tasks: Task[];
}

export interface Task {
  id: string;
  description: string;
  room: string;
  completed: boolean;
}

export interface GameState {
  gameCode: string;
  players: Player[];
  maxPlayers: number;
  phase: 'lobby' | 'playing' | 'meeting' | 'ended';
  rooms: string[];
}