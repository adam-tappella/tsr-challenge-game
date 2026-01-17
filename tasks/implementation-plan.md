# Implementation Plan: Magna TSR Challenge

## Overview

This document breaks the PRD into implementable phases and tasks. Each phase builds on the previous, allowing for incremental testing.

**Estimated Total Effort:** 4-6 development sprints (depending on team size)

---

## Phase 1: Foundation & Data Layer
*Goal: Set up project structure, data models, and decision card configuration*

### Task 1.1: Project Setup
- [ ] Initialize backend (Node.js + Express + TypeScript)
- [ ] Initialize frontend (React + Vite + TypeScript) — if not already done
- [ ] Set up shared types package or file for common interfaces
- [ ] Configure WebSocket library (e.g., Socket.IO)
- [ ] Set up development scripts (`npm run dev`, `npm run dev:backend`)

### Task 1.2: Data Models & Types
- [ ] Create `Decision` interface (all attributes from PRD)
- [ ] Create `GameState` interface
- [ ] Create `TeamState` interface
- [ ] Create `FinancialMetrics` interface
- [ ] Create `ScenarioState` interface

### Task 1.3: Decision Card Data
- [ ] Create JSON/TypeScript config file for 75 decision cards
- [ ] Parse Excel data into structured format
- [ ] Validate all cards have required attributes
- [ ] Organize by category (Grow/Optimize/Sustain) and introducedYear (1-5)

### Task 1.4: Financial Baseline Data
- [ ] Create config for 2025 EOY baseline financials
- [ ] Create config for scenario modifiers (multipliers per round)
- [ ] Create config for game settings (team count range, round duration, PIN)

---

## Phase 2: Backend Core
*Goal: Implement game state management and real-time communication*

### Task 2.1: Game State Manager
- [ ] Create in-memory game state store
- [ ] Implement state transitions: `lobby` → `active` → `paused` → `results` → `finished`
- [ ] Implement round progression logic (1 → 2 → 3 → 4 → 5)
- [ ] Implement team registration (claim team number)
- [ ] Implement decision submission per team per round

### Task 2.2: WebSocket Server
- [ ] Set up Socket.IO server
- [ ] Implement `join-game` event (team claims number)
- [ ] Implement `submit-decisions` event
- [ ] Implement `game-state-update` broadcast
- [ ] Implement `timer-tick` broadcast (every second during active round)
- [ ] Handle reconnection (team rejoins with same ID)

### Task 2.3: Facilitator API
- [ ] `POST /admin/auth` — PIN verification
- [ ] `POST /admin/config` — Set team count
- [ ] `POST /admin/start-game` — Begin Round 1
- [ ] `POST /admin/pause` — Pause current round
- [ ] `POST /admin/resume` — Resume paused round
- [ ] `POST /admin/end-round` — Force-end current round
- [ ] `POST /admin/next-round` — Advance to next round
- [ ] `POST /admin/trigger-event` — Trigger scenario event
- [ ] `GET /admin/status` — Get current game state + team submission status

### Task 2.4: Timer System
- [ ] Implement server-side countdown timer
- [ ] Broadcast remaining time to all clients
- [ ] Auto-trigger round end when timer hits 0
- [ ] Support pause/resume of timer

---

## Phase 3: Financial Calculation Engine
*Goal: Implement the math that turns decisions into outcomes*

### Task 3.1: Round Calculation Logic
- [ ] Calculate FCF available for round based on previous state
- [ ] Apply decision costs to team's cash balance
- [ ] Track multi-year investment commitments

### Task 3.2: Decision Impact Calculations
- [ ] Implement Grow decision impacts (revenue changes)
- [ ] Implement Optimize decision impacts (COGS/SG&A changes)
- [ ] Implement Sustain decision impacts (risk prevention flags)
- [ ] Apply scenario multipliers based on current round
- [ ] Handle ramp-up timing (30% → 70% → 100%)

### Task 3.3: Financial Metrics Roll-Forward
- [ ] Calculate new Revenue based on decisions + scenario
- [ ] Calculate new COGS, SG&A
- [ ] Calculate EBITDA, EBIT
- [ ] Calculate Operating FCF
- [ ] Update cash balance

### Task 3.4: Valuation & Scoring
- [ ] Calculate NPV / Enterprise Value (simplified DCF or multiple)
- [ ] Calculate Equity Value
- [ ] Calculate Share Price
- [ ] Calculate round TSR and cumulative TSR
- [ ] Rank teams by TSR

### Task 3.5: Risk Event Resolution
- [ ] Pre-determine which risky event triggers at game start
- [ ] Reveal risky outcomes during results phase
- [ ] Apply negative impacts if triggered

### Task 3.6: Final Simulation (Years 2031-2035)
- [ ] Implement auto-pilot logic for post-Round 5 simulation
- [ ] Project financial metrics forward 5 years
- [ ] Calculate final TSR

---

## Phase 4: Frontend — Team Experience
*Goal: Build the team-facing UI*

### Task 4.1: App Shell & Routing
- [ ] Set up React Router (or TanStack Router)
- [ ] Create routes: `/`, `/game`, `/admin`
- [ ] Create layout component with header
- [ ] Set up Zustand store for client-side state
- [ ] Connect to WebSocket server

### Task 4.2: Team Selection Screen
- [ ] Display list of available team numbers
- [ ] Show which teams are already claimed (disabled)
- [ ] "Join Game" button
- [ ] Transition to lobby after joining

### Task 4.3: Lobby/Waiting Screen
- [ ] Display team name/number
- [ ] "Waiting for game to start..." message
- [ ] Listen for game start event

### Task 4.4: Decision Screen — Layout
- [ ] Header: Team name, Starting Cash, Remaining Cash, Timer
- [ ] Three collapsible sections: Grow / Optimize / Sustain
- [ ] Card grid within each section
- [ ] "Submit Decisions" button (sticky footer)

### Task 4.5: Decision Cards
- [ ] Card component showing: name, cost, brief description
- [ ] Visual state: available, selected, disabled (can't afford)
- [ ] "Risky" badge for flagged cards
- [ ] Click to select/deselect
- [ ] Update remaining cash on selection

### Task 4.6: Card Detail Modal/Flip
- [ ] Full narrative text
- [ ] Impact details (revenue/cost impact, duration, ramp-up)
- [ ] Guiding principle tag
- [ ] Select/deselect button
- [ ] Close/back button

### Task 4.7: Decision Submission
- [ ] Validate selections don't exceed cash
- [ ] Submit button sends decisions to server
- [ ] Show confirmation state after submission
- [ ] Disable further changes after submission
- [ ] Handle auto-submit on timer expiry

### Task 4.8: Round Results Screen
- [ ] Display updated financial metrics with deltas (↑↓)
- [ ] Display round TSR and cumulative TSR
- [ ] Display team rank (e.g., "3rd of 15")
- [ ] Display scenario narrative text
- [ ] "Waiting for next round..." indicator

### Task 4.9: Final Results Screen
- [ ] Full leaderboard (all teams ranked)
- [ ] Highlight winner (1st place)
- [ ] Show team's final stock price and total TSR
- [ ] Celebration animation for winner (subtle, professional)

---

## Phase 5: Frontend — Facilitator Admin
*Goal: Build the facilitator control panel*

### Task 5.1: Admin Route & PIN Entry
- [ ] `/admin` route
- [ ] PIN input form
- [ ] Verify PIN against backend
- [ ] Store auth state (session)
- [ ] Redirect to controls on success

### Task 5.2: Game Configuration
- [ ] Team count selector (10-20)
- [ ] Display which teams have joined
- [ ] Round duration setting (optional)
- [ ] "Lock Configuration & Start Game" button

### Task 5.3: Round Controls
- [ ] Current round indicator
- [ ] Timer display
- [ ] Buttons: Start Round, Pause, Resume, End Round, Next Round
- [ ] Disable buttons based on current state

### Task 5.4: Event Triggers
- [ ] Buttons to trigger scenario events
- [ ] Visual confirmation when event is triggered

### Task 5.5: Status Dashboard
- [ ] List of all teams
- [ ] Submission status per team (submitted / pending)
- [ ] Team count summary (e.g., "12/15 submitted")

---

## Phase 6: Polish & Testing
*Goal: Ensure reliability and smooth experience*

### Task 6.1: Error Handling
- [ ] Handle WebSocket disconnection gracefully
- [ ] Show reconnection indicator
- [ ] Handle submission failures with retry
- [ ] Validate all inputs

### Task 6.2: Loading & Transition States
- [ ] Loading spinners during async operations
- [ ] Smooth transitions between game phases
- [ ] Timer animations

### Task 6.3: Responsive Adjustments
- [ ] Ensure laptop screen compatibility (1366x768 minimum)
- [ ] Test on common resolutions

### Task 6.4: End-to-End Testing
- [ ] Test full game flow with multiple browser tabs (simulating teams)
- [ ] Test facilitator controls
- [ ] Test edge cases (timer expiry, reconnection, rapid submissions)

### Task 6.5: Performance Testing
- [ ] Verify timer sync < 1 second drift
- [ ] Verify submission response < 500ms
- [ ] Verify round transition < 2 seconds

---

## Phase 7: Decision Card Population
*Goal: Finalize all 75 decision cards with accurate data*

### Task 7.1: Grow Decisions (25)
- [ ] Complete all attributes for each card
- [ ] Assign to correct round (introducedYear)
- [ ] Set impact values
- [ ] Flag risky cards

### Task 7.2: Optimize Decisions (25)
- [ ] Complete all attributes for each card
- [ ] Assign to correct round
- [ ] Set impact values
- [ ] Flag risky cards

### Task 7.3: Sustain Decisions (25)
- [ ] Complete all attributes for each card
- [ ] Assign to correct round
- [ ] Set impact values
- [ ] Define which risks each prevents

### Task 7.4: Balance & Tuning
- [ ] Ensure 15 cards available per round (5/5/5)
- [ ] Balance costs across rounds
- [ ] Tune impact values so lessons emerge naturally
- [ ] Playtest and adjust

---

## Suggested Build Order

| Order | Phase | Rationale |
|-------|-------|-----------|
| 1 | Phase 1 (Foundation) | Need data structures before anything |
| 2 | Phase 2 (Backend Core) | Need server before clients |
| 3 | Phase 4.1-4.3 (Team Shell) | Basic connectivity test |
| 4 | Phase 5.1-5.3 (Admin Shell) | Can control game flow |
| 5 | Phase 4.4-4.7 (Decision UI) | Core gameplay |
| 6 | Phase 3 (Calculations) | Turn decisions into results |
| 7 | Phase 4.8-4.9 (Results UI) | Display outcomes |
| 8 | Phase 7 (Card Data) | Populate real content |
| 9 | Phase 6 (Polish) | Final quality pass |

---

## Dependencies & Blockers

| Dependency | Needed For | Status |
|------------|-----------|--------|
| 75 decision card details | Phase 7 | Have Excel structure; need impact values |
| Scenario multiplier tuning | Phase 3 | Have illustrative values; need validation |
| Financial model formula | Phase 3 | Have conceptual; need exact NPV calc |
| Admin PIN value | Phase 5 | TBD |
| Magna brand colors | Phase 4 | TBD |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-01-16 | Initial implementation plan |
