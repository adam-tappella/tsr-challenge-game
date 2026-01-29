/**
 * AdminDashboard Component
 * 
 * Main facilitator control panel with:
 * - Game configuration
 * - Round controls
 * - Teams status
 * - Event triggers
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  RotateCcw,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { useAdminStore } from '@/stores/adminStore';
import { useAdmin } from '@/hooks/useAdmin';
import { useSocket } from '@/hooks/useSocket';
import { MagnaLogo } from '../MagnaLogo';
import type { GameStatus } from '@/types/game';

interface AdminDashboardProps {
  className?: string;
  onOpenFramework?: () => void;
}

interface TeamInfo {
  teamId: number;
  teamName: string;
  isClaimed: boolean;
  hasSubmitted: boolean;
  decisionsCount: number;
}

// Year/Round scenario descriptions for facilitator reference
const YEAR_SCENARIOS: Record<number, { 
  title: string; 
  theme: string; 
  description: string;
  keyDynamics: string[];
  color: string;
}> = {
  1: {
    title: 'FY2026 – Business as Usual',
    theme: 'Stable Growth',
    description: 'The automotive market remains stable with moderate growth expectations. OEMs are investing in next-generation platforms while maintaining current production volumes.',
    keyDynamics: [
      'Steady demand across traditional and EV segments',
      'Normal competitive dynamics',
      'Standard capital allocation decisions',
    ],
    color: 'emerald',
  },
  2: {
    title: 'FY2027 – Business as Usual',
    theme: 'Continued Stability',
    description: 'Market conditions remain favorable with continued investment in electrification and advanced technologies. Supply chains have stabilized post-pandemic.',
    keyDynamics: [
      'EV transition accelerating as planned',
      'Healthy OEM order books',
      'Focus on operational excellence',
    ],
    color: 'emerald',
  },
  3: {
    title: 'FY2028 – Cost Pressures',
    theme: 'Margin Squeeze',
    description: 'Rising input costs and supply chain volatility are putting pressure on margins. Raw material prices have increased significantly, and labor costs are rising across key manufacturing regions.',
    keyDynamics: [
      'Commodity prices up 15-20%',
      'OEMs demanding price reductions',
      'Wage inflation in key markets',
      'Energy costs impacting operations',
    ],
    color: 'amber',
  },
  4: {
    title: 'FY2029 – Recession',
    theme: 'Market Downturn',
    description: 'A global economic recession has significantly reduced vehicle demand. OEMs are cutting production volumes and delaying new program launches. Consumer confidence is at multi-year lows.',
    keyDynamics: [
      'Vehicle sales down 20-25%',
      'OEM program cancellations',
      'Customers in-sourcing to fill capacity',
      'Credit markets tightening',
      'Restructuring announcements across the industry',
    ],
    color: 'red',
  },
  5: {
    title: 'FY2030 – Recovery',
    theme: 'Market Rebound',
    description: 'The economy is recovering and automotive demand is rebounding. OEMs are ramping up production and launching delayed programs. Companies with strong balance sheets are well-positioned to capture growth.',
    keyDynamics: [
      'Pent-up demand driving sales recovery',
      'New program launches resuming',
      'M&A opportunities emerging',
      'Technology investments paying off',
      'Strong performers gaining market share',
    ],
    color: 'blue',
  },
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ className, onOpenFramework }) => {
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
    resetGame,
  } = useAdmin();
  
  // Initialize socket connection for real-time updates
  useSocket();
  
  // Fetch status periodically for initial load and fallback
  const fetchStatus = useCallback(async () => {
    const status = await getStatus();
    if (status) {
      setTeams(status.teams);
      setTeamCount(status.teamsTotal);
    }
  }, [getStatus]);
  
  // Derive real-time team data from gameState (updates via WebSocket instantly)
  // Use useMemo with JSON.stringify to detect deep changes in teams object
  const realTimeTeams = useMemo(() => {
    if (!gameState?.teams) return null;
    return Object.values(gameState.teams).map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName || '',
      isClaimed: team.isClaimed,
      hasSubmitted: team.hasSubmitted,
      decisionsCount: team.currentRoundDecisions?.length || 0,
    }));
  }, [JSON.stringify(gameState?.teams)]);
  
  // Update local state when real-time data changes
  useEffect(() => {
    if (realTimeTeams) {
      setTeams(realTimeTeams);
      if (gameState?.teamCount) {
        setTeamCount(gameState.teamCount);
      }
    }
  }, [realTimeTeams, gameState?.teamCount]);
  
  // Initial fetch and periodic refresh as fallback
  useEffect(() => {
    fetchStatus();
    // Poll every 3 seconds as fallback (real-time updates come via WebSocket)
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
      "min-h-screen bg-slate-100",
      className
    )}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MagnaLogo variant="color" size="xs" />
              <div className="bg-magna-red text-white px-3 py-1 rounded-full text-sm font-medium">
                FACILITATOR
              </div>
              <h1 className="text-xl font-semibold text-slate-700">
                Control Panel
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <StatusBadge status={status} />
              
              {/* Framework Button */}
              {onOpenFramework && (
                <button
                  onClick={onOpenFramework}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-magna-red text-magna-red rounded-xl hover:bg-magna-red hover:text-white transition-colors font-medium"
                >
                  <BookOpen className="w-4 h-4" />
                  Principles & Dynamics
                </button>
              )}
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-800 transition-colors"
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
            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
            : "bg-red-50 border border-red-200 text-red-700"
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
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-slate-700" />
                  Game Status
                </h2>
                <button
                  onClick={fetchStatus}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-slate-800">{currentRound}</div>
                  <div className="text-sm text-slate-700">Current Round</div>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
                  <div className={cn(
                    "text-3xl font-bold font-mono",
                    timeRemaining <= 60 ? "text-magna-red" : "text-slate-800"
                  )}>
                    {formattedTime}
                  </div>
                  <div className="text-sm text-slate-700">Time Remaining</div>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-slate-800">
                    {submittedTeams}/{claimedTeams}
                  </div>
                  <div className="text-sm text-slate-700">
                    {submittedTeams === 1 ? '1 team' : `${submittedTeams} teams`} submitted
                  </div>
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
                        ? "bg-magna-red text-white hover:bg-magna-red-dark"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <Play className="w-5 h-5" />
                    Start Game
                  </button>
                )}
                
                {status === 'active' && (
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
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
                    className="flex items-center gap-2 px-6 py-3 bg-magna-red text-white rounded-xl font-medium hover:bg-magna-red-dark transition-colors"
                  >
                    <StopCircle className="w-5 h-5" />
                    End Round
                  </button>
                )}
                
                {status === 'results' && (
                  <button
                    onClick={handleNextRound}
                    className="flex items-center gap-2 px-6 py-3 bg-magna-red text-white rounded-xl font-medium hover:bg-magna-red-dark transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                    {currentRound < 5 ? `Start Round ${currentRound + 1}` : 'Finish Game'}
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset Game
                </button>
              </div>
            </div>
            
            {/* Configuration Card (only in lobby) */}
            {status === 'lobby' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-slate-700" />
                  Game Configuration
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Team Count */}
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Number of Teams
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={10}
                        max={20}
                        value={teamCount}
                        onChange={(e) => setTeamCount(parseInt(e.target.value) || 15)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-magna-red focus:border-magna-red"
                      />
                      <button
                        onClick={handleConfigureTeams}
                        disabled={isLoading}
                        className="px-4 py-2 bg-magna-red text-white rounded-xl font-medium hover:bg-magna-red-dark transition-colors"
                      >
                        Set
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">Min: 10, Max: 20</p>
                  </div>
                  
                  {/* Round Duration */}
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Round Duration (seconds)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={60}
                        max={1800}
                        value={roundDuration}
                        onChange={(e) => setRoundDuration(parseInt(e.target.value) || 600)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-magna-red focus:border-magna-red"
                      />
                      <button
                        onClick={handleConfigureDuration}
                        disabled={isLoading}
                        className="px-4 py-2 bg-magna-red text-white rounded-xl font-medium hover:bg-magna-red-dark transition-colors"
                      >
                        Set
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      {Math.floor(roundDuration / 60)} min {roundDuration % 60} sec
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Year Overview (during active game) */}
            {(status === 'active' || status === 'paused' || status === 'results') && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <YearOverview round={currentRound} />
              </div>
            )}
          </div>
          
          {/* Right Column - Teams Status */}
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-slate-700" />
                Teams Status
              </h2>
              
              {/* Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Joined</span>
                  <span className="text-slate-800 font-medium">{claimedTeams} / {teamCount}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-magna-red rounded-full transition-all duration-500"
                    style={{ width: `${(claimedTeams / teamCount) * 100}%` }}
                  />
                </div>
                
                {(status === 'active' || status === 'paused') && (
                  <>
                    <div className="flex items-center justify-between mb-2 mt-4">
                      <span className="text-slate-600">Submitted</span>
                      <span className="text-slate-800 font-medium">{submittedTeams} / {claimedTeams}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
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
                        isClaimed ? "bg-slate-100" : "bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                          isClaimed ? "bg-magna-red/10 text-magna-red" : "bg-slate-200 text-slate-400"
                        )}>
                          {teamId}
                        </div>
                        <span className={cn(
                          "font-medium truncate max-w-[150px]",
                          isClaimed ? "text-slate-800" : "text-slate-400"
                        )}>
                          {team?.teamName || `Team ${teamId}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!isClaimed && (
                          <span className="text-xs text-slate-400">Not joined</span>
                        )}
                        {isClaimed && !hasSubmitted && (status === 'active' || status === 'paused') && (
                          <span className="text-xs text-amber-500">Deciding...</span>
                        )}
                        {isClaimed && hasSubmitted && (status === 'active' || status === 'paused') && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-emerald-600 font-medium">Decided</span>
                          </div>
                        )}
                        {isClaimed && hasSubmitted && status !== 'active' && status !== 'paused' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {isClaimed && !hasSubmitted && status !== 'active' && status !== 'paused' && (
                          <span className="text-xs text-slate-700">Ready</span>
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

/**
 * YearOverview Component
 * Displays the current year's scenario context for the facilitator
 */
const YearOverview: React.FC<{ round: number }> = ({ round }) => {
  const scenario = YEAR_SCENARIOS[round] || YEAR_SCENARIOS[1];
  
  const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
    },
  };
  
  const colors = colorClasses[scenario.color] || colorClasses.emerald;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-700" />
          Year Overview
        </h2>
        <span className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          colors.badge
        )}>
          {scenario.theme}
        </span>
      </div>
      
      <div className={cn(
        "rounded-xl p-5 border-2",
        colors.bg,
        colors.border
      )}>
        <h3 className={cn("text-xl font-bold mb-3", colors.text)}>
          {scenario.title}
        </h3>
        
        <p className="text-slate-700 mb-4 leading-relaxed">
          {scenario.description}
        </p>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">
            Key Market Dynamics
          </div>
          <ul className="space-y-1.5">
            {scenario.keyDynamics.map((dynamic, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-700">
                <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0", colors.text.replace('text-', 'bg-'))} />
                {dynamic}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

AdminDashboard.displayName = 'AdminDashboard';
