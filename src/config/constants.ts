// For production, use the Render/Railway/etc URL where your server is deployed
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://real-life-among-us-server.onrender.com';

export const SOCKET_OPTIONS = {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  withCredentials: true
};