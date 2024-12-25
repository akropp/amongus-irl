class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 5);
  }

  saveSession(clientId, data) {
    // Verify game exists before saving session
    if (data.gameCode && !global.gameManager.verifyGame(data.gameCode)) {
      console.log('🚫 Attempted to save session for non-existent game:', data.gameCode);
      return false;
    }

    console.log('💾 Saving session:', { clientId, data });
    this.sessions.set(clientId, {
      ...data,
      lastActive: Date.now()
    });
    return true;
  }

  getSession(clientId) {
    const session = this.sessions.get(clientId);
    if (session) {
      // Verify game still exists
      if (session.gameCode && !global.gameManager.verifyGame(session.gameCode)) {
        console.log('🚫 Game no longer exists, clearing session:', session.gameCode);
        this.removeSession(clientId);
        return null;
      }
      session.lastActive = Date.now();
      this.sessions.set(clientId, session);
    }
    return session;
  }

  removeSession(clientId) {
    console.log('🗑️ Removing session:', clientId);
    this.sessions.delete(clientId);
  }

  getGameSessions(gameCode) {
    console.log('🔍 Getting sessions for game:', gameCode);
    return Array.from(this.sessions.entries())
      .filter(([_, session]) => session.gameCode === gameCode)
      .map(([clientId, session]) => ({
        clientId,
        ...session
      }));
  }

  cleanup() {
    const now = Date.now();
    const timeout = 1000 * 60 * 30; // 30 minutes
    
    for (const [clientId, session] of this.sessions.entries()) {
      if (now - session.lastActive > timeout) {
        console.log('🧹 Cleaning up expired session:', clientId);
        this.sessions.delete(clientId);
      }
    }
  }
}

export default new SessionManager();