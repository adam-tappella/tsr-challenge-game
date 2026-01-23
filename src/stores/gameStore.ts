/**
 * Game Store - Client-side state management for TSR Challenge
 * 
 * Manages:
 * - Team identity (which team the client is playing as)
 * - Game state received from server
 * - Available decisions and selections
 * - UI state (loading, connection status)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  GameState,
  GameStatus,
  RoundNumber,
  Decision,
  TeamState,
  RoundResults,
  FinalResults,
} from '@/types/game';

// =============================================================================
// Types
// =============================================================================

interface GameStoreState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Team identity
  teamId: number | null;
  teamName: string | null;
  hasJoinedGame: boolean;
  joinError: string | null;
  
  // Game state (from server)
  gameState: GameState | null;
  availableDecisions: Decision[];
  
  // Local selection state
  selectedDecisionIds: Set<string>;
  hasSubmitted: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  
  // Timer
  timeRemaining: number;
  
  // Results
  lastRoundResults: RoundResults | null;
  finalResults: FinalResults | null;
}

interface GameStoreActions {
  // Connection
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  
  // Team
  setTeamId: (teamId: number) => void;
  setTeamName: (teamName: string) => void;
  setJoinedGame: (joined: boolean, error?: string) => void;
  leaveGame: () => void;
  
  // Game state
  updateGameState: (state: GameState) => void;
  setAvailableDecisions: (decisions: Decision[]) => void;
  
  // Decisions
  toggleDecision: (decisionId: string) => void;
  clearSelections: () => void;
  setSubmitting: (submitting: boolean) => void;
  setSubmitted: (submitted: boolean, error?: string) => void;
  
  // Timer
  setTimeRemaining: (seconds: number) => void;
  
  // Results
  setRoundResults: (results: RoundResults) => void;
  setFinalResults: (results: FinalResults) => void;
  
  // Reset
  reset: () => void;
}

type GameStore = GameStoreState & GameStoreActions;

// =============================================================================
// Initial State
// =============================================================================

const initialState: GameStoreState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  
  teamId: null,
  teamName: null,
  hasJoinedGame: false,
  joinError: null,
  
  gameState: null,
  availableDecisions: [],
  
  selectedDecisionIds: new Set(),
  hasSubmitted: false,
  isSubmitting: false,
  submitError: null,
  
  timeRemaining: 0,
  
  lastRoundResults: null,
  finalResults: null,
};

// =============================================================================
// Store
// =============================================================================

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Connection actions
      setConnected: (connected) => set({ 
        isConnected: connected,
        isConnecting: false,
        connectionError: connected ? null : get().connectionError,
      }),
      
      setConnecting: (connecting) => set({ isConnecting: connecting }),
      
      setConnectionError: (error) => set({ 
        connectionError: error,
        isConnected: false,
        isConnecting: false,
      }),
      
      // Team actions
      setTeamId: (teamId) => set({ teamId }),
      
      setTeamName: (teamName) => set({ teamName }),
      
      setJoinedGame: (joined, error) => set({
        hasJoinedGame: joined,
        joinError: error || null,
      }),
      
      leaveGame: () => set({
        teamId: null,
        teamName: null,
        hasJoinedGame: false,
        joinError: null,
        selectedDecisionIds: new Set(),
        hasSubmitted: false,
      }),
      
      // Game state actions
      updateGameState: (state) => {
        const currentTeamId = get().teamId;
        const team = currentTeamId ? state.teams[currentTeamId] : null;
        
        set({
          gameState: state,
          timeRemaining: state.roundTimeRemaining,
          hasSubmitted: team?.hasSubmitted || false,
        });
      },
      
      setAvailableDecisions: (decisions) => set({
        availableDecisions: decisions,
        selectedDecisionIds: new Set(),
        hasSubmitted: false,
        submitError: null,
      }),
      
      // Decision actions
      toggleDecision: (decisionId) => {
        const current = get().selectedDecisionIds;
        const updated = new Set(current);
        
        if (updated.has(decisionId)) {
          updated.delete(decisionId);
        } else {
          updated.add(decisionId);
        }
        
        set({ selectedDecisionIds: updated });
      },
      
      clearSelections: () => set({ selectedDecisionIds: new Set() }),
      
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      
      setSubmitted: (submitted, error) => set({
        hasSubmitted: submitted,
        isSubmitting: false,
        submitError: error || null,
        // Keep selections so confirmation modal can display them
      }),
      
      // Timer
      setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
      
      // Results
      setRoundResults: (results) => set({ lastRoundResults: results }),
      
      setFinalResults: (results) => set({ finalResults: results }),
      
      // Reset
      reset: () => set(initialState),
    }),
    { name: 'game-store' }
  )
);

// =============================================================================
// Selectors
// =============================================================================

/**
 * Gets the current team's state from the game state
 */
export function useCurrentTeam(): TeamState | null {
  const teamId = useGameStore((s) => s.teamId);
  const gameState = useGameStore((s) => s.gameState);
  
  if (!teamId || !gameState) return null;
  return gameState.teams[teamId] || null;
}

/**
 * Gets the current game status
 */
export function useGameStatus(): GameStatus | null {
  return useGameStore((s) => s.gameState?.status || null);
}

/**
 * Gets the current round number
 */
export function useCurrentRound(): RoundNumber {
  return useGameStore((s) => s.gameState?.currentRound || 1);
}

/**
 * Calculates total cost of selected decisions
 */
export function useSelectedCost(): number {
  const selectedIds = useGameStore((s) => s.selectedDecisionIds);
  const decisions = useGameStore((s) => s.availableDecisions);
  
  let total = 0;
  for (const id of selectedIds) {
    const decision = decisions.find((d) => d.id === id);
    if (decision) total += decision.cost;
  }
  return total;
}

/**
 * Calculates remaining budget after selections
 */
export function useRemainingBudget(): number {
  const team = useCurrentTeam();
  const selectedCost = useSelectedCost();
  
  if (!team) return 0;
  return team.cashBalance - selectedCost;
}

/**
 * Gets the team's rank in the current results
 */
export function useTeamRank(): number | null {
  const teamId = useGameStore((s) => s.teamId);
  const results = useGameStore((s) => s.lastRoundResults);
  
  if (!teamId || !results) return null;
  
  const teamResult = results.teamResults.find((r) => r.teamId === teamId);
  return teamResult?.rank || null;
}
