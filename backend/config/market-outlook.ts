/**
 * Magna TSR Challenge - Market Outlook Generator
 * Generates dynamic backward-looking and forward-looking statements
 * based on team performance and upcoming scenario conditions
 */

import type { 
  RoundNumber, 
  ScenarioType, 
  FinancialMetrics,
  MarketOutlook,
} from '../types/game.js';

import { BASELINE_FINANCIALS } from './baseline-financials.js';
import { SCENARIO_BY_ROUND } from './scenarios.js';

// =============================================================================
// Types
// =============================================================================

interface PerformanceContext {
  round: RoundNumber;
  currentMetrics: FinancialMetrics;
  previousMetrics: FinancialMetrics | null;
  stockPrice: number;
  previousStockPrice: number;
  scenarioType: ScenarioType;
}

// =============================================================================
// Backward-Looking Statement Templates
// =============================================================================

interface BackwardTemplate {
  condition: (ctx: PerformanceContext) => boolean;
  template: (ctx: PerformanceContext) => string;
  priority: number;
}

const BACKWARD_TEMPLATES: BackwardTemplate[] = [
  // Revenue growth statements
  {
    condition: (ctx) => {
      const growth = getRevenueGrowth(ctx);
      return growth > 0.03;
    },
    template: (ctx) => {
      const growth = getRevenueGrowth(ctx);
      return `Revenue grew ${formatPercent(growth)} this fiscal year, outpacing market expectations and demonstrating strong competitive positioning.`;
    },
    priority: 10,
  },
  {
    condition: (ctx) => {
      const growth = getRevenueGrowth(ctx);
      return growth >= 0 && growth <= 0.03;
    },
    template: (ctx) => {
      const growth = getRevenueGrowth(ctx);
      return `Revenue increased modestly by ${formatPercent(growth)}, in line with broader industry trends.`;
    },
    priority: 5,
  },
  {
    condition: (ctx) => {
      const growth = getRevenueGrowth(ctx);
      return growth < 0;
    },
    template: (ctx) => {
      const growth = getRevenueGrowth(ctx);
      return `Revenue declined ${formatPercent(Math.abs(growth))} this year, reflecting challenging market conditions.`;
    },
    priority: 8,
  },
  
  // ROIC statements
  {
    condition: (ctx) => ctx.currentMetrics.roic > 0.10,
    template: (ctx) => `ROIC of ${formatPercent(ctx.currentMetrics.roic)} demonstrates exceptional capital deployment efficiency, well above the cost of capital.`,
    priority: 9,
  },
  {
    condition: (ctx) => ctx.currentMetrics.roic >= 0.07 && ctx.currentMetrics.roic <= 0.10,
    template: (ctx) => `ROIC of ${formatPercent(ctx.currentMetrics.roic)} indicates solid returns on invested capital, maintaining shareholder value creation.`,
    priority: 6,
  },
  {
    condition: (ctx) => ctx.currentMetrics.roic < 0.07,
    template: (ctx) => `ROIC of ${formatPercent(ctx.currentMetrics.roic)} suggests room for improvement in capital allocation efficiency.`,
    priority: 7,
  },
  
  // Margin statements
  {
    condition: (ctx) => {
      const ebitMargin = ctx.currentMetrics.ebit / ctx.currentMetrics.revenue;
      return ebitMargin > 0.09;
    },
    template: (ctx) => {
      const margin = ctx.currentMetrics.ebit / ctx.currentMetrics.revenue;
      return `EBIT margin of ${formatPercent(margin)} reflects strong operational performance and cost discipline.`;
    },
    priority: 7,
  },
  {
    condition: (ctx) => {
      const ebitMargin = ctx.currentMetrics.ebit / ctx.currentMetrics.revenue;
      return ebitMargin < 0.08;
    },
    template: (ctx) => {
      const margin = ctx.currentMetrics.ebit / ctx.currentMetrics.revenue;
      return `EBIT margin contracted to ${formatPercent(margin)}, highlighting the need for continued cost optimization.`;
    },
    priority: 6,
  },
  
  // Stock price statements
  {
    condition: (ctx) => {
      const change = (ctx.stockPrice - ctx.previousStockPrice) / ctx.previousStockPrice;
      return change > 0.05;
    },
    template: (ctx) => {
      const change = (ctx.stockPrice - ctx.previousStockPrice) / ctx.previousStockPrice;
      return `Share price appreciated ${formatPercent(change)} to $${ctx.stockPrice.toFixed(2)}, rewarding shareholders for strategic execution.`;
    },
    priority: 8,
  },
  {
    condition: (ctx) => {
      const change = (ctx.stockPrice - ctx.previousStockPrice) / ctx.previousStockPrice;
      return change < -0.03;
    },
    template: (ctx) => {
      const change = (ctx.stockPrice - ctx.previousStockPrice) / ctx.previousStockPrice;
      return `Share price declined ${formatPercent(Math.abs(change))} to $${ctx.stockPrice.toFixed(2)}, reflecting investor concerns about near-term outlook.`;
    },
    priority: 7,
  },
  
  // Cost efficiency statements
  {
    condition: (ctx) => {
      if (!ctx.previousMetrics) return false;
      const currentSgaRatio = Math.abs(ctx.currentMetrics.sga) / ctx.currentMetrics.revenue;
      const prevSgaRatio = Math.abs(ctx.previousMetrics.sga) / ctx.previousMetrics.revenue;
      return currentSgaRatio < prevSgaRatio - 0.002;
    },
    template: (ctx) => {
      const sgaRatio = Math.abs(ctx.currentMetrics.sga) / ctx.currentMetrics.revenue;
      return `SG&A efficiency improved to ${formatPercent(sgaRatio)} of revenue, reflecting successful cost optimization initiatives.`;
    },
    priority: 6,
  },
];

// =============================================================================
// Forward-Looking Statement Templates
// =============================================================================

interface ForwardTemplate {
  applicableRounds: RoundNumber[];
  nextScenario: ScenarioType;
  statements: string[];
}

const FORWARD_TEMPLATES: ForwardTemplate[] = [
  // After Round 1 -> Round 2 (Business as usual continues)
  {
    applicableRounds: [1],
    nextScenario: 'business_as_usual',
    statements: [
      'Market conditions remain favorable for continued strategic investment.',
      'Analysts expect steady industry growth to persist through the coming fiscal year.',
      'OEM investment in new vehicle platforms creates opportunities for suppliers with strong R&D capabilities.',
      'Competition for tier-1 contracts is expected to intensify.',
    ],
  },
  
  // After Round 2 -> Round 3 (Cost pressure emerging)
  {
    applicableRounds: [2],
    nextScenario: 'cost_pressure',
    statements: [
      'Early indicators suggest cost pressures may intensify in the coming fiscal year.',
      'Raw material prices are showing upward trends that could impact margins.',
      'OEMs are signaling increased focus on supplier cost competitiveness.',
      'Analysts recommend prioritizing operational efficiency over aggressive expansion.',
      'Labor cost inflation is expected to accelerate across key manufacturing regions.',
    ],
  },
  
  // After Round 3 -> Round 4 (Recession warning)
  {
    applicableRounds: [3],
    nextScenario: 'recession',
    statements: [
      'Economic indicators suggest a potential downturn may be approaching.',
      'Analysts warn that overleveraged companies could face significant challenges ahead.',
      'Cash preservation and balance sheet strength are becoming critical success factors.',
      'Market volatility is expected to increase - defensive positioning may be prudent.',
      'Consumer confidence indicators are showing signs of weakness.',
    ],
  },
  
  // After Round 4 -> Round 5 (Recovery signals)
  {
    applicableRounds: [4],
    nextScenario: 'recovery',
    statements: [
      'Early signs of economic recovery are emerging in key markets.',
      'Companies with available capital may find attractive growth opportunities ahead.',
      'Auto sales are projected to rebound as consumer confidence returns.',
      'This is the final year to position for long-term value creation through 2035.',
      'Strategic investments made now could yield significant returns during the recovery.',
    ],
  },
  
  // After Round 5 (Game ending - simulation ahead)
  {
    applicableRounds: [5],
    nextScenario: 'recovery',
    statements: [
      'The strategic decisions made over the past five years will now determine long-term shareholder value.',
      'Your capital allocation choices will be simulated forward through 2035.',
      'Companies that balanced growth, efficiency, and risk management are positioned for success.',
      'The market will ultimately reward disciplined capital deployment aligned with strategic principles.',
    ],
  },
];

// =============================================================================
// Generator Functions
// =============================================================================

/**
 * Generates a dynamic market outlook with backward and forward looking statements
 */
export function generateMarketOutlook(
  round: RoundNumber,
  currentMetrics: FinancialMetrics,
  previousMetrics: FinancialMetrics | null,
  stockPrice: number,
  previousStockPrice: number,
  scenarioType: ScenarioType
): MarketOutlook {
  const ctx: PerformanceContext = {
    round,
    currentMetrics,
    previousMetrics,
    stockPrice,
    previousStockPrice,
    scenarioType,
  };
  
  // Generate backward-looking statements (pick 2 best matching)
  const backwardStatements = selectBackwardStatements(ctx, 2);
  
  // Generate forward-looking statements (pick 2 for upcoming scenario)
  const forwardStatements = selectForwardStatements(round, 2);
  
  return {
    backwardStatements,
    forwardStatements,
  };
}

/**
 * Select the best matching backward-looking statements
 */
function selectBackwardStatements(ctx: PerformanceContext, count: number): string[] {
  const matchingTemplates = BACKWARD_TEMPLATES
    .filter(t => t.condition(ctx))
    .sort((a, b) => b.priority - a.priority);
  
  // Take top N, ensuring we don't repeat similar topics
  const selected: string[] = [];
  const usedTopics = new Set<string>();
  
  for (const template of matchingTemplates) {
    if (selected.length >= count) break;
    
    const statement = template.template(ctx);
    
    // Simple topic detection to avoid repetition
    const topic = detectTopic(statement);
    if (!usedTopics.has(topic)) {
      selected.push(statement);
      usedTopics.add(topic);
    }
  }
  
  // If we don't have enough, add generic statements
  while (selected.length < count) {
    selected.push(getGenericBackwardStatement(ctx));
  }
  
  return selected;
}

/**
 * Select forward-looking statements for the upcoming scenario
 */
function selectForwardStatements(currentRound: RoundNumber, count: number): string[] {
  const template = FORWARD_TEMPLATES.find(t => t.applicableRounds.includes(currentRound));
  
  if (!template) {
    return [
      'Market conditions continue to evolve.',
      'Strategic capital allocation remains critical for long-term success.',
    ];
  }
  
  // Randomly select statements from the pool
  const shuffled = [...template.statements].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// =============================================================================
// Helper Functions
// =============================================================================

function getRevenueGrowth(ctx: PerformanceContext): number {
  const prevRevenue = ctx.previousMetrics?.revenue || BASELINE_FINANCIALS.revenue;
  return (ctx.currentMetrics.revenue - prevRevenue) / prevRevenue;
}

function formatPercent(value: number): string {
  const formatted = (Math.abs(value) * 100).toFixed(1);
  return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
}

function detectTopic(statement: string): string {
  const lower = statement.toLowerCase();
  if (lower.includes('revenue')) return 'revenue';
  if (lower.includes('roic')) return 'roic';
  if (lower.includes('ebit') || lower.includes('margin')) return 'margin';
  if (lower.includes('share price') || lower.includes('stock')) return 'stock';
  if (lower.includes('sg&a') || lower.includes('cost')) return 'cost';
  return 'general';
}

function getGenericBackwardStatement(ctx: PerformanceContext): string {
  const statements = [
    `The company navigated fiscal year ${2025 + ctx.round} with measured strategic execution.`,
    `Management continued to focus on balancing growth, efficiency, and risk management.`,
    `Capital allocation decisions reflected the evolving market environment.`,
  ];
  return statements[Math.floor(Math.random() * statements.length)];
}
