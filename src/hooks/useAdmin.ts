/**
 * useAdmin Hook - Admin API and WebSocket functionality
 * 
 * Handles:
 * - PIN authentication
 * - Game configuration
 * - Round control actions
 * - Event triggers
 */

import { useCallback } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useGameStore } from '@/stores/gameStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  state?: T;
  message?: string;
}

interface AdminStatus {
  success: boolean;
  status: string;
  currentRound: number;
  roundTimeRemaining: number;
  scenario: {
    type: string;
    narrative: string;
  };
  teams: Array<{
    teamId: number;
    teamName: string;
    isClaimed: boolean;
    hasSubmitted: boolean;
    decisionsCount: number;
  }>;
  teamsSubmitted: number;
  teamsClaimed: number;
  teamsTotal: number;
}

export interface ScoreboardTeam {
  teamId: number;
  teamName: string;
  currentStockPrice: number;
  cumulativeTSR: number;
  stockPricesByRound: Record<number, number>;
}

export interface ScoreboardData {
  success: boolean;
  currentRound: number;
  status: string;
  scenario: {
    type: string;
    narrative: string;
    eventTriggered: boolean;
    eventDescription?: string;
  };
  teams: ScoreboardTeam[];
}

export function useAdmin() {
  const setAuthenticated = useAdminStore((s) => s.setAuthenticated);
  const setAuthenticating = useAdminStore((s) => s.setAuthenticating);
  const setAuthError = useAdminStore((s) => s.setAuthError);
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  
  // Store the PIN in memory for subsequent requests
  let storedPin = '';
  
  /**
   * Authenticate with admin PIN
   */
  const authenticate = useCallback(async (pin: string): Promise<boolean> => {
    setAuthenticating(true);
    setAuthError(null);
    
    try {
      const response = await fetch(`${API_URL}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        storedPin = pin;
        // Store PIN in sessionStorage for persistence
        sessionStorage.setItem('adminPin', pin);
        setAuthenticated(true);
        return true;
      } else {
        setAuthError(data.error || 'Invalid PIN');
        return false;
      }
    } catch (error) {
      setAuthError('Connection error. Please try again.');
      return false;
    }
  }, [setAuthenticated, setAuthenticating, setAuthError]);
  
  /**
   * Get stored PIN from sessionStorage
   */
  const getPin = useCallback((): string => {
    if (storedPin) return storedPin;
    return sessionStorage.getItem('adminPin') || '';
  }, []);
  
  /**
   * Make an authenticated admin API request
   */
  const adminRequest = useCallback(async <T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> => {
    const pin = getPin();
    
    if (!pin) {
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      
      if (method === 'POST') {
        options.body = JSON.stringify({ pin, ...body });
      }
      
      const url = method === 'GET' 
        ? `${API_URL}${endpoint}?pin=${encodeURIComponent(pin)}`
        : `${API_URL}${endpoint}`;
      
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  }, [getPin]);
  
  /**
   * Get admin status (teams, submissions, game state)
   */
  const getStatus = useCallback(async (): Promise<AdminStatus | null> => {
    const result = await adminRequest<AdminStatus>('/admin/status', 'GET');
    if (result.success) {
      return result as unknown as AdminStatus;
    }
    return null;
  }, [adminRequest]);
  
  /**
   * Get scoreboard data (team rankings and historical stock prices)
   */
  const getScoreboard = useCallback(async (): Promise<ScoreboardData | null> => {
    const result = await adminRequest<ScoreboardData>('/admin/scoreboard', 'GET');
    if (result.success) {
      return result as unknown as ScoreboardData;
    }
    return null;
  }, [adminRequest]);
  
  /**
   * Configure team count
   */
  const configureTeamCount = useCallback(async (teamCount: number): Promise<ApiResponse> => {
    return adminRequest('/admin/config', 'POST', { teamCount });
  }, [adminRequest]);
  
  /**
   * Configure round duration
   */
  const configureRoundDuration = useCallback(async (roundDurationSeconds: number): Promise<ApiResponse> => {
    return adminRequest('/admin/config', 'POST', { roundDurationSeconds });
  }, [adminRequest]);
  
  /**
   * Start the game (begin Round 1)
   */
  const startGame = useCallback(async (): Promise<ApiResponse> => {
    return adminRequest('/admin/start-game', 'POST');
  }, [adminRequest]);
  
  /**
   * Pause the current round
   */
  const pauseRound = useCallback(async (): Promise<ApiResponse> => {
    return adminRequest('/admin/pause', 'POST');
  }, [adminRequest]);
  
  /**
   * Resume a paused round
   */
  const resumeRound = useCallback(async (): Promise<ApiResponse> => {
    return adminRequest('/admin/resume', 'POST');
  }, [adminRequest]);
  
  /**
   * Force-end the current round
   */
  const endRound = useCallback(async (): Promise<ApiResponse> => {
    return adminRequest('/admin/end-round', 'POST');
  }, [adminRequest]);
  
  /**
   * Advance to the next round
   */
  const nextRound = useCallback(async (): Promise<ApiResponse> => {
    return adminRequest('/admin/next-round', 'POST');
  }, [adminRequest]);
  
  /**
   * Trigger a scenario event
   */
  const triggerEvent = useCallback(async (eventType: string): Promise<ApiResponse> => {
    return adminRequest('/admin/trigger-event', 'POST', { eventType });
  }, [adminRequest]);
  
  /**
   * Reset the game to lobby
   */
  const resetGame = useCallback(async (): Promise<ApiResponse> => {
    return adminRequest('/admin/reset', 'POST');
  }, [adminRequest]);
  
  /**
   * Check if we have a stored PIN and try to re-authenticate
   */
  const checkStoredAuth = useCallback(async (): Promise<boolean> => {
    const pin = sessionStorage.getItem('adminPin');
    if (pin) {
      return authenticate(pin);
    }
    return false;
  }, [authenticate]);
  
  return {
    isAuthenticated,
    authenticate,
    checkStoredAuth,
    getStatus,
    getScoreboard,
    configureTeamCount,
    configureRoundDuration,
    startGame,
    pauseRound,
    resumeRound,
    endRound,
    nextRound,
    triggerEvent,
    resetGame,
  };
}
