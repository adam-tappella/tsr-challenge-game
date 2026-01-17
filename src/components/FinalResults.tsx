/**
 * FinalResults Component
 * 
 * Displays the final leaderboard after Round 5 and the 5-year simulation.
 * Features:
 * - Full leaderboard with all teams ranked
 * - Winner celebration
 * - Team's final stock price and total TSR
 * - Simulation summary
 */

import React, { useMemo } from 'react';
import { 
  Trophy, 
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';

interface FinalResultsProps {
  className?: string;
}

export const FinalResults: React.FC<FinalResultsProps> = ({ className }) => {
  const teamId = useGameStore((s) => s.teamId);
  const finalResults = useGameStore((s) => s.finalResults);
  
  // Find our team's results
  const ourResult = useMemo(() => {
    if (!finalResults || !teamId) return null;
    return finalResults.leaderboard.find((r) => r.teamId === teamId);
  }, [finalResults, teamId]);
  
  // Is our team the winner?
  const isWinner = teamId === finalResults?.winnerId;
  
  if (!finalResults) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading final results...</div>
      </div>
    );
  }
  
  const winner = finalResults.leaderboard[0];
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      "flex flex-col items-center py-12 px-8",
      className
    )}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Game Complete
        </div>
        <h1 className="text-5xl font-bold text-white mb-3">
          Final Results
        </h1>
        <p className="text-slate-400 text-lg">
          2026-2035 Capital Allocation Challenge
        </p>
      </div>
      
      {/* Winner Celebration */}
      <div className="relative bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-3xl p-8 mb-12 w-full max-w-2xl text-center">
        {/* Decorative elements */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="bg-amber-500 rounded-full p-3">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-amber-400 text-sm uppercase tracking-wide mb-2">
            🏆 Champion 🏆
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Team {winner?.teamId}
            {isWinner && " (You!)"}
          </h2>
          
          <div className="flex items-center justify-center gap-8 mb-4">
            <div>
              <div className="text-amber-400 text-3xl font-bold">
                ${winner?.finalStockPrice.toFixed(2)}
              </div>
              <div className="text-slate-400 text-sm">Final Stock Price</div>
            </div>
            <div className="w-px h-12 bg-slate-600" />
            <div>
              <div className="text-emerald-400 text-3xl font-bold">
                +{(winner?.totalTSR * 100).toFixed(1)}%
              </div>
              <div className="text-slate-400 text-sm">Total Return</div>
            </div>
          </div>
        </div>
        
        {isWinner && (
          <div className="mt-6 animate-pulse">
            <Star className="w-12 h-12 text-amber-400 mx-auto" />
            <p className="text-amber-400 font-medium mt-2">
              Congratulations! Your team has won!
            </p>
          </div>
        )}
      </div>
      
      {/* Your Team Result (if not winner) */}
      {!isWinner && ourResult && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8 w-full max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg">
                #{ourResult.rank}
              </div>
              <div>
                <div className="text-white font-bold text-lg">Team {teamId} (You)</div>
                <div className="text-slate-400 text-sm">
                  Final Position: {getRankSuffix(ourResult.rank)} of {finalResults.leaderboard.length}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-xl">${ourResult.finalStockPrice.toFixed(2)}</div>
              <div className={cn(
                "text-sm font-medium",
                ourResult.totalTSR >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {ourResult.totalTSR >= 0 ? '+' : ''}{(ourResult.totalTSR * 100).toFixed(1)}% TSR
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Full Leaderboard */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 w-full max-w-4xl mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-slate-400" />
          Full Leaderboard
        </h3>
        
        <div className="space-y-2">
          {finalResults.leaderboard.map((result, index) => {
            const isTop3 = result.rank <= 3;
            const isUs = result.teamId === teamId;
            
            return (
              <div
                key={result.teamId}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-colors",
                  isUs && "bg-blue-600/20 border border-blue-500/30",
                  !isUs && isTop3 && "bg-amber-500/10 border border-amber-500/20",
                  !isUs && !isTop3 && "bg-slate-800/50 border border-slate-700"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    result.rank === 1 && "bg-amber-500 text-white",
                    result.rank === 2 && "bg-slate-400 text-white",
                    result.rank === 3 && "bg-amber-700 text-white",
                    result.rank > 3 && "bg-slate-700 text-slate-300"
                  )}>
                    {result.rank <= 3 ? (
                      <Medal className="w-5 h-5" />
                    ) : (
                      <span className="font-bold">{result.rank}</span>
                    )}
                  </div>
                  
                  {/* Team Name */}
                  <div>
                    <div className={cn(
                      "font-semibold",
                      isUs ? "text-blue-400" : "text-white"
                    )}>
                      Team {result.teamId}
                      {isUs && " (You)"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Started at ${result.startingStockPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Results */}
                <div className="flex items-center gap-8">
                  {/* Dividends */}
                  <div className="text-right hidden md:block">
                    <div className="text-slate-400 text-sm">Dividends</div>
                    <div className="text-slate-300 font-medium">
                      ${result.totalDividends.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Stock Price */}
                  <div className="text-right">
                    <div className="text-slate-400 text-sm">Stock Price</div>
                    <div className="text-white font-bold">
                      ${result.finalStockPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* TSR */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-slate-400 text-sm">Total TSR</div>
                    <div className={cn(
                      "font-bold flex items-center justify-end gap-1",
                      result.totalTSR >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {result.totalTSR >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
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
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 w-full max-w-4xl">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          Simulation Summary (2031-2035)
        </h3>
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
          {finalResults.simulationSummary}
        </p>
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-slate-500">
        <p className="mb-2">Thank you for participating in the</p>
        <p className="text-lg font-semibold text-slate-400">
          Magna TSR Challenge • March 2026
        </p>
      </div>
    </div>
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
