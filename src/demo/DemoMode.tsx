/**
 * Demo Mode Component
 * 
 * Provides a frontend-only demo experience with mock data.
 * Allows testing all screens without a backend server.
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Play, 
  SkipForward, 
  RotateCcw, 
  Monitor, 
  Users,
  ChevronRight,
  Eye,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { 
  DEMO_DECISIONS, 
  createDemoGameState, 
  createDemoRoundResults,
  createDemoFinalResults,
} from './demoData';
import type { RoundNumber } from '@/types/game';

// =============================================================================
// Demo Context
// =============================================================================

interface DemoContextType {
  isDemo: boolean;
  currentScreen: DemoScreen;
  currentRound: RoundNumber;
  setScreen: (screen: DemoScreen) => void;
  nextScreen: () => void;
  previousScreen: () => void;
  setRound: (round: RoundNumber) => void;
  resetDemo: () => void;
}

type DemoScreen = 'team-selection' | 'lobby' | 'decision' | 'results' | 'final';

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
}

// =============================================================================
// Demo Mode Provider
// =============================================================================

interface DemoModeProviderProps {
  children: React.ReactNode;
}

export function DemoModeProvider({ children }: DemoModeProviderProps) {
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>('team-selection');
  const [currentRound, setCurrentRound] = useState<RoundNumber>(1);
  
  const store = useGameStore();
  
  // Initialize demo state when screen changes
  useEffect(() => {
    switch (currentScreen) {
      case 'team-selection':
        store.reset();
        break;
      case 'lobby':
        store.setTeamId(1);
        store.setTeamName('Demo Team');
        store.setJoinedGame(true);
        store.updateGameState(createDemoGameState(currentRound, 'lobby'));
        break;
      case 'decision':
        store.setTeamId(1);
        store.setTeamName('Demo Team');
        store.setJoinedGame(true);
        store.updateGameState(createDemoGameState(currentRound, 'active'));
        store.setAvailableDecisions(DEMO_DECISIONS);
        store.setTimeRemaining(180);
        break;
      case 'results':
        store.setTeamId(1);
        store.setTeamName('Demo Team');
        store.setJoinedGame(true);
        store.updateGameState(createDemoGameState(currentRound, 'results'));
        store.setRoundResults(createDemoRoundResults(currentRound));
        break;
      case 'final':
        store.setTeamId(1);
        store.setTeamName('Demo Team');
        store.setJoinedGame(true);
        store.updateGameState(createDemoGameState(5, 'finished'));
        store.setFinalResults(createDemoFinalResults());
        break;
    }
  }, [currentScreen, currentRound]);
  
  const screenOrder: DemoScreen[] = ['team-selection', 'lobby', 'decision', 'results', 'final'];
  
  const nextScreen = () => {
    const currentIndex = screenOrder.indexOf(currentScreen);
    if (currentIndex < screenOrder.length - 1) {
      setCurrentScreen(screenOrder[currentIndex + 1]);
    }
  };
  
  const previousScreen = () => {
    const currentIndex = screenOrder.indexOf(currentScreen);
    if (currentIndex > 0) {
      setCurrentScreen(screenOrder[currentIndex - 1]);
    }
  };
  
  const resetDemo = () => {
    setCurrentScreen('team-selection');
    setCurrentRound(1);
    store.reset();
  };
  
  const value: DemoContextType = {
    isDemo: true,
    currentScreen,
    currentRound,
    setScreen: setCurrentScreen,
    nextScreen,
    previousScreen,
    setRound: setCurrentRound,
    resetDemo,
  };
  
  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

// =============================================================================
// Demo Control Bar
// =============================================================================

interface DemoControlBarProps {
  className?: string;
}

export function DemoControlBar({ className }: DemoControlBarProps) {
  const { currentScreen, currentRound, setScreen, setRound, nextScreen, resetDemo } = useDemoMode();
  
  const screens: { id: DemoScreen; label: string }[] = [
    { id: 'team-selection', label: 'Join' },
    { id: 'lobby', label: 'Lobby' },
    { id: 'decision', label: 'Decide' },
    { id: 'results', label: 'Results' },
    { id: 'final', label: 'Final' },
  ];
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-slate-900 text-white py-3 px-4 z-50 shadow-2xl",
      className
    )}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Demo Badge */}
        <div className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1.5 rounded-lg font-bold text-sm">
          <Eye className="w-4 h-4" />
          DEMO MODE
        </div>
        
        {/* Screen Navigation */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {screens.map((screen, index) => (
            <React.Fragment key={screen.id}>
              <button
                onClick={() => setScreen(screen.id)}
                className={cn(
                  "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  currentScreen === screen.id
                    ? "bg-magna-red text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
              >
                {screen.label}
              </button>
              {index < screens.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Round Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Round:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((round) => (
              <button
                key={round}
                onClick={() => setRound(round as RoundNumber)}
                className={cn(
                  "w-8 h-8 rounded text-sm font-bold transition-colors",
                  currentRound === round
                    ? "bg-magna-red text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                )}
              >
                {round}
              </button>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={nextScreen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            Next
          </button>
          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Demo Landing Page
// =============================================================================

interface DemoLandingProps {
  onSelectMode: (mode: 'player' | 'admin') => void;
}

export function DemoLanding({ onSelectMode }: DemoLandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-6xl font-black text-white tracking-tight">MAGNA</span>
          <span className="w-4 h-4 bg-magna-red rounded-full" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          TSR Challenge
        </h1>
        <p className="text-slate-400 text-xl">
          Capital Allocation Simulation Game
        </p>
        
        {/* Demo Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-full font-bold text-sm mt-6">
          <Eye className="w-4 h-4" />
          FRONTEND DEMO - No Server Required
        </div>
      </div>
      
      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Player Mode */}
        <button
          onClick={() => onSelectMode('player')}
          className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-8 text-left transition-all group"
        >
          <div className="bg-magna-red/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-magna-red/30 transition-colors">
            <Users className="w-8 h-8 text-magna-red" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Player View</h2>
          <p className="text-slate-400 mb-4">
            Experience the game as a team captain. Make investment decisions and see results.
          </p>
          <div className="flex items-center gap-2 text-magna-red font-semibold">
            Enter Demo
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
        
        {/* Admin Mode */}
        <button
          onClick={() => onSelectMode('admin')}
          className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-8 text-left transition-all group"
        >
          <div className="bg-blue-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
            <Settings className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin View</h2>
          <p className="text-slate-400 mb-4">
            See the facilitator control panel. Manage game flow and monitor teams.
          </p>
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            Enter Demo
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      </div>
      
      {/* Info */}
      <p className="text-slate-500 text-sm mt-12 max-w-md text-center">
        This is a frontend demo for gathering UI/UX feedback. 
        Use the control bar at the bottom to navigate between screens.
      </p>
    </div>
  );
}
