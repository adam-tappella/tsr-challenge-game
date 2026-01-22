/**
 * InvestorReportSummary Component
 * 
 * Displays end-of-round results in the style of a professional investor report.
 * Features:
 * - 10 core financial metrics with year-over-year comparisons
 * - Analyst commentary quotes
 * - Market benchmark comparisons
 * - Leaderboard snapshot
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  DollarSign,
  Percent,
  Activity,
  PieChart,
  Quote,
  Clock,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore, useCurrentTeam, useTeamRank } from '@/stores/gameStore';
import { generateAnalystQuotes, MARKET_GROWTH_RATES, type AnalystQuote } from './analystQuotes';
import type { FinancialMetrics, RoundNumber } from '@/types/game';

// =============================================================================
// Types
// =============================================================================

interface MetricDisplayData {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  benchmark?: string;
  icon: React.ReactNode;
  isPercentage?: boolean;
  isCurrency?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const BASELINE_REVENUE = 42836;
const BASELINE_EBIT = 2116;
const BASELINE_FCF = 1561;
const BASELINE_STOCK_PRICE = 49.29;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculates derived metrics for investor report display
 */
function calculateDerivedMetrics(
  metrics: FinancialMetrics,
  previousMetrics: FinancialMetrics | null,
  round: RoundNumber
) {
  const baseRevenue = previousMetrics?.revenue || BASELINE_REVENUE;
  const baseEbit = previousMetrics?.ebit || BASELINE_EBIT;
  const baseFcf = previousMetrics?.operatingFCF || BASELINE_FCF;
  
  const revenueGrowth = (metrics.revenue - baseRevenue) / baseRevenue;
  const ebitGrowth = (metrics.ebit - baseEbit) / baseEbit;
  const fcfGrowth = (metrics.operatingFCF - baseFcf) / baseFcf;
  const capexToSales = Math.abs(metrics.capex) / metrics.revenue;
  const fcfConversion = metrics.operatingFCF / metrics.ebitda;
  const marketGrowth = MARKET_GROWTH_RATES[round];
  const growthOverMarket = revenueGrowth - marketGrowth;
  
  return {
    revenueGrowth,
    ebitGrowth,
    fcfGrowth,
    capexToSales,
    fcfConversion,
    growthOverMarket,
    marketGrowth,
  };
}

/**
 * Formats currency in millions
 */
function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toLocaleString()}M`;
}

/**
 * Formats percentage
 */
function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
}

// =============================================================================
// Sub-Components
// =============================================================================

interface MetricCardProps {
  metric: MetricDisplayData;
  size?: 'normal' | 'large';
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, size = 'normal' }) => {
  const isPositive = metric.change !== undefined ? metric.change >= 0 : true;
  const isLarge = size === 'large';
  
  return (
    <div className={cn(
      "bg-white rounded-xl border border-magna-cool-gray/20 p-4 transition-shadow hover:shadow-md",
      isLarge && "col-span-2 p-6"
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-magna-cool-gray uppercase tracking-wider">
          {metric.label}
        </span>
        <div className="text-magna-cool-gray/60">
          {metric.icon}
        </div>
      </div>
      
      <div className={cn(
        "font-bold text-magna-carbon-black mb-1",
        isLarge ? "text-3xl" : "text-2xl"
      )}>
        {metric.value}
      </div>
      
      {metric.change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-emerald-600" : "text-magna-ignition-red"
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{formatPercent(metric.change)} {metric.changeLabel || 'vs prior'}</span>
        </div>
      )}
      
      {metric.benchmark && (
        <div className="text-xs text-magna-cool-gray mt-1">
          Market: {metric.benchmark}
        </div>
      )}
    </div>
  );
};

interface AnalystQuoteCardProps {
  quote: AnalystQuote;
}

const AnalystQuoteCard: React.FC<AnalystQuoteCardProps> = ({ quote }) => {
  return (
    <div className={cn(
      "bg-white rounded-xl border p-4",
      quote.sentiment === 'positive' && "border-emerald-200 bg-emerald-50/30",
      quote.sentiment === 'negative' && "border-magna-ignition-red/20 bg-red-50/30",
      quote.sentiment === 'neutral' && "border-magna-cool-gray/20"
    )}>
      <div className="flex items-start gap-3">
        <Quote className={cn(
          "w-5 h-5 mt-0.5 flex-shrink-0",
          quote.sentiment === 'positive' && "text-emerald-500",
          quote.sentiment === 'negative' && "text-magna-ignition-red",
          quote.sentiment === 'neutral' && "text-magna-cool-gray"
        )} />
        <div>
          <p className="text-magna-carbon-black text-sm leading-relaxed mb-2">
            "{quote.quote}"
          </p>
          <div className="flex items-center gap-2 text-xs text-magna-cool-gray">
            <Building2 className="w-3 h-3" />
            <span className="font-medium">{quote.analyst}</span>
            <span>•</span>
            <span>{quote.firm}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

interface InvestorReportSummaryProps {
  className?: string;
}

export const InvestorReportSummary: React.FC<InvestorReportSummaryProps> = ({ className }) => {
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
  
  // Get nearby teams for leaderboard
  const nearbyTeams = useMemo(() => {
    if (!roundResults || !teamRank) return [];
    const sorted = [...roundResults.teamResults].sort((a, b) => a.rank - b.rank);
    const ourIndex = sorted.findIndex((t) => t.teamId === teamId);
    const start = Math.max(0, ourIndex - 2);
    const end = Math.min(sorted.length, ourIndex + 3);
    return sorted.slice(start, end);
  }, [roundResults, teamRank, teamId]);
  
  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    if (!team || !roundResults) return null;
    return calculateDerivedMetrics(
      team.metrics,
      null, // TODO: Get previous round metrics
      roundResults.round
    );
  }, [team, roundResults]);
  
  // Generate analyst quotes
  const analystQuotes = useMemo(() => {
    if (!team || !roundResults || !teamRank || !gameState) return [];
    return generateAnalystQuotes(
      team.metrics,
      null,
      roundResults.round,
      team.stockPrice,
      BASELINE_STOCK_PRICE,
      teamRank,
      gameState.teamCount
    );
  }, [team, roundResults, teamRank, gameState]);
  
  // Build metrics for display
  const displayMetrics: MetricDisplayData[] = useMemo(() => {
    if (!team || !derivedMetrics) return [];
    
    return [
      {
        label: 'Revenue',
        value: formatCurrency(team.metrics.revenue),
        change: derivedMetrics.revenueGrowth,
        icon: <DollarSign className="w-4 h-4" />,
        isCurrency: true,
      },
      {
        label: 'EBIT (Earnings)',
        value: formatCurrency(team.metrics.ebit),
        change: derivedMetrics.ebitGrowth,
        icon: <BarChart3 className="w-4 h-4" />,
        isCurrency: true,
      },
      {
        label: 'EBIT Margin',
        value: formatPercent(team.metrics.ebitMargin, false),
        icon: <Percent className="w-4 h-4" />,
        isPercentage: true,
      },
      {
        label: 'Share Price',
        value: `$${team.stockPrice.toFixed(2)}`,
        change: ourResult?.stockPriceChange ? ourResult.stockPriceChange / BASELINE_STOCK_PRICE : undefined,
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'Growth Over Market',
        value: formatPercent(derivedMetrics.growthOverMarket),
        benchmark: formatPercent(derivedMetrics.marketGrowth, false),
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        label: 'ROIC',
        value: formatPercent(team.metrics.roic, false),
        icon: <PieChart className="w-4 h-4" />,
        isPercentage: true,
      },
      {
        label: 'Capex to Sales',
        value: formatPercent(derivedMetrics.capexToSales, false),
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        label: 'FCF Conversion',
        value: formatPercent(derivedMetrics.fcfConversion, false),
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'FCF Growth',
        value: formatPercent(derivedMetrics.fcfGrowth),
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        label: 'Operating FCF',
        value: formatCurrency(team.metrics.operatingFCF),
        change: derivedMetrics.fcfGrowth,
        icon: <DollarSign className="w-4 h-4" />,
        isCurrency: true,
      },
    ];
  }, [team, derivedMetrics, ourResult]);
  
  // Loading state
  if (!team || !gameState || !roundResults) {
    return (
      <div className="min-h-screen bg-magna-chrome-white flex items-center justify-center">
        <div className="text-magna-cool-gray">Loading results...</div>
      </div>
    );
  }
  
  const totalTeams = gameState.teamCount;
  const isTopThree = teamRank && teamRank <= 3;
  const fiscalYear = 2025 + roundResults.round;
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-magna-chrome-white to-gray-50",
      "py-8 px-4 md:px-8",
      className
    )}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl font-black text-magna-carbon-black tracking-tight">MAGNA</span>
            <span className="w-2.5 h-2.5 bg-magna-ignition-red rounded-full" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-magna-carbon-black mb-2">
            Q4 FY{fiscalYear} Investor Report
          </h1>
          
          <div className="flex items-center justify-center gap-4">
            <span className="bg-magna-ignition-red text-white px-4 py-1.5 rounded-full font-bold">
              Team {teamId}
            </span>
            <div className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full font-medium",
              isTopThree ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-magna-cool-gray"
            )}>
              <Award className="w-4 h-4" />
              <span>Rank #{teamRank} of {totalTeams}</span>
            </div>
          </div>
        </header>
        
        {/* Executive Summary */}
        <section className="bg-magna-carbon-black text-white rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-3">
            Executive Summary
          </h2>
          <p className="text-lg leading-relaxed">
            In FY{fiscalYear}, the company achieved revenue of {formatCurrency(team.metrics.revenue)} with 
            an EBIT margin of {formatPercent(team.metrics.ebitMargin, false)}. 
            {derivedMetrics && derivedMetrics.growthOverMarket > 0 
              ? ` Revenue growth outpaced the market by ${formatPercent(derivedMetrics.growthOverMarket)}.`
              : ` The company is working to improve market position.`
            }
            {' '}Share price closed at ${team.stockPrice.toFixed(2)}, 
            reflecting a cumulative TSR of {formatPercent(team.cumulativeTSR)} since inception.
          </p>
        </section>
        
        {/* Key Metrics Grid */}
        <section className="mb-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-4">
            Key Financial Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayMetrics.map((metric, index) => (
              <MetricCard 
                key={metric.label} 
                metric={metric}
                size={index < 2 ? 'normal' : 'normal'}
              />
            ))}
          </div>
        </section>
        
        {/* Analyst Commentary */}
        {analystQuotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-4">
              Analyst Commentary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analystQuotes.map((quote, index) => (
                <AnalystQuoteCard key={index} quote={quote} />
              ))}
            </div>
          </section>
        )}
        
        {/* Market Conditions & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Market Conditions */}
          <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-3">
              Market Conditions
            </h2>
            <p className="text-magna-carbon-black leading-relaxed">
              {roundResults.scenarioNarrative}
            </p>
          </section>
          
          {/* Leaderboard Snapshot */}
          <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-3">
              Peer Comparison
            </h2>
            <div className="space-y-2">
              {nearbyTeams.map((teamResult) => (
                <div
                  key={teamResult.teamId}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-colors",
                    teamResult.teamId === teamId
                      ? "bg-magna-ignition-red/10 border border-magna-ignition-red/30"
                      : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      teamResult.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-magna-cool-gray"
                    )}>
                      {teamResult.rank}
                    </div>
                    <span className={cn(
                      "font-medium",
                      teamResult.teamId === teamId ? "text-magna-ignition-red" : "text-magna-carbon-black"
                    )}>
                      Team {teamResult.teamId}
                      {teamResult.teamId === teamId && " (You)"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-magna-carbon-black">
                      ${teamResult.stockPrice.toFixed(2)}
                    </div>
                    <div className={cn(
                      "text-xs font-medium",
                      teamResult.cumulativeTSR >= 0 ? "text-emerald-600" : "text-magna-ignition-red"
                    )}>
                      {formatPercent(teamResult.cumulativeTSR)} TSR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <footer className="text-center">
          <div className="flex items-center justify-center gap-3 text-magna-cool-gray">
            <Clock className="w-5 h-5" />
            <span>Waiting for facilitator to start next round...</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-magna-ignition-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-magna-ignition-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-magna-ignition-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
          
          <p className="text-xs text-magna-cool-gray/60 mt-4">
            Forward. For all.
          </p>
        </footer>
      </div>
    </div>
  );
};

InvestorReportSummary.displayName = 'InvestorReportSummary';
