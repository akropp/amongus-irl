import { Player } from '../types/game';

export function savePlayerSession(gameCode: string, player: Player) {
  localStorage.setItem('currentGameCode', gameCode);
  localStorage.setItem('currentPlayerId', player.id);
  localStorage.setItem('currentPlayer', JSON.stringify(player));
  localStorage.setItem('gamePhase', 'lobby');
}

export function getPlayerSession() {
  const gameCode = localStorage.getItem('currentGameCode');
  const playerId = localStorage.getItem('currentPlayerId');
  const player = JSON.parse(localStorage.getItem('currentPlayer') || 'null');
  const phase = localStorage.getItem('gamePhase');

  return {
    gameCode,
    playerId,
    player,
    phase,
    isValid: !!(gameCode && playerId && player)
  };
}

export function clearPlayerSession(wasRemoved = false) {
  if (wasRemoved) {
    localStorage.setItem('playerRemoved', 'true');
  }
  localStorage.removeItem('currentGameCode');
  localStorage.removeItem('currentPlayerId');
  localStorage.removeItem('currentPlayer');
  localStorage.removeItem('gamePhase');
}