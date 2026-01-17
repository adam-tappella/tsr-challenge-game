/**
 * Magna TSR Challenge - Scenario Configuration
 * Defines the market conditions and modifiers for each round
 */

import type { ScenarioType, ScenarioModifiers, ScenarioState, RoundNumber } from '../types/game.js';

/**
 * Scenario definitions for each round
 */
interface ScenarioDefinition {
  type: ScenarioType;
  narrative: string;
  modifiers: ScenarioModifiers;
}

/**
 * Scenario configuration by round
 * 
 * Round 1-2: Business as usual - standard trade-offs
 * Round 3: Cost pressure emerges - optimize decisions rewarded
 * Round 4: Recession hits - sustain decisions protect, grow punished
 * Round 5: Recovery begins - grow decisions outperform
 */
export const SCENARIO_BY_ROUND: Record<RoundNumber, ScenarioDefinition> = {
  1: {
    type: 'business_as_usual',
    narrative: `Welcome to fiscal year 2026. The automotive market remains stable with moderate growth expectations. 
OEMs are increasing their EV commitments, creating both opportunities and challenges for suppliers. 
Your task: Make strategic capital allocation decisions to maximize shareholder value over the coming years.`,
    modifiers: {
      growMultiplier: 1.0,
      optimizeMultiplier: 1.0,
      sustainMultiplier: 1.0,
    },
  },
  
  2: {
    type: 'business_as_usual',
    narrative: `Fiscal year 2027 begins with continued stability. Your previous investments are beginning to show results.
EV adoption is accelerating, but ICE vehicles still dominate sales. Supply chain pressures are normalizing.
Continue executing on your strategy while positioning for future market shifts.`,
    modifiers: {
      growMultiplier: 1.0,
      optimizeMultiplier: 1.0,
      sustainMultiplier: 1.0,
    },
  },
  
  3: {
    type: 'cost_pressure',
    narrative: `Warning: Cost pressures are emerging in fiscal year 2028.
Raw material prices are rising. Labor costs increasing. OEMs are pushing back on pricing.
Margin expansion becomes critical. Those who invested in efficiency will be rewarded.
Consider: Is this the time to aggressively expand, or to focus on operational excellence?`,
    modifiers: {
      growMultiplier: 0.7,    // Growth investments underperform
      optimizeMultiplier: 1.2, // Efficiency investments outperform
      sustainMultiplier: 1.0,
    },
  },
  
  4: {
    type: 'recession',
    narrative: `RECESSION ALERT: A significant economic downturn has hit in fiscal year 2029.
Auto sales are declining sharply. OEMs are cutting production. Cash preservation is critical.
Those with strong balance sheets can make opportunistic moves. Those overextended will struggle.
Remember: Dry powder enables opportunism. Overinvestment in growth now could be catastrophic.`,
    modifiers: {
      growMultiplier: 0.5,    // Growth investments severely underperform
      optimizeMultiplier: 1.0, // Efficiency holds steady
      sustainMultiplier: 1.5,  // Maintenance and risk prevention highly valued
    },
  },
  
  5: {
    type: 'recovery',
    narrative: `The recovery has begun in fiscal year 2030.
Economic indicators are improving. Auto sales are rebounding. Consumer confidence is returning.
Those who maintained investment capacity can now ride the rising tide.
This is your final round of decisions before the simulation projects forward to 2035.`,
    modifiers: {
      growMultiplier: 1.3,    // Growth investments outperform during recovery
      optimizeMultiplier: 1.0,
      sustainMultiplier: 0.8,  // Less need for defensive plays
    },
  },
};

/**
 * Creates initial scenario state for a given round
 */
export function createScenarioState(round: RoundNumber): ScenarioState {
  const definition = SCENARIO_BY_ROUND[round];
  
  return {
    type: definition.type,
    narrative: definition.narrative,
    modifiers: { ...definition.modifiers },
    eventTriggered: false,
    eventDescription: undefined,
  };
}

/**
 * Special events that can be triggered by the facilitator
 */
export const SPECIAL_EVENTS = {
  supply_chain_disruption: {
    description: 'A major supply chain disruption has occurred. Teams with diversified suppliers are protected.',
    affectedDecisions: ['diversify_suppliers', 'dual_source_critical'],
  },
  key_customer_loss: {
    description: 'A major OEM has announced they are in-sourcing a key component. Customer diversification matters.',
    affectedDecisions: ['diversify_customers', 'expand_customer_base'],
  },
  technology_shift: {
    description: 'A breakthrough in EV technology has accelerated the transition timeline. Early movers benefit.',
    affectedDecisions: ['ev_investment', 'next_gen_portfolio'],
  },
  regulatory_change: {
    description: 'New environmental regulations are announced. Compliance investments prove valuable.',
    affectedDecisions: ['compliance_upgrade', 'sustainability_initiative'],
  },
  competitor_acquisition: {
    description: 'A major competitor has been acquired, creating market opportunities for those with capacity.',
    affectedDecisions: ['expand_capacity', 'market_expansion'],
  },
};
