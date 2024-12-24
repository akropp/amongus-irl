import { Player, Task } from '../types/game';

export const generateGameCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const assignPlayerTasks = (player: Player, availableTasks: Task[]): Task[] => {
  const numTasks = player.role === 'impostor' ? 2 : 4;
  return [...availableTasks]
    .sort(() => Math.random() - 0.5)
    .slice(0, numTasks)
    .map(task => ({ ...task, completed: false }));
};

export const calculateTaskCompletion = (players: Player[]): number => {
  const crewmates = players.filter(p => p.role === 'crewmate');
  const totalTasks = crewmates.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = crewmates.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.completed).length,
    0
  );
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
};