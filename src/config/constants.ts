export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://amongus-irl.onrender.com';

export const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  withCredentials: true,
  autoConnect: true
};