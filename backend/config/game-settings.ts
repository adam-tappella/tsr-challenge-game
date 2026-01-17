/**
 * Magna TSR Challenge - Game Settings
 * Configurable game parameters
 */

import type { GameConfig } from '../types/game.js';

/**
 * Default game configuration
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  /** Number of teams (10-20) */
  teamCount: 15,
  
  /** Duration of each round in seconds (10 minutes default) */
  roundDurationSeconds: 600,
  
  /** Admin PIN for facilitator access */
  adminPin: '1234',  // TODO: Move to environment variable for production
};

/**
 * Game constraints
 */
export const GAME_CONSTRAINTS = {
  /** Minimum number of teams */
  minTeams: 10,
  
  /** Maximum number of teams */
  maxTeams: 20,
  
  /** Minimum round duration in seconds */
  minRoundDuration: 60,
  
  /** Maximum round duration in seconds */
  maxRoundDuration: 1800,  // 30 minutes
  
  /** Total number of rounds */
  totalRounds: 5,
  
  /** Decisions available per round (5 per category) */
  decisionsPerRound: 15,
  
  /** Decisions per category per round */
  decisionsPerCategory: 5,
  
  /** Years to simulate after Round 5 */
  simulationYears: 5,  // 2031-2035
  
  /** Results display duration in seconds */
  resultsDisplaySeconds: 90,
};

/**
 * Timer settings
 */
export const TIMER_SETTINGS = {
  /** How often to broadcast timer updates (ms) */
  tickIntervalMs: 1000,
  
  /** Warning threshold - flash timer when below this (seconds) */
  warningThreshold: 60,
  
  /** Critical threshold - urgent visual when below this (seconds) */
  criticalThreshold: 10,
};

/**
 * WebSocket settings
 */
export const WEBSOCKET_SETTINGS = {
  /** Ping interval for connection keepalive (ms) */
  pingInterval: 25000,
  
  /** Ping timeout before considering disconnected (ms) */
  pingTimeout: 20000,
  
  /** Maximum reconnection attempts */
  maxReconnectAttempts: 10,
  
  /** Delay between reconnection attempts (ms) */
  reconnectDelayMs: 1000,
};

/**
 * Scoring settings
 */
export const SCORING_SETTINGS = {
  /** Assumed dividend yield for TSR calculation */
  dividendYield: 0.025,  // 2.5%
  
  /** Multiple for enterprise value calculation (simplified) */
  evMultiple: 6.0,
  
  /** Investor expectations noise factor (±%) */
  expectationsNoiseFactor: 0.05,
};
