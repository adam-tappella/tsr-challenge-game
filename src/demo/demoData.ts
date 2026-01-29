/**
 * Demo Mode Data
 * 
 * Mock data for frontend-only demo mode.
 * Allows testing the UI/UX without a backend server.
 */

import type { GameState, Decision, RoundResults, FinalResults, TeamRoundSnapshot, RoundNumber } from '@/types/game';

// =============================================================================
// Demo Decisions (Sample from each category)
// =============================================================================

export const DEMO_DECISIONS: Decision[] = [
  // GROW decisions
  {
    id: 'demo-grow-1',
    name: 'EV Battery Technology JV',
    description: 'Form a joint venture with a leading battery manufacturer to secure supply chain positioning and access next-gen battery technology.',
    category: 'Grow',
    cost: 400,
    round: 1,
    impacts: {
      revenue: { min: 800, max: 1200, expected: 1000 },
      ebit: { min: 80, max: 150, expected: 115 },
      fcf: { min: 60, max: 120, expected: 90 },
    },
  },
  {
    id: 'demo-grow-2',
    name: 'Autonomous Driving Software Acquisition',
    description: 'Acquire a promising autonomous driving software startup to accelerate ADAS capabilities.',
    category: 'Grow',
    cost: 550,
    round: 1,
    impacts: {
      revenue: { min: 600, max: 1000, expected: 800 },
      ebit: { min: 50, max: 100, expected: 75 },
      fcf: { min: 30, max: 80, expected: 55 },
    },
  },
  {
    id: 'demo-grow-3',
    name: 'Mexico Manufacturing Expansion',
    description: 'Build new manufacturing facility in Mexico to serve North American OEMs with lower logistics costs.',
    category: 'Grow',
    cost: 350,
    round: 1,
    impacts: {
      revenue: { min: 500, max: 800, expected: 650 },
      ebit: { min: 60, max: 100, expected: 80 },
      fcf: { min: 40, max: 70, expected: 55 },
    },
  },
  // OPTIMIZE decisions
  {
    id: 'demo-optimize-1',
    name: 'AI-Powered Quality Control',
    description: 'Deploy machine learning systems across manufacturing lines to reduce defect rates and warranty costs.',
    category: 'Optimize',
    cost: 150,
    round: 1,
    impacts: {
      revenue: { min: 0, max: 50, expected: 25 },
      ebit: { min: 80, max: 140, expected: 110 },
      fcf: { min: 70, max: 130, expected: 100 },
    },
  },
  {
    id: 'demo-optimize-2',
    name: 'Supply Chain Digitization',
    description: 'Implement end-to-end supply chain visibility platform to reduce inventory costs and improve supplier management.',
    category: 'Optimize',
    cost: 120,
    round: 1,
    impacts: {
      revenue: { min: 0, max: 30, expected: 15 },
      ebit: { min: 60, max: 100, expected: 80 },
      fcf: { min: 50, max: 90, expected: 70 },
    },
  },
  {
    id: 'demo-optimize-3',
    name: 'Lean Manufacturing Initiative',
    description: 'Deploy lean manufacturing principles across legacy plants to improve throughput and reduce waste.',
    category: 'Optimize',
    cost: 80,
    round: 1,
    impacts: {
      revenue: { min: 0, max: 20, expected: 10 },
      ebit: { min: 40, max: 80, expected: 60 },
      fcf: { min: 35, max: 75, expected: 55 },
    },
  },
  // SUSTAIN decisions
  {
    id: 'demo-sustain-1',
    name: 'Carbon Neutral Manufacturing',
    description: 'Invest in renewable energy and carbon offset programs to achieve carbon neutrality at key facilities.',
    category: 'Sustain',
    cost: 200,
    round: 1,
    impacts: {
      revenue: { min: 100, max: 200, expected: 150 },
      ebit: { min: 20, max: 50, expected: 35 },
      fcf: { min: 15, max: 40, expected: 28 },
    },
  },
  {
    id: 'demo-sustain-2',
    name: 'Workforce Upskilling Program',
    description: 'Comprehensive training program to prepare workforce for EV and software-defined vehicle manufacturing.',
    category: 'Sustain',
    cost: 100,
    round: 1,
    impacts: {
      revenue: { min: 50, max: 150, expected: 100 },
      ebit: { min: 30, max: 70, expected: 50 },
      fcf: { min: 25, max: 60, expected: 43 },
    },
  },
  {
    id: 'demo-sustain-3',
    name: 'Supplier Diversity Initiative',
    description: 'Develop relationships with diverse suppliers to improve supply chain resilience and meet OEM requirements.',
    category: 'Sustain',
    cost: 60,
    round: 1,
    impacts: {
      revenue: { min: 30, max: 80, expected: 55 },
      ebit: { min: 10, max: 30, expected: 20 },
      fcf: { min: 8, max: 25, expected: 17 },
    },
  },
];

// =============================================================================
// Demo Game State
// =============================================================================

export function createDemoGameState(
  round: RoundNumber = 1, 
  status: 'lobby' | 'active' | 'results' | 'finished' = 'lobby',
  userTeamName?: string
): GameState {
  return {
    status,
    currentRound: round,
    roundTimeRemaining: 180,
    roundDuration: 180,
    teamCount: 5,
    teams: {
      1: {
        teamId: 1,
        teamName: userTeamName || 'Your Team',
        isClaimed: true,
        socketId: 'demo-socket-1',
        cashBalance: 1000,
        currentRoundDecisions: [],
        allDecisions: [],
        metrics: {
          revenue: 42836,
          ebitda: 3200,
          ebit: 2116,
          ebitMargin: 0.0494,
          operatingFCF: 1561,
          capex: -1200,
          roic: 0.085,
        },
        stockPrice: 52.50,
        cumulativeTSR: 0.065,
        roundTSR: 0.032,
        hasSubmitted: false,
        draftDecisionIds: [],
      },
      2: {
        teamId: 2,
        teamName: 'Beta Capital',
        isClaimed: true,
        socketId: 'demo-socket-2',
        cashBalance: 850,
        currentRoundDecisions: [],
        allDecisions: [],
        metrics: {
          revenue: 43500,
          ebitda: 3100,
          ebit: 2050,
          ebitMargin: 0.0471,
          operatingFCF: 1480,
          capex: -1150,
          roic: 0.082,
        },
        stockPrice: 51.20,
        cumulativeTSR: 0.039,
        roundTSR: 0.018,
        hasSubmitted: false,
        draftDecisionIds: [],
      },
      3: {
        teamId: 3,
        teamName: 'Gamma Growth',
        isClaimed: true,
        socketId: 'demo-socket-3',
        cashBalance: 920,
        currentRoundDecisions: [],
        allDecisions: [],
        metrics: {
          revenue: 44200,
          ebitda: 3350,
          ebit: 2200,
          ebitMargin: 0.0498,
          operatingFCF: 1620,
          capex: -1280,
          roic: 0.088,
        },
        stockPrice: 54.80,
        cumulativeTSR: 0.112,
        roundTSR: 0.055,
        hasSubmitted: false,
        draftDecisionIds: [],
      },
      4: {
        teamId: 4,
        teamName: 'Delta Partners',
        isClaimed: false,
        cashBalance: 1000,
        currentRoundDecisions: [],
        allDecisions: [],
        metrics: {
          revenue: 42836,
          ebitda: 3200,
          ebit: 2116,
          ebitMargin: 0.0494,
          operatingFCF: 1561,
          capex: -1200,
          roic: 0.085,
        },
        stockPrice: 49.29,
        cumulativeTSR: 0,
        roundTSR: 0,
        hasSubmitted: false,
        draftDecisionIds: [],
      },
      5: {
        teamId: 5,
        teamName: 'Epsilon Equity',
        isClaimed: false,
        cashBalance: 1000,
        currentRoundDecisions: [],
        allDecisions: [],
        metrics: {
          revenue: 42836,
          ebitda: 3200,
          ebit: 2116,
          ebitMargin: 0.0494,
          operatingFCF: 1561,
          capex: -1200,
          roic: 0.085,
        },
        stockPrice: 49.29,
        cumulativeTSR: 0,
        roundTSR: 0,
        hasSubmitted: false,
        draftDecisionIds: [],
      },
    },
    scenario: {
      round: round,
      name: 'Business as Usual',
      description: 'Standard market conditions with moderate growth expectations.',
      marketGrowth: 0.02,
      revenueMultiplier: 1.0,
      costMultiplier: 1.0,
    },
    riskyEvents: {
      hasActiveRiskyEvent: false,
    },
    startedAt: new Date().toISOString(),
    roundStartedAt: new Date().toISOString(),
  };
}

// =============================================================================
// Demo Round Results
// =============================================================================

export function createDemoRoundResults(round: RoundNumber): RoundResults {
  return {
    round,
    teamResults: [
      {
        teamId: 3,
        rank: 1,
        stockPrice: 54.80,
        stockPriceChange: 2.50,
        roundTSR: 0.055,
        cumulativeTSR: 0.112,
        decisionsCount: 3,
      },
      {
        teamId: 1,
        rank: 2,
        stockPrice: 52.50,
        stockPriceChange: 1.80,
        roundTSR: 0.032,
        cumulativeTSR: 0.065,
        decisionsCount: 2,
      },
      {
        teamId: 2,
        rank: 3,
        stockPrice: 51.20,
        stockPriceChange: 0.90,
        roundTSR: 0.018,
        cumulativeTSR: 0.039,
        decisionsCount: 4,
      },
    ],
    scenarioNarrative: 'The automotive sector saw steady growth this quarter as EV adoption continued to accelerate.',
    marketOutlook: {
      backwardStatements: [
        'EV adoption exceeded expectations, driving component demand higher.',
        'Supply chain pressures eased as semiconductor availability improved.',
      ],
      forwardStatements: [
        'Cost pressures expected to intensify as raw material prices rise.',
        'OEM consolidation may create new partnership opportunities.',
      ],
    },
  };
}

// =============================================================================
// Demo Final Results
// =============================================================================

export function createDemoFinalResults(): FinalResults {
  const teamHistories: Record<number, TeamRoundSnapshot[]> = {
    1: [
      { round: 1 as RoundNumber, stockPrice: 50.50, tsr: 0.025, cashBalance: 850, decisionsSubmitted: ['demo-grow-1', 'demo-optimize-1'], metrics: { stockPrice: 50.50, roic: 0.086, revenueGrowth: 0.02, ebitdaMargin: 0.075, ebitMargin: 0.050, cogsToRevenue: 0.82, sgaToRevenue: 0.08 } },
      { round: 2 as RoundNumber, stockPrice: 51.80, tsr: 0.026, cashBalance: 720, decisionsSubmitted: ['demo-grow-2'], metrics: { stockPrice: 51.80, roic: 0.088, revenueGrowth: 0.025, ebitdaMargin: 0.076, ebitMargin: 0.051, cogsToRevenue: 0.81, sgaToRevenue: 0.08 } },
      { round: 3 as RoundNumber, stockPrice: 50.20, tsr: -0.031, cashBalance: 680, decisionsSubmitted: [], metrics: { stockPrice: 50.20, roic: 0.082, revenueGrowth: -0.01, ebitdaMargin: 0.072, ebitMargin: 0.047, cogsToRevenue: 0.83, sgaToRevenue: 0.085 } },
      { round: 4 as RoundNumber, stockPrice: 48.50, tsr: -0.034, cashBalance: 620, decisionsSubmitted: ['demo-optimize-2'], metrics: { stockPrice: 48.50, roic: 0.078, revenueGrowth: -0.05, ebitdaMargin: 0.068, ebitMargin: 0.042, cogsToRevenue: 0.84, sgaToRevenue: 0.09 } },
      { round: 5 as RoundNumber, stockPrice: 52.50, tsr: 0.082, cashBalance: 580, decisionsSubmitted: ['demo-grow-3', 'demo-sustain-1'], metrics: { stockPrice: 52.50, roic: 0.085, revenueGrowth: 0.06, ebitdaMargin: 0.075, ebitMargin: 0.049, cogsToRevenue: 0.82, sgaToRevenue: 0.08 } },
    ],
    2: [
      { round: 1 as RoundNumber, stockPrice: 50.00, tsr: 0.014, cashBalance: 900, decisionsSubmitted: ['demo-optimize-1'], metrics: { stockPrice: 50.00, roic: 0.084, revenueGrowth: 0.015, ebitdaMargin: 0.074, ebitMargin: 0.049, cogsToRevenue: 0.82, sgaToRevenue: 0.08 } },
      { round: 2 as RoundNumber, stockPrice: 50.50, tsr: 0.010, cashBalance: 850, decisionsSubmitted: ['demo-sustain-2'], metrics: { stockPrice: 50.50, roic: 0.085, revenueGrowth: 0.018, ebitdaMargin: 0.074, ebitMargin: 0.049, cogsToRevenue: 0.82, sgaToRevenue: 0.08 } },
      { round: 3 as RoundNumber, stockPrice: 49.80, tsr: -0.014, cashBalance: 800, decisionsSubmitted: [], metrics: { stockPrice: 49.80, roic: 0.082, revenueGrowth: -0.008, ebitdaMargin: 0.072, ebitMargin: 0.047, cogsToRevenue: 0.83, sgaToRevenue: 0.085 } },
      { round: 4 as RoundNumber, stockPrice: 47.20, tsr: -0.052, cashBalance: 750, decisionsSubmitted: ['demo-grow-1'], metrics: { stockPrice: 47.20, roic: 0.076, revenueGrowth: -0.06, ebitdaMargin: 0.066, ebitMargin: 0.040, cogsToRevenue: 0.85, sgaToRevenue: 0.09 } },
      { round: 5 as RoundNumber, stockPrice: 51.20, tsr: 0.085, cashBalance: 700, decisionsSubmitted: ['demo-grow-2'], metrics: { stockPrice: 51.20, roic: 0.082, revenueGrowth: 0.05, ebitdaMargin: 0.073, ebitMargin: 0.047, cogsToRevenue: 0.82, sgaToRevenue: 0.085 } },
    ],
    3: [
      { round: 1 as RoundNumber, stockPrice: 51.50, tsr: 0.045, cashBalance: 800, decisionsSubmitted: ['demo-grow-1', 'demo-grow-2'], metrics: { stockPrice: 51.50, roic: 0.090, revenueGrowth: 0.035, ebitdaMargin: 0.078, ebitMargin: 0.052, cogsToRevenue: 0.80, sgaToRevenue: 0.078 } },
      { round: 2 as RoundNumber, stockPrice: 53.20, tsr: 0.033, cashBalance: 680, decisionsSubmitted: ['demo-optimize-1'], metrics: { stockPrice: 53.20, roic: 0.092, revenueGrowth: 0.04, ebitdaMargin: 0.080, ebitMargin: 0.054, cogsToRevenue: 0.79, sgaToRevenue: 0.076 } },
      { round: 3 as RoundNumber, stockPrice: 52.00, tsr: -0.023, cashBalance: 650, decisionsSubmitted: [], metrics: { stockPrice: 52.00, roic: 0.088, revenueGrowth: 0.00, ebitdaMargin: 0.076, ebitMargin: 0.050, cogsToRevenue: 0.81, sgaToRevenue: 0.08 } },
      { round: 4 as RoundNumber, stockPrice: 50.50, tsr: -0.029, cashBalance: 600, decisionsSubmitted: ['demo-grow-3'], metrics: { stockPrice: 50.50, roic: 0.084, revenueGrowth: -0.03, ebitdaMargin: 0.072, ebitMargin: 0.046, cogsToRevenue: 0.82, sgaToRevenue: 0.085 } },
      { round: 5 as RoundNumber, stockPrice: 54.80, tsr: 0.085, cashBalance: 550, decisionsSubmitted: ['demo-grow-1', 'demo-sustain-1'], metrics: { stockPrice: 54.80, roic: 0.088, revenueGrowth: 0.07, ebitdaMargin: 0.078, ebitMargin: 0.050, cogsToRevenue: 0.80, sgaToRevenue: 0.078 } },
    ],
  };

  return {
    winnerId: 3,
    leaderboard: [
      {
        teamId: 3,
        rank: 1,
        finalStockPrice: 54.80,
        startingStockPrice: 49.29,
        totalTSR: 0.112,
        totalDividends: 2.50,
      },
      {
        teamId: 1,
        rank: 2,
        finalStockPrice: 52.50,
        startingStockPrice: 49.29,
        totalTSR: 0.065,
        totalDividends: 2.20,
      },
      {
        teamId: 2,
        rank: 3,
        finalStockPrice: 51.20,
        startingStockPrice: 49.29,
        totalTSR: 0.039,
        totalDividends: 2.00,
      },
    ],
    teamHistories,
  };
}
