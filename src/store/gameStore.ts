// Update the persist configuration
persist(
  (set, get) => ({
    // ... existing store code ...
  }),
  {
    name: 'game-storage',
    partialize: (state) => ({
      gameCode: state.gameCode,
      players: state.players,
      phase: state.phase,
      rooms: state.rooms,
      tasks: state.tasks,
      maxPlayers: state.maxPlayers // Add this to persist maxPlayers
    })
  }
)