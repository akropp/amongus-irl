export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
  (window.location.hostname.includes('localhost') 
    ? 'http://localhost:3000'
    : 'https://amongus-irl.onrender.com');

export const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling']
};