/**
 * Analyst Quotes System
 * 
 * Provides dynamic analyst commentary for each round based on team performance.
 * Quotes are templated and filled with actual metrics.
 */

import type { FinancialMetrics, RoundNumber } from '@/types/game';

export interface AnalystQuote {
  analyst: string;
  firm: string;
  quote: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface QuoteTemplate {
  analyst: string;
  firm: string;
  template: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  condition: (metrics: PerformanceData) => boolean;
}

interface PerformanceData {
  ebitMargin: number;
  roic: number;
  revenueGrowth: number;
  fcfConversion: number;
  stockPriceChange: number;
  rank: number;
  totalTeams: number;
}

/**
 * Market growth rates by scenario (for comparison)
 */
export const MARKET_GROWTH_RATES: Record<RoundNumber, number> = {
  1: 0.03,  // 3% - Business as Usual
  2: 0.03,  // 3% - Business as Usual
  3: 0.01,  // 1% - Cost Pressure
  4: -0.02, // -2% - Recession
  5: 0.04,  // 4% - Recovery
};

/**
 * Quote templates organized by round
 */
const QUOTE_TEMPLATES: Record<RoundNumber, QuoteTemplate[]> = {
  1: [
    {
      analyst: 'Sarah Chen',
      firm: 'Goldman Sachs',
      template: 'Management is making bold early moves. With EBIT margin at {ebitMargin}, the strategic direction looks promising.',
      sentiment: 'positive',
      condition: (p) => p.ebitMargin > 0.048,
    },
    {
      analyst: 'Michael Torres',
      firm: 'Morgan Stanley',
      template: 'We see solid fundamentals with ROIC of {roic}. Watching capital allocation decisions closely.',
      sentiment: 'neutral',
      condition: (p) => p.roic > 0.07,
    },
    {
      analyst: 'Jennifer Walsh',
      firm: 'JP Morgan',
      template: 'Early investments in growth could pay dividends. FCF conversion of {fcfConversion} is encouraging.',
      sentiment: 'positive',
      condition: (p) => p.fcfConversion > 0.35,
    },
    {
      analyst: 'David Kim',
      firm: 'Barclays',
      template: 'Revenue growth of {revenueGrowth} outpaces the market. We maintain our BUY rating.',
      sentiment: 'positive',
      condition: (p) => p.revenueGrowth > 0.03,
    },
    {
      analyst: 'Amanda Foster',
      firm: 'Credit Suisse',
      template: 'Margin compression concerns us. EBIT margin at {ebitMargin} needs improvement.',
      sentiment: 'negative',
      condition: (p) => p.ebitMargin < 0.045,
    },
  ],
  2: [
    {
      analyst: 'Robert Martinez',
      firm: 'UBS',
      template: 'Consistent execution continues. The {revenueGrowth} revenue growth validates the strategy.',
      sentiment: 'positive',
      condition: (p) => p.revenueGrowth > 0.02,
    },
    {
      analyst: 'Lisa Thompson',
      firm: 'Deutsche Bank',
      template: 'ROIC of {roic} demonstrates efficient capital deployment. Upgrading to OVERWEIGHT.',
      sentiment: 'positive',
      condition: (p) => p.roic > 0.08,
    },
    {
      analyst: 'James Wilson',
      firm: 'Citi',
      template: 'Stock performance of {stockPriceChange} reflects market confidence. Holding position.',
      sentiment: 'neutral',
      condition: (p) => p.stockPriceChange > 0,
    },
    {
      analyst: 'Emily Zhang',
      firm: 'Bank of America',
      template: 'Watching margin trends carefully. Current {ebitMargin} EBIT margin is below sector average.',
      sentiment: 'negative',
      condition: (p) => p.ebitMargin < 0.05,
    },
  ],
  3: [
    {
      analyst: 'Sarah Chen',
      firm: 'Goldman Sachs',
      template: 'Cost discipline is evident. Despite sector headwinds, EBIT margin held at {ebitMargin}.',
      sentiment: 'positive',
      condition: (p) => p.ebitMargin > 0.045,
    },
    {
      analyst: 'Richard Park',
      firm: 'Jefferies',
      template: 'Cost pressure environment tests management. FCF conversion of {fcfConversion} shows resilience.',
      sentiment: 'neutral',
      condition: (p) => p.fcfConversion > 0.30,
    },
    {
      analyst: 'Katherine Lee',
      firm: 'RBC Capital',
      template: 'Outperforming peers during cost pressures. Revenue growth of {revenueGrowth} vs market {marketGrowth}.',
      sentiment: 'positive',
      condition: (p) => p.revenueGrowth > 0.01,
    },
    {
      analyst: 'Steven Brown',
      firm: 'Wells Fargo',
      template: 'Margin erosion accelerating. EBIT margin drop to {ebitMargin} is concerning.',
      sentiment: 'negative',
      condition: (p) => p.ebitMargin < 0.04,
    },
  ],
  4: [
    {
      analyst: 'Michael Torres',
      firm: 'Morgan Stanley',
      template: 'Recession resilience is remarkable. Maintaining {ebitMargin} EBIT margin when peers struggle.',
      sentiment: 'positive',
      condition: (p) => p.ebitMargin > 0.04,
    },
    {
      analyst: 'Jennifer Walsh',
      firm: 'JP Morgan',
      template: 'Balance sheet strength evident. ROIC of {roic} during downturn positions well for recovery.',
      sentiment: 'positive',
      condition: (p) => p.roic > 0.06,
    },
    {
      analyst: 'Andrew Clark',
      firm: 'Bernstein',
      template: 'Defensive positioning paying off. FCF generation at {fcfConversion} provides optionality.',
      sentiment: 'neutral',
      condition: (p) => p.fcfConversion > 0.25,
    },
    {
      analyst: 'Michelle Davis',
      firm: 'Nomura',
      template: 'Recession impact deeper than expected. Revenue decline of {revenueGrowth} weighs on outlook.',
      sentiment: 'negative',
      condition: (p) => p.revenueGrowth < -0.02,
    },
  ],
  5: [
    {
      analyst: 'Lisa Thompson',
      firm: 'Deutsche Bank',
      template: 'Strong recovery execution. Revenue growth of {revenueGrowth} exceeds market at {marketGrowth}.',
      sentiment: 'positive',
      condition: (p) => p.revenueGrowth > 0.04,
    },
    {
      analyst: 'David Kim',
      firm: 'Barclays',
      template: 'Multi-year strategy bearing fruit. ROIC expansion to {roic} validates capital allocation.',
      sentiment: 'positive',
      condition: (p) => p.roic > 0.09,
    },
    {
      analyst: 'Robert Martinez',
      firm: 'UBS',
      template: 'Well-positioned for cycle upturn. Initiating coverage with STRONG BUY, price target ${priceTarget}.',
      sentiment: 'positive',
      condition: (p) => p.rank <= 3,
    },
    {
      analyst: 'James Wilson',
      firm: 'Citi',
      template: 'Recovery lagging peers. Stock price change of {stockPriceChange} underperforms sector.',
      sentiment: 'negative',
      condition: (p) => p.stockPriceChange < 0.05 && p.rank > 5,
    },
  ],
};

/**
 * Formats a percentage value for display
 */
function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
}

/**
 * Fills template placeholders with actual values
 */
function fillTemplate(template: string, data: PerformanceData, round: RoundNumber, stockPrice: number): string {
  const marketGrowth = MARKET_GROWTH_RATES[round];
  const priceTarget = (stockPrice * 1.15).toFixed(2);
  
  return template
    .replace('{ebitMargin}', formatPercent(data.ebitMargin))
    .replace('{roic}', formatPercent(data.roic))
    .replace('{revenueGrowth}', formatPercent(data.revenueGrowth))
    .replace('{fcfConversion}', formatPercent(data.fcfConversion))
    .replace('{stockPriceChange}', formatPercent(data.stockPriceChange))
    .replace('{marketGrowth}', formatPercent(marketGrowth))
    .replace('{priceTarget}', priceTarget);
}

/**
 * Generates analyst quotes based on team performance
 */
export function generateAnalystQuotes(
  metrics: FinancialMetrics,
  previousMetrics: FinancialMetrics | null,
  round: RoundNumber,
  stockPrice: number,
  previousStockPrice: number,
  rank: number,
  totalTeams: number
): AnalystQuote[] {
  const baselineRevenue = 42836; // From baseline financials
  const baselineEbitda = 3738;
  
  // Calculate performance data
  const performanceData: PerformanceData = {
    ebitMargin: metrics.ebitMargin,
    roic: metrics.roic,
    revenueGrowth: previousMetrics 
      ? (metrics.revenue - previousMetrics.revenue) / previousMetrics.revenue
      : (metrics.revenue - baselineRevenue) / baselineRevenue,
    fcfConversion: metrics.operatingFCF / metrics.ebitda,
    stockPriceChange: (stockPrice - previousStockPrice) / previousStockPrice,
    rank,
    totalTeams,
  };
  
  // Get templates for this round
  const templates = QUOTE_TEMPLATES[round] || QUOTE_TEMPLATES[1];
  
  // Find matching quotes (max 3)
  const matchingQuotes: AnalystQuote[] = [];
  
  for (const template of templates) {
    if (template.condition(performanceData) && matchingQuotes.length < 3) {
      matchingQuotes.push({
        analyst: template.analyst,
        firm: template.firm,
        quote: fillTemplate(template.template, performanceData, round, stockPrice),
        sentiment: template.sentiment,
      });
    }
  }
  
  // If we don't have enough quotes, add some defaults
  if (matchingQuotes.length === 0) {
    matchingQuotes.push({
      analyst: 'Market Analyst',
      firm: 'Industry Watch',
      quote: `Performance tracking expectations. Current EBIT margin at ${formatPercent(performanceData.ebitMargin)}.`,
      sentiment: 'neutral',
    });
  }
  
  return matchingQuotes.slice(0, 3);
}
