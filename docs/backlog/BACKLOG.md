# TSR Challenge - Development Backlog

> Living document for tracking development tasks, ideas, and improvements.
> Updated: 2026-01-18

---

## 🔥 High Priority (Next Sprint)

### Personalized Round Summary Screens
**Effort:** Large | **Type:** Feature

Add screens between rounds with 4 key elements:

**1. Financial Performance**
- Revenue, earnings, margin, ROIC
- Other key elements of the financial framework (FCF conversion, etc.)
- Year-over-year trends

**2. Performance Drivers (CEO/CFO Style)**
- Narrative explanation like an investor call: "Cost pressures compressed our margins" or "Strong execution on efficiency initiatives drove margin expansion"
- Link results to decisions made and external environment

**3. Analyst Quotes (1-2 per round)**
- Generate fictional analyst commentary on the company's performance
- E.g., "Management's disciplined capital allocation is paying off" or "We're concerned about concentration risk in the customer portfolio"
- *Note: May need templated quotes based on performance patterns*

**4. Performance vs Business Plan**
- Compare actual results to targets (revenue, earnings)
- Load in BP targets for each year (2026-2030)
- Show variance and RAG status

**Dependencies:** 
- Calculation engine needs to output driver attribution
- Need to define BP targets for each year
- Template library for analyst quotes

---

### Projected vs Actual Return System
**Effort:** Medium | **Type:** Feature

Each decision shows a projected return to teams, but actual outcomes vary slightly (pre-determined):
- Some cards outperform projections
- Some underperform
- Adds realism that business cases don't always pan out exactly
- The Round 2 "concentrated OEM" bait card is the extreme example ($120M projected → $0 actual)

**Note:** Data structure designed, just needs calculation engine implementation

---

### Connect Excel Model
**Effort:** Medium | **Type:** Integration

Link the game's calculation engine to the source Excel financial model:
- Import decision card parameters from Excel
- Validate game outputs against Excel calculations
- Enable rapid iteration on financial assumptions

**Questions:** 
- One-time import or live sync?
- Which Excel file is the source of truth?

---

## 📊 Game Content

### Pricing Pressure Event & Cards
**Effort:** Medium | **Type:** Content

Add pricing dynamics to the game:
- **New Event:** "OEM Pricing Pressure" - Major OEM demands 5% price reduction
- **New Decision Cards:**
  - Accept pricing concession (protect volume, hurt margins)
  - Negotiate value-based pricing (risk volume loss)
  - Offer cost-down roadmap (balanced approach)
  
**Learning:** Margin protection vs volume trade-offs

---

### Decision Card Refinements
**Effort:** Small-Medium | **Type:** Content

Review and refine the 75 decision cards:
- [ ] Validate cost/return assumptions are realistic
- [ ] Ensure narratives are compelling and clear
- [ ] Balance difficulty across rounds
- [ ] Add more "trap" cards that teach specific lessons
- [ ] Review guiding principle assignments

---

### Risk Tier Classification System
**Effort:** Medium | **Type:** Content + Feature

Categorize all 75 decision cards into risk tiers with probability-based outcomes:

| Tier | Success Rate | Player Guidance |
|------|--------------|-----------------|
| Low Risk | ~90% | "High confidence" |
| Medium Risk | ~75% | "Moderate uncertainty" |
| High Risk | ~20% | "Speculative bet" |

**Implementation:**
- [ ] Classify each card into a risk tier
- [ ] Display risk tier indicator on card UI
- [ ] Pre-determine outcomes so actual success rates match guidance (~90%, ~75%, ~20%)
- [ ] Update calculation engine to apply outcomes based on tier
- [ ] Validate distribution across rounds (not all high-risk in one round)

**Note:** Replaces current binary "isRisky" flag with more nuanced 3-tier system

---

## 🧪 Analysis & Validation

### Monte Carlo Simulation
**Effort:** Medium | **Type:** Analysis

Run simulations to validate game balance:
- Simulate 1000+ games with random decision combinations
- Identify dominant strategies (if any)
- Ensure lesson-aligned strategies actually outperform
- Validate multiplier effects create meaningful differentiation
- Check for edge cases or broken combinations

**Output:** Balance report + recommended tuning

---

### Playtesting Session
**Effort:** Small | **Type:** Validation

Conduct internal playtest before the event:
- [ ] Test with 3-5 people playing different strategies
- [ ] Time each phase (is 10 min/round enough?)
- [ ] Identify confusing UI elements
- [ ] Document feedback for iteration

---

## 🎨 UX & Polish

### Update Web Design to Match Brand Standards
**Effort:** Medium | **Type:** UX

Align the app's visual design with Magna's official brand guidelines:
- [ ] Review Magna brand guidelines (colors, typography, logo usage)
- [ ] Update color palette to match official brand colors
- [ ] Update fonts to brand-approved typefaces
- [ ] Ensure logo usage follows guidelines
- [ ] Review overall look/feel for executive presentation quality

**Reference:** `mck-branding/` folder in repo

---

### Instructions Page
**Effort:** Small | **Type:** UX

Add a simple instructions page accessible at any time:
- Explain game flow (5 rounds, decision categories, scoring)
- How to read decision cards
- What the timer means
- Accessible via button/link from main game screens

---

### Timer Warnings
**Effort:** Small | **Type:** UX

Add escalating warnings as round timer runs low:
- 2 minutes: Yellow warning
- 1 minute: Orange warning + subtle pulse
- 30 seconds: Red warning + more urgent pulse
- 10 seconds: Countdown overlay

---

## 🔧 Technical Debt

### Type Consistency
**Effort:** Small | **Type:** Tech Debt

- Ensure frontend and backend type definitions stay in sync
- Consider shared types package or code generation

---

### Error Handling
**Effort:** Small | **Type:** Tech Debt

- Add graceful error handling for network issues
- Reconnection logic for dropped WebSocket connections
- Clear error messages for facilitator

---

## 📱 Future Features (Post-MVP)

### Facilitator Projector/Output Screen
**Effort:** Large | **Type:** Feature

Large-screen display for the room with dynamic and static elements:

**Dynamic Center Content:**
- Countdown clock (prominent, real-time)
- Moving stock prices (animated ticker or live updating)
- Live leaderboard (team rankings, updates as results come in)
- Aggregate submission status

**Static Side Panels:**
- **Left side:** Static PPT slide for current round context
- **Right side:** Static PPT slide for current round context
- Different slides loaded per round (Round 1-5)

**Layout:** PPT (left) | Live Game Data (center) | PPT (right)

**Note:** Designed for projection in conference room alongside facilitator's admin view

---

### Results Export
After game ends:
- Export full results to Excel/CSV
- Generate PDF summary report
- Capture decision history per team

---

### Replay Mode
Review completed games:
- Step through rounds
- See each team's decisions
- Analyze what drove outcomes

---

## ✅ Completed

### Learning Framework & Admin Visualization
**Completed:** 2026-01-18

- Added 4 Guiding Principles to PRD
- Created KPI Scorecard
- Documented scenario dynamics with multipliers
- Added special events including OEM Program Cancellation
- Created Round 2 bait cards (diversified vs concentrated)
- Built admin "Principles & Dynamics" graphics section

---

### Remove EV References
**Completed:** 2026-01-18

Replaced EV-specific language with technology-agnostic terms for credibility.

---

## Categories Reference

| Tag | Meaning |
|-----|---------|
| **Feature** | New functionality |
| **Content** | Game cards, events, narratives |
| **UX** | User experience improvements |
| **Integration** | External system connections |
| **Analysis** | Validation, testing, simulation |
| **Tech Debt** | Code cleanup, refactoring |
