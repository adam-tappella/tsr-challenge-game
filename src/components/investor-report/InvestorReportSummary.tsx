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
import { generateAnalystQuotes, MARKET_GROWTH_RATES, type AnalystQuote } from './analystQuotes';
import type { FinancialMetrics, RoundNumber } from '@/types/game';

// =============================================================================
// Types
// =============================================================================

type Rating = 'BUY' | 'HOLD' | 'SELL';

interface ConsensusEstimate {
  metric: string;
  current: string;
  prior: string;
  change: number;
}

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
          <div className="text-sm font-semibold text-magna-cool-gray uppercase tracking-wider mb-2">
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
          <div className="text-sm font-semibold text-magna-cool-gray uppercase tracking-wider mb-1">
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
    <div className="flex items-center justify-between py-3 border-b border-magna-cool-gray/10 last:border-0">
      <span className="text-base text-magna-cool-gray">{label}</span>
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
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-magna-cool-gray/20">
        <span className="text-magna-cool-gray">{icon}</span>
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
            <Building2 className="w-4 h-4 text-magna-cool-gray" />
            <span className="font-semibold text-magna-carbon-black">{quote.analyst}</span>
            <span className="text-magna-cool-gray">•</span>
            <span className="text-magna-cool-gray">{quote.firm}</span>
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
  
  // Consensus estimates table
  const consensusEstimates: ConsensusEstimate[] = useMemo(() => {
    if (!team || !derivedMetrics) return [];
    return [
      { metric: 'Revenue', current: formatCurrency(team.metrics.revenue), prior: formatCurrency(BASELINE_REVENUE), change: derivedMetrics.revenueGrowth },
      { metric: 'EBIT', current: formatCurrency(team.metrics.ebit), prior: formatCurrency(BASELINE_EBIT), change: derivedMetrics.ebitGrowth },
      { metric: 'EPS', current: `$${derivedMetrics.eps.toFixed(2)}`, prior: `$${(BASELINE_EBIT * 0.75 / SHARES_OUTSTANDING).toFixed(2)}`, change: derivedMetrics.epsGrowth },
      { metric: 'FCF', current: formatCurrency(team.metrics.operatingFCF), prior: formatCurrency(BASELINE_FCF), change: derivedMetrics.fcfGrowth },
    ];
  }, [team, derivedMetrics]);
  
  if (!team || !gameState || !roundResults || !derivedMetrics) {
    return (
      <div className="min-h-screen bg-magna-chrome-white flex items-center justify-center">
        <div className="text-magna-cool-gray">Loading results...</div>
      </div>
    );
  }
  
  const totalTeams = gameState.teamCount;
  const isTopThree = teamRank && teamRank <= 3;
  const fiscalYear = 2025 + roundResults.round;
  const peRatio = team.stockPrice / derivedMetrics.eps;
  
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
                <span className="text-4xl font-black tracking-tight">MAGNA</span>
                <span className="w-3 h-3 bg-magna-ignition-red rounded-full" />
              </div>
              <div className="text-magna-cool-gray text-lg">
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
        
        {/* Consensus Estimates Table */}
        <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-8 mb-6">
          <h2 className="text-base font-semibold text-magna-carbon-black uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-magna-ignition-red" />
            Consensus Estimates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-magna-cool-gray/20">
                  <th className="text-left text-sm font-semibold text-magna-cool-gray uppercase py-3">Metric</th>
                  <th className="text-right text-sm font-semibold text-magna-cool-gray uppercase py-3">FY{fiscalYear}</th>
                  <th className="text-right text-sm font-semibold text-magna-cool-gray uppercase py-3">FY{fiscalYear - 1}</th>
                  <th className="text-right text-sm font-semibold text-magna-cool-gray uppercase py-3">YoY Change</th>
                </tr>
              </thead>
              <tbody>
                {consensusEstimates.map((est) => (
                  <tr key={est.metric} className="border-b border-magna-cool-gray/10 last:border-0">
                    <td className="py-4 text-lg font-medium text-magna-carbon-black">{est.metric}</td>
                    <td className="py-4 text-lg text-right font-semibold text-magna-carbon-black">{est.current}</td>
                    <td className="py-4 text-lg text-right text-magna-cool-gray">{est.prior}</td>
                    <td className={cn(
                      "py-4 text-lg text-right font-semibold",
                      est.change >= 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {formatPercent(est.change)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        {/* Key Metrics - Sectioned */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Valuation */}
          <MetricSection title="Valuation" icon={<DollarSign className="w-4 h-4" />}>
            <MetricRow label="Share Price" value={`$${team.stockPrice.toFixed(2)}`} change={ourResult?.stockPriceChange ? ourResult.stockPriceChange / BASELINE_STOCK_PRICE : undefined} />
            <MetricRow label="EPS (TTM)" value={`$${derivedMetrics.eps.toFixed(2)}`} change={derivedMetrics.epsGrowth} />
            <MetricRow label="P/E Ratio" value={`${peRatio.toFixed(1)}x`} />
            <MetricRow label="Price Target" value={`$${priceTarget.toFixed(2)}`} />
          </MetricSection>
          
          {/* Growth */}
          <MetricSection title="Growth" icon={<TrendingUp className="w-4 h-4" />}>
            <MetricRow label="Revenue Growth" value={formatPercent(derivedMetrics.revenueGrowth)} change={derivedMetrics.revenueGrowth} showChangeArrow={false} />
            <MetricRow label="EBIT Growth" value={formatPercent(derivedMetrics.ebitGrowth)} change={derivedMetrics.ebitGrowth} showChangeArrow={false} />
            <MetricRow label="vs. Market" value={formatPercent(derivedMetrics.growthOverMarket)} />
            <MetricRow label="Market Growth" value={formatPercent(derivedMetrics.marketGrowth, false)} />
          </MetricSection>
          
          {/* Profitability */}
          <MetricSection title="Profitability" icon={<BarChart3 className="w-4 h-4" />}>
            <MetricRow label="EBIT Margin" value={formatPercent(team.metrics.ebitMargin, false)} />
            <MetricRow label="ROIC" value={formatPercent(team.metrics.roic, false)} />
            <MetricRow label="EBITDA" value={formatCurrency(team.metrics.ebitda)} />
            <MetricRow label="Net Income" value={formatCurrency(team.metrics.ebit * 0.75)} />
          </MetricSection>
          
          {/* Cash Flow */}
          <MetricSection title="Cash Flow" icon={<Activity className="w-4 h-4" />}>
            <MetricRow label="Operating FCF" value={formatCurrency(team.metrics.operatingFCF)} change={derivedMetrics.fcfGrowth} />
            <MetricRow label="FCF Conversion" value={formatPercent(derivedMetrics.fcfConversion, false)} />
            <MetricRow label="Capex/Sales" value={formatPercent(derivedMetrics.capexToSales, false)} />
            <MetricRow label="FCF Growth" value={formatPercent(derivedMetrics.fcfGrowth)} showChangeArrow={false} />
          </MetricSection>
        </div>
        
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
