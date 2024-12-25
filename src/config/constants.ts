import { ManagerOptions, SocketOptions } from 'socket.io-client';

// Get the current hostname
const getCurrentHost = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
};

// Determine server URL based on environment
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
  (getCurrentHost().includes('localhost') 
    ? 'http://localhost:3000'
    : 'https://amongus-irl.onrender.com');

export const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: false
};

console.log('🌐 Socket server URL:', SERVER_URL);