// Generate a unique client ID
export function generateClientId() {
  return 'client_' + Math.random().toString(36).substring(2, 15);
}