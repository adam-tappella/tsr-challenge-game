/**
 * App Component
 * 
 * Main application entry point for the Magna TSR Challenge.
 * Handles routing between screens based on URL and game state:
 * 
 * Routes:
 * - / (or /game) - Team interface
 * - /admin - Facilitator control panel
 * 
 * Team Interface States:
 * - Team Selection (not joined)
 * - Lobby (joined, game not started)
 * - Decision Screen (active round)
 * - Round Results (round ended)
 * - Final Results (game finished)
 */

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore, useGameStatus } from '@/stores/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { AccessGate } from '@/components/AccessGate';
import { TeamSelection } from '@/components/TeamSelection';
import { Lobby } from '@/components/Lobby';
import { DecisionScreen } from '@/components/DecisionScreen';
import { RoundResults } from '@/components/RoundResults';
import { FinalResults } from '@/components/FinalResults';
import { AdminPanel } from '@/components/admin';
import { RoundCountdown } from '@/components/RoundCountdown';

// =============================================================================
// ACCESS CODE - Change this to control who can access the app
// =============================================================================
const ACCESS_CODE = 'magna2026';

type Route = 'team' | 'admin';

function App() {
  const [route, setRoute] = useState<Route>('team');
  
  // Handle routing based on URL
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/admin' || hash === '#admin') {
        setRoute('admin');
      } else {
        setRoute('team');
      }
    };
    
    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);
  
  // Wrap everything in AccessGate
  return (
    <AccessGate accessCode={ACCESS_CODE}>
      {route === 'admin' ? <AdminPanel /> : <TeamInterface />}
    </AccessGate>
  );
}

/**
 * TeamInterface - The main player-facing interface
 */
function TeamInterface() {
  // Initialize socket connection
  const { isConnected, isConnecting, error } = useSocket();
  
  // Game state
  const hasJoinedGame = useGameStore((s) => s.hasJoinedGame);
  const gameStatus = useGameStatus();
  const availableDecisions = useGameStore((s) => s.availableDecisions);
  const currentRound = useGameStore((s) => s.gameState?.currentRound);
  
  // Countdown overlay state - shown on top of blurred decision screen
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(false);
  const prevStatusRef = useRef<string | null>(null);
  const prevRoundRef = useRef<number | null>(null);
  const hasShownCountdownForRound = useRef<number | null>(null);
  
  // Log connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log('[App] Connected to game server');
    }
  }, [isConnected]);
  
  // Detect when a new round starts and trigger countdown overlay
  useEffect(() => {
    const wasNotActive = prevStatusRef.current !== 'active';
    const isNowActive = gameStatus === 'active';
    const isNewRound = currentRound !== null && currentRound !== hasShownCountdownForRound.current;
    
    // Show countdown overlay when:
    // 1. Game becomes active (transition from non-active to active)
    // 2. OR it's a new round we haven't shown countdown for yet
    if (isNowActive && availableDecisions.length > 0 && (wasNotActive || isNewRound)) {
      // Only show if we haven't already shown for this round
      if (hasShownCountdownForRound.current !== currentRound) {
        setShowCountdownOverlay(true);
        hasShownCountdownForRound.current = currentRound;
      }
    }
    
    // Hide countdown when leaving active state
    if (gameStatus === 'lobby' || gameStatus === 'results' || gameStatus === 'finished') {
      setShowCountdownOverlay(false);
    }
    
    prevStatusRef.current = gameStatus;
    prevRoundRef.current = currentRound ?? null;
  }, [gameStatus, availableDecisions.length, currentRound]);
  
  // Handle countdown completion - just hide the overlay
  const handleCountdownComplete = () => {
    setShowCountdownOverlay(false);
  };
  
  // Handle connection error
  if (error && !isConnected && !isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magna-darker via-magna-dark to-magna-darker flex items-center justify-center p-8">
        <div className="bg-magna-red/10 border border-magna-red/30 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-magna-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-magna-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-magna-red mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-magna-red text-white rounded-xl font-medium hover:bg-magna-red-dark transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
  
  // Determine which screen to show
  const renderScreen = () => {
    // Not joined yet - show team selection
    if (!hasJoinedGame) {
      return <TeamSelection />;
    }
    
    // Game finished - show final results
    if (gameStatus === 'finished') {
      return <FinalResults />;
    }
    
    // Round results - show results screen
    if (gameStatus === 'results') {
      return <RoundResults />;
    }
    
    // Active or paused round - show decision screen with countdown overlay on top
    if ((gameStatus === 'active' || gameStatus === 'paused') && availableDecisions.length > 0) {
      return (
        <div className="relative">
          {/* Decision screen - always rendered, blurred when countdown is showing */}
          <div className={showCountdownOverlay ? 'blur-sm pointer-events-none' : ''}>
            <DecisionScreen isCountdownShowing={showCountdownOverlay} />
          </div>
          
          {/* Countdown overlay on top */}
          {showCountdownOverlay && (
            <div className="fixed inset-0 z-50">
              <RoundCountdown
                round={currentRound || 1}
                onComplete={handleCountdownComplete}
              />
            </div>
          )}
        </div>
      );
    }
    
    // Lobby - waiting for game to start
    return <Lobby />;
  };
  
  return (
    <div className="min-h-screen bg-magna-darker">
      {renderScreen()}
      
      {/* Admin Link (subtle, bottom right) */}
      <a
        href="#admin"
        className="fixed bottom-4 right-4 text-magna-gray/50 hover:text-magna-gray text-xs transition-colors"
      >
        Admin
      </a>
    </div>
  );
}

export default App;
