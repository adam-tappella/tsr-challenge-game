/**
 * InvestorReportDemo Component
 * 
 * Demo page to preview the investor report with mock data.
 * Access via /#demo route.
 */

import React from 'react';
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
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_METRICS = {
  revenue: 44500,
  ebit: 2350,
  ebitMargin: 0.0528,
  roic: 0.092,
  stockPrice: 54.75,
  operatingFCF: 1720,
  ebitda: 4100,
  capex: -1850,
};

const MOCK_DERIVED = {
  revenueGrowth: 0.039,
  ebitGrowth: 0.111,
  fcfGrowth: 0.102,
  capexToSales: 0.042,
  fcfConversion: 0.420,
  growthOverMarket: 0.009,
  marketGrowth: 0.03,
};

const MOCK_QUOTES = [
  {
    analyst: 'Sarah Chen',
    firm: 'Goldman Sachs',
    quote: 'Management is making bold early moves. With EBIT margin at +5.3%, the strategic direction looks promising.',
    sentiment: 'positive' as const,
  },
  {
    analyst: 'Michael Torres',
    firm: 'Morgan Stanley',
    quote: 'We see solid fundamentals with ROIC of +9.2%. Watching capital allocation decisions closely.',
    sentiment: 'neutral' as const,
  },
  {
    analyst: 'Jennifer Walsh',
    firm: 'JP Morgan',
    quote: 'Early investments in growth could pay dividends. FCF conversion of +42.0% is encouraging.',
    sentiment: 'positive' as const,
  },
];

const MOCK_LEADERBOARD = [
  { teamId: 3, rank: 1, stockPrice: 58.42, cumulativeTSR: 0.185 },
  { teamId: 7, rank: 2, stockPrice: 56.18, cumulativeTSR: 0.140 },
  { teamId: 5, rank: 3, stockPrice: 54.75, cumulativeTSR: 0.111, isYou: true },
  { teamId: 1, rank: 4, stockPrice: 52.30, cumulativeTSR: 0.061 },
  { teamId: 9, rank: 5, stockPrice: 50.85, cumulativeTSR: 0.032 },
];

// =============================================================================
// Helper Functions
// =============================================================================

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

// =============================================================================
// Sub-Components
// =============================================================================

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  benchmark?: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, benchmark, icon }) => {
  const isPositive = change !== undefined ? change >= 0 : true;
  
  return (
    <div className="bg-white rounded-xl border border-magna-cool-gray/20 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-magna-cool-gray uppercase tracking-wider">
          {label}
        </span>
        <div className="text-magna-cool-gray/60">
          {icon}
        </div>
      </div>
      
      <div className="text-2xl font-bold text-magna-carbon-black mb-1">
        {value}
      </div>
      
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-emerald-600" : "text-magna-ignition-red"
        )}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{formatPercent(change)} vs prior</span>
        </div>
      )}
      
      {benchmark && (
        <div className="text-xs text-magna-cool-gray mt-1">
          Market: {benchmark}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Main Demo Component
// =============================================================================

export const InvestorReportDemo: React.FC = () => {
  const displayMetrics = [
    { label: 'Revenue', value: formatCurrency(MOCK_METRICS.revenue), change: MOCK_DERIVED.revenueGrowth, icon: <DollarSign className="w-4 h-4" /> },
    { label: 'EBIT (Earnings)', value: formatCurrency(MOCK_METRICS.ebit), change: MOCK_DERIVED.ebitGrowth, icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'EBIT Margin', value: formatPercent(MOCK_METRICS.ebitMargin, false), icon: <Percent className="w-4 h-4" /> },
    { label: 'Share Price', value: `$${MOCK_METRICS.stockPrice.toFixed(2)}`, change: 0.111, icon: <Activity className="w-4 h-4" /> },
    { label: 'Growth Over Market', value: formatPercent(MOCK_DERIVED.growthOverMarket), benchmark: formatPercent(MOCK_DERIVED.marketGrowth, false), icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'ROIC', value: formatPercent(MOCK_METRICS.roic, false), icon: <PieChart className="w-4 h-4" /> },
    { label: 'Capex to Sales', value: formatPercent(MOCK_DERIVED.capexToSales, false), icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'FCF Conversion', value: formatPercent(MOCK_DERIVED.fcfConversion, false), icon: <Activity className="w-4 h-4" /> },
    { label: 'FCF Growth', value: formatPercent(MOCK_DERIVED.fcfGrowth), icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Operating FCF', value: formatCurrency(MOCK_METRICS.operatingFCF), change: MOCK_DERIVED.fcfGrowth, icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-magna-chrome-white to-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Demo Banner */}
        <div className="bg-magna-electric-blue/10 border border-magna-electric-blue/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-magna-electric-blue font-medium">Demo Mode</span>
            <span className="text-magna-cool-gray text-sm">This is a preview with sample data</span>
          </div>
          <a 
            href="#" 
            className="flex items-center gap-2 text-sm text-magna-cool-gray hover:text-magna-carbon-black"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </a>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl font-black text-magna-carbon-black tracking-tight">MAGNA</span>
            <span className="w-2.5 h-2.5 bg-magna-ignition-red rounded-full" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-magna-carbon-black mb-2">
            Q4 FY2026 Investor Report
          </h1>
          
          <div className="flex items-center justify-center gap-4">
            <span className="bg-magna-ignition-red text-white px-4 py-1.5 rounded-full font-bold">
              Team 5
            </span>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full font-medium bg-amber-100 text-amber-700">
              <Award className="w-4 h-4" />
              <span>Rank #3 of 10</span>
            </div>
          </div>
        </header>
        
        {/* Executive Summary */}
        <section className="bg-magna-carbon-black text-white rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-3">
            Executive Summary
          </h2>
          <p className="text-lg leading-relaxed">
            In FY2026, the company achieved revenue of $44.5B with an EBIT margin of 5.3%. 
            Revenue growth outpaced the market by +0.9%. Share price closed at $54.75, 
            reflecting a cumulative TSR of +11.1% since inception.
          </p>
        </section>
        
        {/* Key Metrics Grid */}
        <section className="mb-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-4">
            Key Financial Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>
        
        {/* Analyst Commentary */}
        <section className="mb-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-4">
            Analyst Commentary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_QUOTES.map((quote, index) => (
              <div 
                key={index}
                className={cn(
                  "bg-white rounded-xl border p-4",
                  quote.sentiment === 'positive' && "border-emerald-200 bg-emerald-50/30",
                  quote.sentiment === 'negative' && "border-magna-ignition-red/20 bg-red-50/30",
                  quote.sentiment === 'neutral' && "border-magna-cool-gray/20"
                )}
              >
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
            ))}
          </div>
        </section>
        
        {/* Market Conditions & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-3">
              Market Conditions
            </h2>
            <p className="text-magna-carbon-black leading-relaxed">
              The automotive sector experienced steady growth in FY2026, with global light vehicle production 
              increasing 3% year-over-year. OEM demand for advanced technologies remained strong, 
              particularly in electrification and driver assistance systems.
            </p>
          </section>
          
          <section className="bg-white rounded-2xl border border-magna-cool-gray/20 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-magna-cool-gray mb-3">
              Peer Comparison
            </h2>
            <div className="space-y-2">
              {MOCK_LEADERBOARD.map((team) => (
                <div
                  key={team.teamId}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-colors",
                    team.isYou
                      ? "bg-magna-ignition-red/10 border border-magna-ignition-red/30"
                      : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      team.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-magna-cool-gray"
                    )}>
                      {team.rank}
                    </div>
                    <span className={cn(
                      "font-medium",
                      team.isYou ? "text-magna-ignition-red" : "text-magna-carbon-black"
                    )}>
                      Team {team.teamId}
                      {team.isYou && " (You)"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-magna-carbon-black">
                      ${team.stockPrice.toFixed(2)}
                    </div>
                    <div className={cn(
                      "text-xs font-medium",
                      team.cumulativeTSR >= 0 ? "text-emerald-600" : "text-magna-ignition-red"
                    )}>
                      {formatPercent(team.cumulativeTSR)} TSR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <footer className="text-center">
          <p className="text-xs text-magna-cool-gray/60 mt-4">
            Forward. For all.
          </p>
        </footer>
      </div>
    </div>
  );
};

InvestorReportDemo.displayName = 'InvestorReportDemo';
