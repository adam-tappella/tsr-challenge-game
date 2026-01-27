/**
 * Analyst Quotes System
 * 
 * Provides dynamic analyst commentary for each round based on team performance.
 * Generates 3 quotes:
 * - 1 challenging question probing management decisions
 * - 2 observations explaining share price movement
 */

import type { FinancialMetrics, RoundNumber } from '@/types/game';

export interface AnalystQuote {
  analyst: string;
  firm: string;
  quote: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  type: 'question' | 'observation';
}

interface QuoteTemplate {
  analyst: string;
  firm: string;
  template: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  type: 'question' | 'observation';
  condition: (metrics: PerformanceData) => boolean;
  priority: number;
}

interface PerformanceData {
  ebitMargin: number;
  roic: number;
  revenueGrowth: number;
  fcfConversion: number;
  stockPriceChange: number;
  rank: number;
  totalTeams: number;
  stockPrice: number;
  previousStockPrice: number;
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

// =============================================================================
// Challenging Questions - Probing Management Decisions
// =============================================================================

const CHALLENGING_QUESTIONS: QuoteTemplate[] = [
  // Growth vs. Efficiency balance
  {
    analyst: 'Sarah Chen',
    firm: 'Goldman Sachs',
    template: 'With ROIC at {roic}, is management allocating enough capital to high-return opportunities, or playing it too safe?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.roic >= 0.07 && p.roic <= 0.10,
    priority: 10,
  },
  {
    analyst: 'Michael Torres',
    firm: 'Morgan Stanley',
    template: 'Revenue growth of {revenueGrowth} trails the market. What is management\'s plan to recapture market share?',
    sentiment: 'negative',
    type: 'question',
    condition: (p) => p.revenueGrowth < 0.02,
    priority: 12,
  },
  {
    analyst: 'Jennifer Walsh',
    firm: 'JP Morgan',
    template: 'With FCF conversion at {fcfConversion}, why isn\'t more cash being returned to shareholders or reinvested in growth?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.fcfConversion > 0.35,
    priority: 8,
  },
  {
    analyst: 'David Kim',
    firm: 'Barclays',
    template: 'EBIT margin compression to {ebitMargin} is concerning. Where are the cost savings initiatives we were promised?',
    sentiment: 'negative',
    type: 'question',
    condition: (p) => p.ebitMargin < 0.045,
    priority: 11,
  },
  {
    analyst: 'Lisa Thompson',
    firm: 'Deutsche Bank',
    template: 'The stock is up {stockPriceChange}, but can management sustain this momentum without over-investing?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.stockPriceChange > 0.05,
    priority: 9,
  },
  {
    analyst: 'Robert Martinez',
    firm: 'UBS',
    template: 'Ranking #{rank} of {totalTeams} teams - what differentiates your strategy from the leaders?',
    sentiment: 'negative',
    type: 'question',
    condition: (p) => p.rank > p.totalTeams / 2,
    priority: 10,
  },
  {
    analyst: 'Katherine Lee',
    firm: 'RBC Capital',
    template: 'With ROIC at {roic}, are we seeing sufficient return on the growth investments made in prior years?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.roic < 0.08,
    priority: 9,
  },
  {
    analyst: 'Andrew Clark',
    firm: 'Bernstein',
    template: 'Revenue is growing at {revenueGrowth} but margins are under pressure. Is this growth profitable?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.revenueGrowth > 0.02 && p.ebitMargin < 0.05,
    priority: 11,
  },
];

// =============================================================================
// Share Price Observations - Explaining Price Movement
// =============================================================================

const PRICE_OBSERVATIONS: QuoteTemplate[] = [
  // Positive price movement explanations
  {
    analyst: 'Emily Zhang',
    firm: 'Bank of America',
    template: 'The {stockPriceChange} share price gain to ${stockPrice} reflects investor confidence in the {revenueGrowth} revenue growth trajectory.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.03 && p.revenueGrowth > 0.02,
    priority: 12,
  },
  {
    analyst: 'Richard Park',
    firm: 'Jefferies',
    template: 'Share price rose {stockPriceChange} to ${stockPrice} as ROIC of {roic} signals efficient capital deployment.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.02 && p.roic > 0.08,
    priority: 11,
  },
  {
    analyst: 'Steven Brown',
    firm: 'Wells Fargo',
    template: 'The stock\'s {stockPriceChange} appreciation to ${stockPrice} is driven by EBITDA margin expansion to {ebitMargin}.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.02 && p.ebitMargin > 0.085,
    priority: 10,
  },
  {
    analyst: 'Amanda Foster',
    firm: 'Credit Suisse',
    template: 'Strong FCF conversion of {fcfConversion} propelled shares up {stockPriceChange} to ${stockPrice}, signaling balance sheet strength.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.01 && p.fcfConversion > 0.30,
    priority: 9,
  },
  
  // Negative price movement explanations
  {
    analyst: 'James Wilson',
    firm: 'Citi',
    template: 'Share price fell {stockPriceChange} to ${stockPrice} as revenue growth of {revenueGrowth} disappointed expectations.',
    sentiment: 'negative',
    type: 'observation',
    condition: (p) => p.stockPriceChange < -0.02 && p.revenueGrowth < 0.01,
    priority: 12,
  },
  {
    analyst: 'Michelle Davis',
    firm: 'Nomura',
    template: 'The {stockPriceChange} decline to ${stockPrice} reflects concerns over margin compression - EBIT margin at {ebitMargin}.',
    sentiment: 'negative',
    type: 'observation',
    condition: (p) => p.stockPriceChange < -0.02 && p.ebitMargin < 0.045,
    priority: 11,
  },
  {
    analyst: 'Daniel Harris',
    firm: 'HSBC',
    template: 'Shares dropped {stockPriceChange} to ${stockPrice} as ROIC of {roic} fell below the cost of capital threshold.',
    sentiment: 'negative',
    type: 'observation',
    condition: (p) => p.stockPriceChange < 0 && p.roic < 0.07,
    priority: 10,
  },
  
  // Neutral/moderate movement explanations
  {
    analyst: 'Patricia Moore',
    firm: 'Mizuho',
    template: 'Shares edged up {stockPriceChange} to ${stockPrice} - investors await clearer signals on the growth vs. efficiency balance.',
    sentiment: 'neutral',
    type: 'observation',
    condition: (p) => p.stockPriceChange >= -0.02 && p.stockPriceChange <= 0.03,
    priority: 7,
  },
  {
    analyst: 'Christopher Lee',
    firm: 'Stifel',
    template: 'At ${stockPrice} ({stockPriceChange}), the stock reflects mixed signals: strong revenue growth of {revenueGrowth} offset by margin pressures.',
    sentiment: 'neutral',
    type: 'observation',
    condition: (p) => p.revenueGrowth > 0.02 && p.ebitMargin < 0.05,
    priority: 8,
  },
  {
    analyst: 'Rebecca Adams',
    firm: 'Cowen',
    template: 'Share price of ${stockPrice} ({stockPriceChange}) underperforms peers despite solid ROIC of {roic}. Market wants more growth.',
    sentiment: 'neutral',
    type: 'observation',
    condition: (p) => p.stockPriceChange < 0.02 && p.roic > 0.08 && p.revenueGrowth < 0.02,
    priority: 9,
  },
  
  // Ranking-based observations
  {
    analyst: 'Thomas Grant',
    firm: 'Piper Sandler',
    template: 'Top-tier performance: ${stockPrice} share price ({stockPriceChange}) places you #{rank} - execution is clearly differentiating.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.rank <= 3,
    priority: 13,
  },
  {
    analyst: 'Victoria Chen',
    firm: 'William Blair',
    template: 'At ${stockPrice} ({stockPriceChange}), you rank #{rank} of {totalTeams}. The gap to leaders reflects strategic positioning differences.',
    sentiment: 'neutral',
    type: 'observation',
    condition: (p) => p.rank > 3 && p.rank <= Math.ceil(p.totalTeams / 2),
    priority: 8,
  },
];

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
function fillTemplate(template: string, data: PerformanceData, round: RoundNumber): string {
  const marketGrowth = MARKET_GROWTH_RATES[round];
  const priceTarget = (data.stockPrice * 1.15).toFixed(2);
  
  return template
    .replace('{ebitMargin}', formatPercent(data.ebitMargin))
    .replace('{roic}', formatPercent(data.roic))
    .replace('{revenueGrowth}', formatPercent(data.revenueGrowth))
    .replace('{fcfConversion}', formatPercent(data.fcfConversion))
    .replace('{stockPriceChange}', formatPercent(data.stockPriceChange))
    .replace('{marketGrowth}', formatPercent(marketGrowth))
    .replace('{priceTarget}', priceTarget)
    .replace('{stockPrice}', data.stockPrice.toFixed(2))
    .replace('{rank}', data.rank.toString())
    .replace('{totalTeams}', data.totalTeams.toString());
}

/**
 * Selects the best matching templates from a list
 */
function selectBestTemplates(
  templates: QuoteTemplate[], 
  data: PerformanceData, 
  count: number
): QuoteTemplate[] {
  return templates
    .filter(t => t.condition(data))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, count);
}

/**
 * Generates analyst quotes based on team performance
 * Returns: 1 challenging question + 2 share price observations
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
    stockPrice,
    previousStockPrice,
  };
  
  const quotes: AnalystQuote[] = [];
  
  // Select 1 challenging question
  const bestQuestions = selectBestTemplates(CHALLENGING_QUESTIONS, performanceData, 1);
  for (const template of bestQuestions) {
    quotes.push({
      analyst: template.analyst,
      firm: template.firm,
      quote: fillTemplate(template.template, performanceData, round),
      sentiment: template.sentiment,
      type: 'question',
    });
  }
  
  // Add a default question if none matched
  if (quotes.filter(q => q.type === 'question').length === 0) {
    quotes.push({
      analyst: 'Sarah Chen',
      firm: 'Goldman Sachs',
      quote: `With ROIC at ${formatPercent(performanceData.roic)}, how is management prioritizing capital allocation between growth and returns?`,
      sentiment: 'neutral',
      type: 'question',
    });
  }
  
  // Select 2 share price observations
  const bestObservations = selectBestTemplates(PRICE_OBSERVATIONS, performanceData, 2);
  for (const template of bestObservations) {
    quotes.push({
      analyst: template.analyst,
      firm: template.firm,
      quote: fillTemplate(template.template, performanceData, round),
      sentiment: template.sentiment,
      type: 'observation',
    });
  }
  
  // Add default observations if we don't have enough
  while (quotes.filter(q => q.type === 'observation').length < 2) {
    const change = performanceData.stockPriceChange;
    const sentiment = change >= 0 ? 'positive' : 'negative';
    const verb = change >= 0 ? 'gained' : 'declined';
    
    quotes.push({
      analyst: quotes.length % 2 === 0 ? 'Emily Zhang' : 'James Wilson',
      firm: quotes.length % 2 === 0 ? 'Bank of America' : 'Citi',
      quote: `Share price ${verb} ${formatPercent(Math.abs(change))} to $${stockPrice.toFixed(2)}, reflecting the overall strategic execution this fiscal year.`,
      sentiment,
      type: 'observation',
    });
  }
  
  return quotes.slice(0, 3);
}
