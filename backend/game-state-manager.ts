/**
 * Magna TSR Challenge - Game State Manager
 * In-memory game state management with state transitions and team operations
 */

import type {
  GameState,
  GameStatus,
  RoundNumber,
  TeamState,
  TeamDecision,
  ScenarioState,
  RiskyEventState,
  Decision,
  RoundResults,
  FinalResults,
  TeamRoundSnapshot,
} from './types/game.js';

import {
  DEFAULT_GAME_CONFIG,
  GAME_CONSTRAINTS,
  createScenarioState,
  createInitialMetrics,
  STARTING_INVESTMENT_CASH,
  BASELINE_FINANCIALS,
  getDecisionsForRound,
  getDecisionById,
} from './config/index.js';

import {
  processRoundEnd as calculateRoundEnd,
  generateRoundResults,
  generateFinalResults,
} from './calculation-engine.js';

// =============================================================================
// Constants
// =============================================================================

// Frontend countdown duration (3-2-1-GO) - add this to round time so timer starts after countdown
const COUNTDOWN_DURATION_SECONDS = 4;

// =============================================================================
// Types
// =============================================================================

interface TeamSubmissionInfo {
  teamId: number;
  teamName: string;
  isClaimed: boolean;
  hasSubmitted: boolean;
  socketId?: string;
  decisionsCount: number;
}

interface GameStateManagerEvents {
  onStateChange: (state: GameState) => void;
  onTimerTick: (secondsRemaining: number) => void;
  onRoundEnd: () => void;
  onGameEnd: () => void;
}

// =============================================================================
// Game State Manager Class
// =============================================================================

/**
 * GameStateManager - Manages the authoritative game state
 * Single source of truth for all game data
 */
export class GameStateManager {
  private state: GameState;
  private events: GameStateManagerEvents;
  private timerInterval: NodeJS.Timeout | null = null;
  private roundDuration: number;
  
  // Results storage
  private lastRoundResults: RoundResults | null = null;
  private lastFinalResults: FinalResults | null = null;
  
  // Round-by-round history for Game Recap feature
  // Maps teamId -> array of snapshots (one per completed round)
  private roundHistories: Record<number, TeamRoundSnapshot[]> = {};

  constructor(events: GameStateManagerEvents) {
    this.events = events;
    this.roundDuration = DEFAULT_GAME_CONFIG.roundDurationSeconds;
    this.state = this.createInitialState();
  }

  // ===========================================================================
  // State Initialization
  // ===========================================================================

  /**
   * Creates initial game state in lobby mode
   */
  private createInitialState(): GameState {
    return {
      status: 'lobby',
      currentRound: 1,
      roundTimeRemaining: this.roundDuration,
      roundDuration: this.roundDuration,
      teams: this.createTeamStates(DEFAULT_GAME_CONFIG.teamCount),
      scenario: createScenarioState(1),
      riskyEvents: this.createRiskyEventState(),
      teamCount: DEFAULT_GAME_CONFIG.teamCount,
      startedAt: undefined,
      roundStartedAt: undefined,
    };
  }

  /**
   * Creates team states for all team slots
   */
  private createTeamStates(teamCount: number): Record<number, TeamState> {
    const teams: Record<number, TeamState> = {};
    
    for (let i = 1; i <= teamCount; i++) {
      teams[i] = this.createTeamState(i);
    }
    
    return teams;
  }

  /**
   * Creates a single team state
   */
  private createTeamState(teamId: number): TeamState {
    return {
      teamId,
      teamName: '', // Will be set when team joins
      isClaimed: false,
      socketId: undefined,
      cashBalance: STARTING_INVESTMENT_CASH,
      currentRoundDecisions: [],
      allDecisions: [],
      metrics: createInitialMetrics(),
      stockPrice: BASELINE_FINANCIALS.sharePrice,
      cumulativeTSR: 0,
      roundTSR: 0,
      hasSubmitted: false,
    };
  }

  /**
   * Creates risky event state with pre-determined outcomes
   * 1 of 5 risky decisions triggers negative outcome
   */
  private createRiskyEventState(): RiskyEventState {
    // Pre-determine which event index will trigger (0-4)
    const activeEventIndex = Math.floor(Math.random() * 5);
    
    return {
      triggeredEvents: {},
      activeEventIndex,
    };
  }

  // ===========================================================================
  // State Getters
  // ===========================================================================

  /**
   * Returns the current game state
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Returns the current game status
   */
  getStatus(): GameStatus {
    return this.state.status;
  }

  /**
   * Returns the current round number
   */
  getCurrentRound(): RoundNumber {
    return this.state.currentRound;
  }

  /**
   * Returns a specific team's state
   */
  getTeamState(teamId: number): TeamState | undefined {
    return this.state.teams[teamId];
  }

  /**
   * Returns all teams submission info (for admin dashboard)
   */
  getTeamsSubmissionInfo(): TeamSubmissionInfo[] {
    return Object.values(this.state.teams).map(team => ({
      teamId: team.teamId,
      teamName: team.teamName,
      isClaimed: team.isClaimed,
      hasSubmitted: team.hasSubmitted,
      socketId: team.socketId,
      decisionsCount: team.currentRoundDecisions.length,
    }));
  }

  /**
   * Returns decisions available for the current round
   */
  getAvailableDecisions(): Decision[] {
    return getDecisionsForRound(this.state.currentRound);
  }

  /**
   * Returns the last round results (after round end)
   */
  getLastRoundResults(): RoundResults | null {
    return this.lastRoundResults;
  }

  /**
   * Returns the final game results (after game end)
   */
  getFinalResults(): FinalResults | null {
    return this.lastFinalResults;
  }

  /**
   * Returns round-by-round history for all teams (for Game Recap)
   */
  getRoundHistories(): Record<number, TeamRoundSnapshot[]> {
    return { ...this.roundHistories };
  }

  // ===========================================================================
  // Configuration
  // ===========================================================================

  /**
   * Configures the number of teams (only in lobby status)
   */
  configureTeamCount(count: number): { success: boolean; error?: string } {
    if (this.state.status !== 'lobby') {
      return { success: false, error: 'Can only configure teams in lobby' };
    }

    if (count < GAME_CONSTRAINTS.minTeams || count > GAME_CONSTRAINTS.maxTeams) {
      return { 
        success: false, 
        error: `Team count must be between ${GAME_CONSTRAINTS.minTeams} and ${GAME_CONSTRAINTS.maxTeams}` 
      };
    }

    this.state.teamCount = count;
    this.state.teams = this.createTeamStates(count);
    this.broadcastStateChange();
    
    return { success: true };
  }

  /**
   * Configures round duration (only in lobby status)
   */
  configureRoundDuration(seconds: number): { success: boolean; error?: string } {
    if (this.state.status !== 'lobby') {
      return { success: false, error: 'Can only configure duration in lobby' };
    }

    if (seconds < GAME_CONSTRAINTS.minRoundDuration || seconds > GAME_CONSTRAINTS.maxRoundDuration) {
      return { 
        success: false, 
        error: `Duration must be between ${GAME_CONSTRAINTS.minRoundDuration} and ${GAME_CONSTRAINTS.maxRoundDuration} seconds` 
      };
    }

    this.roundDuration = seconds;
    this.state.roundDuration = seconds;
    this.state.roundTimeRemaining = seconds;
    this.broadcastStateChange();
    
    return { success: true };
  }

  // ===========================================================================
  // Team Operations
  // ===========================================================================

  /**
   * Team joins with a team name (auto-assigns team ID)
   */
  joinGame(teamName: string, socketId: string): { success: boolean; error?: string; teamId?: number } {
    // Validate game state
    if (this.state.status === 'finished') {
      return { success: false, error: 'Game has ended' };
    }

    // Validate team name
    if (!teamName || teamName.trim().length === 0) {
      return { success: false, error: 'Team name is required' };
    }

    const trimmedName = teamName.trim();

    // Check if this socket is already connected to a team
    for (const team of Object.values(this.state.teams)) {
      if (team.socketId === socketId) {
        // Already connected, just update the name if needed
        team.teamName = trimmedName;
        this.broadcastStateChange();
        return { success: true, teamId: team.teamId };
      }
    }

    // Check if team name is already taken - allow reconnection by updating socket ID
    for (const team of Object.values(this.state.teams)) {
      if (team.isClaimed && team.teamName.toLowerCase() === trimmedName.toLowerCase()) {
        // Team exists with this name - update socket ID (handles reconnection)
        const oldSocketId = team.socketId;
        team.socketId = socketId;
        console.log(`[GameState] Team "${trimmedName}" reconnected: ${oldSocketId} -> ${socketId}`);
        this.broadcastStateChange();
        return { success: true, teamId: team.teamId };
      }
    }

    // Find first available team slot
    let availableTeam: TeamState | null = null;
    for (const team of Object.values(this.state.teams)) {
      if (!team.isClaimed) {
        availableTeam = team;
        break;
      }
    }

    if (!availableTeam) {
      return { success: false, error: 'All team slots are full' };
    }

    // Claim the team slot
    availableTeam.isClaimed = true;
    availableTeam.socketId = socketId;
    availableTeam.teamName = trimmedName;
    
    this.broadcastStateChange();
    return { success: true, teamId: availableTeam.teamId };
  }

  /**
   * Handle team disconnection
   */
  handleDisconnect(socketId: string): { teamId: number | null } {
    // Find team with this socket
    for (const team of Object.values(this.state.teams)) {
      if (team.socketId === socketId) {
        // Don't unclaim - allow reconnection
        // Just clear the socketId
        team.socketId = undefined;
        this.broadcastStateChange();
        return { teamId: team.teamId };
      }
    }
    return { teamId: null };
  }

  /**
   * Reconnect a team
   */
  reconnectTeam(teamId: number, socketId: string): { success: boolean; error?: string } {
    const team = this.state.teams[teamId];
    
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    if (!team.isClaimed) {
      // Team slot wasn't claimed, treat as new join
      return this.joinGame(teamId, socketId);
    }

    // Allow reconnection to claimed team without active socket
    if (!team.socketId) {
      team.socketId = socketId;
      this.broadcastStateChange();
      return { success: true };
    }

    // Already has active connection
    return { success: false, error: 'Team has active connection' };
  }

  /**
   * Submit decisions for a team
   */
  submitDecisions(
    socketId: string, 
    decisionIds: string[]
  ): { success: boolean; error?: string; teamId?: number } {
    // Validate game state
    if (this.state.status !== 'active') {
      return { success: false, error: 'Round is not active' };
    }

    // Find team by socket
    const team = Object.values(this.state.teams).find(t => t.socketId === socketId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Check if already submitted
    if (team.hasSubmitted) {
      return { success: false, error: 'Already submitted for this round' };
    }

    // Validate and apply decisions
    const availableDecisions = this.getAvailableDecisions();
    const availableIds = new Set(availableDecisions.map(d => d.id));
    
    let totalCost = 0;
    const validDecisions: TeamDecision[] = [];

    for (const decisionId of decisionIds) {
      // Validate decision exists and is available this round
      if (!availableIds.has(decisionId)) {
        return { success: false, error: `Decision ${decisionId} is not available this round` };
      }

      const decision = getDecisionById(decisionId);
      if (!decision) {
        return { success: false, error: `Decision ${decisionId} not found` };
      }

      totalCost += decision.cost;

      validDecisions.push({
        decisionId,
        round: this.state.currentRound,
        submittedAt: new Date().toISOString(),
        actualCost: decision.cost,
      });
    }

    // Check budget
    if (totalCost > team.cashBalance) {
      return { 
        success: false, 
        error: `Insufficient funds. Need $${totalCost}M, have $${team.cashBalance}M` 
      };
    }

    // Apply decisions
    team.currentRoundDecisions = validDecisions;
    team.cashBalance -= totalCost;
    team.hasSubmitted = true;

    this.broadcastStateChange();
    return { success: true, teamId: team.teamId };
  }

  /**
   * Unsubmit decisions (allow team to edit before round ends)
   */
  unsubmitDecisions(socketId: string): { success: boolean; error?: string; teamId?: number } {
    // Validate game state
    if (this.state.status !== 'active' && this.state.status !== 'paused') {
      return { success: false, error: 'Round is not active' };
    }

    // Find team by socket
    const team = Object.values(this.state.teams).find(t => t.socketId === socketId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Check if actually submitted
    if (!team.hasSubmitted) {
      return { success: false, error: 'Not submitted yet' };
    }

    // Restore cash and clear submission
    const totalCost = team.currentRoundDecisions.reduce((sum, d) => sum + d.cost, 0);
    team.cashBalance += totalCost;
    team.hasSubmitted = false;
    // Keep currentRoundDecisions so their selections are preserved

    this.broadcastStateChange();
    return { success: true, teamId: team.teamId };
  }

  /**
   * Track decision toggle (for real-time preview, not final submission)
   */
  toggleDecision(socketId: string, decisionId: string, selected: boolean): void {
    // This is for real-time tracking only, doesn't affect state
    // Could be used for spectator/admin view
    console.log(`[GameState] Team socket ${socketId} toggled ${decisionId}: ${selected}`);
  }

  // ===========================================================================
  // Game Flow Control
  // ===========================================================================

  /**
   * Start the game (begin Round 1)
   */
  startGame(): { success: boolean; error?: string } {
    if (this.state.status !== 'lobby') {
      return { success: false, error: 'Game can only be started from lobby' };
    }

    // Check if at least one team has joined
    const claimedTeams = Object.values(this.state.teams).filter(t => t.isClaimed);
    if (claimedTeams.length === 0) {
      return { success: false, error: 'At least one team must join before starting' };
    }

    // Transition to active
    this.state.status = 'active';
    this.state.currentRound = 1;
    // Add countdown offset so timer effectively starts after 3-2-1 countdown completes
    this.state.roundTimeRemaining = this.roundDuration + COUNTDOWN_DURATION_SECONDS;
    this.state.scenario = createScenarioState(1);
    this.state.startedAt = new Date().toISOString();
    this.state.roundStartedAt = new Date().toISOString();

    // Reset all teams for round 1
    for (const team of Object.values(this.state.teams)) {
      team.hasSubmitted = false;
      team.currentRoundDecisions = [];
    }

    // Start timer
    this.startTimer();
    this.broadcastStateChange();

    return { success: true };
  }

  /**
   * Pause the current round
   */
  pauseRound(): { success: boolean; error?: string } {
    if (this.state.status !== 'active') {
      return { success: false, error: 'Can only pause active round' };
    }

    this.state.status = 'paused';
    this.stopTimer();
    this.broadcastStateChange();

    return { success: true };
  }

  /**
   * Resume a paused round
   */
  resumeRound(): { success: boolean; error?: string } {
    if (this.state.status !== 'paused') {
      return { success: false, error: 'Can only resume paused round' };
    }

    this.state.status = 'active';
    this.startTimer();
    this.broadcastStateChange();

    return { success: true };
  }

  /**
   * Force-end the current round
   */
  endRound(): { success: boolean; error?: string } {
    if (this.state.status !== 'active' && this.state.status !== 'paused') {
      return { success: false, error: 'No active round to end' };
    }

    this.processRoundEnd();
    return { success: true };
  }

  /**
   * Advance to next round
   */
  nextRound(): { success: boolean; error?: string } {
    if (this.state.status !== 'results') {
      return { success: false, error: 'Can only advance to next round from results screen' };
    }

    if (this.state.currentRound >= 5) {
      // Game is over, finalize
      this.finalizeGame();
      return { success: true };
    }

    // Advance to next round
    const nextRound = (this.state.currentRound + 1) as RoundNumber;
    
    this.state.status = 'active';
    this.state.currentRound = nextRound;
    // Add countdown offset so timer effectively starts after 3-2-1 countdown completes
    this.state.roundTimeRemaining = this.roundDuration + COUNTDOWN_DURATION_SECONDS;
    this.state.scenario = createScenarioState(nextRound);
    this.state.roundStartedAt = new Date().toISOString();

    // Reset teams for new round with dynamic cash allocation
    for (const team of Object.values(this.state.teams)) {
      // Move current round decisions to all decisions
      team.allDecisions.push(...team.currentRoundDecisions);
      
      // Calculate next round's cash based on prior decisions
      // Simulate: spending on "grow" investments generates more future cash
      // spending on "sustain" maintains cash, "optimize" is neutral
      const priorDecisions = team.currentRoundDecisions;
      const growSpend = priorDecisions.filter(d => d.category === 'grow').reduce((sum, d) => sum + d.cost, 0);
      const optimizeSpend = priorDecisions.filter(d => d.category === 'optimize').reduce((sum, d) => sum + d.cost, 0);
      const sustainSpend = priorDecisions.filter(d => d.category === 'sustain').reduce((sum, d) => sum + d.cost, 0);
      
      // Base cash + growth return + efficiency savings - sustain costs
      // Grow investments return 15-25% in future cash generation
      // Optimize investments return 5-10% in efficiency savings
      // Sustain investments cost money but prevent penalties
      const growReturn = growSpend * (0.15 + Math.random() * 0.10);
      const optimizeReturn = optimizeSpend * (0.05 + Math.random() * 0.05);
      const sustainCost = sustainSpend * 0.02; // Small ongoing cost
      
      // Calculate new cash: base + returns, with some randomness for market conditions
      const marketFactor = 0.95 + Math.random() * 0.10; // 95% to 105%
      let newCash = Math.round((STARTING_INVESTMENT_CASH + growReturn + optimizeReturn - sustainCost) * marketFactor);
      
      // Clamp to reasonable range (800M to 1600M)
      newCash = Math.max(800, Math.min(1600, newCash));
      
      team.currentRoundDecisions = [];
      team.hasSubmitted = false;
      team.cashBalance = newCash;
    }

    // Start timer
    this.startTimer();
    this.broadcastStateChange();

    return { success: true };
  }

  /**
   * Trigger a special scenario event
   */
  triggerEvent(eventType: string): { success: boolean; error?: string } {
    if (this.state.status !== 'active' && this.state.status !== 'paused') {
      return { success: false, error: 'Can only trigger events during active round' };
    }

    this.state.scenario.eventTriggered = true;
    this.state.scenario.eventDescription = eventType;
    this.broadcastStateChange();

    return { success: true };
  }

  /**
   * Reset game to lobby state
   */
  resetGame(): { success: boolean } {
    this.stopTimer();
    this.state = this.createInitialState();
    this.roundHistories = {}; // Clear round history on reset
    this.lastRoundResults = null;
    this.lastFinalResults = null;
    this.broadcastStateChange();
    return { success: true };
  }

  // ===========================================================================
  // Timer System
  // ===========================================================================

  /**
   * Start the countdown timer
   */
  private startTimer(): void {
    this.stopTimer(); // Clear any existing timer

    this.timerInterval = setInterval(() => {
      if (this.state.status !== 'active') {
        this.stopTimer();
        return;
      }

      this.state.roundTimeRemaining--;
      this.events.onTimerTick(this.state.roundTimeRemaining);

      if (this.state.roundTimeRemaining <= 0) {
        this.processRoundEnd();
      }
    }, 1000);
  }

  /**
   * Stop the countdown timer
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ===========================================================================
  // Round Processing
  // ===========================================================================

  /**
   * Process the end of a round
   */
  private processRoundEnd(): void {
    this.stopTimer();
    
    // Auto-submit for teams that haven't submitted
    for (const team of Object.values(this.state.teams)) {
      if (team.isClaimed && !team.hasSubmitted) {
        // Submit with whatever they had selected (empty if nothing)
        team.hasSubmitted = true;
      }
    }

    // Calculate financial impacts using the calculation engine
    this.state.teams = calculateRoundEnd(
      this.state.teams,
      this.state.currentRound,
      this.state.scenario.modifiers,
      this.state.riskyEvents
    );

    // Capture round snapshots for Game Recap feature
    this.captureRoundSnapshots();

    // Move to results status
    this.state.status = 'results';
    this.state.roundTimeRemaining = 0;

    // Store the round results for retrieval
    this.lastRoundResults = generateRoundResults(
      this.state.teams,
      this.state.currentRound,
      this.state.scenario.narrative,
      this.state.riskyEvents
    );

    this.broadcastStateChange();
    this.events.onRoundEnd();
  }

  /**
   * Capture snapshot of each team's state at end of round (for Game Recap)
   */
  private captureRoundSnapshots(): void {
    const currentRound = this.state.currentRound;
    
    for (const team of Object.values(this.state.teams)) {
      // Only track claimed teams
      if (!team.isClaimed) continue;
      
      // Initialize history array for team if needed
      if (!this.roundHistories[team.teamId]) {
        this.roundHistories[team.teamId] = [];
      }
      
      // Calculate cash spent this round and gather decision summaries
      let cashSpent = 0;
      const decisions: Array<{ id: string; name: string; cost: number; category: 'grow' | 'optimize' | 'sustain' }> = [];
      
      for (const teamDecision of team.currentRoundDecisions) {
        const decision = getDecisionById(teamDecision.decisionId);
        if (decision) {
          cashSpent += teamDecision.actualCost;
          decisions.push({
            id: decision.id,
            name: decision.name,
            cost: decision.cost,
            category: decision.category,
          });
        }
      }
      
      // Create snapshot
      const snapshot: TeamRoundSnapshot = {
        round: currentRound,
        stockPrice: team.stockPrice,
        roundTSR: team.roundTSR,
        cumulativeTSR: team.cumulativeTSR,
        cashSpent,
        decisions,
      };
      
      this.roundHistories[team.teamId].push(snapshot);
    }
    
    console.log(`[GameState] Captured round ${currentRound} snapshots for ${Object.keys(this.roundHistories).length} teams`);
  }

  /**
   * Finalize the game after Round 5
   */
  private finalizeGame(): void {
    this.state.status = 'finished';
    
    // Move final round decisions to all decisions
    for (const team of Object.values(this.state.teams)) {
      team.allDecisions.push(...team.currentRoundDecisions);
      team.currentRoundDecisions = [];
    }

    // Generate final results with 5-year forward simulation (2031-2035)
    // Include team histories for Game Recap feature
    this.lastFinalResults = generateFinalResults(
      this.state.teams,
      this.state.riskyEvents,
      this.roundHistories
    );

    this.broadcastStateChange();
    this.events.onGameEnd();
  }

  // ===========================================================================
  // Broadcasting
  // ===========================================================================

  /**
   * Broadcast state change to all connected clients
   */
  private broadcastStateChange(): void {
    this.events.onStateChange(this.getState());
  }
}

// =============================================================================
// Singleton Instance Export
// =============================================================================

let gameStateManager: GameStateManager | null = null;

/**
 * Initialize the game state manager with event handlers
 */
export function initializeGameStateManager(events: GameStateManagerEvents): GameStateManager {
  gameStateManager = new GameStateManager(events);
  return gameStateManager;
}

/**
 * Get the current game state manager instance
 */
export function getGameStateManager(): GameStateManager | null {
  return gameStateManager;
}
