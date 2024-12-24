export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const SOCKET_OPTIONS = {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  withCredentials: true
};