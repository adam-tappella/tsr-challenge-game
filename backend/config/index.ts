/**
 * Magna TSR Challenge - Configuration Exports
 */

// Financial baseline data
export {
  BASELINE_FINANCIALS,
  createInitialMetrics,
  STARTING_INVESTMENT_CASH,
  WACC,
  TERMINAL_GROWTH_RATE,
  TAX_RATE,
} from './baseline-financials.js';

// Scenario configuration
export {
  SCENARIO_BY_ROUND,
  createScenarioState,
  SPECIAL_EVENTS,
} from './scenarios.js';

// Game settings
export {
  DEFAULT_GAME_CONFIG,
  GAME_CONSTRAINTS,
  TIMER_SETTINGS,
  WEBSOCKET_SETTINGS,
  SCORING_SETTINGS,
} from './game-settings.js';

// Decision cards
export {
  ALL_DECISIONS,
  getDecisionsForRound,
  getDecisionsByCategory,
  getDecisionById,
  getRiskyDecisions,
  validateDecisionConfiguration,
} from './decisions.js';
