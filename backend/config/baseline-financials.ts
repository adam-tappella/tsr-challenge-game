/**
 * Magna TSR Challenge - Baseline Financials
 * Starting position for all teams (2025 EOY)
 * 
 * Based on Magna International's simplified 2025 financials
 * All values in USD Millions unless otherwise noted
 */

import type { BaselineFinancials, FinancialMetrics } from '../types/game.js';

/**
 * 2025 End of Year baseline financials
 * This is the starting position for all teams
 */
export const BASELINE_FINANCIALS: BaselineFinancials = {
  // Income Statement
  revenue: 42836,           // $42,836M
  cogs: -37037,             // ($37,037M) - Cost of Goods Sold
  sga: -2061,               // ($2,061M) - SG&A
  ebitda: 3738,             // $3,738M - EBITDA
  depreciation: -1510,      // ($1,510M)
  amortization: -112,       // ($112M)
  ebit: 2116,               // $2,116M - EBIT
  
  // Cash Flow
  cashTaxes: -466,          // ($466M)
  capex: -1713,             // ($1,713M) - Capital Expenditures
  operatingFCF: 1561,       // $1,561M - Operating Free Cash Flow
  beginningCash: 1247,      // $1,247M
  
  // Valuation
  npv: 23201,               // $23,201M - Enterprise Value / NPV
  equityValue: 15018,       // $15,018M (NPV - Debt - Minority)
  sharesOutstanding: 287,   // 287M shares
  sharePrice: 52.27,        // $52.27 per share
};

/**
 * Creates a full FinancialMetrics object from baseline
 * Used to initialize team state at game start
 */
export function createInitialMetrics(): FinancialMetrics {
  const baseline = BASELINE_FINANCIALS;
  
  return {
    // Income Statement
    revenue: baseline.revenue,
    cogs: baseline.cogs,
    sga: baseline.sga,
    ebitda: baseline.ebitda,
    depreciation: baseline.depreciation,
    amortization: baseline.amortization,
    ebit: baseline.ebit,
    
    // Cash Flow
    cashTaxes: baseline.cashTaxes,
    capex: baseline.capex,
    operatingFCF: baseline.operatingFCF,
    beginningCash: baseline.beginningCash,
    endingCash: baseline.beginningCash + baseline.operatingFCF,
    
    // Valuation
    npv: baseline.npv,
    equityValue: baseline.equityValue,
    sharesOutstanding: baseline.sharesOutstanding,
    sharePrice: baseline.sharePrice,
    
    // Derived Metrics - All calculated dynamically
    investedCapital: INVESTED_CAPITAL,
    ebitdaMargin: baseline.ebitda / baseline.revenue,  // EBITDA/Revenue
    ebitMargin: baseline.ebit / baseline.revenue,  // EBIT/Revenue
    roic: (baseline.ebit * (1 - TAX_RATE)) / INVESTED_CAPITAL,  // EBIT * (1 - Tax) / Invested Capital
    cogsToRevenue: Math.abs(baseline.cogs) / baseline.revenue,  // COGS/Revenue
    sgaToRevenue: Math.abs(baseline.sga) / baseline.revenue,  // SGA/Revenue
    capexToRevenue: Math.abs(baseline.capex) / baseline.revenue,  // CAPEX/Revenue
  };
}

/**
 * Starting cash available for investments
 * Based on Operating FCF minus assumed dividends/buybacks
 */
export const STARTING_INVESTMENT_CASH = 1200;  // $1,200M available per round initially

/**
 * WACC (Weighted Average Cost of Capital)
 * Used for NPV calculations
 */
export const WACC = 0.08;  // 8%

/**
 * Terminal growth rate for DCF calculations
 */
export const TERMINAL_GROWTH_RATE = 0.02;  // 2%

/**
 * Tax rate for cash flow calculations
 */
export const TAX_RATE = 0.22;  // 22%

/**
 * Net debt for equity value calculation
 * Fixed value used for valuation purposes
 */
export const NET_DEBT = 7765;  // $7,765M

/**
 * Minority interest for equity value calculation
 * Fixed value used for valuation purposes
 */
export const MINORITY_INTEREST = 418;  // $418M

/**
 * Invested Capital for ROIC calculation
 * ROIC = EBIT * (1 - Tax Rate) / Invested Capital
 */
export const INVESTED_CAPITAL = 15828;  // $15,828M
