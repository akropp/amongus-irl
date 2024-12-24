/*
  # Game persistence schema

  1. New Tables
    - `games`
      - `code` (text, primary key) - Game code
      - `max_players` (int) - Maximum allowed players
      - `phase` (text) - Game phase (lobby, playing, etc)
      - `created_at` (timestamp)
    - `game_players`
      - `id` (uuid, primary key)
      - `game_code` (text, foreign key)
      - `name` (text) - Player name
      - `role` (text) - Player role
      - `is_alive` (boolean)
    - `game_rooms`
      - `id` (uuid, primary key)
      - `game_code` (text, foreign key)
      - `name` (text) - Room name

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Games table
CREATE TABLE IF NOT EXISTS games (
  code text PRIMARY KEY,
  max_players int NOT NULL,
  phase text NOT NULL DEFAULT 'lobby',
  created_at timestamptz DEFAULT now()
);

-- Game players table
CREATE TABLE IF NOT EXISTS game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code text REFERENCES games(code) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'unassigned',
  is_alive boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Game rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code text REFERENCES games(code) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Games are publicly readable"
  ON games FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Players are publicly readable"
  ON game_players FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Rooms are publicly readable"
  ON game_rooms FOR SELECT
  TO public
  USING (true);