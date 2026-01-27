/**
 * GameRecap Component
 * 
 * Displays a detailed recap of how the game played out after it ends.
 * Features:
 * - Stock price progression chart for all teams
 * - Clickable team cards to drill into round-by-round details
 * - Per-round: decisions selected, cost spent, stock price, TSR
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { FinalResults, TeamRoundSnapshot, DecisionSummary } from '@/types/game';

// =============================================================================
// Types
// =============================================================================

interface GameRecapProps {
  finalResults: FinalResults;
  onClose: () => void;
  className?: string;
}

interface TeamHistoryViewProps {
  teamId: number;
  teamName: string;
  history: TeamRoundSnapshot[];
  finalTSR: number;
  finalStockPrice: number;
  startingStockPrice: number;
}

// =============================================================================
// Constants
// =============================================================================

const TEAM_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#a855f7', // purple
  '#eab308', // yellow
  '#10b981', // emerald
  '#0ea5e9', // sky
];

const CATEGORY_ICONS = {
  grow: TrendingUp,
  optimize: Settings,
  sustain: Shield,
};

const CATEGORY_COLORS = {
  grow: 'text-emerald-600',
  optimize: 'text-blue-600',
  sustain: 'text-amber-600',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Prepares chart data from team histories
 */
function prepareChartData(
  teamHistories: Record<number, TeamRoundSnapshot[]>,
  leaderboard: FinalResults['leaderboard'],
  startingPrice: number
): Array<Record<string, number | string>> {
  // Get all rounds (1-5)
  const rounds = [0, 1, 2, 3, 4, 5]; // 0 = starting point
  
  // Create data points for each round
  const data: Array<Record<string, number | string>> = rounds.map(round => {
    const point: Record<string, number | string> = {
      round: round === 0 ? 'Start' : `Round ${round}`,
    };
    
    // Add each team's stock price
    for (const teamResult of leaderboard) {
      const history = teamHistories[teamResult.teamId] || [];
      
      if (round === 0) {
        // Starting price for all teams
        point[`team${teamResult.teamId}`] = startingPrice;
      } else {
        // Find the snapshot for this round
        const snapshot = history.find(s => s.round === round);
        if (snapshot) {
          point[`team${teamResult.teamId}`] = parseFloat(snapshot.stockPrice.toFixed(2));
        }
      }
    }
    
    return point;
  });
  
  return data;
}

// =============================================================================
// Sub-Components
// =============================================================================

/**
 * Team history expanded view showing round-by-round breakdown
 */
const TeamHistoryView: React.FC<TeamHistoryViewProps> = ({
  teamId,
  teamName,
  history,
  finalTSR,
  finalStockPrice,
  startingStockPrice,
}) => {
  return (
    <div className="space-y-4 mt-4 border-t border-slate-200 pt-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-100 rounded-lg p-4 text-center">
          <div className="text-sm text-slate-500 uppercase tracking-wide mb-1">Starting</div>
          <div className="text-slate-800 font-bold text-xl">${startingStockPrice.toFixed(2)}</div>
        </div>
        <div className="bg-slate-100 rounded-lg p-4 text-center">
          <div className="text-sm text-slate-500 uppercase tracking-wide mb-1">Final</div>
          <div className="text-slate-800 font-bold text-xl">${finalStockPrice.toFixed(2)}</div>
        </div>
        <div className="bg-slate-100 rounded-lg p-4 text-center">
          <div className="text-sm text-slate-500 uppercase tracking-wide mb-1">Total TSR</div>
          <div className={cn(
            "font-bold text-xl",
            finalTSR >= 0 ? "text-emerald-600" : "text-magna-red"
          )}>
            {finalTSR >= 0 ? '+' : ''}{(finalTSR * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Round-by-Round Breakdown */}
      {history.map((snapshot, index) => {
        const prevSnapshot = index > 0 ? history[index - 1] : null;
        const priceChange = prevSnapshot 
          ? snapshot.stockPrice - prevSnapshot.stockPrice
          : snapshot.stockPrice - startingStockPrice;
        
        return (
          <div key={snapshot.round} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-magna-red/10 text-magna-red rounded-lg flex items-center justify-center font-bold text-lg">
                  {snapshot.round}
                </div>
                <div>
                  <div className="text-slate-800 font-semibold text-lg">Round {snapshot.round}</div>
                  <div className="text-sm text-slate-500">FY{2025 + snapshot.round}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-800 font-bold text-xl">${snapshot.stockPrice.toFixed(2)}</div>
                <div className={cn(
                  "text-base font-semibold",
                  priceChange >= 0 ? "text-emerald-600" : "text-magna-red"
                )}>
                  {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({snapshot.roundTSR >= 0 ? '+' : ''}{(snapshot.roundTSR * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
            
            {/* Decisions */}
            {snapshot.decisions.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {snapshot.decisions.length} Decision{snapshot.decisions.length !== 1 ? 's' : ''} - ${snapshot.cashSpent}M Invested
                </div>
                <div className="grid gap-2">
                  {snapshot.decisions.map((decision) => {
                    const CategoryIcon = CATEGORY_ICONS[decision.category];
                    return (
                      <div
                        key={decision.id}
                        className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-2"
                      >
                        <CategoryIcon className={cn("w-5 h-5 flex-shrink-0", CATEGORY_COLORS[decision.category])} />
                        <span className="text-slate-800 text-base flex-1 truncate">{decision.name}</span>
                        <span className="text-slate-500 text-base font-medium">${decision.cost}M</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-base italic">No decisions submitted this round</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const GameRecap: React.FC<GameRecapProps> = ({
  finalResults,
  onClose,
  className,
}) => {
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  
  const { leaderboard, teamHistories } = finalResults;
  
  // Get starting price from first team's result
  const startingPrice = leaderboard[0]?.startingStockPrice || 45;
  
  // Prepare chart data
  const chartData = useMemo(() => 
    prepareChartData(teamHistories, leaderboard, startingPrice),
    [teamHistories, leaderboard, startingPrice]
  );
  
  // Toggle team expansion
  const toggleTeam = (teamId: number) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };
  
  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-slate-100 overflow-y-auto",
      className
    )}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-magna-red/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-magna-red" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Game Recap</h1>
                <p className="text-slate-500 text-lg">How the game played out over 5 rounds</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          
          {/* Stock Price Chart */}
          <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Stock Price Over Time
            </h2>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="round" 
                    stroke="#64748b"
                    tick={{ fill: '#475569', fontSize: 14 }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#475569', fontSize: 14 }}
                    tickFormatter={(value) => `$${value}`}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                    labelStyle={{ color: '#1e293b' }}
                    formatter={(value) => [`$${(value as number).toFixed(2)}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px' }} />
                  {leaderboard.map((team, index) => (
                    <Line
                      key={team.teamId}
                      type="monotone"
                      dataKey={`team${team.teamId}`}
                      name={team.teamName || `Team ${team.teamId}`}
                      stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Team Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Team Breakdown
              <span className="text-base font-normal text-slate-500">(click to expand)</span>
            </h2>
            
            {leaderboard.map((team, index) => {
              const history = teamHistories[team.teamId] || [];
              const isExpanded = expandedTeamId === team.teamId;
              const teamColor = TEAM_COLORS[index % TEAM_COLORS.length];
              
              return (
                <div
                  key={team.teamId}
                  className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden"
                >
                  {/* Team Header (clickable) */}
                  <button
                    onClick={() => toggleTeam(team.teamId)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                        style={{ backgroundColor: `${teamColor}20`, color: teamColor }}
                      >
                        #{team.rank}
                      </div>
                      
                      {/* Team Info */}
                      <div className="text-left">
                        <div className="text-slate-800 font-semibold text-lg">
                          {team.teamName || `Team ${team.teamId}`}
                        </div>
                        <div className="text-base text-slate-500">
                          {history.length} rounds completed
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-slate-800 font-bold text-xl">${team.finalStockPrice.toFixed(2)}</div>
                        <div className="text-sm text-slate-500">Final Price</div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "font-bold text-xl flex items-center gap-1",
                          team.totalTSR >= 0 ? "text-emerald-600" : "text-magna-red"
                        )}>
                          {team.totalTSR >= 0 ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                          {team.totalTSR >= 0 ? '+' : ''}{(team.totalTSR * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-500">Total TSR</div>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6" />
                        ) : (
                          <ChevronDown className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <TeamHistoryView
                        teamId={team.teamId}
                        teamName={team.teamName || `Team ${team.teamId}`}
                        history={history}
                        finalTSR={team.totalTSR}
                        finalStockPrice={team.finalStockPrice}
                        startingStockPrice={team.startingStockPrice}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-magna-red text-white rounded-xl font-semibold text-xl hover:bg-magna-red-dark transition-colors shadow-lg"
            >
              Close Recap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

GameRecap.displayName = 'GameRecap';
