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
  npv: 22738,               // $22,738M - Enterprise Value / NPV
  equityValue: 14164,       // $14,164M
  sharesOutstanding: 287,   // 287M shares
  sharePrice: 49.29,        // $49.29 per share
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
    
    // Derived Metrics
    ebitMargin: baseline.ebit / baseline.revenue,  // ~4.94%
    roic: 0.08,  // Assume 8% ROIC (slightly above WACC per PRD)
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
export const WACC = 0.075;  // 7.5%

/**
 * Terminal growth rate for DCF calculations
 */
export const TERMINAL_GROWTH_RATE = 0.02;  // 2%

/**
 * Tax rate for cash flow calculations
 */
export const TAX_RATE = 0.22;  // 22%
