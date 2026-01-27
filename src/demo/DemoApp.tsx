/**
 * Demo App
 * 
 * Main entry point for demo mode.
 * Provides navigation between player and admin views with mock data.
 */

import React, { useState } from 'react';
import { DemoModeProvider, DemoControlBar, DemoLanding, useDemoMode } from './DemoMode';
import { TeamSelection } from '@/components/TeamSelection';
import { Lobby } from '@/components/Lobby';
import { DecisionScreen } from '@/components/DecisionScreen';
import { RoundResults } from '@/components/RoundResults';
import { FinalResults } from '@/components/FinalResults';
import { AdminPanel } from '@/components/admin';

// =============================================================================
// Demo Player View
// =============================================================================

function DemoPlayerView() {
  const { currentScreen, setScreen } = useDemoMode();
  
  // Custom join handler for demo mode
  const handleDemoJoin = () => {
    setScreen('lobby');
  };
  
  const renderScreen = () => {
    switch (currentScreen) {
      case 'team-selection':
        return <DemoTeamSelection onJoin={handleDemoJoin} />;
      case 'lobby':
        return <Lobby />;
      case 'decision':
        return <DecisionScreen />;
      case 'results':
        return <RoundResults />;
      case 'final':
        return <FinalResults />;
      default:
        return <DemoTeamSelection onJoin={handleDemoJoin} />;
    }
  };
  
  return (
    <div className="pb-16"> {/* Padding for control bar */}
      {renderScreen()}
      <DemoControlBar />
    </div>
  );
}

// =============================================================================
// Demo Team Selection (Modified for demo)
// =============================================================================

interface DemoTeamSelectionProps {
  onJoin: () => void;
}

function DemoTeamSelection({ onJoin }: DemoTeamSelectionProps) {
  const [teamName, setTeamName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onJoin();
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
      {/* Header with Magna Logo */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-6xl font-black text-slate-800 tracking-tight">MAGNA</span>
          <span className="w-4 h-4 bg-magna-red rounded-full" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
          TSR Challenge
        </h1>
        <p className="text-slate-600 text-xl">
          Capital Allocation Simulation Game
        </p>
      </div>
      
      {/* Connection Status - Always connected in demo */}
      <div className="flex items-center gap-2 px-5 py-3 rounded-full mb-8 bg-emerald-100 text-emerald-700">
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <span className="text-lg font-medium">Demo Mode - No Server Required</span>
      </div>
      
      {/* Team Name Entry Card */}
      <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-magna-red/10 rounded-xl">
            <svg className="w-8 h-8 text-magna-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">Enter Your Team Name</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="teamName" className="block text-lg font-medium text-slate-600 mb-2">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Alpha Team, The Strategists"
              className="w-full px-5 py-4 rounded-xl text-xl font-medium bg-slate-50 border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-magna-red focus:ring-magna-red/20 transition-all duration-200"
              autoFocus
              maxLength={30}
            />
            <p className="text-base text-slate-500 mt-2">
              Choose a <span className="font-semibold text-slate-600">unique</span> name for your team (max 30 characters)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={!teamName.trim()}
            className={`w-full py-5 rounded-xl font-semibold text-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              teamName.trim()
                ? "bg-magna-red text-white hover:bg-magna-red-dark shadow-lg shadow-magna-red/30"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {teamName.trim() ? 'Join Game' : 'Enter Team Name to Continue'}
          </button>
        </form>
      </div>
      
      <p className="text-slate-500 text-lg mt-8">
        Magna International Leadership Meeting • 2026
      </p>
    </div>
  );
}

// =============================================================================
// Demo Admin View
// =============================================================================

function DemoAdminView() {
  return (
    <div>
      <AdminPanel />
      {/* Admin doesn't need the demo control bar - it has its own controls */}
    </div>
  );
}

// =============================================================================
// Main Demo App
// =============================================================================

export function DemoApp() {
  const [mode, setMode] = useState<'landing' | 'player' | 'admin'>('landing');
  
  if (mode === 'landing') {
    return <DemoLanding onSelectMode={(m) => setMode(m)} />;
  }
  
  if (mode === 'admin') {
    return <DemoAdminView />;
  }
  
  return (
    <DemoModeProvider>
      <DemoPlayerView />
    </DemoModeProvider>
  );
}

export default DemoApp;
