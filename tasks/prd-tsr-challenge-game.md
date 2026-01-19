# PRD: Magna TSR Challenge — Interactive Capital Allocation Game

## Introduction

The **Magna TSR Challenge** is a live simulation game for Magna International's global leadership meeting in March 2026. Approximately 150 leaders (15 teams of 10) will compete as "CEOs" making capital allocation decisions across 5 rounds (representing fiscal years 2026-2030). The game teaches Total Shareholder Return (TSR) drivers through experiential learning, with the winner determined by cumulative shareholder value creation from 2026-2035.

### Problem Statement

Magna's leadership needs to internalize complex capital allocation trade-offs and their impact on shareholder value. Traditional presentations don't create lasting understanding. This simulation creates visceral, memorable learning by putting leaders in the CEO seat during varying market conditions.

### Context

- **Event:** Magna International Global Leadership Meeting
- **Date:** March 2026
- **Duration:** 120 minutes total session
- **Participants:** ~150 leaders across 15 teams of 10
- **Setting:** Conference room with one laptop per team table

---

## Goals

- Enable 15 teams to simultaneously make capital allocation decisions within time constraints
- Calculate and display team performance (stock price / TSR) after each round
- Teach core value creation principles through gameplay mechanics
- Support facilitator control of game flow (start/pause/advance rounds, trigger events)
- Deliver a functional MVP focused on the core game loop

---

## Core Learning Objectives

The game mechanics should be designed so that teams who follow these principles tend to outperform.

### Magna's Four Guiding Principles

The game reinforces Magna's strategic framework through experiential learning:

| Guiding Principle | What It Means | Key Behaviors |
|-------------------|---------------|---------------|
| **Long-Term Ownership Mentality** | Incentives aligned to execution and long-term value; partnership-driven approach with OEMs | Avoid short-term cuts that destroy long-term value; maintain investment capacity |
| **Portfolio Management** | Target attractive markets; back leaders with path to profitable growth; exit non-core assets | Diversify across customers/suppliers/geographies; actively manage portfolio |
| **Maintain Strong Balance Sheet** | Protect liquidity and investment-grade leverage (Debt/EBITDA: 1.0-1.5x) | Preserve cash optionality; maintain flexibility through cycles |
| **Capital Allocation Strategy** | Maximize long-term FCF per share; prioritize profitable growth | Margin improvement over volume growth; return excess capital appropriately |

### Core Lessons Mapped to Principles

| Lesson | Guiding Principle | Why It Matters |
|--------|-------------------|----------------|
| **Margin expansion > Growth** | Capital Allocation Strategy | At MGA's position on the growth spread matrix (ROIC slightly above WACC), margin improvement creates significantly more value than chasing growth |
| **Diversification pays off** | Portfolio Management | Spreading risk across customers, suppliers, and geographies protects against concentrated failures |
| **Cash optionality matters** | Maintain Strong Balance Sheet | Sometimes holding cash beats investing, especially before downturns |
| **Balance sheet flexibility enables opportunism** | Maintain Strong Balance Sheet | Dry powder allows opportunistic M&A when competitors struggle |
| **Position for recovery** | Long-Term Ownership Mentality | Those who maintain investment capacity can ride the rising tide |

### KPI Scorecard

Teams will be assessed against Magna's Financial Framework targets:

| KPI | Target | Assessment Criteria |
|-----|--------|---------------------|
| **Growth over Market** | 2-4% | 🟢 On target / 🟡 Below target / 🔴 Chasing volume unsustainably |
| **EBIT Margin** | ≥10% | 🟢 ≥10% / 🟡 8-10% / 🔴 <8% |
| **CapEx to Sales** | 4-4.5% | 🟢 In range / 🟡 Under-investing / 🔴 Over-investing |
| **FCF Conversion** | >70% | 🟢 ≥70% / 🟡 50-70% / 🔴 <50% |
| **ROIC** | ≥15% | 🟢 ≥15% / 🟡 12-15% / 🔴 <12% |
| **Debt / EBITDA** | 1.0-1.5x | 🟢 In range / 🔴 Overleveraged or under-leveraged |

---

## Scenario Dynamics & Expected Responses

### Macro Environment by Round

| Round | Year | Scenario | What Happens | Smart Response | Trap to Avoid |
|-------|------|----------|--------------|----------------|---------------|
| 1 | 2026 | **Business as Usual** | Stable market, EV transition underway | Balance growth & optimization; build foundation | Over-investing in risky growth bets too early |
| 2 | 2027 | **Business as Usual** | Continued stability; investments ramping | Execute on strategy; position for efficiency; diversify OEM exposure | Complacency; concentrating on single OEM relationships |
| 3 | 2028 | **Cost Pressure** | Raw materials ↑, labor ↑, OEM pushback; **OEM program cancellation hits** | Pivot to Optimize decisions; preserve cash | Doubling down on Grow (penalized at 0.7x!) |
| 4 | 2029 | **Recession** | Auto sales ↓↓, cash is king | Sustain investments; opportunistic M&A if cash available | Aggressive expansion (penalized at 0.5x!) |
| 5 | 2030 | **Recovery** | Market rebounds, optimism returns | Grow investments rewarded (1.3x); ride the wave | Over-defensive play; excessive Sustain (0.8x) |

### Scenario Multipliers

| Scenario | Grow | Optimize | Sustain | Strategic Implication |
|----------|------|----------|---------|----------------------|
| Business as Usual (R1-2) | 1.0x | 1.0x | 1.0x | Balanced approach works |
| Cost Pressure (R3) | **0.7x** | **1.2x** | 1.0x | Margin focus rewarded |
| Recession (R4) | **0.5x** | 1.0x | **1.5x** | Survival mode; protect the base |
| Recovery (R5) | **1.3x** | 1.0x | **0.8x** | Growth bets pay off |

---

## Special Events (Facilitator-Triggered)

These events test whether teams have built resilience through diversification and risk management:

| Event | Round | Description | Protected If... | Punished If... |
|-------|-------|-------------|-----------------|----------------|
| **OEM Program Cancellation** | 3 | Major OEM cancels high-volume program that was expected to drive significant returns | Diversified OEM investments (spread across multiple customers) | Concentrated single-OEM investment (the "bait" card from Round 2) |
| **Supply Chain Disruption** | 3-4 | Major supplier failure disrupts production | Invested in dual-sourcing, supplier relationships | Single-source dependencies |
| **Key Customer Loss** | 3-4 | OEM in-sources a key component | Diversified customer base | Over-reliance on single customer |
| **Technology Shift** | 2-3 | EV transition accelerates faster than expected | Early investment in EV/next-gen portfolio | Underinvestment in technology transition |
| **Regulatory Change** | 3-4 | New environmental regulations announced | Proactive compliance investments | Deferred compliance spending |
| **Competitor Acquisition** | 4-5 | Competitor acquired, creating market opportunities | Have capacity and cash to capture share | Overleveraged or capacity-constrained |

### Round 2 "Bait" Decisions

Two key Grow decisions in Round 2 test diversification learning:

| Decision | Apparent Return | Actual Outcome | Learning |
|----------|-----------------|----------------|----------|
| **Diversified OEM Capacity Investment** | Lower projected return (+$80M/yr) | Stable, predictable return | Diversification provides insurance |
| **Concentrated OEM Capacity Investment** | Higher projected return (+$120M/yr) | **Returns to $0** when OEM cancels program in R3 | Concentration risk is real |

---

## Risky Decision Outcomes (Pre-Determined)

Risky decisions have a ~20% failure rate. The following outcomes are **pre-determined** for consistency:

| Decision | Round | Category | Projected Outcome | **Actual Outcome** | Rationale |
|----------|-------|----------|-------------------|-------------------|-----------|
| Southeast Asia Market Entry | 1 | Grow | +$120M/yr | ✅ **Succeeds** (+$100M/yr) | Execution slightly below plan but viable |
| Autonomous Driving Systems Unit | 1 | Grow | +$180M/yr | ❌ **Fails** (-$50M/yr) | Technology pivot required; investment lost |
| Software-Defined Vehicle Platform | 2 | Grow | +$200M/yr | ✅ **Succeeds** (+$220M/yr) | Industry adoption exceeds expectations |
| Distressed Competitor Acquisition | 3 | Grow | +$250M/yr | ✅ **Succeeds** (+$200M/yr) | Integration challenges reduce synergies |
| Chinese OEM Partnership | 3 | Grow | +$180M/yr | ❌ **Fails** (-$80M/yr) | Geopolitical tensions force exit |
| Vehicle-to-Grid Services Business | 3 | Grow | +$60M/yr | ✅ **Succeeds** (+$40M/yr) | Slower market development |
| Solid-State Battery Research | 3 | Grow | +$120M/yr | ✅ **Succeeds** (+$150M/yr) | Breakthrough accelerates timeline |
| Hydrogen Fuel Cell Alliance | 4 | Grow | +$50M/yr | ✅ **Succeeds** (+$30M/yr) | Modest returns as expected |
| Deep Cost Restructuring | 4 | Optimize | +$150M/yr | ✅ **Succeeds** (+$130M/yr) | Some capability damage but net positive |
| Minimum Viable Maintenance | 4 | Sustain | Risk prevention | ❌ **Fails** (Equipment failure: -$100M) | Deferred maintenance catches up |

**Summary:** 3 of 10 risky decisions fail (30% failure rate), teaching that high-risk bets should be selective.

---

## Game Structure

### Overview
| Aspect | Detail |
|--------|--------|
| Teams | 10-20 teams (configurable), ~10 people each |
| Rounds | 5 rounds (representing FY2026-2030) |
| Time per round | ~10-15 minutes for decisions |
| Starting position | Magna 2025 EOY financials |
| Scoring | Total Shareholder Return (2026-2035) |
| Final simulation | Years 2031-2035 auto-simulated (no decisions) |

### Round-by-Round Design

| Round | Year | Scenario | Core Lesson |
|-------|------|----------|-------------|
| 1 | 2026 | Business as usual | Standard trade-offs, get comfortable |
| 2 | 2027 | Business as usual | Execution and incremental decisions |
| 3 | 2028 | Cost pressure emerges | Sometimes cash > investing |
| 4 | 2029 | Recession hits | Balance sheet strength enables opportunistic M&A |
| 5 | 2030 | Recovery begins | Rising tide — investments outperform |

### Decision System

**75 total unique decision cards** organized into 3 categories:

| Category | Total Cards | Per Round | Description | Examples |
|----------|-------------|-----------|-------------|----------|
| **Grow** | 25 | 5 | Large strategic commitments to expand capacity, enter new markets, or acquire | New geography expansion, OEM tooling commitments, bolt-on acquisitions, JV partnerships |
| **Optimize** | 25 | 5 | ROI-driven projects for efficiency and margin improvement | Factory automation, footprint consolidation, dual-sourcing, digital transformation |
| **Sustain** | 25 | 5 | Non-discretionary investments to maintain operations | Mandatory equipment, compliance, workforce retention, safety |

**Card Availability per Round:**
- **15 cards available each round** (5 Grow + 5 Optimize + 5 Sustain)
- Different cards appear in different rounds (based on "Introduced Year" attribute)
- Some cards may be **flagged as risky** — these have probability-based outcomes

Each decision card has attributes:
- **Guiding Principle** (which strategic principle it relates to)
- **Decision Category** (Grow/Optimize/Sustain subcategory)
- **Decision Name** (short title)
- **Decision Narrative** (detailed description)
- **Decision Type** (Organic / Inorganic)
- **Introduced Year** (which round it becomes available: 1-5)
- **Impact Magnitude** (1-5 scale)
- **Risky Flag** (boolean — if true, has probabilistic outcome)

### Constraints & Mechanics

- **Capital constraint:** Teams have limited free cash flow each round (after dividends and buybacks)
- **Decision limits:** Each round limits the number of investment decisions teams can make
- **Multi-year investments:** See Investment Duration Model below
- **Probabilistic returns:** Returns depend on market conditions and scenario evolution

### Investment Duration Model

Investments follow a **one-time cost + recurring benefit** pattern:

| Aspect | Detail |
|--------|--------|
| **Duration** | 1 or 2 years (specified on each card) |
| **Cost timing** | One-time, paid in the round the decision is made |
| **Benefit timing** | Recurring; may take 1-3 years to fully ramp up |
| **Exception** | Divestitures provide one-time benefit (sale proceeds) |

**Example patterns:**
- **1-year investment:** Pay $200M in Year 1 → +$50M/year recurring benefit starting Year 2
- **2-year investment:** Pay $300M in Year 1, $200M in Year 2 → +$100M/year recurring benefit starting Year 3
- **Divestiture:** Receive $500M one-time in Year 1, lose $30M/year recurring revenue

**Ramp-up:** Some investments have gradual impact:
- Year 1: 30% of full impact
- Year 2: 70% of full impact  
- Year 3+: 100% of full impact

### Scenario Modifiers

Scenarios apply **category-specific multipliers** to decision outcomes:

| Scenario | Grow Decisions | Optimize Decisions | Sustain Decisions |
|----------|---------------|-------------------|-------------------|
| **Business as usual** (R1-2) | 1.0x | 1.0x | 1.0x |
| **Cost pressure** (R3) | 0.7x | 1.2x | 1.0x |
| **Recession** (R4) | 0.5x | 1.0x | 1.5x |
| **Recovery** (R5) | 1.3x | 1.0x | 0.8x |

*Note: Exact multipliers are illustrative and will be tuned during implementation.*

**Rationale:**
- Recession hits **Grow** hardest (expansion during downturn underperforms)
- Cost pressure rewards **Optimize** (margin focus pays off when costs rise)
- **Sustain** investments prove valuable in recession (avoiding catastrophic failures)
- Recovery rewards **Grow** (positioned for upturn)

### Risk / Chance Mechanic

- **Risky bet cards:** Optional high-risk/high-reward decisions with ~20% chance of negative outcome
- **Implementation:** Only 1 of 5 risky events actually triggers across the game
- **Purpose:** Adds realism without punishing fundamentally good strategy

---

## User Stories

### US-001: Team Decision Interface
**Description:** As a team, I want to view available investment options and submit our decisions so that we can participate in each round.

**Acceptance Criteria:**
- [ ] Team sees their current cash balance prominently displayed
- [ ] Team sees remaining time in the round (countdown timer)
- [ ] Team can browse decisions by category (Grow / Optimize / Sustain)
- [ ] Each decision card shows: name, cost, brief description
- [ ] Team can "flip" card to see detailed narrative and expected impact
- [ ] Team can select/deselect decisions (selections update remaining cash)
- [ ] Team cannot exceed available cash (visual warning if attempted)
- [ ] Team can submit final decisions before timer expires
- [ ] Decisions auto-submit when timer reaches zero
- [ ] Typecheck passes

### US-002: Round Results Display
**Description:** As a team, I want to see the results of my decisions after each round so that I understand how my choices impacted performance.

**Acceptance Criteria:**
- [ ] After round ends, team sees updated financial metrics (revenue, EBIT, ROIC, stock price)
- [ ] Team sees their TSR for the round and cumulative TSR
- [ ] Team sees their rank among all 15 teams
- [ ] Team sees brief narrative explaining market conditions that round
- [ ] Results display for ~60-90 seconds before next round begins
- [ ] Typecheck passes

### US-003: Team Identification
**Description:** As a team, I want to identify ourselves at the start so that our decisions are tracked correctly.

**Acceptance Criteria:**
- [ ] On app load, team selects their team number from available list (based on configured team count)
- [ ] Only unclaimed team numbers are selectable
- [ ] Team name displays in header throughout the game
- [ ] Team cannot change team selection after game starts
- [ ] Typecheck passes

### US-004: Facilitator Access & Game Setup
**Description:** As a facilitator, I want to securely access admin controls and configure the game before starting.

**Acceptance Criteria:**
- [ ] Facilitator navigates to `/admin` route
- [ ] PIN entry required before accessing controls (e.g., 4-6 digit PIN)
- [ ] Incorrect PIN shows error, does not grant access
- [ ] After PIN entry, facilitator can configure number of teams (10-20)
- [ ] Facilitator can see which team numbers have been claimed
- [ ] Configuration locked once game starts
- [ ] Typecheck passes

### US-005: Facilitator Round Control
**Description:** As a facilitator, I want to control game flow so that I can pace the session appropriately.

**Acceptance Criteria:**
- [ ] Facilitator can start Round 1 (all teams see decision interface)
- [ ] Facilitator can pause the current round (timers freeze)
- [ ] Facilitator can resume a paused round
- [ ] Facilitator can end round early (force-submit all pending decisions)
- [ ] Facilitator can advance to next round
- [ ] Facilitator can trigger scenario events (e.g., recession announcement)
- [ ] Typecheck passes

### US-006: Final Results & Winner
**Description:** As a team, I want to see final standings after Round 5 so that we know who won.

**Acceptance Criteria:**
- [ ] After Round 5 decisions, system simulates years 2031-2035 automatically
- [ ] Final leaderboard shows all teams ranked by total TSR (2026-2035)
- [ ] Winner is highlighted/celebrated in UI
- [ ] Teams see their final stock price and cumulative return
- [ ] Typecheck passes

### US-007: Game State Synchronization
**Description:** As a system, I need to keep all team clients and facilitator in sync so that the game runs smoothly.

**Acceptance Criteria:**
- [ ] All teams see the same round state (waiting / active / results)
- [ ] Timer is synchronized across all clients (within 1 second)
- [ ] When facilitator advances round, all teams transition together
- [ ] If a team's connection drops and reconnects, they rejoin current state
- [ ] Typecheck passes

---

## Functional Requirements

### Game Flow
- **FR-1:** System shall support configurable number of teams (10-20), identified by team number
- **FR-2:** System shall run 5 sequential rounds, each with a configurable time limit (default: 10 minutes)
- **FR-3:** System shall prevent teams from submitting decisions after round timer expires
- **FR-4:** System shall auto-submit any selected (but not submitted) decisions when timer expires

### Decision Management
- **FR-5:** System shall load 75 decision cards from configuration (25 per category)
- **FR-6:** System shall display exactly 15 decisions per round (5 Grow + 5 Optimize + 5 Sustain) based on "Introduced Year" attribute
- **FR-7:** System shall track each team's available cash (FCF) and prevent overspending
- **FR-8:** System shall allow teams to select multiple decisions up to their cash limit
- **FR-9:** System shall record all team decisions with timestamps
- **FR-21:** System shall visually indicate which decisions are flagged as "risky"

### Scoring & Results
- **FR-10:** System shall calculate team financial metrics after each round based on decisions made and scenario conditions
- **FR-11:** System shall calculate stock price / TSR based on financial metrics
- **FR-12:** System shall rank teams by cumulative TSR after each round
- **FR-13:** System shall simulate years 2031-2035 after Round 5 using team's ending position and auto-pilot logic
- **FR-14:** System shall apply scenario modifiers (cost pressure, recession, recovery) to decision outcomes based on current round

### Facilitator Controls
- **FR-15:** Facilitator shall access admin mode via password/PIN (e.g., `/admin` route with PIN entry)
- **FR-16:** Facilitator shall be able to: start game, start round, pause round, resume round, end round, trigger events
- **FR-17:** Facilitator actions shall propagate to all team clients in real-time
- **FR-22:** Facilitator shall be able to configure number of teams (10-20) before game starts

### Probabilistic Elements
- **FR-18:** System shall support "risky" decision cards with probability-based outcomes
- **FR-19:** System shall pre-determine which risky events trigger (1 of 5) at game start
- **FR-20:** Risky outcomes shall be revealed during round results

---

## Non-Goals (Out of Scope for MVP)

- **No shared/projected leaderboard display** — Teams see only their own screen (will add later)
- **No persistence or replay** — Game state not saved after session ends
- **No authentication** — Teams self-identify by number; no login required
- **No detailed analytics export** — No post-game data export
- **No scenario editor** — Scenarios are hardcoded for this event
- **No mobile optimization** — Designed for laptop screens only
- **No sound effects or advanced animations** — Focus on functional UI
- **No AI opponents** — All 15 teams are human-controlled
- **No multiple simultaneous games** — Single game instance at a time

---

## Design Considerations

### UI/UX Direction
- **Aesthetic:** Clean, professional, financial/corporate feel (not gamified/cartoonish)
- **Inspiration:** Bloomberg terminal meets modern fintech dashboard
- **Color palette:** Use Magna brand colors as accents; neutral base
- **Typography:** Clear, readable; financial data should feel authoritative

### Key Screens

1. **Team Selection Screen**
   - Simple team number selector (1-15)
   - "Join Game" button

2. **Waiting/Lobby Screen**
   - "Waiting for game to start..."
   - Team name displayed

3. **Decision Screen** (main game interface)
   - Header: Team name, current cash, remaining cash, timer
   - Three collapsible sections: Grow / Optimize / Sustain
   - Card grid within each section
   - Selected cards highlighted with running total
   - "Submit Decisions" button

4. **Card Detail View**
   - Flip animation or modal
   - Full narrative, impact details, cost
   - Select/deselect toggle

5. **Round Results Screen**
   - Key metrics with delta indicators (↑↓)
   - Mini leaderboard (team's rank + nearby teams)
   - Scenario narrative text
   - "Waiting for next round..." indicator

6. **Final Results Screen**
   - Full leaderboard (all 15 teams)
   - Winner celebration state
   - Team's journey summary (optional)

7. **Facilitator Control Panel** (PIN-protected)
   - PIN entry screen before accessing controls
   - Game configuration (number of teams: 10-20)
   - Game state indicator
   - Round controls (start/pause/resume/end)
   - Event trigger buttons
   - Overview of how many teams have submitted

---

## Technical Considerations

### Architecture
- **Frontend:** React + TypeScript (per project tech stack)
- **State Management:** Zustand for local state; consider real-time sync solution
- **Real-time:** WebSocket or Server-Sent Events for facilitator → team communication
- **Backend:** Node.js + Express for game state management and calculations
- **Data:** Decision cards loaded from JSON configuration file

### Key Technical Decisions

1. **Game state management:** Central server holds authoritative game state; clients subscribe to updates
2. **Timer synchronization:** Server broadcasts remaining time; clients display but don't control
3. **Calculation engine:** Backend calculates all financial outcomes (not in client)
4. **Decision card data:** 75 cards defined in JSON/TypeScript config based on Excel data

### Data Model (Conceptual)

```typescript
interface GameState {
  status: 'lobby' | 'active' | 'paused' | 'results' | 'finished';
  currentRound: number; // 1-5
  roundTimeRemaining: number; // seconds
  teams: TeamState[];
  scenario: ScenarioState;
}

interface TeamState {
  teamId: number; // 1-15
  cashBalance: number;
  decisions: Decision[]; // decisions made this round
  allDecisions: Decision[]; // all decisions across rounds
  metrics: FinancialMetrics;
  stockPrice: number;
  cumulativeTSR: number;
}

interface Decision {
  id: string;
  category: 'grow' | 'optimize' | 'sustain';
  name: string;
  narrative: string;
  cost: number;                    // one-time cost in $M
  impactMagnitude: number;         // 1-5 scale
  introducedYear: number;          // 1-5, which round this card appears
  type: 'organic' | 'inorganic';
  guidingPrinciple: string;
  isRisky: boolean;                // if true, has probabilistic outcome
  
  // Duration & Timing
  durationYears: 1 | 2;            // how many years of cost commitment
  rampUpYears: 1 | 2 | 3;          // years until full impact realized
  isOneTimeBenefit: boolean;       // true for divestitures
  
  // Impact specifics (for calculation engine)
  revenueImpact?: number;          // % change to revenue (Grow decisions)
  cogsImpact?: number;             // % change to COGS (Optimize decisions)
  sgaImpact?: number;              // % change to SG&A (Optimize decisions)
  recurringBenefit?: number;       // annual $M benefit after ramp-up
  riskPrevention?: string;         // which risk event this prevents (Sustain)
}

interface FinancialMetrics {
  // Income Statement
  revenue: number;
  cogs: number;
  sga: number;
  ebitda: number;
  depreciation: number;
  amortization: number;
  ebit: number;
  // Cash Flow
  cashTaxes: number;
  capex: number;
  operatingFCF: number;
  beginningCash: number;
  endingCash: number;
  // Valuation
  npv: number;           // Enterprise Value
  equityValue: number;
  sharesOutstanding: number;
  sharePrice: number;
  // Derived
  ebitMargin: number;    // EBIT / Revenue
  roic: number;          // calculated
}
```

### Performance Requirements
- Timer updates: At least 1 update/second visible to users
- Decision submission: < 500ms response time
- Round transition: < 2 seconds for all clients to sync

---

## Financial Model

### Starting Position (2025 EOY Baseline)

All teams start with Magna's simplified 2025 financials (USD Millions):

**Simplified Income Statement:**
| Metric | 2025 Baseline |
|--------|---------------|
| Revenue | $42,836 |
| COGS | ($37,037) |
| SG&A | ($2,061) |
| **EBITDA** | **$3,738** |
| Depreciation | ($1,510) |
| Amortization | ($112) |
| **EBIT** | **$2,116** |

**Simplified Cash Flow Statement:**
| Metric | 2025 Baseline |
|--------|---------------|
| Cash Taxes | ($466) |
| CapEx | ($1,713) |
| **Operating FCF** | **$1,561** |
| Beginning Cash | $1,247 |

**Valuation:**
| Metric | 2025 Baseline |
|--------|---------------|
| NPV / Enterprise Value | $22,738 |
| Equity Value | $14,164 |
| Shares Outstanding | 287M |
| **Share Price** | **$49.29** |

### Scoring Logic

**Primary metric:** Increase in NPV (Enterprise Value) over the game period

**Secondary factor:** Investor expectations management — teams communicate expectations to "investors" which creates slight noise around outcomes. Managing expectations well (under-promise, over-deliver) improves TSR slightly; over-promising and under-delivering penalizes.

**TSR Calculation:** 
```
TSR = (Ending Share Price - Starting Share Price + Dividends) / Starting Share Price
```

Share price derived from: `Equity Value / Shares Outstanding`

### Decision Impact Model

| Category | Primary Impact | Secondary Effects |
|----------|---------------|-------------------|
| **Grow** | ↑ Revenue | May increase CapEx, may dilute ROIC short-term |
| **Optimize** | ↓ Costs (COGS or SG&A) | Improves margins, may require upfront investment |
| **Sustain** | Prevents value destruction | No upside, but avoids downside risk events |

**FCF Dynamics:**
- FCF is NOT fixed per round — it varies based on:
  - Previous round's business outcomes
  - Investment decisions made (CapEx commitments)
  - Scenario conditions (recession reduces cash generation)
- Teams must manage cash carefully; overspending in early rounds may leave them vulnerable

---

## Success Metrics

| Metric | Target |
|--------|--------|
| All 15 teams can submit decisions | 100% of rounds |
| Round transitions complete without errors | 100% |
| Teams understand how to use interface | < 2 min onboarding |
| Session completes within 120 minutes | Yes |
| Debrief reveals meaningful decision variance | Teams make different choices |

---

## Open Questions

All key questions have been answered. See relevant sections throughout the PRD.

### Resolved Questions Log
1. ✅ **Starting financials** — See Financial Model section
2. ✅ **Cash per round** — FCF varies based on investments and business outcomes
3. ✅ **Scoring formula** — Based on NPV increase, with noise from investor expectations
4. ✅ **Decision impacts** — Grow→Revenue, Optimize→Costs, Sustain→Risk prevention
5. ✅ **Scenario modifiers** — Category-specific (Grow hit harder in recession than Optimize)
6. ✅ **Risky cards** — Flagged within the 75 decisions
7. ✅ **Card availability** — 15 cards per round (5 Grow / 5 Optimize / 5 Sustain)
8. ✅ **Multi-year decisions** — 1-2 year durations; one-time costs with recurring benefits
9. ✅ **Facilitator access** — Password/PIN protected admin mode
10. ✅ **Team count** — Configurable 10-20 teams

---

## Appendix: Decision Card Categories (from Excel)

### Grow (25 decisions)
Subcategories include:
- Scale R&D for Next-Gen Portfolio
- Acquire a Business
- JV / Strategic Partnership
- Enter New Geography / Market
- Expand Manufacturing Footprint
- Launch a New Business
- Platform-Level Technology Bets

### Optimize (25 decisions)
Subcategories include:
- SG&A Optimization
- Organizational Restructure
- Enterprise Digital Transformation
- Factory of the Future
- Select Group Transformation
- Divest Group
- Global Supply Chain Redesign

### Sustain (25 decisions)
Subcategories include:
- Risk & Compliance Upgrade
- Talent & Leadership Upskilling
- Capital allocation strategy (maintenance)
- Portfolio management (maintenance)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-01-16 | AI + Adam | Initial PRD draft |
| 0.2 | 2026-01-17 | AI + Adam | Added learning framework: guiding principles, KPI scorecard, scenario dynamics, special events |