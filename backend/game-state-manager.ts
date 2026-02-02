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
  SnapshotMetrics,
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
  generateMarketOutlook,
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
      reconnectToken: undefined, // Token for reconnection verification
      cashBalance: STARTING_INVESTMENT_CASH,
      currentRoundDecisions: [],
      allDecisions: [],
      metrics: initialMetrics,
      stockPrice: BASELINE_FINANCIALS.sharePrice,
      cumulativeTSR: 0,
      roundTSR: 0,
      hasSubmitted: false,
      draftDecisionIds: [],
    };
  }
  
  /**
   * Generate a random reconnection token
   */
  private generateReconnectToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

  /**
   * Find a team by their socket ID
   */
  private findTeamBySocket(socketId: string): TeamState | undefined {
    return Object.values(this.state.teams).find(t => t.socketId === socketId);
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
   * Enforces unique team names - no duplicates allowed
   * Once a name is claimed, it's locked for that game session (no takeover allowed)
   */
  joinGame(teamName: string, socketId: string, reconnectToken?: string): { success: boolean; error?: string; teamId?: number; reconnectToken?: string } {
    // Validate game state
    if (this.state.status === 'finished') {
      return { success: false, error: 'Game has ended' };
    }

    // Validate team name
    if (!teamName || teamName.trim().length === 0) {
      return { success: false, error: 'Team name is required' };
    }

    const trimmedName = teamName.trim();
    const normalizedName = trimmedName.toLowerCase();
    
    console.log(`[GameState] Join attempt: "${trimmedName}" from socket ${socketId}${reconnectToken ? ' (with reconnect token)' : ''}`);

    // Check if this socket is already connected to a team
    const existingTeamForSocket = Object.values(this.state.teams).find(t => t.socketId === socketId);
    if (existingTeamForSocket) {
      // Already connected with this socket - allow them to keep their current name
      // but don't allow changing to a name taken by another team
      if (existingTeamForSocket.teamName.toLowerCase() === normalizedName) {
        // Same name, just refresh - allow
        console.log(`[GameState] Socket ${socketId} already owns team "${trimmedName}" (Team ${existingTeamForSocket.teamId})`);
        return { success: true, teamId: existingTeamForSocket.teamId, reconnectToken: existingTeamForSocket.reconnectToken };
      }
      
      // Trying to change to a different name - check if it's available
      const nameConflict = Object.values(this.state.teams).find(
        t => t.teamId !== existingTeamForSocket.teamId && 
             t.isClaimed && 
             t.teamName.toLowerCase() === normalizedName
      );
      if (nameConflict) {
        console.log(`[GameState] REJECTED: "${trimmedName}" already taken by Team ${nameConflict.teamId}`);
        return { 
          success: false, 
          error: `"${trimmedName}" is already taken by another team. Please choose a different name.` 
        };
      }
      // Update the name
      existingTeamForSocket.teamName = trimmedName;
      this.broadcastStateChange();
      return { success: true, teamId: existingTeamForSocket.teamId, reconnectToken: existingTeamForSocket.reconnectToken };
    }

    // Check if team name is already taken by another claimed team
    const existingTeamWithName = Object.values(this.state.teams).find(
      t => t.isClaimed && t.teamName.toLowerCase() === normalizedName
    );
    
    if (existingTeamWithName) {
      // Name is claimed - check if this is a valid reconnection with the correct token
      if (reconnectToken && existingTeamWithName.reconnectToken === reconnectToken) {
        // Valid reconnection - same player returning after refresh/disconnect
        console.log(`[GameState] RECONNECTION (token verified): "${trimmedName}" reconnecting to Team ${existingTeamWithName.teamId}`);
        existingTeamWithName.socketId = socketId;
        this.broadcastStateChange();
        return { success: true, teamId: existingTeamWithName.teamId, reconnectToken: existingTeamWithName.reconnectToken };
      }
      
      // No token or wrong token - REJECT (prevents other players from stealing the name)
      console.log(`[GameState] REJECTED: "${trimmedName}" is claimed by Team ${existingTeamWithName.teamId} (token mismatch or missing)`);
      return { 
        success: false, 
        error: `"${trimmedName}" is already taken. Please choose a different name.` 
      };
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

    // Claim the team slot and generate a new reconnection token
    const newReconnectToken = this.generateReconnectToken();
    availableTeam.isClaimed = true;
    availableTeam.socketId = socketId;
    availableTeam.teamName = trimmedName;
    availableTeam.reconnectToken = newReconnectToken;
    
    console.log(`[GameState] SUCCESS: New team "${trimmedName}" joined as Team ${availableTeam.teamId}`);
    this.broadcastStateChange();
    return { success: true, teamId: availableTeam.teamId, reconnectToken: newReconnectToken };
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
      return this.joinGame(team.teamName, socketId);
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
    const totalCost = team.currentRoundDecisions.reduce((sum, d) => sum + d.actualCost, 0);
    team.cashBalance += totalCost;
    team.hasSubmitted = false;
    // Keep currentRoundDecisions so their selections are preserved

    this.broadcastStateChange();
    return { success: true, teamId: team.teamId };
  }

  /**
   * Track decision toggle for auto-submit on timeout
   * Stores draft selections so they can be used if team doesn't explicitly submit
   */
  toggleDecision(socketId: string, decisionId: string, selected: boolean): void {
    const team = this.findTeamBySocket(socketId);
    if (!team) {
      console.log(`[GameState] Toggle decision failed: no team for socket ${socketId}`);
      return;
    }
    
    // Don't track drafts if team has already submitted
    if (team.hasSubmitted) {
      return;
    }
    
    if (selected) {
      // Add to draft if not already present
      if (!team.draftDecisionIds.includes(decisionId)) {
        team.draftDecisionIds.push(decisionId);
      }
    } else {
      // Remove from draft
      team.draftDecisionIds = team.draftDecisionIds.filter(id => id !== decisionId);
    }
    
    console.log(`[GameState] Team ${team.teamId} draft updated: ${team.draftDecisionIds.length} decisions selected`);
  }
  
  /**
   * Sync all draft selections at once (for reconnection or bulk update)
   */
  syncDraftSelections(socketId: string, decisionIds: string[]): void {
    const team = this.findTeamBySocket(socketId);
    if (!team) {
      console.log(`[GameState] Sync drafts failed: no team for socket ${socketId}`);
      return;
    }
    
    // Don't update drafts if team has already submitted
    if (team.hasSubmitted) {
      return;
    }
    
    team.draftDecisionIds = [...decisionIds];
    console.log(`[GameState] Team ${team.teamId} drafts synced: ${decisionIds.length} decisions`);
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

    console.log(`\n🎮 Starting game with ${claimedTeams.length} team(s) - Round 1`);

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
      
      // Look up full decision info to get category
      let growSpend = 0;
      let optimizeSpend = 0;
      let sustainSpend = 0;
      
      for (const td of priorDecisions) {
        const decision = getDecisionById(td.decisionId);
        if (decision) {
          if (decision.category === 'grow') growSpend += td.actualCost;
          else if (decision.category === 'optimize') optimizeSpend += td.actualCost;
          else if (decision.category === 'sustain') sustainSpend += td.actualCost;
        }
      }
      
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
      team.draftDecisionIds = []; // Clear draft selections for new round
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
   * Auto-submit a team's draft decisions when time runs out
   * Converts draft decision IDs into TeamDecision objects
   */
  private autoSubmitDraftDecisions(team: TeamState): void {
    const availableDecisions = this.getAvailableDecisions();
    const availableIds = new Set(availableDecisions.map(d => d.id));
    
    let totalCost = 0;
    const validDecisions: TeamDecision[] = [];
    
    // Process each draft decision ID
    for (const decisionId of team.draftDecisionIds) {
      // Skip if not available this round
      if (!availableIds.has(decisionId)) {
        continue;
      }
      
      const decision = getDecisionById(decisionId);
      if (!decision) {
        continue;
      }
      
      // Check if adding this would exceed budget
      if (totalCost + decision.cost > team.cashBalance) {
        // Skip decisions that don't fit in budget
        console.log(`[AutoSubmit] Team ${team.teamId}: Skipping ${decisionId} - would exceed budget`);
        continue;
      }
      
      totalCost += decision.cost;
      
      validDecisions.push({
        decisionId,
        round: this.state.currentRound,
        submittedAt: new Date().toISOString(),
        actualCost: decision.cost,
      });
    }
    
    // Apply the decisions
    team.currentRoundDecisions = validDecisions;
    team.cashBalance -= totalCost;
    team.hasSubmitted = true;
    
    console.log(`[AutoSubmit] Team ${team.teamId} auto-submitted ${validDecisions.length} decisions (from ${team.draftDecisionIds.length} drafts), cost: $${totalCost}M`);
  }

  /**
   * Process the end of a round
   */
  private processRoundEnd(): void {
    this.stopTimer();
    
    // Auto-submit draft selections for teams that haven't explicitly submitted
    for (const team of Object.values(this.state.teams)) {
      if (team.isClaimed && !team.hasSubmitted) {
        // Use their draft selections (whatever they had selected on screen)
        this.autoSubmitDraftDecisions(team);
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

    // Generate market outlook based on first claimed team's metrics
    const marketOutlook = this.generateMarketOutlookForRound();

    // Store the round results for retrieval
    this.lastRoundResults = generateRoundResults(
      this.state.teams,
      this.state.currentRound,
      this.state.scenario.narrative,
      this.state.riskyEvents,
      marketOutlook
    );

    this.broadcastStateChange();
    this.events.onRoundEnd();
  }

  /**
   * Generate market outlook for the current round
   */
  private generateMarketOutlookForRound(): { backwardStatements: string[]; forwardStatements: string[] } {
    const currentRound = this.state.currentRound;
    const claimedTeams = Object.values(this.state.teams).filter(t => t.isClaimed);
    
    if (claimedTeams.length === 0) {
      return {
        backwardStatements: ['Market conditions remain stable.', 'Strategic execution continues.'],
        forwardStatements: ['Analysts remain cautiously optimistic.', 'Industry trends continue to evolve.'],
      };
    }
    
    // Use the first claimed team's metrics for generating the outlook
    const team = claimedTeams[0];
    const currentMetrics = team.metrics;
    
    // Get previous metrics (from previous round or baseline)
    let previousMetrics = null;
    let previousStockPrice = BASELINE_FINANCIALS.sharePrice;
    
    if (currentRound > 1) {
      const history = this.roundHistories[team.teamId];
      const prevSnapshot = history?.find(s => s.round === (currentRound - 1) as RoundNumber);
      if (prevSnapshot?.metrics) {
        // Reconstruct previous metrics from snapshot (simplified)
        previousStockPrice = prevSnapshot.stockPrice;
      }
    }
    
    return generateMarketOutlook(
      currentRound,
      currentMetrics,
      previousMetrics,
      team.stockPrice,
      previousStockPrice,
      this.state.scenario.type
    );
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
      
      // Calculate historical metrics for this round
      const metrics = this.calculateSnapshotMetrics(team, currentRound);
      
      // Create snapshot
      const snapshot: TeamRoundSnapshot = {
        round: currentRound,
        stockPrice: team.stockPrice,
        roundTSR: team.roundTSR,
        cumulativeTSR: team.cumulativeTSR,
        cashSpent,
        decisions,
        metrics,
      };
      
      this.roundHistories[team.teamId].push(snapshot);
    }
    
    console.log(`[GameState] Captured round ${currentRound} snapshots for ${Object.keys(this.roundHistories).length} teams`);
  }

  /**
   * Calculate snapshot metrics for historical tracking
   */
  private calculateSnapshotMetrics(team: TeamState, currentRound: RoundNumber): SnapshotMetrics {
    const m = team.metrics;
    
    // Get previous round revenue for growth calculation (or baseline for round 1)
    let previousRevenue: number;
    if (currentRound === 1) {
      previousRevenue = BASELINE_FINANCIALS.revenue;
    } else {
      // Look up previous round from history
      const history = this.roundHistories[team.teamId];
      const prevSnapshot = history?.find(s => s.round === (currentRound - 1) as RoundNumber);
      // If we have previous metrics, use that revenue - otherwise calculate from baseline + growth
      if (prevSnapshot?.metrics) {
        // We stored revenue growth, so we need to back-calculate revenue
        // Actually, we should store the revenue value for easier lookups
        // For now, use baseline as fallback
        previousRevenue = BASELINE_FINANCIALS.revenue * (1 + (prevSnapshot.metrics.revenueGrowth || 0));
      } else {
        previousRevenue = BASELINE_FINANCIALS.revenue;
      }
    }
    
    // Calculate all metrics
    const revenueGrowth = (m.revenue - previousRevenue) / previousRevenue;
    const ebitdaMargin = m.ebitda / m.revenue;
    const ebitMargin = m.ebit / m.revenue;
    const cogsToRevenue = Math.abs(m.cogs) / m.revenue;
    const sgaToRevenue = Math.abs(m.sga) / m.revenue;
    
    return {
      stockPrice: team.stockPrice,
      roic: m.roic,
      revenueGrowth,
      ebitdaMargin,
      ebitMargin,
      cogsToRevenue,
      sgaToRevenue,
    };
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
