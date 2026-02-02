/**
 * Magna TSR Challenge - Financial Calculation Engine
 * 
 * Processes team decisions and calculates:
 * - Financial metric impacts (revenue, COGS, SG&A, EBITDA, EBIT, FCF)
 * - NPV / Enterprise Value using DCF
 * - Stock price
 * - TSR (Total Shareholder Return)
 * - Team rankings
 * 
 * Key Constants:
 * - WACC: 7.5%
 * - Terminal Growth Rate: 2%
 * - Tax Rate: 22%
 */

import type {
  Decision,
  TeamState,
  TeamDecision,
  FinancialMetrics,
  ScenarioModifiers,
  RoundNumber,
  RiskyEventState,
  TeamRoundResult,
  RoundResults,
  FinalTeamResult,
  FinalResults,
  TeamRoundSnapshot,
  MarketOutlook,
} from './types/game.js';

import {
  BASELINE_FINANCIALS,
  WACC,
  TERMINAL_GROWTH_RATE,
  TAX_RATE,
  STARTING_INVESTMENT_CASH,
  INVESTED_CAPITAL,
  NET_DEBT,
  MINORITY_INTEREST,
  createInitialMetrics,
} from './config/baseline-financials.js';

import { getDecisionById } from './config/decisions.js';

// =============================================================================
// Constants
// =============================================================================

/** Years for DCF projection */
const DCF_PROJECTION_YEARS = 10;

/** Ramp-up percentages by year */
const RAMP_UP_SCHEDULE: Record<number, number> = {
  1: 0.3,  // 30% of full impact
  2: 0.7,  // 70% of full impact
  3: 1.0,  // 100% of full impact
};

/** Investor expectations noise factor (±5%) */
const INVESTOR_NOISE_FACTOR = 0.05;

/** Dividend payout ratio (simplified model) */
const DIVIDEND_PAYOUT_RATIO = 0.25;

/** Stock price bounds - max is 2x starting price, min is 0.5x */
const MAX_STOCK_PRICE_MULTIPLIER = 2.0;
const MIN_STOCK_PRICE_MULTIPLIER = 0.5;

// =============================================================================
// Types
// =============================================================================

interface DecisionImpact {
  revenueChange: number;      // Dollar change in revenue
  cogsChange: number;         // Dollar change in COGS (typically negative for improvements)
  sgaChange: number;          // Dollar change in SG&A (typically negative for improvements)
  capexChange: number;        // Additional capex from investment
  oneTimeBenefit: number;     // One-time cash benefit (divestitures)
  rampUpFactor: number;       // Current ramp-up factor (0.3, 0.7, or 1.0)
  isRiskyTriggered: boolean;  // Whether this risky decision had negative outcome
}

interface CalculatedMetrics extends FinancialMetrics {
  investorNoiseFactor: number;  // Random noise applied to valuation
}

interface ActiveInvestment {
  decisionId: string;
  decision: Decision;
  roundMade: RoundNumber;
  yearsActive: number;        // How many years this investment has been active
  remainingCostYears: number; // Years of cost remaining (for multi-year)
}

// =============================================================================
// Decision Impact Calculator
// =============================================================================

/**
 * Calculates the impact of a single decision based on:
 * - The decision's base impact values
 * - Scenario modifiers for the current round
 * - Ramp-up period (years since decision was made)
 * - Whether the risky outcome triggered
 */
export function calculateDecisionImpact(
  decision: Decision,
  yearsActive: number,
  modifiers: ScenarioModifiers,
  riskyTriggered: boolean = false
): DecisionImpact {
  // Get the appropriate scenario multiplier based on category
  const categoryMultiplier = getCategoryMultiplier(decision.category, modifiers);
  
  // Calculate ramp-up factor based on years active and decision's ramp-up period
  const rampUpFactor = calculateRampUpFactor(yearsActive, decision.rampUpYears);
  
  // Base revenue from baseline
  const baseRevenue = BASELINE_FINANCIALS.revenue;
  const baseCogs = Math.abs(BASELINE_FINANCIALS.cogs);
  const baseSga = Math.abs(BASELINE_FINANCIALS.sga);
  
  // Calculate revenue change
  let revenueChange = 0;
  if (decision.revenueImpact) {
    revenueChange = baseRevenue * decision.revenueImpact * categoryMultiplier * rampUpFactor;
    
    // If risky and triggered, reverse the impact
    if (decision.isRisky && riskyTriggered) {
      revenueChange = -revenueChange * 0.5;  // 50% negative impact
    }
  }
  
  // Calculate COGS change (negative values mean improvement/savings)
  let cogsChange = 0;
  if (decision.cogsImpact) {
    // cogsImpact is typically negative for improvements (e.g., -0.01 = 1% reduction)
    cogsChange = baseCogs * decision.cogsImpact * categoryMultiplier * rampUpFactor;
    
    if (decision.isRisky && riskyTriggered) {
      cogsChange = -cogsChange;  // Reverse the benefit
    }
  }
  
  // Calculate SG&A change
  let sgaChange = 0;
  if (decision.sgaImpact) {
    sgaChange = baseSga * decision.sgaImpact * categoryMultiplier * rampUpFactor;
    
    if (decision.isRisky && riskyTriggered) {
      sgaChange = -sgaChange;
    }
  }
  
  // Calculate capex (only in years where cost is still being paid)
  let capexChange = 0;
  if (yearsActive <= decision.durationYears) {
    // Spread cost over duration years
    capexChange = decision.cost / decision.durationYears;
  }
  
  // One-time benefit (for divestitures)
  let oneTimeBenefit = 0;
  if (decision.isOneTimeBenefit && yearsActive === 1) {
    oneTimeBenefit = decision.recurringBenefit || 0;
    oneTimeBenefit *= categoryMultiplier;
    
    if (decision.isRisky && riskyTriggered) {
      oneTimeBenefit *= 0.5;  // Reduced benefit if risky outcome
    }
  }
  
  return {
    revenueChange,
    cogsChange,
    sgaChange,
    capexChange,
    oneTimeBenefit,
    rampUpFactor,
    isRiskyTriggered: decision.isRisky && riskyTriggered,
  };
}

/**
 * Gets the category multiplier from scenario modifiers
 */
function getCategoryMultiplier(
  category: 'grow' | 'optimize' | 'sustain',
  modifiers: ScenarioModifiers
): number {
  switch (category) {
    case 'grow':
      return modifiers.growMultiplier;
    case 'optimize':
      return modifiers.optimizeMultiplier;
    case 'sustain':
      return modifiers.sustainMultiplier;
    default:
      return 1.0;
  }
}

/**
 * Calculates the ramp-up factor based on years active and total ramp-up period
 */
function calculateRampUpFactor(yearsActive: number, rampUpYears: 1 | 2 | 3): number {
  if (yearsActive <= 0) return 0;
  if (yearsActive >= rampUpYears) return 1.0;
  
  // Progressive ramp-up
  if (rampUpYears === 1) return 1.0;
  if (rampUpYears === 2) return yearsActive === 1 ? 0.5 : 1.0;
  
  // 3-year ramp-up uses the standard schedule
  return RAMP_UP_SCHEDULE[yearsActive] || 1.0;
}

// =============================================================================
// Financial Metrics Calculator
// =============================================================================

/**
 * Calculates updated financial metrics for a team based on all their active investments
 */
export function calculateTeamMetrics(
  previousMetrics: FinancialMetrics,
  activeInvestments: ActiveInvestment[],
  modifiers: ScenarioModifiers,
  riskyEvents: RiskyEventState,
  riskyDecisionIndex: number
): CalculatedMetrics {
  // Start with previous metrics as base
  let revenue = previousMetrics.revenue;
  let cogs = previousMetrics.cogs;        // Already negative
  let sga = previousMetrics.sga;          // Already negative
  let capex = BASELINE_FINANCIALS.capex;  // Reset to baseline each year
  let oneTimeBenefits = 0;
  
  // Track which risky decision we're on
  let riskyIndex = 0;
  
  // Apply all active investment impacts
  for (const investment of activeInvestments) {
    // Determine if this risky decision triggers
    let riskyTriggered = false;
    if (investment.decision.isRisky) {
      riskyTriggered = riskyIndex === riskyEvents.activeEventIndex;
      riskyIndex++;
    }
    
    const impact = calculateDecisionImpact(
      investment.decision,
      investment.yearsActive,
      modifiers,
      riskyTriggered
    );
    
    // Apply impacts
    revenue += impact.revenueChange;
    cogs += impact.cogsChange;      // cogsChange is already in correct sign convention
    sga += impact.sgaChange;        // sgaChange is already in correct sign convention
    capex -= impact.capexChange;    // Additional capex (makes capex more negative)
    oneTimeBenefits += impact.oneTimeBenefit;
  }
  
  // Calculate derived metrics
  const ebitda = revenue + cogs + sga;  // COGS and SG&A are negative
  
  // Keep depreciation and amortization proportional to capex changes
  const capexRatio = Math.abs(capex / BASELINE_FINANCIALS.capex);
  const depreciation = BASELINE_FINANCIALS.depreciation * capexRatio;
  const amortization = BASELINE_FINANCIALS.amortization * capexRatio;
  
  const ebit = ebitda + depreciation + amortization;  // D&A are negative
  
  // Calculate cash taxes based on EBIT
  const taxableIncome = Math.max(0, ebit);
  const cashTaxes = -taxableIncome * TAX_RATE;
  
  // Operating FCF = EBITDA - Cash Taxes - CapEx
  // Note: D&A added back in EBITDA already, so use EBITDA - Taxes - CapEx
  const operatingFCF = ebitda + cashTaxes + capex + oneTimeBenefits;
  
  // Update cash balance
  const beginningCash = previousMetrics.endingCash;
  const endingCash = beginningCash + operatingFCF;
  
  // Calculate NPV using simplified DCF
  const npv = calculateNPV(ebit, operatingFCF);
  
  // Apply investor noise (±5%)
  const investorNoiseFactor = 1 + (Math.random() * 2 - 1) * INVESTOR_NOISE_FACTOR;
  const adjustedNpv = npv * investorNoiseFactor;
  
  // Calculate equity value and share price
  // Equity Value = NPV - Debt - Minority Interest
  const equityValue = adjustedNpv - NET_DEBT - MINORITY_INTEREST;
  const sharesOutstanding = BASELINE_FINANCIALS.sharesOutstanding;
  const rawSharePrice = equityValue / sharesOutstanding;
  
  // Apply stock price bounds - max 2x starting price, min 0.5x starting price
  const minPrice = BASELINE_FINANCIALS.sharePrice * MIN_STOCK_PRICE_MULTIPLIER;
  const maxPrice = BASELINE_FINANCIALS.sharePrice * MAX_STOCK_PRICE_MULTIPLIER;
  const sharePrice = Math.min(maxPrice, Math.max(minPrice, rawSharePrice));
  
  // Calculate margins and returns
  const ebitMargin = ebit / revenue;
  const roic = calculateROIC(ebit, revenue);
  
  return {
    revenue,
    cogs,
    sga,
    ebitda,
    depreciation,
    amortization,
    ebit,
    cashTaxes,
    capex,
    operatingFCF,
    beginningCash,
    endingCash,
    npv: adjustedNpv,
    equityValue,
    sharesOutstanding,
    sharePrice,
    ebitMargin,
    roic,
    investorNoiseFactor,
  };
}

/**
 * Calculates NPV using simplified DCF model
 * 
 * NPV = Sum of (FCF / (1 + WACC)^t) + Terminal Value
 * Terminal Value = FCF_final * (1 + g) / (WACC - g) / (1 + WACC)^n
 */
function calculateNPV(ebit: number, operatingFCF: number): number {
  const wacc = WACC;
  const terminalGrowth = TERMINAL_GROWTH_RATE;
  
  // Simplified: Use current FCF growing at 2% per year
  let npv = 0;
  let currentFCF = operatingFCF;
  
  // Sum of DCF for projection years
  for (let year = 1; year <= DCF_PROJECTION_YEARS; year++) {
    currentFCF *= (1 + terminalGrowth);  // Grow FCF
    const discountFactor = Math.pow(1 + wacc, year);
    npv += currentFCF / discountFactor;
  }
  
  // Terminal value
  const terminalFCF = currentFCF * (1 + terminalGrowth);
  const terminalValue = terminalFCF / (wacc - terminalGrowth);
  const discountedTerminalValue = terminalValue / Math.pow(1 + wacc, DCF_PROJECTION_YEARS);
  
  npv += discountedTerminalValue;
  
  return npv;
}

/**
 * Calculates ROIC (Return on Invested Capital)
 * Simplified: EBIT * (1 - Tax Rate) / Invested Capital
 */
function calculateROIC(ebit: number, revenue: number): number {
  const nopat = ebit * (1 - TAX_RATE);  // Net Operating Profit After Tax
  return nopat / INVESTED_CAPITAL;
}

// =============================================================================
// TSR Calculator
// =============================================================================

/**
 * Calculates TSR (Total Shareholder Return)
 * TSR = (Ending Price - Starting Price + Dividends) / Starting Price
 */
export function calculateTSR(
  startingPrice: number,
  endingPrice: number,
  dividendsPerShare: number = 0
): number {
  if (startingPrice <= 0) return 0;
  return (endingPrice - startingPrice + dividendsPerShare) / startingPrice;
}

/**
 * Calculates round TSR based on stock price change
 */
export function calculateRoundTSR(
  previousPrice: number,
  currentPrice: number,
  operatingFCF: number,
  sharesOutstanding: number
): number {
  // Calculate dividends for the round (assume 25% payout ratio)
  const totalDividends = Math.max(0, operatingFCF * DIVIDEND_PAYOUT_RATIO);
  const dividendsPerShare = totalDividends / sharesOutstanding;
  
  return calculateTSR(previousPrice, currentPrice, dividendsPerShare);
}

/**
 * Calculates cumulative TSR from game start
 */
export function calculateCumulativeTSR(
  startingPrice: number,
  currentPrice: number,
  totalDividendsPerShare: number
): number {
  return calculateTSR(startingPrice, currentPrice, totalDividendsPerShare);
}

// =============================================================================
// Team Rankings
// =============================================================================

/**
 * Ranks teams by cumulative TSR
 * Returns teams sorted by TSR (descending) with rank assigned
 */
export function rankTeamsByTSR(teams: TeamState[]): TeamState[] {
  const sorted = [...teams].sort((a, b) => b.cumulativeTSR - a.cumulativeTSR);
  return sorted;
}

/**
 * Gets ranking position for a specific team
 */
export function getTeamRank(teamId: number, allTeams: TeamState[]): number {
  const sorted = rankTeamsByTSR(allTeams.filter(t => t.isClaimed));
  const index = sorted.findIndex(t => t.teamId === teamId);
  return index >= 0 ? index + 1 : allTeams.length;
}

// =============================================================================
// Active Investment Tracker
// =============================================================================

/**
 * Builds list of active investments for a team based on all decisions made
 */
export function getActiveInvestments(
  allDecisions: TeamDecision[],
  currentRound: RoundNumber
): ActiveInvestment[] {
  const activeInvestments: ActiveInvestment[] = [];
  
  for (const teamDecision of allDecisions) {
    const decision = getDecisionById(teamDecision.decisionId);
    if (!decision) continue;
    
    const yearsActive = currentRound - teamDecision.round + 1;
    
    // Check if investment is still producing benefits
    // One-time benefits only count in year 1
    // Recurring benefits continue indefinitely after ramp-up
    if (decision.isOneTimeBenefit && yearsActive > 1) {
      continue;  // One-time benefit already applied
    }
    
    activeInvestments.push({
      decisionId: teamDecision.decisionId,
      decision,
      roundMade: teamDecision.round,
      yearsActive,
      remainingCostYears: Math.max(0, decision.durationYears - yearsActive + 1),
    });
  }
  
  return activeInvestments;
}

// =============================================================================
// Round Results Generator
// =============================================================================

/**
 * Generates round results for all teams
 */
export function generateRoundResults(
  teams: Record<number, TeamState>,
  round: RoundNumber,
  scenarioNarrative: string,
  riskyEvents: RiskyEventState,
  marketOutlook: MarketOutlook
): RoundResults {
  const claimedTeams = Object.values(teams).filter(t => t.isClaimed);
  const sorted = rankTeamsByTSR(claimedTeams);
  
  const teamResults: TeamRoundResult[] = sorted.map((team, index) => ({
    teamId: team.teamId,
    stockPrice: team.stockPrice,
    stockPriceChange: team.stockPrice - (team.metrics.beginningCash > 0 ? 
      BASELINE_FINANCIALS.sharePrice : team.stockPrice),
    roundTSR: team.roundTSR,
    cumulativeTSR: team.cumulativeTSR,
    rank: index + 1,
    decisionsCount: team.currentRoundDecisions.length,
    totalSpent: team.currentRoundDecisions.reduce((sum, d) => {
      const dec = getDecisionById(d.decisionId);
      return sum + (dec?.cost || 0);
    }, 0),
  }));
  
  // Generate risky outcomes summary
  const riskyOutcomes: RoundResults['riskyOutcomes'] = [];
  let riskyIndex = 0;
  
  for (const team of claimedTeams) {
    for (const decision of team.currentRoundDecisions) {
      const dec = getDecisionById(decision.decisionId);
      if (dec?.isRisky) {
        const triggered = riskyIndex === riskyEvents.activeEventIndex;
        riskyOutcomes.push({
          decisionId: dec.id,
          decisionName: dec.name,
          triggered,
          impact: triggered 
            ? '❌ Risky outcome triggered - reduced impact' 
            : '✅ Risk avoided - full impact realized',
        });
        riskyIndex++;
      }
    }
  }
  
  return {
    round,
    scenarioNarrative,
    teamResults,
    riskyOutcomes,
    marketOutlook,
  };
}

// =============================================================================
// Final Results Generator (Post-Round 5)
// =============================================================================

/**
 * Simulates years 2031-2035 (5 years forward) and generates final results
 */
export function generateFinalResults(
  teams: Record<number, TeamState>,
  riskyEvents: RiskyEventState,
  teamHistories: Record<number, TeamRoundSnapshot[]> = {}
): FinalResults {
  const claimedTeams = Object.values(teams).filter(t => t.isClaimed);
  
  // Simulate 5 years forward for each team
  const simulatedTeams: FinalTeamResult[] = claimedTeams.map(team => {
    // Project forward with assumptions:
    // - 2% annual FCF growth (terminal growth rate)
    // - Stock price grows with NPV
    // - Dividends continue at 25% payout ratio
    
    const startingPrice = BASELINE_FINANCIALS.sharePrice;
    let currentPrice = team.stockPrice;
    let totalDividends = 0;
    let currentFCF = team.metrics.operatingFCF;
    
    // Stock price bounds for final simulation
    const minPrice = startingPrice * MIN_STOCK_PRICE_MULTIPLIER;
    const maxPrice = startingPrice * MAX_STOCK_PRICE_MULTIPLIER;
    
    // Simulate 5 years (2031-2035)
    for (let year = 1; year <= 5; year++) {
      // FCF grows at terminal rate
      currentFCF *= (1 + TERMINAL_GROWTH_RATE);
      
      // Calculate annual dividends
      const annualDividends = Math.max(0, currentFCF * DIVIDEND_PAYOUT_RATIO);
      totalDividends += annualDividends / team.metrics.sharesOutstanding;
      
      // Stock price grows slightly with FCF growth and random noise
      const growthFactor = 1 + TERMINAL_GROWTH_RATE + (Math.random() * 0.02 - 0.01);
      currentPrice *= growthFactor;
      
      // Apply bounds each year
      currentPrice = Math.min(maxPrice, Math.max(minPrice, currentPrice));
    }
    
    // Calculate final TSR
    const totalTSR = calculateTSR(startingPrice, currentPrice, totalDividends);
    
    return {
      teamId: team.teamId,
      teamName: team.teamName || `Team ${team.teamId}`,
      finalStockPrice: currentPrice,
      totalTSR,
      rank: 0,  // Will be assigned after sorting
      startingStockPrice: startingPrice,
      totalDividends,
    };
  });
  
  // Sort by TSR and assign ranks
  simulatedTeams.sort((a, b) => b.totalTSR - a.totalTSR);
  simulatedTeams.forEach((team, index) => {
    team.rank = index + 1;
  });
  
  // Determine winner
  const winnerId = simulatedTeams.length > 0 ? simulatedTeams[0].teamId : 1;
  
  // Generate simulation summary
  const winner = simulatedTeams[0];
  const avgTSR = simulatedTeams.reduce((sum, t) => sum + t.totalTSR, 0) / simulatedTeams.length;
  
  const simulationSummary = `
The simulation projected team performance from 2031 to 2035, assuming:
- Terminal FCF growth rate of ${(TERMINAL_GROWTH_RATE * 100).toFixed(1)}%
- Continued dividend payout at ${(DIVIDEND_PAYOUT_RATIO * 100).toFixed(0)}% of FCF
- Market conditions normalized post-2030

🏆 Winner: Team ${winnerId} achieved a total TSR of ${(winner?.totalTSR * 100).toFixed(1)}%
📊 Average TSR across all teams: ${(avgTSR * 100).toFixed(1)}%
💰 Starting share price: $${BASELINE_FINANCIALS.sharePrice.toFixed(2)}
🎯 Winning final share price: $${winner?.finalStockPrice.toFixed(2)}
  `.trim();
  
  return {
    leaderboard: simulatedTeams,
    winnerId,
    simulationSummary,
    teamHistories,
  };
}

// =============================================================================
// Full Round Processing
// =============================================================================

/**
 * Processes all team decisions at the end of a round
 * Updates financial metrics, stock prices, and TSR for all teams
 */
export function processRoundEnd(
  teams: Record<number, TeamState>,
  currentRound: RoundNumber,
  modifiers: ScenarioModifiers,
  riskyEvents: RiskyEventState
): Record<number, TeamState> {
  const startingPrice = BASELINE_FINANCIALS.sharePrice;
  const updatedTeams: Record<number, TeamState> = {};
  
  // Track risky decision outcomes
  let globalRiskyIndex = 0;
  
  for (const [teamIdStr, team] of Object.entries(teams)) {
    const teamId = parseInt(teamIdStr, 10);
    
    if (!team.isClaimed) {
      updatedTeams[teamId] = { ...team };
      continue;
    }
    
    // Get all active investments for this team
    const allTeamDecisions = [...team.allDecisions, ...team.currentRoundDecisions];
    const activeInvestments = getActiveInvestments(allTeamDecisions, currentRound);
    
    // Calculate updated metrics
    const previousMetrics = team.metrics;
    const previousPrice = team.stockPrice;
    
    const newMetrics = calculateTeamMetrics(
      previousMetrics,
      activeInvestments,
      modifiers,
      riskyEvents,
      globalRiskyIndex
    );
    
    // Update global risky index
    for (const inv of activeInvestments) {
      if (inv.decision.isRisky) {
        globalRiskyIndex++;
      }
    }
    
    // Calculate round TSR
    const roundTSR = calculateRoundTSR(
      previousPrice,
      newMetrics.sharePrice,
      newMetrics.operatingFCF,
      newMetrics.sharesOutstanding
    );
    
    // Calculate cumulative TSR from game start
    // Sum up dividends across all rounds
    const totalDividends = calculateTotalDividends(team, newMetrics);
    const cumulativeTSR = calculateCumulativeTSR(
      startingPrice,
      newMetrics.sharePrice,
      totalDividends
    );
    
    // Create updated team state
    updatedTeams[teamId] = {
      ...team,
      metrics: newMetrics,
      stockPrice: newMetrics.sharePrice,
      roundTSR,
      cumulativeTSR,
      // Cash balance replenishment for next round
      cashBalance: STARTING_INVESTMENT_CASH,
    };
  }
  
  return updatedTeams;
}

/**
 * Calculates total dividends per share across all rounds
 */
function calculateTotalDividends(
  team: TeamState,
  currentMetrics: FinancialMetrics
): number {
  // Simplified: assume each round paid out 25% of FCF as dividends
  const rounds = team.allDecisions.length > 0 
    ? new Set(team.allDecisions.map(d => d.round)).size + 1
    : 1;
  
  // Estimate average FCF across rounds
  const avgFCF = (BASELINE_FINANCIALS.operatingFCF + currentMetrics.operatingFCF) / 2;
  const totalDividendsPaid = avgFCF * DIVIDEND_PAYOUT_RATIO * rounds;
  
  return totalDividendsPaid / currentMetrics.sharesOutstanding;
}

// =============================================================================
// Utility Exports
// =============================================================================

/**
 * Checks if a risky decision's negative outcome should trigger
 * Based on the pre-determined active event index
 */
export function checkRiskyOutcome(
  decisionIndex: number,
  riskyEvents: RiskyEventState
): boolean {
  return decisionIndex === riskyEvents.activeEventIndex;
}

/**
 * Formats currency values for display
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  return `$${value.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}M`;
}

/**
 * Formats percentage values for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Gets a summary of decision impacts for display
 */
export function getDecisionImpactSummary(decision: Decision): string {
  const impacts: string[] = [];
  
  if (decision.revenueImpact) {
    const direction = decision.revenueImpact > 0 ? '+' : '';
    impacts.push(`Revenue: ${direction}${(decision.revenueImpact * 100).toFixed(1)}%`);
  }
  if (decision.cogsImpact) {
    const direction = decision.cogsImpact < 0 ? '' : '+';
    impacts.push(`COGS: ${direction}${(decision.cogsImpact * 100).toFixed(1)}%`);
  }
  if (decision.sgaImpact) {
    const direction = decision.sgaImpact < 0 ? '' : '+';
    impacts.push(`SG&A: ${direction}${(decision.sgaImpact * 100).toFixed(1)}%`);
  }
  if (decision.recurringBenefit && !decision.isOneTimeBenefit) {
    impacts.push(`Recurring: $${decision.recurringBenefit}M/year`);
  }
  if (decision.isOneTimeBenefit && decision.recurringBenefit) {
    impacts.push(`One-time: $${decision.recurringBenefit}M`);
  }
  if (decision.riskPrevention) {
    impacts.push(`Prevents: ${decision.riskPrevention.replace(/_/g, ' ')}`);
  }
  
  return impacts.join(' | ');
}
