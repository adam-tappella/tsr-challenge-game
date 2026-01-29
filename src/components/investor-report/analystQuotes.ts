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
    template: 'ROIC of {roic} sits in the middle of our peer group range. Given the current macro backdrop, can you walk us through how you\'re thinking about the trade-off between incremental capital deployment versus maintaining balance sheet optionality?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.roic >= 0.07 && p.roic <= 0.10,
    priority: 10,
  },
  {
    analyst: 'Michael Torres',
    firm: 'Morgan Stanley',
    template: 'Organic growth of {revenueGrowth} is running meaningfully below our market growth estimates. What gives you confidence the gap will narrow, and should we expect a more aggressive go-to-market stance in the coming quarters?',
    sentiment: 'negative',
    type: 'question',
    condition: (p) => p.revenueGrowth < 0.02,
    priority: 12,
  },
  {
    analyst: 'Jennifer Walsh',
    firm: 'JP Morgan',
    template: 'FCF conversion at {fcfConversion} is impressive, but it raises the question: what\'s the capital allocation framework here? Are you building dry powder for M&A, or should we expect an enhanced shareholder return program?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.fcfConversion > 0.35,
    priority: 8,
  },
  {
    analyst: 'David Kim',
    firm: 'Barclays',
    template: 'EBIT margin of {ebitMargin} came in below our estimate. Can you quantify the headwinds versus structural factors here, and what visibility do you have on the path back to normalized profitability?',
    sentiment: 'negative',
    type: 'question',
    condition: (p) => p.ebitMargin < 0.045,
    priority: 11,
  },
  {
    analyst: 'Lisa Thompson',
    firm: 'Deutsche Bank',
    template: 'Shares have outperformed the sector by {stockPriceChange}. At current multiples, what additional catalysts should we be modeling for, and how are you thinking about managing investor expectations?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.stockPriceChange > 0.05,
    priority: 9,
  },
  {
    analyst: 'Robert Martinez',
    firm: 'UBS',
    template: 'Your TSR ranking of #{rank} out of {totalTeams} suggests the market is discounting your execution versus peers. What operational levers are you pulling to close this valuation gap?',
    sentiment: 'negative',
    type: 'question',
    condition: (p) => p.rank > p.totalTeams / 2,
    priority: 10,
  },
  {
    analyst: 'Katherine Lee',
    firm: 'RBC Capital Markets',
    template: 'ROIC at {roic} remains below your stated cost of capital. At what point do prior growth investments start to inflect, and what\'s the right time horizon for investors to evaluate capital efficiency here?',
    sentiment: 'neutral',
    type: 'question',
    condition: (p) => p.roic < 0.08,
    priority: 9,
  },
  {
    analyst: 'Andrew Clark',
    firm: 'Bernstein',
    template: 'We\'re seeing {revenueGrowth} top-line growth but EBIT margin compression to {ebitMargin}. Is this deliberate investment for share, or are there mix headwinds we should be factoring into our out-year estimates?',
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
    template: 'We reiterate our Overweight rating following the {stockPriceChange} move to ${stockPrice}. The {revenueGrowth} revenue trajectory supports our above-consensus estimates and gives us increased confidence in our $' + '{priceTarget} price target.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.03 && p.revenueGrowth > 0.02,
    priority: 12,
  },
  {
    analyst: 'Richard Park',
    firm: 'Jefferies',
    template: 'Shares rallied {stockPriceChange} to ${stockPrice} as the {roic} ROIC print exceeded buy-side expectations. This validates the capital discipline thesis and supports multiple expansion from current levels.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.02 && p.roic > 0.08,
    priority: 11,
  },
  {
    analyst: 'Steven Brown',
    firm: 'Wells Fargo',
    template: 'The {stockPriceChange} appreciation to ${stockPrice} reflects investor re-rating on the margin story. EBIT margin at {ebitMargin} demonstrates operational leverage and validates our estimates.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.02 && p.ebitMargin > 0.085,
    priority: 10,
  },
  {
    analyst: 'Amanda Foster',
    firm: 'Credit Suisse',
    template: 'FCF conversion of {fcfConversion} drove shares {stockPriceChange} to ${stockPrice}. Strong cash generation provides optionality for capital returns and positions the balance sheet favorably versus peers.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.stockPriceChange > 0.01 && p.fcfConversion > 0.30,
    priority: 9,
  },
  
  // Negative price movement explanations
  {
    analyst: 'James Wilson',
    firm: 'Citi',
    template: 'Shares traded off {stockPriceChange} to ${stockPrice} as {revenueGrowth} organic growth missed consensus by approximately 150bps. We\'re trimming estimates and moving to the sidelines pending improved visibility.',
    sentiment: 'negative',
    type: 'observation',
    condition: (p) => p.stockPriceChange < -0.02 && p.revenueGrowth < 0.01,
    priority: 12,
  },
  {
    analyst: 'Michelle Davis',
    firm: 'Nomura',
    template: 'The {stockPriceChange} de-rating to ${stockPrice} reflects margin concerns that are likely to persist. EBIT margin at {ebitMargin} suggests structural headwinds we hadn\'t fully appreciated in our prior outlook.',
    sentiment: 'negative',
    type: 'observation',
    condition: (p) => p.stockPriceChange < -0.02 && p.ebitMargin < 0.045,
    priority: 11,
  },
  {
    analyst: 'Daniel Harris',
    firm: 'HSBC',
    template: 'Shares declined {stockPriceChange} to ${stockPrice} on the ROIC print. At {roic}, returns remain below cost of capital, which limits our ability to justify current multiples. We await evidence of inflection.',
    sentiment: 'negative',
    type: 'observation',
    condition: (p) => p.stockPriceChange < 0 && p.roic < 0.07,
    priority: 10,
  },
  
  // Neutral/moderate movement explanations
  {
    analyst: 'Patricia Moore',
    firm: 'Mizuho',
    template: 'Shares moved {stockPriceChange} to ${stockPrice}. We maintain our Neutral rating as we await clarity on the growth-versus-margin trajectory before becoming more constructive.',
    sentiment: 'neutral',
    type: 'observation',
    condition: (p) => p.stockPriceChange >= -0.02 && p.stockPriceChange <= 0.03,
    priority: 7,
  },
  {
    analyst: 'Christopher Lee',
    firm: 'Stifel',
    template: 'At ${stockPrice} ({stockPriceChange}), valuation reflects the push-pull between {revenueGrowth} revenue growth and margin compression to {ebitMargin}. We see this as a "show-me" story at current levels.',
    sentiment: 'neutral',
    type: 'observation',
    condition: (p) => p.revenueGrowth > 0.02 && p.ebitMargin < 0.05,
    priority: 8,
  },
  {
    analyst: 'Rebecca Adams',
    firm: 'TD Cowen',
    template: 'The {stockPriceChange} move to ${stockPrice} leaves shares trading at a discount to peers despite {roic} ROIC. The market is demanding faster top-line growth; we see this as an opportunity for patient investors.',
    sentiment: 'neutral',
    type: 'observation',
    condition: (p) => p.stockPriceChange < 0.02 && p.roic > 0.08 && p.revenueGrowth < 0.02,
    priority: 9,
  },
  
  // Ranking-based observations
  {
    analyst: 'Thomas Grant',
    firm: 'Piper Sandler',
    template: 'Top-quintile TSR with shares at ${stockPrice} ({stockPriceChange}) and a #{rank} ranking. Management execution is differentiating, and we see further upside to our estimates on continued momentum.',
    sentiment: 'positive',
    type: 'observation',
    condition: (p) => p.rank <= 3,
    priority: 13,
  },
  {
    analyst: 'Victoria Chen',
    firm: 'William Blair',
    template: 'Shares at ${stockPrice} ({stockPriceChange}) place the company #{rank} of {totalTeams} on TSR. The valuation discount to sector leaders reflects execution uncertainty that we believe is addressable.',
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
      quote: `ROIC at ${formatPercent(performanceData.roic)} remains a key focus for our institutional clients. Can you help us bridge the path from current returns to your medium-term capital efficiency targets?`,
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
    const direction = change >= 0 ? 'appreciated' : 'traded lower';
    const outlook = change >= 0 
      ? 'We maintain our constructive view on the name.' 
      : 'We await improved visibility before becoming more constructive.';
    
    quotes.push({
      analyst: quotes.length % 2 === 0 ? 'Emily Zhang' : 'James Wilson',
      firm: quotes.length % 2 === 0 ? 'Bank of America' : 'Citi',
      quote: `Shares ${direction} ${formatPercent(Math.abs(change))} to $${stockPrice.toFixed(2)}, broadly in line with our sector thesis. ${outlook}`,
      sentiment,
      type: 'observation',
    });
  }
  
  return quotes.slice(0, 3);
}
