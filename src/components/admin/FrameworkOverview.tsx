/**
 * FrameworkOverview Component
 * 
 * Executive-ready visualization of the learning framework:
 * - Guiding Principles & Lessons
 * - KPI Scorecard
 * - Macro Dynamics (Scenarios)
 * - Special Events & Decision Mapping
 */

import React, { useState } from 'react';
import { 
  ArrowLeft,
  Target,
  TrendingUp,
  Shield,
  Wallet,
  Gauge,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BarChart3,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagnaLogo } from '../MagnaLogo';

interface FrameworkOverviewProps {
  onBack: () => void;
  className?: string;
}

type DetailView = 'landing' | 'principles' | 'kpis' | 'scenarios' | 'events';

// =============================================================================
// DATA
// =============================================================================

const GUIDING_PRINCIPLES = [
  {
    id: 'long-term',
    name: 'Long-Term Ownership Mentality',
    icon: Target,
    color: 'from-blue-500 to-blue-600',
    description: 'Incentives aligned to execution and long-term value; partnership-driven approach with OEMs',
    behaviors: [
      'Avoid short-term cuts that destroy long-term value',
      'Maintain investment capacity through cycles',
      'Position for recovery before it happens',
    ],
    lessons: ['Position for recovery'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio Management',
    icon: BarChart3,
    color: 'from-emerald-500 to-emerald-600',
    description: 'Target attractive markets; back leaders with path to profitable growth; exit non-core assets',
    behaviors: [
      'Diversify across customers, suppliers, geographies',
      'Actively manage portfolio composition',
      'Exit underperforming or non-strategic assets',
    ],
    lessons: ['Diversification pays off'],
  },
  {
    id: 'balance-sheet',
    name: 'Maintain Strong Balance Sheet',
    icon: Shield,
    color: 'from-amber-500 to-amber-600',
    description: 'Protect liquidity and investment-grade leverage (Debt/EBITDA: 1.0-1.5x)',
    behaviors: [
      'Preserve cash optionality',
      'Maintain flexibility through cycles',
      'Enable opportunistic moves during downturns',
    ],
    lessons: ['Cash optionality matters', 'Balance sheet flexibility enables opportunism'],
  },
  {
    id: 'capital-allocation',
    name: 'Capital Allocation Strategy',
    icon: Wallet,
    color: 'from-magna-red to-red-600',
    description: 'Maximize long-term FCF per share; prioritize profitable growth',
    behaviors: [
      'Margin improvement over volume growth',
      'Return excess capital appropriately',
      'Invest behind defensible advantages',
    ],
    lessons: ['Margin expansion > Growth'],
  },
];

const KPI_SCORECARD = [
  { name: 'Growth over Market', target: '2-4%', green: '2-4%', yellow: '<2%', red: 'Chasing volume' },
  { name: 'EBIT Margin', target: '≥10%', green: '≥10%', yellow: '8-10%', red: '<8%' },
  { name: 'CapEx to Sales', target: '4-4.5%', green: '4-4.5%', yellow: 'Under-investing', red: 'Over-investing' },
  { name: 'FCF Conversion', target: '>70%', green: '≥70%', yellow: '50-70%', red: '<50%' },
  { name: 'ROIC', target: '≥15%', green: '≥15%', yellow: '12-15%', red: '<12%' },
  { name: 'Debt / EBITDA', target: '1.0-1.5x', green: '1.0-1.5x', yellow: '-', red: 'Overleveraged' },
];

const SCENARIOS = [
  {
    round: 1,
    year: 2026,
    name: 'Business as Usual',
    description: 'Stable market, technology evolution underway',
    smartResponse: 'Balance growth & optimization; build foundation',
    trap: 'Over-investing in risky growth bets too early',
    multipliers: { grow: 1.0, optimize: 1.0, sustain: 1.0 },
  },
  {
    round: 2,
    year: 2027,
    name: 'Business as Usual',
    description: 'Continued stability; investments ramping',
    smartResponse: 'Execute on strategy; diversify OEM exposure',
    trap: 'Concentrating on single OEM relationships (BAIT CARD!)',
    multipliers: { grow: 1.0, optimize: 1.0, sustain: 1.0 },
  },
  {
    round: 3,
    year: 2028,
    name: 'Cost Pressure',
    description: 'Raw materials ↑, labor ↑, OEM pushback; OEM program cancellation hits',
    smartResponse: 'Pivot to Optimize decisions; preserve cash',
    trap: 'Doubling down on Grow (penalized at 0.7x!)',
    multipliers: { grow: 0.7, optimize: 1.2, sustain: 1.0 },
  },
  {
    round: 4,
    year: 2029,
    name: 'Recession',
    description: 'Auto sales ↓↓, cash is king',
    smartResponse: 'Sustain investments; opportunistic M&A if cash available',
    trap: 'Aggressive expansion (penalized at 0.5x!)',
    multipliers: { grow: 0.5, optimize: 1.0, sustain: 1.5 },
  },
  {
    round: 5,
    year: 2030,
    name: 'Recovery',
    description: 'Market rebounds, optimism returns',
    smartResponse: 'Grow investments rewarded (1.3x); ride the wave',
    trap: 'Over-defensive play; excessive Sustain (0.8x)',
    multipliers: { grow: 1.3, optimize: 1.0, sustain: 0.8 },
  },
];

const SPECIAL_EVENTS = [
  {
    name: 'OEM Program Cancellation',
    round: 3,
    description: 'Major OEM cancels flagship vehicle program',
    protected: 'Diversified OEM investments',
    punished: 'Concentrated single-OEM investment (R2 bait card)',
    isCritical: true,
  },
  {
    name: 'Supply Chain Disruption',
    round: 3,
    description: 'Major supplier failure disrupts production',
    protected: 'Dual-sourcing, supplier relationships',
    punished: 'Single-source dependencies',
    isCritical: false,
  },
  {
    name: 'Key Customer Loss',
    round: 4,
    description: 'OEM in-sources a key component',
    protected: 'Diversified customer base',
    punished: 'Over-reliance on single customer',
    isCritical: false,
  },
  {
    name: 'Technology Shift',
    round: 2,
    description: 'Technology transition accelerates faster than expected',
    protected: 'Early next-gen portfolio investment',
    punished: 'Underinvestment in technology transition',
    isCritical: false,
  },
  {
    name: 'Regulatory Change',
    round: 3,
    description: 'New environmental regulations announced',
    protected: 'Proactive compliance investments',
    punished: 'Deferred compliance spending',
    isCritical: false,
  },
  {
    name: 'Competitor Acquisition',
    round: 5,
    description: 'Competitor acquired, creating market opportunities',
    protected: 'Have capacity and cash to capture share',
    punished: 'Overleveraged or capacity-constrained',
    isCritical: false,
  },
];

const RISKY_DECISIONS = [
  { name: 'Southeast Asia Market Entry', round: 1, outcome: 'success', actual: '+$100M/yr (slightly below plan)' },
  { name: 'Autonomous Driving Systems Unit', round: 1, outcome: 'fail', actual: '-$50M/yr (technology pivot required)' },
  { name: 'Software-Defined Vehicle Platform', round: 2, outcome: 'success', actual: '+$220M/yr (exceeds expectations)' },
  { name: 'Distressed Competitor Acquisition', round: 3, outcome: 'success', actual: '+$200M/yr (integration challenges)' },
  { name: 'Chinese OEM Partnership', round: 3, outcome: 'fail', actual: '-$80M/yr (geopolitical tensions)' },
  { name: 'Vehicle-to-Grid Services Business', round: 3, outcome: 'success', actual: '+$40M/yr (slower market)' },
  { name: 'Solid-State Battery Research', round: 3, outcome: 'success', actual: '+$150M/yr (breakthrough!)' },
  { name: 'Hydrogen Fuel Cell Alliance', round: 4, outcome: 'success', actual: '+$30M/yr (modest)' },
  { name: 'Deep Cost Restructuring', round: 4, outcome: 'success', actual: '+$130M/yr (some capability damage)' },
  { name: 'Minimum Viable Maintenance', round: 4, outcome: 'fail', actual: '-$100M (equipment failure)' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export const FrameworkOverview: React.FC<FrameworkOverviewProps> = ({ onBack, className }) => {
  const [view, setView] = useState<DetailView>('landing');

  return (
    <div className={cn("min-h-screen bg-magna-darker", className)}>
      {/* Header */}
      <header className="bg-magna-dark border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={view === 'landing' ? onBack : () => setView('landing')}
                className="flex items-center gap-2 text-magna-gray hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {view === 'landing' ? 'Back to Dashboard' : 'Back to Overview'}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <MagnaLogo variant="white" size="xs" />
              <span className="text-white font-semibold">Principles, Lessons & Dynamics</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'landing' && <LandingView onNavigate={setView} />}
        {view === 'principles' && <PrinciplesView />}
        {view === 'kpis' && <KPIsView />}
        {view === 'scenarios' && <ScenariosView />}
        {view === 'events' && <EventsView />}
      </main>
    </div>
  );
};

// =============================================================================
// LANDING VIEW
// =============================================================================

const LandingView: React.FC<{ onNavigate: (view: DetailView) => void }> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'principles' as DetailView,
      title: 'Guiding Principles & Lessons',
      description: "Magna's 4 strategic principles and the 5 core lessons the game teaches",
      icon: Lightbulb,
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      id: 'kpis' as DetailView,
      title: 'KPI Scorecard',
      description: 'Financial framework targets teams are assessed against',
      icon: Gauge,
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'scenarios' as DetailView,
      title: 'Macro Dynamics',
      description: 'Round-by-round scenarios, multipliers, and expected responses',
      icon: Calendar,
      color: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      id: 'events' as DetailView,
      title: 'Events & Risk Outcomes',
      description: 'Special events, bait cards, and pre-determined risky decision outcomes',
      icon: Zap,
      color: 'from-magna-red/20 to-red-600/20',
      borderColor: 'border-magna-red/30',
      iconColor: 'text-magna-red',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Learning Framework
        </h1>
        <p className="text-xl text-magna-gray max-w-2xl mx-auto">
          The strategic principles and game dynamics designed to create memorable, 
          actionable learning for Magna's leadership team.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={cn(
              "group relative bg-gradient-to-br p-8 rounded-2xl border transition-all duration-300",
              "hover:scale-[1.02] hover:shadow-xl",
              card.color,
              card.borderColor
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl bg-black/30 flex items-center justify-center",
                card.iconColor
              )}>
                <card.icon className="w-7 h-7" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-magna-gray">{card.description}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-magna-gray group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-4 gap-4">
        {[
          { label: '4', sublabel: 'Guiding Principles' },
          { label: '5', sublabel: 'Core Lessons' },
          { label: '5', sublabel: 'Rounds/Scenarios' },
          { label: '6', sublabel: 'Special Events' },
        ].map((stat, i) => (
          <div key={i} className="bg-magna-dark border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-magna-red mb-1">{stat.label}</div>
            <div className="text-sm text-magna-gray">{stat.sublabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// PRINCIPLES VIEW
// =============================================================================

const PrinciplesView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Guiding Principles & Lessons</h2>
      <p className="text-magna-gray mb-8">The game reinforces Magna's strategic framework through experiential learning.</p>

      <div className="space-y-6">
        {GUIDING_PRINCIPLES.map((principle) => (
          <div
            key={principle.id}
            className="bg-magna-dark border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className={cn("bg-gradient-to-r p-6", principle.color)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <principle.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{principle.name}</h3>
                  <p className="text-white/80 text-sm">{principle.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-magna-gray uppercase tracking-wide mb-3">
                    Key Behaviors
                  </h4>
                  <ul className="space-y-2">
                    {principle.behaviors.map((behavior, i) => (
                      <li key={i} className="flex items-start gap-2 text-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {behavior}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-magna-gray uppercase tracking-wide mb-3">
                    Related Lessons
                  </h4>
                  <div className="space-y-2">
                    {principle.lessons.map((lesson, i) => (
                      <div key={i} className="bg-black/30 rounded-xl px-4 py-3 text-magna-red font-medium">
                        {lesson}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Core Lesson Summary */}
      <div className="mt-8 bg-magna-red/10 border border-magna-red/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-magna-red mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Key Insight for MGA
        </h3>
        <p className="text-white text-lg">
          <strong>Margin improvement is worth much more than growth</strong> based on Magna's position on the growth spread matrix 
          (ROIC slightly above WACC). Teams who prioritize Optimize decisions over Grow decisions will tend to outperform.
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// KPIs VIEW
// =============================================================================

const KPIsView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">KPI Scorecard</h2>
      <p className="text-magna-gray mb-8">Teams are assessed against Magna's Financial Framework targets.</p>

      <div className="bg-magna-dark border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-black/30">
              <th className="text-left p-4 text-magna-gray font-semibold">KPI</th>
              <th className="text-center p-4 text-magna-gray font-semibold">Target</th>
              <th className="text-center p-4 text-emerald-400 font-semibold">🟢 On Track</th>
              <th className="text-center p-4 text-amber-400 font-semibold">🟡 Warning</th>
              <th className="text-center p-4 text-red-400 font-semibold">🔴 Off Track</th>
            </tr>
          </thead>
          <tbody>
            {KPI_SCORECARD.map((kpi, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="p-4 text-white font-medium">{kpi.name}</td>
                <td className="p-4 text-center text-magna-red font-bold">{kpi.target}</td>
                <td className="p-4 text-center text-emerald-400">{kpi.green}</td>
                <td className="p-4 text-center text-amber-400">{kpi.yellow}</td>
                <td className="p-4 text-center text-red-400">{kpi.red}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Framework */}
      <div className="mt-8 bg-magna-dark border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Financial Framework to Drive Value</h3>
        <div className="flex items-center justify-center gap-4">
          <div className="bg-black/30 rounded-2xl p-6 text-center w-48">
            <TrendingUp className="w-8 h-8 text-magna-gray mx-auto mb-2" />
            <div className="text-white font-semibold">Sales Growth</div>
            <div className="text-magna-gray text-sm">Over Market</div>
          </div>
          <div className="text-4xl text-magna-red font-bold">+</div>
          <div className="bg-black/30 rounded-2xl p-6 text-center w-48">
            <BarChart3 className="w-8 h-8 text-magna-gray mx-auto mb-2" />
            <div className="text-white font-semibold">Profitability</div>
            <div className="text-magna-gray text-sm">Top 25% of Peers</div>
          </div>
          <div className="text-4xl text-magna-red font-bold">=</div>
          <div className="bg-magna-red rounded-2xl p-6 text-center w-48">
            <Target className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-white font-bold">Profitable</div>
            <div className="text-white/80 text-sm">Growth</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SCENARIOS VIEW
// =============================================================================

const ScenariosView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Macro Dynamics</h2>
      <p className="text-magna-gray mb-8">Round-by-round scenarios and the strategic responses they reward or punish.</p>

      {/* Timeline */}
      <div className="space-y-4">
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.round}
            className="bg-magna-dark border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start gap-6">
              {/* Round Badge */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-magna-red rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{scenario.round}</span>
                  <span className="text-xs text-white/80">{scenario.year}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{scenario.name}</h3>
                  {scenario.round === 3 && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                      OEM CANCELLATION
                    </span>
                  )}
                </div>
                <p className="text-magna-gray mb-4">{scenario.description}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
                      <CheckCircle2 className="w-4 h-4" /> Smart Response
                    </div>
                    <p className="text-white">{scenario.smartResponse}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-1">
                      <XCircle className="w-4 h-4" /> Trap to Avoid
                    </div>
                    <p className="text-white">{scenario.trap}</p>
                  </div>
                </div>

                {/* Multipliers */}
                <div className="flex gap-3">
                  <MultiplierBadge label="Grow" value={scenario.multipliers.grow} />
                  <MultiplierBadge label="Optimize" value={scenario.multipliers.optimize} />
                  <MultiplierBadge label="Sustain" value={scenario.multipliers.sustain} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Multiplier Legend */}
      <div className="mt-8 bg-black/30 border border-white/10 rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-magna-gray uppercase tracking-wide mb-4">
          Multiplier Impact
        </h4>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-white">&gt;1.0x = Outperforms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-magna-gray rounded-full" />
            <span className="text-white">1.0x = Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-white">&lt;1.0x = Underperforms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiplierBadge: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color = value > 1 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    : value < 1 ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : 'bg-white/10 text-magna-gray border-white/20';
  
  return (
    <div className={cn("px-3 py-1.5 rounded-lg border text-sm font-medium", color)}>
      {label}: {value}x
    </div>
  );
};

// =============================================================================
// EVENTS VIEW
// =============================================================================

const EventsView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Events & Risk Outcomes</h2>
      <p className="text-magna-gray mb-8">Special events and pre-determined outcomes for risky decisions.</p>

      {/* Special Events */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Special Events
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {SPECIAL_EVENTS.map((event, i) => (
            <div
              key={i}
              className={cn(
                "bg-magna-dark border rounded-xl p-5",
                event.isCritical ? "border-amber-500/50" : "border-white/10"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-white">{event.name}</h4>
                <span className="text-xs bg-black/30 text-magna-gray px-2 py-1 rounded">
                  Round {event.round}
                </span>
              </div>
              <p className="text-magna-gray text-sm mb-3">{event.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-400">{event.protected}</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-red-400">{event.punished}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bait Card Callout */}
      <div className="mb-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Round 2 Bait Cards
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-4">
            <div className="text-emerald-400 font-semibold mb-2">Diversified OEM Capacity Investment</div>
            <div className="text-magna-gray text-sm mb-2">Cost: $200M | Return: +$80M/yr</div>
            <div className="text-white text-sm">✓ Spreads risk across multiple OEMs - PROTECTED from cancellation</div>
          </div>
          <div className="bg-black/30 rounded-xl p-4">
            <div className="text-red-400 font-semibold mb-2">Concentrated OEM Capacity Investment</div>
            <div className="text-magna-gray text-sm mb-2">Cost: $180M | Projected: +$120M/yr</div>
            <div className="text-white text-sm">✗ Looks better but → <strong className="text-red-400">$0 return</strong> when OEM cancels in R3</div>
          </div>
        </div>
      </div>

      {/* Risky Decision Outcomes */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Risky Decision Outcomes (Pre-Determined)
        </h3>
        <p className="text-magna-gray text-sm mb-4">
          3 of 10 risky decisions fail (30% failure rate) - teaching that high-risk bets should be selective.
        </p>
        <div className="bg-magna-dark border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-black/30">
                <th className="text-left p-4 text-magna-gray font-semibold">Decision</th>
                <th className="text-center p-4 text-magna-gray font-semibold">Round</th>
                <th className="text-center p-4 text-magna-gray font-semibold">Outcome</th>
                <th className="text-left p-4 text-magna-gray font-semibold">Actual Result</th>
              </tr>
            </thead>
            <tbody>
              {RISKY_DECISIONS.map((decision, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-4 text-white">{decision.name}</td>
                  <td className="p-4 text-center text-magna-gray">{decision.round}</td>
                  <td className="p-4 text-center">
                    {decision.outcome === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <XCircle className="w-4 h-4" /> Fails
                      </span>
                    )}
                  </td>
                  <td className={cn(
                    "p-4",
                    decision.outcome === 'success' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {decision.actual}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

FrameworkOverview.displayName = 'FrameworkOverview';
