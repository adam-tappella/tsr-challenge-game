/**
 * FinalResults Component
 * 
 * Displays the final leaderboard after Round 5 and the 5-year simulation.
 * Features:
 * - Full leaderboard with all teams ranked
 * - Winner celebration
 * - Team's final stock price and total TSR
 * - Simulation summary
 * - Game Recap button to view detailed game history
 */

import React, { useMemo, useState } from 'react';
import { 
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Sparkles,
  BarChart3,
  Activity,
  Table,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { GameRecap } from './GameRecap';
import type { TeamRoundSnapshot } from '@/types/game';

interface FinalResultsProps {
  className?: string;
}

export const FinalResults: React.FC<FinalResultsProps> = ({ className }) => {
  const teamId = useGameStore((s) => s.teamId);
  const teamName = useGameStore((s) => s.teamName);
  const finalResults = useGameStore((s) => s.finalResults);
  
  // State for Game Recap modal
  const [showRecap, setShowRecap] = useState(false);
  
  // Find our team's results
  const ourResult = useMemo(() => {
    if (!finalResults || !teamId) return null;
    return finalResults.leaderboard.find((r) => r.teamId === teamId);
  }, [finalResults, teamId]);
  
  // Get our team's round history
  const teamHistory = useMemo(() => {
    if (!finalResults || !teamId) return [];
    return finalResults.teamHistories[teamId] || [];
  }, [finalResults, teamId]);
  
  // Prepare chart data for stock price over rounds
  const stockPriceChartData = useMemo(() => {
    if (!teamHistory.length) return [];
    
    const startingPrice = ourResult?.startingStockPrice || 49.29;
    const data = [{ round: 'Start', stockPrice: startingPrice }];
    
    for (const snapshot of teamHistory) {
      data.push({
        round: `R${snapshot.round}`,
        stockPrice: snapshot.stockPrice,
      });
    }
    
    return data;
  }, [teamHistory, ourResult]);
  
  // Is our team the winner?
  const isWinner = teamId === finalResults?.winnerId;
  
  if (!finalResults) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500 text-xl">Loading final results...</div>
      </div>
    );
  }
  
  const winner = finalResults.leaderboard[0];
  
  return (
    <div className={cn(
      "min-h-screen bg-slate-100",
      "flex flex-col items-center py-12 px-8",
      className
    )}>
      {/* Magna Header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-5xl font-black text-slate-800 tracking-tight">MAGNA</span>
        <span className="w-4 h-4 bg-magna-red rounded-full" />
      </div>
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-5 py-3 rounded-full text-lg font-semibold mb-4">
          <Sparkles className="w-5 h-5" />
          Game Complete
        </div>
        <h1 className="text-6xl font-bold text-slate-800 mb-4">
          Final Results
        </h1>
        <p className="text-slate-600 text-2xl">
          2026-2035 Capital Allocation Challenge
        </p>
      </div>
      
      {/* Winner Celebration */}
      <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-10 mb-12 w-full max-w-2xl text-center shadow-lg">
        {/* Decorative elements */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
          <div className="bg-amber-500 rounded-full p-4 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="mt-6">
          <div className="text-amber-600 text-lg uppercase tracking-wide font-semibold mb-3">
            🏆 Champion 🏆
          </div>
          <h2 className="text-5xl font-bold text-slate-800 mb-6">
            Team {winner?.teamId}
            {isWinner && " (You!)"}
          </h2>
          
          <div className="flex items-center justify-center gap-10 mb-6">
            <div>
              <div className="text-amber-600 text-4xl font-bold">
                ${winner?.finalStockPrice.toFixed(2)}
              </div>
              <div className="text-slate-500 text-lg">Final Stock Price</div>
            </div>
            <div className="w-px h-16 bg-amber-300" />
            <div>
              <div className="text-emerald-600 text-4xl font-bold">
                +{(winner?.totalTSR * 100).toFixed(1)}%
              </div>
              <div className="text-slate-500 text-lg">Total Return</div>
            </div>
          </div>
        </div>
        
        {isWinner && (
          <div className="mt-6 animate-pulse">
            <Star className="w-14 h-14 text-amber-500 mx-auto" />
            <p className="text-amber-600 font-semibold text-xl mt-2">
              Congratulations! Your team has won!
            </p>
          </div>
        )}
      </div>
      
      {/* Your Team Result (if not winner) */}
      {!isWinner && ourResult && (
        <div className="bg-magna-red/10 border-2 border-magna-red/30 rounded-xl p-6 mb-8 w-full max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-magna-red text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl">
                #{ourResult.rank}
              </div>
              <div>
                <div className="text-slate-800 font-bold text-xl">{teamName || `Team ${teamId}`} (You)</div>
                <div className="text-slate-500 text-base">
                  Final Position: {getRankSuffix(ourResult.rank)} of {finalResults.leaderboard.length}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-800 font-bold text-2xl">${ourResult.finalStockPrice.toFixed(2)}</div>
              <div className={cn(
                "text-lg font-semibold",
                ourResult.totalTSR >= 0 ? "text-emerald-600" : "text-magna-red"
              )}>
                {ourResult.totalTSR >= 0 ? '+' : ''}{(ourResult.totalTSR * 100).toFixed(1)}% TSR
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Full Leaderboard */}
      <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 w-full max-w-4xl mb-8">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
          <Award className="w-7 h-7 text-slate-500" />
          Full Leaderboard
        </h3>
        
        <div className="space-y-3">
          {finalResults.leaderboard.map((result, index) => {
            const isTop3 = result.rank <= 3;
            const isUs = result.teamId === teamId;
            
            return (
              <div
                key={result.teamId}
                className={cn(
                  "flex items-center justify-between p-5 rounded-xl transition-colors",
                  isUs && "bg-magna-red/10 border-2 border-magna-red/30",
                  !isUs && isTop3 && "bg-amber-50 border border-amber-300",
                  !isUs && !isTop3 && "bg-slate-50 border border-slate-200"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    result.rank === 1 && "bg-amber-500 text-white",
                    result.rank === 2 && "bg-slate-400 text-white",
                    result.rank === 3 && "bg-amber-700 text-white",
                    result.rank > 3 && "bg-slate-200 text-slate-600"
                  )}>
                    {result.rank <= 3 ? (
                      <Medal className="w-6 h-6" />
                    ) : (
                      <span className="font-bold text-lg">{result.rank}</span>
                    )}
                  </div>
                  
                  {/* Team Name */}
                  <div>
                    <div className={cn(
                      "font-semibold text-lg",
                      isUs ? "text-magna-red" : "text-slate-800"
                    )}>
                      Team {result.teamId}
                      {isUs && " (You)"}
                    </div>
                    <div className="text-sm text-slate-500">
                      Started at ${result.startingStockPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Results */}
                <div className="flex items-center gap-8">
                  {/* Dividends */}
                  <div className="text-right hidden md:block">
                    <div className="text-slate-500 text-base">Dividends</div>
                    <div className="text-slate-800 font-semibold text-lg">
                      ${result.totalDividends.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Stock Price */}
                  <div className="text-right">
                    <div className="text-slate-500 text-base">Stock Price</div>
                    <div className="text-slate-800 font-bold text-xl">
                      ${result.finalStockPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* TSR */}
                  <div className="text-right min-w-[100px]">
                    <div className="text-slate-500 text-base">Total TSR</div>
                    <div className={cn(
                      "font-bold text-xl flex items-center justify-end gap-1",
                      result.totalTSR >= 0 ? "text-emerald-600" : "text-magna-red"
                    )}>
                      {result.totalTSR >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      {result.totalTSR >= 0 ? '+' : ''}{(result.totalTSR * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Simulation Summary */}
      <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-6 w-full max-w-4xl">
        <h3 className="text-base font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Simulation Summary (2031-2035)
        </h3>
        <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
          {finalResults.simulationSummary}
        </p>
      </div>
      
      {/* Your Performance Over Time */}
      {teamHistory.length > 0 && (
        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 w-full max-w-4xl mt-8">
          <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
            <Activity className="w-7 h-7 text-magna-red" />
            Your Performance Over 5 Rounds
          </h3>
          
          {/* Stock Price Chart */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-700 mb-4">Stock Price Progression</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockPriceChartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="round" 
                    tick={{ fill: '#64748b', fontSize: 14 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fill: '#64748b', fontSize: 14 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Stock Price']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stockPrice" 
                    stroke="#DA291C" 
                    strokeWidth={3}
                    dot={{ fill: '#DA291C', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#DA291C' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Historical Metrics Table */}
          <div>
            <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Table className="w-5 h-5" />
              Key Metrics by Round
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b border-slate-200">Metric</th>
                    {teamHistory.map((snapshot) => (
                      <th 
                        key={snapshot.round} 
                        className="text-center py-3 px-4 font-semibold text-slate-700 border-b border-slate-200"
                      >
                        Round {snapshot.round}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <MetricRow 
                    label="Stock Price" 
                    values={teamHistory.map(s => s.metrics?.stockPrice)} 
                    format="currency" 
                  />
                  <MetricRow 
                    label="ROIC" 
                    values={teamHistory.map(s => s.metrics?.roic)} 
                    format="percent" 
                  />
                  <MetricRow 
                    label="Revenue Growth" 
                    values={teamHistory.map(s => s.metrics?.revenueGrowth)} 
                    format="percentChange" 
                  />
                  <MetricRow 
                    label="EBITDA Margin" 
                    values={teamHistory.map(s => s.metrics?.ebitdaMargin)} 
                    format="percent" 
                  />
                  <MetricRow 
                    label="EBIT Margin" 
                    values={teamHistory.map(s => s.metrics?.ebitMargin)} 
                    format="percent" 
                  />
                  <MetricRow 
                    label="COGS / Revenue" 
                    values={teamHistory.map(s => s.metrics?.cogsToRevenue)} 
                    format="percent" 
                  />
                  <MetricRow 
                    label="SG&A / Revenue" 
                    values={teamHistory.map(s => s.metrics?.sgaToRevenue)} 
                    format="percent" 
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* View Game Recap Button */}
      <div className="mt-8">
        <button
          onClick={() => setShowRecap(true)}
          className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xl transition-colors flex items-center gap-3 shadow-lg"
        >
          <BarChart3 className="w-6 h-6" />
          View Game Recap
          <span className="text-base text-slate-300">(Round-by-Round Breakdown)</span>
        </button>
      </div>
      
      {/* Game Recap Modal */}
      {showRecap && (
        <GameRecap
          finalResults={finalResults}
          onClose={() => setShowRecap(false)}
        />
      )}
      
      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-slate-500 text-lg mb-3">Thank you for participating in the</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-black text-slate-800">MAGNA</span>
          <span className="w-2 h-2 bg-magna-red rounded-full" />
          <span className="text-2xl font-semibold text-slate-800">TSR Challenge</span>
        </div>
        <p className="text-slate-500 text-lg mt-3">2026</p>
      </div>
    </div>
  );
};

// =============================================================================
// Helper Components
// =============================================================================

interface MetricRowProps {
  label: string;
  values: (number | undefined)[];
  format: 'currency' | 'percent' | 'percentChange';
}

const MetricRow: React.FC<MetricRowProps> = ({ label, values, format }) => {
  const formatValue = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return '—';
    
    switch (format) {
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'percentChange':
        const formatted = (value * 100).toFixed(1);
        return value >= 0 ? `+${formatted}%` : `${formatted}%`;
      default:
        return value.toFixed(2);
    }
  };
  
  const getChangeColor = (value: number | undefined): string => {
    if (value === undefined || format !== 'percentChange') return 'text-slate-800';
    return value >= 0 ? 'text-emerald-600' : 'text-red-600';
  };
  
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4 font-medium text-slate-700">{label}</td>
      {values.map((value, i) => (
        <td 
          key={i} 
          className={cn(
            "text-center py-3 px-4 font-semibold",
            getChangeColor(value)
          )}
        >
          {formatValue(value)}
        </td>
      ))}
    </tr>
  );
};

// =============================================================================
// Helper Functions
// =============================================================================

function getRankSuffix(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

FinalResults.displayName = 'FinalResults';
