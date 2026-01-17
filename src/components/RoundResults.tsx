/**
 * RoundResults Component
 * 
 * Displays results after each round:
 * - Team's updated financial metrics with deltas
 * - Round TSR and cumulative TSR
 * - Team rank
 * - Scenario narrative
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Award,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore, useCurrentTeam, useTeamRank } from '@/stores/gameStore';

interface RoundResultsProps {
  className?: string;
}

export const RoundResults: React.FC<RoundResultsProps> = ({ className }) => {
  const team = useCurrentTeam();
  const teamId = useGameStore((s) => s.teamId);
  const gameState = useGameStore((s) => s.gameState);
  const roundResults = useGameStore((s) => s.lastRoundResults);
  const teamRank = useTeamRank();
  
  // Find our team's results
  const ourResult = useMemo(() => {
    if (!roundResults || !teamId) return null;
    return roundResults.teamResults.find((r) => r.teamId === teamId);
  }, [roundResults, teamId]);
  
  // Get nearby teams for mini leaderboard
  const nearbyTeams = useMemo(() => {
    if (!roundResults || !teamRank) return [];
    
    const sorted = [...roundResults.teamResults].sort((a, b) => a.rank - b.rank);
    const ourIndex = sorted.findIndex((t) => t.teamId === teamId);
    
    // Show 2 above and 2 below us (max 5 teams)
    const start = Math.max(0, ourIndex - 2);
    const end = Math.min(sorted.length, ourIndex + 3);
    
    return sorted.slice(start, end);
  }, [roundResults, teamRank, teamId]);
  
  if (!team || !gameState || !roundResults) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading results...</div>
      </div>
    );
  }
  
  const totalTeams = gameState.teamCount;
  const isTopThree = teamRank && teamRank <= 3;
  const isImproved = ourResult && ourResult.stockPriceChange > 0;
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      {/* Round Badge */}
      <div className="bg-slate-800 text-slate-300 px-6 py-2 rounded-full font-medium mb-4">
        Round {roundResults.round} Complete • FY {2025 + roundResults.round}
      </div>
      
      {/* Team Badge */}
      <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-bold mb-8 shadow-lg shadow-blue-500/30">
        Team {teamId}
      </div>
      
      {/* Main Results Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 w-full max-w-4xl mb-8">
        {/* Rank Display */}
        <div className="text-center mb-8">
          <div className={cn(
            "inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-4",
            isTopThree ? "bg-amber-500/20" : "bg-slate-700"
          )}>
            <Award className={cn(
              "w-8 h-8",
              isTopThree ? "text-amber-400" : "text-slate-400"
            )} />
            <div>
              <div className={cn(
                "text-4xl font-bold",
                isTopThree ? "text-amber-400" : "text-white"
              )}>
                #{teamRank}
              </div>
              <div className="text-sm text-slate-400">of {totalTeams} teams</div>
            </div>
          </div>
        </div>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Stock Price"
            value={`$${ourResult?.stockPrice.toFixed(2) || team.stockPrice.toFixed(2)}`}
            change={ourResult?.stockPriceChange}
            changeLabel="vs prev"
          />
          <MetricCard
            label="Round TSR"
            value={`${((ourResult?.roundTSR || team.roundTSR) * 100).toFixed(1)}%`}
            isPercentage
            positive={(ourResult?.roundTSR || team.roundTSR) > 0}
          />
          <MetricCard
            label="Cumulative TSR"
            value={`${((ourResult?.cumulativeTSR || team.cumulativeTSR) * 100).toFixed(1)}%`}
            isPercentage
            positive={(ourResult?.cumulativeTSR || team.cumulativeTSR) > 0}
          />
          <MetricCard
            label="Decisions Made"
            value={ourResult?.decisionsCount.toString() || '0'}
            subLabel={`$${ourResult?.totalSpent || 0}M spent`}
          />
        </div>
        
        {/* Mini Leaderboard */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            Leaderboard
          </h3>
          <div className="space-y-2">
            {nearbyTeams.map((teamResult) => (
              <div
                key={teamResult.teamId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-colors",
                  teamResult.teamId === teamId
                    ? "bg-blue-600/20 border border-blue-500/30"
                    : "bg-slate-700/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                    teamResult.rank <= 3 ? "bg-amber-500/20 text-amber-400" : "bg-slate-600 text-slate-300"
                  )}>
                    {teamResult.rank}
                  </div>
                  <span className={cn(
                    "font-medium",
                    teamResult.teamId === teamId ? "text-blue-400" : "text-white"
                  )}>
                    Team {teamResult.teamId}
                    {teamResult.teamId === teamId && " (You)"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">${teamResult.stockPrice.toFixed(2)}</div>
                  <div className={cn(
                    "text-xs",
                    teamResult.cumulativeTSR >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {teamResult.cumulativeTSR >= 0 ? '+' : ''}{(teamResult.cumulativeTSR * 100).toFixed(1)}% TSR
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Risky Outcomes */}
        {roundResults.riskyOutcomes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
              Risky Investment Outcomes
            </h3>
            <div className="space-y-2">
              {roundResults.riskyOutcomes.map((outcome) => (
                <div
                  key={outcome.decisionId}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    outcome.triggered ? "bg-red-500/10 border border-red-500/30" : "bg-emerald-500/10 border border-emerald-500/30"
                  )}
                >
                  {outcome.triggered ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className={cn(
                      "font-medium",
                      outcome.triggered ? "text-red-400" : "text-emerald-400"
                    )}>
                      {outcome.decisionName}
                    </div>
                    <div className="text-sm text-slate-400">{outcome.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Scenario Narrative */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
            Market Conditions
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {roundResults.scenarioNarrative}
          </p>
        </div>
      </div>
      
      {/* Waiting Indicator */}
      <div className="flex items-center gap-3 text-slate-400">
        <Clock className="w-5 h-5" />
        <span>Waiting for facilitator to start next round...</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Helper Components
// =============================================================================

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  isPercentage?: boolean;
  positive?: boolean;
  subLabel?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeLabel,
  isPercentage,
  positive,
  subLabel,
}) => {
  const hasChange = change !== undefined;
  const isPositive = hasChange ? change >= 0 : positive;
  
  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">{label}</div>
      <div className={cn(
        "text-2xl font-bold mb-1",
        isPercentage
          ? isPositive ? "text-emerald-400" : "text-red-400"
          : "text-white"
      )}>
        {value}
      </div>
      {hasChange && (
        <div className={cn(
          "flex items-center justify-center gap-1 text-sm",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {isPositive ? '+' : ''}{change.toFixed(2)} {changeLabel}
        </div>
      )}
      {subLabel && (
        <div className="text-xs text-slate-500 mt-1">{subLabel}</div>
      )}
    </div>
  );
};

RoundResults.displayName = 'RoundResults';
