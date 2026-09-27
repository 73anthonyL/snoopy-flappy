/**
 * Snoopy's Flying Ace - Types
 */

export type GameState = 'TITLE' | 'PLAYING' | 'GAME_OVER';

export type Difficulty = 'EASY' | 'CLASSIC' | 'ACE';

export interface Skin {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  unlockScore: number;
  color: string;
  accentColor: string;
  icon: string;
}

export interface FlightRecord {
  id: string;
  date: string;
  score: number;
  biscuits: number;
  woodstocks: number;
  durationSeconds: number;
  difficulty: Difficulty;
  skinId: string;
  cause: string;
}

export interface PilotStats {
  highScore: number;
  totalFlights: number;
  totalScore: number;
  totalBiscuits: number;
  totalWoodstocks: number;
  totalFlightTimeSeconds: number;
  unlockedSkins: string[];
  history: FlightRecord[];
}

export interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
  passed: boolean;
  type: 'TREE' | 'BOOTH' | 'PIANO' | 'RED_BARON';
  hasBiscuit?: boolean;
  biscuitY?: number;
  biscuitCollected?: boolean;
  hasWoodstock?: boolean;
  woodstockY?: number;
  woodstockRescued?: boolean;
}

export interface FlyingWoodstockHazard {
  id: string;
  x: number;
  y: number;
  baseY: number;
  speed: number;
  phase: number;
  amplitude: number;
  passed: boolean;
  type: 'ERRATIC_WOODSTOCK' | 'KITE_WIND_GUST';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface Medal {
  id: string;
  title: string;
  description: string;
  quote: string;
  icon: string;
  isUnlocked: (stats: PilotStats) => boolean;
}
