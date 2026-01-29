/**
 * RankingsPreview Component
 * 
 * Shows team rankings and a preview of the coming year.
 * Displayed after the equity research page to prep teams for next round.
 * 
 * Features:
 * - Team leaderboard table
 * - Stock price trend chart across rounds
 * - Coming year scenario preview with key dynamics
 */

import React, { useMemo } from 'react';
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
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Zap,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore, useCurrentTeam, useTeamRank } from '@/stores/gameStore';
import { MagnaLogo } from './MagnaLogo';
import type { RoundNumber } from '@/types/game';

// =============================================================================
// Constants
// =============================================================================

const BASELINE_STOCK_PRICE = 49.29;

// Team colors for chart lines
const TEAM_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#a855f7', // purple
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#0ea5e9', // sky
  '#d946ef', // fuchsia
  '#64748b', // slate
  '#78716c', // stone
  '#71717a', // zinc
];

// Round labels
const ROUND_LABELS: Record<number, string> = {
  1: 'FY26',
  2: 'FY27',
  3: 'FY28',
  4: 'FY29',
  5: 'FY30',
};

// Next year scenario previews (shown for the NEXT round, not current)
const NEXT_YEAR_SCENARIOS: Record<number, {
  title: string;
  theme: string;
  description: string;
  keyDynamics: string[];
  color: 'emerald' | 'amber' | 'red' | 'blue';
}> = {
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

// =============================================================================
// Helper Functions
// =============================================================================

function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
}

// =============================================================================
// Sub-Components
// =============================================================================

interface LeaderboardRowProps {
  rank: number;
  teamName: string;
  stockPrice: number;
  cumulativeTSR: number;
  isCurrentTeam: boolean;
  color: string;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  teamName,
  stockPrice,
  cumulativeTSR,
  isCurrentTeam,
  color,
}) => {
  const isPositive = cumulativeTSR >= 0;
  
  return (
    <tr className={cn(
      "border-b border-slate-200 last:border-0 transition-colors",
      isCurrentTeam && "bg-magna-red/5"
    )}>
      <td className="py-4 px-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
          rank === 1 && "bg-yellow-100 text-yellow-700",
          rank === 2 && "bg-slate-200 text-slate-600",
          rank === 3 && "bg-amber-100 text-amber-700",
          rank > 3 && "bg-slate-100 text-slate-500"
        )}>
          {rank}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className={cn(
            "font-semibold text-lg",
            isCurrentTeam ? "text-magna-red" : "text-magna-carbon-black"
          )}>
            {teamName}
            {isCurrentTeam && <span className="text-magna-red ml-2">(You)</span>}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-mono font-bold text-xl text-magna-carbon-black">
          ${stockPrice.toFixed(2)}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className={cn(
          "flex items-center justify-end gap-2 font-semibold text-lg",
          isPositive ? "text-emerald-600" : "text-red-600"
        )}>
          {isPositive ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
          {formatPercent(cumulativeTSR)}
        </div>
      </td>
    </tr>
  );
};

interface YearPreviewCardProps {
  nextRound: number;
}

const YearPreviewCard: React.FC<YearPreviewCardProps> = ({ nextRound }) => {
  const scenario = NEXT_YEAR_SCENARIOS[nextRound];
  
  if (!scenario) {
    // Game is over after round 5
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-purple-900">Final Round Complete!</h3>
            <p className="text-purple-700">Awaiting final results...</p>
          </div>
        </div>
        <p className="text-purple-800 text-lg leading-relaxed">
          Your 5-year strategic journey is complete. The facilitator will reveal the final standings and the 2031-2035 forward simulation shortly.
        </p>
      </div>
    );
  }
  
  const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string; bullet: string }> = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800',
      bullet: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-800',
      bullet: 'bg-amber-500',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
      bullet: 'bg-red-500',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
      bullet: 'bg-blue-500',
    },
  };
  
  const colors = colorClasses[scenario.color];
  
  return (
    <div className={cn(
      "rounded-2xl p-8 border-2",
      colors.bg,
      colors.border
    )}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center",
            colors.badge
          )}>
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className={cn("text-2xl font-bold", colors.text)}>
              {scenario.title}
            </h3>
            <p className="text-slate-600 text-lg">Coming Next</p>
          </div>
        </div>
        <span className={cn(
          "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide",
          colors.badge
        )}>
          {scenario.theme}
        </span>
      </div>
      
      <p className="text-slate-700 text-lg leading-relaxed mb-6">
        {scenario.description}
      </p>
      
      <div>
        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Key Market Dynamics
        </h4>
        <ul className="space-y-3">
          {scenario.keyDynamics.map((dynamic, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className={cn(
                "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                colors.bullet
              )} />
              <span className="text-slate-800 text-lg">{dynamic}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Warning/Tip based on scenario */}
      {scenario.color === 'amber' && (
        <div className="mt-6 bg-amber-100 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 font-medium">
            Cost pressures ahead. Consider decisions that improve operational efficiency and protect margins.
          </p>
        </div>
      )}
      
      {scenario.color === 'red' && (
        <div className="mt-6 bg-red-100 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 font-medium">
            Recession warning. Preserve cash, reduce risk, and position for survival. Companies with strong balance sheets will weather the storm.
          </p>
        </div>
      )}
      
      {scenario.color === 'blue' && (
        <div className="mt-6 bg-blue-100 border border-blue-300 rounded-xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 font-medium">
            Recovery opportunity! Companies that maintained capacity and invested through the downturn will be best positioned to capture growth.
          </p>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

interface RankingsPreviewProps {
  className?: string;
}

export const RankingsPreview: React.FC<RankingsPreviewProps> = ({ className }) => {
  const team = useCurrentTeam();
  const teamId = useGameStore((s) => s.teamId);
  const teamName = useGameStore((s) => s.teamName);
  const gameState = useGameStore((s) => s.gameState);
  const roundResults = useGameStore((s) => s.lastRoundResults);
  const teamRank = useTeamRank();
  
  // Build sorted leaderboard
  const leaderboard = useMemo(() => {
    if (!roundResults) return [];
    return [...roundResults.teamResults].sort((a, b) => a.rank - b.rank);
  }, [roundResults]);
  
  // Build chart data from round results
  // Since we don't have full history in the client, we'll show current round data
  // and baseline for comparison
  const chartData = useMemo(() => {
    if (!roundResults || !gameState) return [];
    
    const currentRound = roundResults.round;
    const data: Array<Record<string, number | string>> = [];
    
    // Add baseline (FY25)
    const baselineData: Record<string, number | string> = { round: 0, label: 'FY25' };
    roundResults.teamResults.forEach((result, index) => {
      const name = gameState.teams[result.teamId]?.teamName || `Team ${result.teamId}`;
      baselineData[name] = BASELINE_STOCK_PRICE;
    });
    data.push(baselineData);
    
    // Add current round data
    const currentData: Record<string, number | string> = { 
      round: currentRound, 
      label: ROUND_LABELS[currentRound] || `R${currentRound}` 
    };
    roundResults.teamResults.forEach((result, index) => {
      const name = gameState.teams[result.teamId]?.teamName || `Team ${result.teamId}`;
      currentData[name] = result.stockPrice;
    });
    data.push(currentData);
    
    return data;
  }, [roundResults, gameState]);
  
  // Get team names for chart legend
  const teamNamesForChart = useMemo(() => {
    if (!roundResults || !gameState) return [];
    return roundResults.teamResults.map((result, index) => ({
      name: gameState.teams[result.teamId]?.teamName || `Team ${result.teamId}`,
      color: TEAM_COLORS[index % TEAM_COLORS.length],
      teamId: result.teamId,
    }));
  }, [roundResults, gameState]);
  
  if (!team || !gameState || !roundResults) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading rankings...</div>
      </div>
    );
  }
  
  const currentRound = roundResults.round;
  const nextRound = currentRound + 1;
  const fiscalYear = 2025 + currentRound;
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-slate-50 to-slate-100",
      "py-8 px-4 md:px-8",
      className
    )}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-magna-carbon-black text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MagnaLogo variant="white" size="md" />
              <div className="h-8 w-px bg-white/20" />
              <div>
                <h1 className="text-2xl font-bold">Rankings & Next Round</h1>
                <p className="text-slate-300">End of FY{fiscalYear} • Round {currentRound} of 5</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-300">Your Position</div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">#{teamRank}</span>
                  <span className="text-slate-400">of {leaderboard.length}</span>
                </div>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl font-semibold",
                teamRank && teamRank <= 3 ? "bg-yellow-500/20 text-yellow-300" : "bg-white/10 text-white"
              )}>
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Leaderboard Table */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-magna-carbon-black flex items-center gap-2">
                <Trophy className="w-5 h-5 text-magna-red" />
                Team Leaderboard
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-500 uppercase tracking-wider w-16">Rank</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Team</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Stock Price</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">TSR</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((result, index) => {
                    const name = gameState.teams[result.teamId]?.teamName || `Team ${result.teamId}`;
                    return (
                      <LeaderboardRow
                        key={result.teamId}
                        rank={result.rank}
                        teamName={name}
                        stockPrice={result.stockPrice}
                        cumulativeTSR={result.cumulativeTSR}
                        isCurrentTeam={result.teamId === teamId}
                        color={TEAM_COLORS[index % TEAM_COLORS.length]}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          
          {/* Stock Price Chart */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-magna-carbon-black flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-magna-red" />
              Stock Price Performance
            </h2>
            
            <div className="h-[350px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Stock Price']}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => (
                        <span className={cn(
                          "text-sm",
                          value === (teamName || `Team ${teamId}`) ? "font-bold text-magna-red" : "text-slate-600"
                        )}>
                          {value}
                        </span>
                      )}
                    />
                    {teamNamesForChart.map((team, index) => (
                      <Line
                        key={team.teamId}
                        type="monotone"
                        dataKey={team.name}
                        stroke={team.color}
                        strokeWidth={team.teamId === teamId ? 4 : 2}
                        dot={{ r: team.teamId === teamId ? 6 : 4, fill: team.color }}
                        activeDot={{ r: 8 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <p>Chart data loading...</p>
                </div>
              )}
            </div>
          </section>
        </div>
        
        {/* Coming Year Preview */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-magna-carbon-black mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-magna-red" />
            Prepare for the Next Round
          </h2>
          
          <YearPreviewCard nextRound={nextRound} />
        </section>
        
        {/* Footer */}
        <footer className="text-center">
          <div className="flex items-center justify-center gap-3 text-slate-500 text-lg">
            <span>Waiting for facilitator to start the next round...</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

RankingsPreview.displayName = 'RankingsPreview';
