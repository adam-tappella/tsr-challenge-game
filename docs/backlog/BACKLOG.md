# TSR Challenge - Development Backlog

> Living document for tracking development tasks, ideas, and improvements.
> Updated: 2026-01-18

---

## 🔥 High Priority (Next Sprint)

### Personalized Round Summary Screens
**Effort:** Large | **Type:** Feature

Add screens between rounds that highlight each team's performance against Magna's business plan:
- Show KPI scorecard (EBIT Margin, ROIC, FCF Conversion, etc.) with RAG status
- Explain what drove their results (decisions made + external environment)
- Assessment of alignment to the 4 Guiding Principles
- Narrative feedback on strategic positioning

**Dependencies:** Calculation engine needs to output principle alignment scores

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

### Timer Warnings
**Effort:** Small | **Type:** UX

Add escalating warnings as round timer runs low:
- 2 minutes: Yellow warning
- 1 minute: Orange warning + subtle pulse
- 30 seconds: Red warning + more urgent pulse
- 10 seconds: Countdown overlay

---

### Animations & Transitions
**Effort:** Medium | **Type:** UX

Add polish to key moments:
- Card flip animations
- Round transition effects
- Results reveal (staggered number animations)
- Leaderboard position changes
- Winner celebration

---

### Sound Effects (Optional)
**Effort:** Small | **Type:** UX

Consider audio cues for:
- Timer warnings
- Decision submission confirmation
- Round end fanfare
- Final results

**Note:** May not be appropriate for boardroom setting - make optional

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

### Facilitator Projector View
Large-screen display for the room showing:
- Live leaderboard
- Round timer
- Current scenario narrative
- Aggregate submission status

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
