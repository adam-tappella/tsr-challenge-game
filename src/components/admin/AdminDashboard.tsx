/**
 * AdminDashboard Component
 * 
 * Main facilitator control panel with:
 * - Game configuration
 * - Round controls
 * - Teams status
 * - Event triggers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Play, 
  Pause, 
  SkipForward, 
  StopCircle,
  Users,
  Timer,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  LogOut,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { useAdminStore } from '@/stores/adminStore';
import { useAdmin } from '@/hooks/useAdmin';
import { useSocket } from '@/hooks/useSocket';
import type { GameStatus } from '@/types/game';

interface AdminDashboardProps {
  className?: string;
}

interface TeamInfo {
  teamId: number;
  isClaimed: boolean;
  hasSubmitted: boolean;
  decisionsCount: number;
}

const SCENARIO_EVENTS = [
  { id: 'supply_chain_disruption', name: 'Supply Chain Disruption', description: 'Major supply chain issue' },
  { id: 'key_customer_loss', name: 'Key Customer Loss', description: 'OEM in-sourcing announcement' },
  { id: 'technology_shift', name: 'Technology Shift', description: 'EV technology breakthrough' },
  { id: 'regulatory_change', name: 'Regulatory Change', description: 'New environmental regulations' },
  { id: 'competitor_acquisition', name: 'Competitor Acquired', description: 'Major competitor acquired' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  // Local state
  const [teamCount, setTeamCount] = useState(15);
  const [roundDuration, setRoundDuration] = useState(600);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Stores
  const gameState = useGameStore((s) => s.gameState);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const logout = useAdminStore((s) => s.logout);
  
  // Hooks
  const { 
    getStatus, 
    configureTeamCount, 
    configureRoundDuration,
    startGame, 
    pauseRound, 
    resumeRound, 
    endRound, 
    nextRound, 
    triggerEvent,
    resetGame,
  } = useAdmin();
  
  // Initialize socket connection for real-time updates
  useSocket();
  
  // Fetch status periodically
  const fetchStatus = useCallback(async () => {
    const status = await getStatus();
    if (status) {
      setTeams(status.teams);
      setTeamCount(status.teamsTotal);
    }
  }, [getStatus]);
  
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);
  
  // Show action message
  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };
  
  // Action handlers
  const handleConfigureTeams = async () => {
    setIsLoading(true);
    const result = await configureTeamCount(teamCount);
    if (result.success) {
      showMessage('success', `Team count set to ${teamCount}`);
    } else {
      showMessage('error', result.error || 'Failed to configure teams');
    }
    setIsLoading(false);
  };
  
  const handleConfigureDuration = async () => {
    setIsLoading(true);
    const result = await configureRoundDuration(roundDuration);
    if (result.success) {
      showMessage('success', `Round duration set to ${Math.floor(roundDuration / 60)} minutes`);
    } else {
      showMessage('error', result.error || 'Failed to configure duration');
    }
    setIsLoading(false);
  };
  
  const handleStartGame = async () => {
    setIsLoading(true);
    const result = await startGame();
    if (result.success) {
      showMessage('success', 'Game started! Round 1 has begun.');
    } else {
      showMessage('error', result.error || 'Failed to start game');
    }
    setIsLoading(false);
  };
  
  const handlePause = async () => {
    const result = await pauseRound();
    if (result.success) {
      showMessage('success', 'Round paused');
    } else {
      showMessage('error', result.error || 'Failed to pause');
    }
  };
  
  const handleResume = async () => {
    const result = await resumeRound();
    if (result.success) {
      showMessage('success', 'Round resumed');
    } else {
      showMessage('error', result.error || 'Failed to resume');
    }
  };
  
  const handleEndRound = async () => {
    if (!confirm('Are you sure you want to end this round early?')) return;
    const result = await endRound();
    if (result.success) {
      showMessage('success', 'Round ended');
    } else {
      showMessage('error', result.error || 'Failed to end round');
    }
  };
  
  const handleNextRound = async () => {
    const result = await nextRound();
    if (result.success) {
      showMessage('success', 'Advanced to next round');
    } else {
      showMessage('error', result.error || 'Failed to advance');
    }
  };
  
  const handleTriggerEvent = async (eventId: string) => {
    const result = await triggerEvent(eventId);
    if (result.success) {
      showMessage('success', `Event triggered: ${eventId.replace(/_/g, ' ')}`);
    } else {
      showMessage('error', result.error || 'Failed to trigger event');
    }
  };
  
  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the game? All progress will be lost.')) return;
    const result = await resetGame();
    if (result.success) {
      showMessage('success', 'Game reset to lobby');
    } else {
      showMessage('error', result.error || 'Failed to reset');
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('adminPin');
    logout();
  };
  
  // Derived state
  const status = gameState?.status || 'lobby';
  const currentRound = gameState?.currentRound || 1;
  const claimedTeams = teams.filter((t) => t.isClaimed).length;
  const submittedTeams = teams.filter((t) => t.hasSubmitted).length;
  
  const formattedTime = `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`;
  
  return (
    <div className={cn(
      "min-h-screen bg-slate-900",
      className
    )}>
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                FACILITATOR
              </div>
              <h1 className="text-xl font-bold text-white">
                Magna TSR Challenge Control Panel
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <StatusBadge status={status} />
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Action Message */}
      {actionMessage && (
        <div className={cn(
          "fixed top-20 left-1/2 -translate-x-1/2 z-50",
          "px-6 py-3 rounded-xl shadow-lg flex items-center gap-2",
          actionMessage.type === 'success' 
            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
            : "bg-red-500/20 border border-red-500/30 text-red-400"
        )}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {actionMessage.text}
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Status Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-slate-400" />
                  Game Status
                </h2>
                <button
                  onClick={fetchStatus}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">{currentRound}</div>
                  <div className="text-sm text-slate-400">Current Round</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 text-center">
                  <div className={cn(
                    "text-3xl font-bold font-mono",
                    timeRemaining <= 60 ? "text-red-400" : "text-white"
                  )}>
                    {formattedTime}
                  </div>
                  <div className="text-sm text-slate-400">Time Remaining</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">
                    {submittedTeams}/{claimedTeams}
                  </div>
                  <div className="text-sm text-slate-400">Teams Submitted</div>
                </div>
              </div>
              
              {/* Round Controls */}
              <div className="flex flex-wrap gap-3">
                {status === 'lobby' && (
                  <button
                    onClick={handleStartGame}
                    disabled={isLoading || claimedTeams === 0}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors",
                      claimedTeams > 0
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    <Play className="w-5 h-5" />
                    Start Game
                  </button>
                )}
                
                {status === 'active' && (
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-500 transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Pause Round
                  </button>
                )}
                
                {status === 'paused' && (
                  <button
                    onClick={handleResume}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Resume Round
                  </button>
                )}
                
                {(status === 'active' || status === 'paused') && (
                  <button
                    onClick={handleEndRound}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 transition-colors"
                  >
                    <StopCircle className="w-5 h-5" />
                    End Round
                  </button>
                )}
                
                {status === 'results' && (
                  <button
                    onClick={handleNextRound}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                    {currentRound < 5 ? `Start Round ${currentRound + 1}` : 'Finish Game'}
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-600 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset Game
                </button>
              </div>
            </div>
            
            {/* Configuration Card (only in lobby) */}
            {status === 'lobby' && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-slate-400" />
                  Game Configuration
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Team Count */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Number of Teams
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={10}
                        max={20}
                        value={teamCount}
                        onChange={(e) => setTeamCount(parseInt(e.target.value) || 15)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleConfigureTeams}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                      >
                        Set
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Min: 10, Max: 20</p>
                  </div>
                  
                  {/* Round Duration */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Round Duration (seconds)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={60}
                        max={1800}
                        value={roundDuration}
                        onChange={(e) => setRoundDuration(parseInt(e.target.value) || 600)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleConfigureDuration}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                      >
                        Set
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {Math.floor(roundDuration / 60)} min {roundDuration % 60} sec
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Event Triggers (only during active game) */}
            {(status === 'active' || status === 'paused') && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Scenario Events
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {SCENARIO_EVENTS.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleTriggerEvent(event.id)}
                      className="flex items-start gap-3 p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors text-left"
                    >
                      <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-white">{event.name}</div>
                        <div className="text-xs text-slate-400">{event.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Teams Status */}
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-slate-400" />
                Teams Status
              </h2>
              
              {/* Summary */}
              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Joined</span>
                  <span className="text-white font-medium">{claimedTeams} / {teamCount}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(claimedTeams / teamCount) * 100}%` }}
                  />
                </div>
                
                {(status === 'active' || status === 'paused') && (
                  <>
                    <div className="flex items-center justify-between mb-2 mt-4">
                      <span className="text-slate-400">Submitted</span>
                      <span className="text-white font-medium">{submittedTeams} / {claimedTeams}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: claimedTeams > 0 ? `${(submittedTeams / claimedTeams) * 100}%` : '0%' }}
                      />
                    </div>
                  </>
                )}
              </div>
              
              {/* Team List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {Array.from({ length: teamCount }, (_, i) => i + 1).map((teamId) => {
                  const team = teams.find((t) => t.teamId === teamId);
                  const isClaimed = team?.isClaimed || false;
                  const hasSubmitted = team?.hasSubmitted || false;
                  
                  return (
                    <div
                      key={teamId}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl",
                        isClaimed ? "bg-slate-900" : "bg-slate-900/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                          isClaimed ? "bg-blue-500/20 text-blue-400" : "bg-slate-700 text-slate-500"
                        )}>
                          {teamId}
                        </div>
                        <span className={cn(
                          "font-medium",
                          isClaimed ? "text-white" : "text-slate-500"
                        )}>
                          Team {teamId}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!isClaimed && (
                          <span className="text-xs text-slate-500">Not joined</span>
                        )}
                        {isClaimed && !hasSubmitted && status === 'active' && (
                          <span className="text-xs text-amber-400">Deciding...</span>
                        )}
                        {isClaimed && hasSubmitted && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {isClaimed && !hasSubmitted && status !== 'active' && (
                          <span className="text-xs text-slate-400">Ready</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// =============================================================================
// Helper Components
// =============================================================================

const StatusBadge: React.FC<{ status: GameStatus }> = ({ status }) => {
  const config: Record<GameStatus, { label: string; color: string }> = {
    lobby: { label: 'Lobby', color: 'bg-slate-500' },
    active: { label: 'Active', color: 'bg-emerald-500' },
    paused: { label: 'Paused', color: 'bg-amber-500' },
    results: { label: 'Results', color: 'bg-blue-500' },
    finished: { label: 'Finished', color: 'bg-purple-500' },
  };
  
  const { label, color } = config[status] || config.lobby;
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium",
      color
    )}>
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      {label}
    </div>
  );
};

AdminDashboard.displayName = 'AdminDashboard';
