// Add these methods to the SocketService class

public offJoinGameSuccess(callback: (data: { player: Player, gameCode: string }) => void): void {
  this.joinGameSuccessCallback = null;
}

public offJoinGameError(callback: (error: { message: string }) => void): void {
  this.joinGameErrorCallback = null;
}

public offPlayersUpdated(callback: (players: Player[]) => void): void {
  this.playersUpdateCallback = null;
}