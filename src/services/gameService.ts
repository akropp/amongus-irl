import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { Game, Player } from '../types/game';

export const gameService = {
  async createGame(code: string, maxPlayers: number): Promise<Game | null> {
    if (!isSupabaseEnabled) return null;

    const { data, error } = await supabase!
      .from('games')
      .insert([{ code, max_players: maxPlayers }])
      .select()
      .single();

    if (error) {
      console.error('Error creating game:', error);
      return null;
    }

    return {
      code: data.code,
      maxPlayers: data.max_players,
      phase: data.phase,
      players: [],
      rooms: []
    };
  },

  async getGame(code: string): Promise<Game | null> {
    if (!isSupabaseEnabled) return null;

    const { data: game, error: gameError } = await supabase!
      .from('games')
      .select('*')
      .eq('code', code)
      .single();

    if (gameError) return null;

    const { data: players } = await supabase!
      .from('game_players')
      .select('*')
      .eq('game_code', code);

    const { data: rooms } = await supabase!
      .from('game_rooms')
      .select('*')
      .eq('game_code', code);

    return {
      code: game.code,
      maxPlayers: game.max_players,
      phase: game.phase,
      players: players || [],
      rooms: rooms?.map(r => r.name) || []
    };
  },

  async addPlayer(gameCode: string, player: Player): Promise<Player | null> {
    if (!isSupabaseEnabled) return null;

    const { data, error } = await supabase!
      .from('game_players')
      .insert([{
        id: player.id,
        game_code: gameCode,
        name: player.name,
        role: player.role,
        is_alive: player.isAlive
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding player:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      role: data.role,
      isAlive: data.is_alive,
      tasks: []
    };
  },

  async removePlayer(gameCode: string, playerId: string): Promise<void> {
    if (!isSupabaseEnabled) return;

    await supabase!
      .from('game_players')
      .delete()
      .eq('game_code', gameCode)
      .eq('id', playerId);
  },

  async updateGamePhase(code: string, phase: string): Promise<void> {
    if (!isSupabaseEnabled) return;

    await supabase!
      .from('games')
      .update({ phase })
      .eq('code', code);
  }
};