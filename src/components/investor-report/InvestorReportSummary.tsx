/**
 * InvestorReportSummary Component
 * 
 * Professional investor report styled after major equity research reports.
 * Features:
 * - Investment rating (Buy/Hold/Sell) with price target
 * - Sectioned financial metrics (Valuation, Growth, Profitability, Cash Flow)
 * - Consensus estimates table
 * - Analyst commentary
 * - Market conditions and peer comparison
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  DollarSign,
  Target,
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  Quote,
  Clock,
  Building2,
  Users,
  History,
  ArrowRight,
  HelpCircle,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore, useCurrentTeam, useTeamRank } from '@/stores/gameStore';
import { MagnaLogo } from '../MagnaLogo';
import { generateAnalystQuotes, MARKET_GROWTH_RATES, type AnalystQuote } from './analystQuotes';
import type { FinancialMetrics, RoundNumber } from '@/types/game';

// =============================================================================
// Types
// =============================================================================

type Rating = 'BUY' | 'HOLD' | 'SELL';

interface ConsensusEstimate {
  metric: string;
  consensus: string;
  actual: string;
  consensusValue: number;
  actualValue: number;
  difference: number;
}

// Wall Street consensus estimates by round (what analysts expected)
// Based on market conditions each year
const WALL_STREET_CONSENSUS: Record<RoundNumber, {
  revenueGrowth: number;  // Expected revenue growth from baseline
  ebitMargin: number;     // Expected EBIT margin
  epsGrowth: number;      // Expected EPS growth from baseline
  fcfGrowth: number;      // Expected FCF growth from baseline
}> = {
  1: { // FY2026 - Business as Usual - Modest growth expected
    revenueGrowth: 0.02,
    ebitMargin: 0.049,
    epsGrowth: 0.02,
    fcfGrowth: 0.015,
  },
  2: { // FY2027 - Business as Usual - Continued growth expected
    revenueGrowth: 0.035,
    ebitMargin: 0.050,
    epsGrowth: 0.04,
    fcfGrowth: 0.03,
  },
  3: { // FY2028 - Cost Pressures - Analysts expect margin compression
    revenueGrowth: 0.01,
    ebitMargin: 0.045,
    epsGrowth: -0.05,
    fcfGrowth: -0.08,
  },
  4: { // FY2029 - Recession - Analysts expect decline
    revenueGrowth: -0.10,
    ebitMargin: 0.035,
    epsGrowth: -0.25,
    fcfGrowth: -0.30,
  },
  5: { // FY2030 - Recovery - Analysts expect rebound
    revenueGrowth: 0.08,
    ebitMargin: 0.052,
    epsGrowth: 0.15,
    fcfGrowth: 0.12,
  },
};

// =============================================================================
// Constants
// =============================================================================

const BASELINE_REVENUE = 42836;
const BASELINE_EBIT = 2116;
const BASELINE_FCF = 1561;
const BASELINE_STOCK_PRICE = 49.29;
const SHARES_OUTSTANDING = 288; // millions

// =============================================================================
// Helper Functions
// =============================================================================

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
  
  // EPS calculation (simplified)
  const eps = metrics.ebit * 0.75 / SHARES_OUTSTANDING; // Assume 25% tax rate
  const priorEps = baseEbit * 0.75 / SHARES_OUTSTANDING;
  const epsGrowth = (eps - priorEps) / priorEps;
  
  // EV multiples (Enterprise Value = NPV)
  const evToEbitda = metrics.npv / metrics.ebitda;
  const evToEbit = metrics.npv / metrics.ebit;
  
  // Debt calculation: Net Debt = EV - Equity Value
  const netDebt = metrics.npv - metrics.equityValue;
  const debtToEbitda = netDebt / metrics.ebitda;
  
  return {
    revenueGrowth,
    ebitGrowth,
    fcfGrowth,
    capexToSales,
    fcfConversion,
    growthOverMarket,
    marketGrowth,
    eps,
    epsGrowth,
    evToEbitda,
    evToEbit,
    netDebt,
    debtToEbitda,
  };
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toLocaleString()}M`;
}

function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
}

function determineRating(cumulativeTSR: number, growthOverMarket: number, rank: number, totalTeams: number): Rating {
  const topThird = Math.ceil(totalTeams / 3);
  const bottomThird = totalTeams - topThird;
  
  if (rank <= topThird && cumulativeTSR > 0.05) return 'BUY';
  if (rank >= bottomThird || cumulativeTSR < -0.05) return 'SELL';
  return 'HOLD';
}

function calculatePriceTarget(currentPrice: number, rating: Rating, growthOverMarket: number): number {
  let multiplier = 1.0;
  if (rating === 'BUY') multiplier = 1.12 + (growthOverMarket * 0.5);
  else if (rating === 'HOLD') multiplier = 1.03 + (growthOverMarket * 0.3);
  else multiplier = 0.92 + (growthOverMarket * 0.2);
  
  return Math.round(currentPrice * multiplier * 100) / 100;
}

// =============================================================================
// Sub-Components
// =============================================================================

interface RatingBadgeProps {
  rating: Rating;
  priceTarget: number;
  currentPrice: number;
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, priceTarget, currentPrice }) => {
  const upside = ((priceTarget - currentPrice) / currentPrice) * 100;
  
  return (
    <div className="bg-white rounded-2xl border border-magna-cool-gray/20 p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Analyst Rating
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-2xl",
              rating === 'BUY' && "bg-emerald-100 text-emerald-700",
              rating === 'HOLD' && "bg-amber-100 text-amber-700",
              rating === 'SELL' && "bg-red-100 text-red-700"
            )}>
              {rating === 'BUY' && <ArrowUpCircle className="w-7 h-7" />}
              {rating === 'HOLD' && <MinusCircle className="w-7 h-7" />}
              {rating === 'SELL' && <ArrowDownCircle className="w-7 h-7" />}
              {rating}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Price Target
          </div>
          <div className="text-4xl font-bold text-magna-carbon-black">
            ${priceTarget.toFixed(2)}
          </div>
          <div className={cn(
            "text-lg font-semibold",
            upside >= 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {upside >= 0 ? '+' : ''}{upside.toFixed(1)}% upside
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricRowProps {
  label: string;
  value: string;
  change?: number;
  showChangeArrow?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, change, showChangeArrow = true }) => {
  const isPositive = change !== undefined ? change >= 0 : true;
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
      <span className="text-base text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg text-magna-carbon-black">{value}</span>
        {change !== undefined && showChangeArrow && (
          <span className={cn(
            "text-sm font-semibold",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}>
            {isPositive ? '↑' : '↓'} {Math.abs(change * 100).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

interface MetricSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const MetricSection: React.FC<MetricSectionProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-xl border border-magna-cool-gray/20 p-5">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-slate-600">{icon}</span>
        <h3 className="text-sm font-semibold text-magna-carbon-black uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  );
};

interface AnalystQuoteCardProps {
  quote: AnalystQuote;
}

const AnalystQuoteCard: React.FC<AnalystQuoteCardProps> = ({ quote }) => {
  const isQuestion = quote.type === 'question';
  
  // Determine icon and styling based on type
  const IconComponent = isQuestion ? HelpCircle : LineChart;
  
  return (
    <div className={cn(
      "rounded-2xl border-2 p-6 transition-all",
      // Question styling - amber/orange accent
      isQuestion && "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md",
      // Observation styling - based on sentiment
      !isQuestion && quote.sentiment === 'positive' && "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm",
      !isQuestion && quote.sentiment === 'negative' && "border-red-300 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm",
      !isQuestion && quote.sentiment === 'neutral' && "border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 shadow-sm"
    )}>
      {/* Type Badge */}
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4",
        isQuestion && "bg-amber-200 text-amber-800",
        !isQuestion && quote.sentiment === 'positive' && "bg-emerald-200 text-emerald-800",
        !isQuestion && quote.sentiment === 'negative' && "bg-red-200 text-red-800",
        !isQuestion && quote.sentiment === 'neutral' && "bg-slate-200 text-slate-700"
      )}>
        <IconComponent className="w-3.5 h-3.5" />
        {isQuestion ? 'Analyst Question' : 'Price Observation'}
      </div>
      
      {/* Quote Content */}
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          isQuestion && "bg-amber-200",
          !isQuestion && quote.sentiment === 'positive' && "bg-emerald-200",
          !isQuestion && quote.sentiment === 'negative' && "bg-red-200",
          !isQuestion && quote.sentiment === 'neutral' && "bg-slate-200"
        )}>
          <IconComponent className={cn(
            "w-6 h-6",
            isQuestion && "text-amber-700",
            !isQuestion && quote.sentiment === 'positive' && "text-emerald-700",
            !isQuestion && quote.sentiment === 'negative' && "text-red-700",
            !isQuestion && quote.sentiment === 'neutral' && "text-slate-600"
          )} />
        </div>
        <div className="flex-1">
          <p className={cn(
            "text-lg leading-relaxed mb-4 font-medium",
            isQuestion ? "text-amber-900" : "text-magna-carbon-black"
          )}>
            "{quote.quote}"
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-magna-carbon-black">{quote.analyst}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-600">{quote.firm}</span>
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
  const teamName = useGameStore((s) => s.teamName);
  const gameState = useGameStore((s) => s.gameState);
  const roundResults = useGameStore((s) => s.lastRoundResults);
  const teamRank = useTeamRank();
  
  const ourResult = useMemo(() => {
    if (!roundResults || !teamId) return null;
    return roundResults.teamResults.find((r) => r.teamId === teamId);
  }, [roundResults, teamId]);
  
  const nearbyTeams = useMemo(() => {
    if (!roundResults || !teamRank) return [];
    const sorted = [...roundResults.teamResults].sort((a, b) => a.rank - b.rank);
    const ourIndex = sorted.findIndex((t) => t.teamId === teamId);
    const start = Math.max(0, ourIndex - 2);
    const end = Math.min(sorted.length, ourIndex + 3);
    return sorted.slice(start, end);
  }, [roundResults, teamRank, teamId]);
  
  const derivedMetrics = useMemo(() => {
    if (!team || !roundResults) return null;
    return calculateDerivedMetrics(team.metrics, null, roundResults.round);
  }, [team, roundResults]);
  
  const analystQuotes = useMemo(() => {
    if (!team || !roundResults || !teamRank || !gameState) return [];
    return generateAnalystQuotes(
      team.metrics, null, roundResults.round,
      team.stockPrice, BASELINE_STOCK_PRICE, teamRank, gameState.teamCount
    );
  }, [team, roundResults, teamRank, gameState]);
  
  // Calculate rating and price target
  const { rating, priceTarget } = useMemo(() => {
    if (!team || !derivedMetrics || !teamRank || !gameState) {
      return { rating: 'HOLD' as Rating, priceTarget: 50 };
    }
    const r = determineRating(team.cumulativeTSR, derivedMetrics.growthOverMarket, teamRank, gameState.teamCount);
    const pt = calculatePriceTarget(team.stockPrice, r, derivedMetrics.growthOverMarket);
    return { rating: r, priceTarget: pt };
  }, [team, derivedMetrics, teamRank, gameState]);
  
  // Consensus estimates table - Actual vs. Wall Street Expectations
  const consensusEstimates: ConsensusEstimate[] = useMemo(() => {
    if (!team || !derivedMetrics || !roundResults) return [];
    
    const round = roundResults.round;
    const consensus = WALL_STREET_CONSENSUS[round];
    
    // Calculate what Wall Street expected
    const expectedRevenue = BASELINE_REVENUE * (1 + consensus.revenueGrowth);
    const expectedEbit = expectedRevenue * consensus.ebitMargin;
    const expectedEps = expectedEbit * 0.75 / SHARES_OUTSTANDING;
    const expectedFcf = BASELINE_FCF * (1 + consensus.fcfGrowth);
    
    // Actual values
    const actualRevenue = team.metrics.revenue;
    const actualEbit = team.metrics.ebit;
    const actualEps = derivedMetrics.eps;
    const actualFcf = team.metrics.operatingFCF;
    
    return [
      { 
        metric: 'Revenue', 
        consensus: formatCurrency(expectedRevenue), 
        actual: formatCurrency(actualRevenue),
        consensusValue: expectedRevenue,
        actualValue: actualRevenue,
        difference: (actualRevenue - expectedRevenue) / expectedRevenue,
      },
      { 
        metric: 'EBIT', 
        consensus: formatCurrency(expectedEbit), 
        actual: formatCurrency(actualEbit),
        consensusValue: expectedEbit,
        actualValue: actualEbit,
        difference: (actualEbit - expectedEbit) / expectedEbit,
      },
      { 
        metric: 'EPS', 
        consensus: `$${expectedEps.toFixed(2)}`, 
        actual: `$${actualEps.toFixed(2)}`,
        consensusValue: expectedEps,
        actualValue: actualEps,
        difference: (actualEps - expectedEps) / expectedEps,
      },
      { 
        metric: 'FCF', 
        consensus: formatCurrency(expectedFcf), 
        actual: formatCurrency(actualFcf),
        consensusValue: expectedFcf,
        actualValue: actualFcf,
        difference: (actualFcf - expectedFcf) / Math.abs(expectedFcf),
      },
    ];
  }, [team, derivedMetrics, roundResults]);
  
  if (!team || !gameState || !roundResults || !derivedMetrics) {
    return (
      <div className="min-h-screen bg-magna-chrome-white flex items-center justify-center">
        <div className="text-slate-700">Loading results...</div>
      </div>
    );
  }
  
  const totalTeams = gameState.teamCount;
  const isTopThree = teamRank && teamRank <= 3;
  const fiscalYear = 2025 + roundResults.round;
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-slate-50 to-slate-100",
      "py-8 px-4 md:px-8",
      className
    )}>
      <div className="max-w-6xl mx-auto">
        {/* Report Header - JPMorgan Style */}
        <header className="bg-magna-carbon-black text-white rounded-t-2xl p-8 mb-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MagnaLogo variant="white" size="lg" />
              </div>
              <div className="text-slate-300 text-lg">
                Automotive Technology & Manufacturing
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg text-magna-cool-gray">Equity Research</div>
              <div className="text-2xl font-semibold">Q4 FY{fiscalYear}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/20">
            <span className="bg-magna-ignition-red px-5 py-2 rounded-full text-lg font-bold">
              {teamName || `Team ${teamId}`}
            </span>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold",
              isTopThree ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/70"
            )}>
              <Award className="w-5 h-5" />
              <span>Rank #{teamRank} of {totalTeams}</span>
            </div>
            <div className="ml-auto text-3xl font-bold">
              ${team.stockPrice.toFixed(2)}
              <span className={cn(
                "text-lg ml-3",
                team.cumulativeTSR >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {formatPercent(team.cumulativeTSR)} TSR
              </span>
            </div>
          </div>
        </header>
        
        {/* Rating & Price Target Bar */}
        <div className="bg-white border-x border-b border-magna-cool-gray/20 rounded-b-2xl p-6 mb-6">
          <RatingBadge rating={rating} priceTarget={priceTarget} currentPrice={team.stockPrice} />
        </div>
        
        {/* Executive Summary */}
        <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-8 mb-6">
          <h2 className="text-base font-semibold text-magna-carbon-black uppercase tracking-wide mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-magna-ignition-red" />
            Investment Thesis
          </h2>
          <p className="text-magna-carbon-black text-lg leading-relaxed">
            In FY{fiscalYear}, the company achieved revenue of {formatCurrency(team.metrics.revenue)} with 
            an EBIT margin of {formatPercent(team.metrics.ebitMargin, false)}. 
            {derivedMetrics.growthOverMarket > 0 
              ? ` Revenue growth outpaced the market by ${formatPercent(derivedMetrics.growthOverMarket)}, demonstrating strong competitive positioning.`
              : ` The company is focused on operational improvements to regain market share.`
            }
            {' '}We {rating === 'BUY' ? 'recommend accumulating shares' : rating === 'SELL' ? 'advise reducing exposure' : 'maintain a neutral stance'} with 
            a price target of ${priceTarget.toFixed(2)}, representing {((priceTarget / team.stockPrice - 1) * 100).toFixed(0)}% {priceTarget > team.stockPrice ? 'upside' : 'downside'}.
          </p>
        </section>
        
        {/* Key Metrics - Sectioned (Growth > Profitability > Cash Flow > Valuation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Growth */}
          <MetricSection title="Growth" icon={<TrendingUp className="w-4 h-4" />}>
            <MetricRow label="Revenue Growth" value={formatPercent(derivedMetrics.revenueGrowth)} change={derivedMetrics.revenueGrowth} showChangeArrow={false} />
            <MetricRow label="EBIT Growth" value={formatPercent(derivedMetrics.ebitGrowth)} change={derivedMetrics.ebitGrowth} showChangeArrow={false} />
            <MetricRow label="vs. Market" value={formatPercent(derivedMetrics.growthOverMarket)} />
            <MetricRow label="Market Growth" value={formatPercent(derivedMetrics.marketGrowth, false)} />
          </MetricSection>
          
          {/* Profitability */}
          <MetricSection title="Profitability" icon={<BarChart3 className="w-4 h-4" />}>
            <MetricRow label="Operating Profit" value={formatCurrency(team.metrics.ebit)} change={derivedMetrics.ebitGrowth} />
            <MetricRow label="EBIT Margin" value={formatPercent(team.metrics.ebitMargin, false)} />
            <MetricRow label="ROIC" value={formatPercent(team.metrics.roic, false)} />
            <MetricRow label="EBITDA" value={formatCurrency(team.metrics.ebitda)} />
          </MetricSection>
          
          {/* Cash Flow */}
          <MetricSection title="Cash Flow" icon={<Activity className="w-4 h-4" />}>
            <MetricRow label="Operating FCF" value={formatCurrency(team.metrics.operatingFCF)} change={derivedMetrics.fcfGrowth} />
            <MetricRow label="Cash for Next Rd" value={formatCurrency(team.metrics.endingCash)} />
            <MetricRow label="Debt/EBITDA" value={`${derivedMetrics.debtToEbitda.toFixed(1)}x`} />
            <MetricRow label="FCF Conversion" value={formatPercent(derivedMetrics.fcfConversion, false)} />
          </MetricSection>
          
          {/* Valuation */}
          <MetricSection title="Valuation" icon={<DollarSign className="w-4 h-4" />}>
            <MetricRow label="Share Price" value={`$${team.stockPrice.toFixed(2)}`} change={ourResult?.stockPriceChange ? ourResult.stockPriceChange / BASELINE_STOCK_PRICE : undefined} />
            <MetricRow label="EV/EBITDA" value={`${derivedMetrics.evToEbitda.toFixed(1)}x`} />
            <MetricRow label="EV/EBIT" value={`${derivedMetrics.evToEbit.toFixed(1)}x`} />
            <MetricRow label="Price Target" value={`$${priceTarget.toFixed(2)}`} />
          </MetricSection>
        </div>
        
        {/* Performance vs. Wall Street Expectations */}
        <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-8 mb-6">
          <h2 className="text-base font-semibold text-magna-carbon-black uppercase tracking-wide mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-magna-ignition-red" />
            Performance vs. Wall Street Expectations
          </h2>
          <p className="text-magna-cool-gray text-sm mb-4">
            How your FY{fiscalYear} results compare to analyst consensus estimates
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-magna-cool-gray/30">
                  <th className="text-left text-sm font-semibold text-magna-cool-gray uppercase py-3">Metric</th>
                  <th className="text-right text-sm font-semibold text-magna-cool-gray uppercase py-3">
                    <span className="flex items-center justify-end gap-1">
                      Wall Street Expected
                    </span>
                  </th>
                  <th className="text-right text-sm font-semibold text-magna-cool-gray uppercase py-3">
                    <span className="flex items-center justify-end gap-1">
                      Your Result
                    </span>
                  </th>
                  <th className="text-right text-sm font-semibold text-magna-cool-gray uppercase py-3">vs. Consensus</th>
                </tr>
              </thead>
              <tbody>
                {consensusEstimates.map((est) => {
                  const isBeat = est.difference > 0.001;
                  const isMiss = est.difference < -0.001;
                  const isInline = !isBeat && !isMiss;
                  
                  return (
                    <tr key={est.metric} className="border-b border-magna-cool-gray/10 last:border-0">
                      <td className="py-4 text-lg font-medium text-magna-carbon-black">{est.metric}</td>
                      <td className="py-4 text-lg text-right text-magna-cool-gray">{est.consensus}</td>
                      <td className="py-4 text-lg text-right font-bold text-magna-carbon-black">{est.actual}</td>
                      <td className={cn(
                        "py-4 text-right font-bold",
                        isBeat && "text-emerald-600",
                        isMiss && "text-red-600",
                        isInline && "text-magna-cool-gray"
                      )}>
                        <div className="flex items-center justify-end gap-2">
                          {isBeat && <TrendingUp className="w-5 h-5" />}
                          {isMiss && <TrendingDown className="w-5 h-5" />}
                          <span className="text-lg">
                            {isInline ? 'In Line' : formatPercent(est.difference)}
                          </span>
                          {isBeat && <span className="text-sm font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">BEAT</span>}
                          {isMiss && <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded">MISS</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary Badge */}
          {(() => {
            const beats = consensusEstimates.filter(e => e.difference > 0.001).length;
            const misses = consensusEstimates.filter(e => e.difference < -0.001).length;
            const total = consensusEstimates.length;
            
            if (beats >= 3) {
              return (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-emerald-200 p-2 rounded-full">
                    <TrendingUp className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-800">Strong Beat!</div>
                    <div className="text-emerald-700 text-sm">You beat {beats} of {total} Wall Street estimates this quarter</div>
                  </div>
                </div>
              );
            } else if (misses >= 3) {
              return (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-red-200 p-2 rounded-full">
                    <TrendingDown className="w-5 h-5 text-red-700" />
                  </div>
                  <div>
                    <div className="font-bold text-red-800">Below Expectations</div>
                    <div className="text-red-700 text-sm">You missed {misses} of {total} Wall Street estimates this quarter</div>
                  </div>
                </div>
              );
            } else if (beats > misses) {
              return (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-emerald-200 p-2 rounded-full">
                    <TrendingUp className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-800">Beat Expectations</div>
                    <div className="text-emerald-700 text-sm">You beat {beats} of {total} Wall Street estimates</div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-amber-200 p-2 rounded-full">
                    <MinusCircle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-800">Mixed Results</div>
                    <div className="text-amber-700 text-sm">Performance was in line with Wall Street expectations</div>
                  </div>
                </div>
              );
            }
          })()}
        </section>
        
        {/* Analyst Commentary - More Prominent */}
        {analystQuotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-magna-carbon-black uppercase tracking-wide mb-6 flex items-center gap-3">
              <Quote className="w-6 h-6 text-magna-ignition-red" />
              What Analysts Are Saying
            </h2>
            
            {/* Question - Full Width, Prominent */}
            {analystQuotes.filter(q => q.type === 'question').map((quote, index) => (
              <div key={`q-${index}`} className="mb-6">
                <AnalystQuoteCard quote={quote} />
              </div>
            ))}
            
            {/* Observations - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analystQuotes.filter(q => q.type === 'observation').map((quote, index) => (
                <AnalystQuoteCard key={`o-${index}`} quote={quote} />
              ))}
            </div>
          </section>
        )}
        
        {/* Market & Peer Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-8">
            <h2 className="text-base font-semibold text-magna-carbon-black uppercase tracking-wide mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-magna-ignition-red" />
              Market Outlook
            </h2>
            
            {/* Backward-Looking Statements */}
            {roundResults.marketOutlook?.backwardStatements?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-magna-cool-gray uppercase tracking-wide mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  This Fiscal Year
                </h3>
                <ul className="space-y-3">
                  {roundResults.marketOutlook.backwardStatements.map((statement, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-magna-ignition-red rounded-full mt-2 flex-shrink-0" />
                      <span className="text-magna-carbon-black text-base leading-relaxed">{statement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Forward-Looking Statements */}
            {roundResults.marketOutlook?.forwardStatements?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-magna-cool-gray uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Looking Ahead
                </h3>
                <ul className="space-y-3">
                  {roundResults.marketOutlook.forwardStatements.map((statement, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-magna-electric-blue rounded-full mt-2 flex-shrink-0" />
                      <span className="text-magna-carbon-black text-base leading-relaxed">{statement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Fallback to scenario narrative if no market outlook */}
            {(!roundResults.marketOutlook?.backwardStatements?.length && !roundResults.marketOutlook?.forwardStatements?.length) && (
              <p className="text-magna-carbon-black text-lg leading-relaxed">
                {roundResults.scenarioNarrative}
              </p>
            )}
          </section>
          
          <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-8">
            <h2 className="text-base font-semibold text-magna-carbon-black uppercase tracking-wide mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-magna-ignition-red" />
              Peer Comparison
            </h2>
            <div className="space-y-3">
              {nearbyTeams.map((teamResult) => (
                <div
                  key={teamResult.teamId}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-colors",
                    teamResult.teamId === teamId
                      ? "bg-magna-ignition-red/10 border border-magna-ignition-red/30"
                      : "bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base",
                      teamResult.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-magna-cool-gray"
                    )}>
                      {teamResult.rank}
                    </div>
                    <span className={cn(
                      "text-lg font-medium",
                      teamResult.teamId === teamId ? "text-magna-ignition-red" : "text-magna-carbon-black"
                    )}>
                      {teamResult.teamId === teamId 
                        ? (teamName || `Team ${teamResult.teamId}`)
                        : (gameState?.teams[teamResult.teamId]?.teamName || `Team ${teamResult.teamId}`)
                      }
                      {teamResult.teamId === teamId && " (You)"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-magna-carbon-black">
                      ${teamResult.stockPrice.toFixed(2)}
                    </div>
                    <div className={cn(
                      "text-base font-semibold",
                      teamResult.cumulativeTSR >= 0 ? "text-emerald-600" : "text-red-600"
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
          <div className="flex items-center justify-center gap-3 text-magna-cool-gray text-lg">
            <Clock className="w-6 h-6" />
            <span>Waiting for facilitator to start next round...</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-magna-ignition-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-magna-ignition-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-magna-ignition-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
          
          <p className="text-sm text-magna-cool-gray/60 mt-4">
            This report is for educational purposes only. Forward. For all.
          </p>
        </footer>
      </div>
    </div>
  );
};

InvestorReportSummary.displayName = 'InvestorReportSummary';
