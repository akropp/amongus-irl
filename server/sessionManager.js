class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  saveSession(clientId, data) {
    this.sessions.set(clientId, {
      ...data,
      lastActive: Date.now()
    });
  }

  getSession(clientId) {
    return this.sessions.get(clientId);
  }

  removeSession(clientId) {
    this.sessions.delete(clientId);
  }

  updateLastActive(clientId) {
    const session = this.sessions.get(clientId);
    if (session) {
      session.lastActive = Date.now();
      this.sessions.set(clientId, session);
    }
  }
}

export default new SessionManager();