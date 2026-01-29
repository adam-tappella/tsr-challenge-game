/**
 * useSocket Hook - WebSocket connection management for TSR Challenge
 * 
 * Handles:
 * - Socket.IO connection to game server
 * - Reconnection logic
 * - Event subscription and emission
 * - Integration with game store
 */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/stores/gameStore';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  GameState,
  RoundNumber,
  Decision,
  RoundResults,
  FinalResults,
} from '@/types/game';

// =============================================================================
// Types
// =============================================================================

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  joinGame: (teamName: string) => Promise<{ success: boolean; error?: string; teamId?: number }>;
  submitDecisions: (decisionIds: string[]) => Promise<{ success: boolean; error?: string }>;
  unsubmitDecisions: () => Promise<{ success: boolean; error?: string }>;
  toggleDecision: (decisionId: string, selected: boolean) => void;
  syncDraftSelections: (decisionIds: string[]) => void;
  disconnect: () => void;
}

// =============================================================================
// Configuration
// =============================================================================

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// =============================================================================
// Hook
// =============================================================================

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<GameSocket | null>(null);
  
  // Store actions
  const setConnected = useGameStore((s) => s.setConnected);
  const setConnecting = useGameStore((s) => s.setConnecting);
  const setConnectionError = useGameStore((s) => s.setConnectionError);
  const updateGameState = useGameStore((s) => s.updateGameState);
  const setAvailableDecisions = useGameStore((s) => s.setAvailableDecisions);
  const setTimeRemaining = useGameStore((s) => s.setTimeRemaining);
  const setRoundResults = useGameStore((s) => s.setRoundResults);
  const setFinalResults = useGameStore((s) => s.setFinalResults);
  
  // Store state
  const isConnected = useGameStore((s) => s.isConnected);
  const isConnecting = useGameStore((s) => s.isConnecting);
  const connectionError = useGameStore((s) => s.connectionError);
  
  // Initialize socket connection
  useEffect(() => {
    if (socketRef.current) return;
    
    setConnecting(true);
    
    const socket: GameSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    
    socketRef.current = socket;
    
    // Connection events
    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      setConnected(true);
      
      // Auto-reconnection is disabled - teams must always enter their name
      // This ensures fresh team selection each time the page loads
      // Clear any stored credentials to prevent confusion
      useGameStore.getState().clearStoredCredentials();
      console.log('[Socket] Ready for team to join');
    });
    
    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, need to manually reconnect
        socket.connect();
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setConnectionError(`Connection failed: ${error.message}`);
    });
    
    // Game state events
    socket.on('game-state-update', (state: GameState) => {
      console.log('[Socket] Game state update:', state.status, 'Round:', state.currentRound);
      updateGameState(state);
    });
    
    socket.on('timer-tick', (secondsRemaining: number) => {
      setTimeRemaining(secondsRemaining);
    });
    
    socket.on('round-start', (round: RoundNumber, availableDecisions: Decision[]) => {
      console.log('[Socket] Round started:', round, 'Decisions:', availableDecisions.length);
      setAvailableDecisions(availableDecisions);
    });
    
    socket.on('round-end', (results: RoundResults) => {
      console.log('[Socket] Round ended:', results.round);
      setRoundResults(results);
    });
    
    socket.on('game-end', (finalResults: FinalResults) => {
      console.log('[Socket] Game ended. Winner:', finalResults.winnerId);
      setFinalResults(finalResults);
    });
    
    socket.on('team-joined', (teamId: number) => {
      console.log('[Socket] Team joined:', teamId);
    });
    
    socket.on('team-submitted', (teamId: number) => {
      console.log('[Socket] Team submitted:', teamId);
    });
    
    socket.on('scenario-event', (description: string) => {
      console.log('[Socket] Scenario event:', description);
    });
    
    // Cleanup
    return () => {
      console.log('[Socket] Cleaning up connection');
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    setConnected,
    setConnecting,
    setConnectionError,
    updateGameState,
    setAvailableDecisions,
    setTimeRemaining,
    setRoundResults,
    setFinalResults,
  ]);
  
  // Join game with team name
  const joinGame = useCallback(async (teamName: string): Promise<{ success: boolean; error?: string; teamId?: number }> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      
      if (!socket?.connected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }
      
      // Check if we have a stored token for this team name (for reconnection)
      const storedCredentials = useGameStore.getState().getStoredCredentials();
      const reconnectToken = storedCredentials.teamName === teamName ? storedCredentials.reconnectToken : undefined;
      
      socket.emit('join-game', teamName, reconnectToken, (success: boolean, error?: string, teamId?: number, newReconnectToken?: string) => {
        if (success && teamId) {
          useGameStore.getState().setTeamId(teamId);
          useGameStore.getState().setTeamName(teamName);
          if (newReconnectToken) {
            useGameStore.getState().setReconnectToken(newReconnectToken);
          }
          useGameStore.getState().setJoinedGame(true);
        } else {
          useGameStore.getState().setJoinedGame(false, error);
        }
        resolve({ success, error, teamId });
      });
    });
  }, []);
  
  // Submit decisions
  const submitDecisions = useCallback(async (decisionIds: string[]): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      
      if (!socket?.connected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }
      
      useGameStore.getState().setSubmitting(true);
      
      socket.emit('submit-decisions', decisionIds, (success: boolean, error?: string) => {
        useGameStore.getState().setSubmitted(success, error);
        resolve({ success, error });
      });
    });
  }, []);
  
  // Unsubmit decisions (to edit before round ends)
  const unsubmitDecisions = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      
      if (!socket?.connected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }
      
      socket.emit('unsubmit-decisions', (success: boolean, error?: string) => {
        if (success) {
          useGameStore.getState().setSubmitted(false);
        }
        resolve({ success, error });
      });
    });
  }, []);
  
  // Toggle decision (real-time tracking)
  const toggleDecision = useCallback((decisionId: string, selected: boolean) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('toggle-decision', decisionId, selected);
    }
  }, []);
  
  // Sync all draft selections at once
  const syncDraftSelections = useCallback((decisionIds: string[]) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('sync-draft-selections', decisionIds);
    }
  }, []);
  
  // Disconnect
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    useGameStore.getState().reset();
  }, []);
  
  return {
    isConnected,
    isConnecting,
    error: connectionError,
    joinGame,
    submitDecisions,
    unsubmitDecisions,
    toggleDecision,
    syncDraftSelections,
    disconnect,
  };
}
