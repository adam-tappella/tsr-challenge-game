/**
 * DecisionScreen Component
 * 
 * Main game interface where teams make capital allocation decisions.
 * Features:
 * - Header with team info, cash balance, timer
 * - Three category sections (Grow, Optimize, Sustain)
 * - Card grid with selection capability
 * - Submit button
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Shield,
  Send,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  HelpCircle,
  X,
  Target,
  Coins,
  Clock,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore, useCurrentTeam, useRemainingBudget, useSelectedCost } from '@/stores/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { DecisionCard } from './DecisionCard';
import type { Decision, DecisionCategory } from '@/types/game';

interface DecisionScreenProps {
  className?: string;
  isCountdownShowing?: boolean;
}

const CATEGORY_CONFIG: Record<DecisionCategory, {
  label: string;
  icon: typeof TrendingUp;
  description: string;
  gradient: string;
}> = {
  grow: {
    label: 'Grow',
    icon: TrendingUp,
    description: 'Strategic investments to expand capacity, enter new markets, or acquire',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
  optimize: {
    label: 'Optimize',
    icon: Settings,
    description: 'ROI-driven projects for efficiency and margin improvement',
    gradient: 'from-blue-500/20 to-blue-500/5',
  },
  sustain: {
    label: 'Sustain',
    icon: Shield,
    description: 'Non-discretionary investments to maintain operations and prevent risks',
    gradient: 'from-amber-500/20 to-amber-500/5',
  },
};

export const DecisionScreen: React.FC<DecisionScreenProps> = ({ className, isCountdownShowing = false }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<DecisionCategory>>(
    new Set(['grow', 'optimize', 'sustain'])
  );
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showOneMinuteWarning, setShowOneMinuteWarning] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const oneMinuteTriggeredRef = useRef(false);
  
  const team = useCurrentTeam();
  const gameState = useGameStore((s) => s.gameState);
  const teamName = useGameStore((s) => s.teamName);
  const availableDecisions = useGameStore((s) => s.availableDecisions);
  const selectedDecisionIds = useGameStore((s) => s.selectedDecisionIds);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);
  const isSubmitting = useGameStore((s) => s.isSubmitting);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const toggleDecision = useGameStore((s) => s.toggleDecision);
  const setSubmitted = useGameStore((s) => s.setSubmitted);
  
  const remainingBudget = useRemainingBudget();
  const selectedCost = useSelectedCost();
  
  const { submitDecisions, unsubmitDecisions, syncDraftSelections } = useSocket();
  
  // Sync draft selections to backend whenever they change (for auto-submit on timeout)
  useEffect(() => {
    // Only sync if we have a connection and haven't submitted
    if (!hasSubmitted && selectedDecisionIds.size >= 0) {
      syncDraftSelections(Array.from(selectedDecisionIds));
    }
  }, [selectedDecisionIds, hasSubmitted, syncDraftSelections]);
  
  // Trigger 1-minute warning - show for 5 seconds then hide
  useEffect(() => {
    // Trigger warning when time hits 60 seconds (and only once per round)
    if (timeRemaining <= 60 && timeRemaining > 0 && !oneMinuteTriggeredRef.current) {
      oneMinuteTriggeredRef.current = true;
      setShowOneMinuteWarning(true);
      
      // Hide the warning completely after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowOneMinuteWarning(false);
      }, 5000);
      
      return () => clearTimeout(hideTimer);
    }
    
    // Reset trigger when time goes back up (new round)
    if (timeRemaining > 60) {
      oneMinuteTriggeredRef.current = false;
      setShowOneMinuteWarning(false);
    }
  }, [timeRemaining]);
  
  // Group decisions by category
  const decisionsByCategory = useMemo(() => {
    const grouped: Record<DecisionCategory, Decision[]> = {
      grow: [],
      optimize: [],
      sustain: [],
    };
    
    for (const decision of availableDecisions) {
      grouped[decision.category].push(decision);
    }
    
    return grouped;
  }, [availableDecisions]);
  
  // Get selected decisions for confirmation summary
  const selectedDecisions = useMemo(() => {
    return availableDecisions.filter((d) => selectedDecisionIds.has(d.id));
  }, [availableDecisions, selectedDecisionIds]);
  
  // Format time - show full round duration during countdown, actual time otherwise
  const displayTime = isCountdownShowing ? (gameState?.roundDuration || timeRemaining) : timeRemaining;
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(displayTime / 60);
    const seconds = displayTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [displayTime]);
  
  // Toggle category expansion
  const toggleCategory = (category: DecisionCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };
  
  // Handle decision toggle
  const handleToggleDecision = (decisionId: string) => {
    if (hasSubmitted) return;
    toggleDecision(decisionId);
  };
  
  // Handle submit - immediately submit and show confirmation modal
  const handleSubmit = async () => {
    // Prevent double-click during submission
    if (isSubmitting) return;
    
    // If already submitted, just show the confirmation modal
    if (hasSubmitted) {
      setShowConfirmationModal(true);
      return;
    }
    
    if (selectedDecisionIds.size === 0) return;
    
    const decisionIds = Array.from(selectedDecisionIds);
    
    // Show the confirmation modal immediately (optimistic)
    setShowConfirmationModal(true);
    
    // Submit in the background
    const result = await submitDecisions(decisionIds);
    
    if (!result.success) {
      console.error('Submit failed:', result.error);
      // Keep modal open but could show an error state here if needed
    }
  };
  
  // Handle edit decisions (go back to editing mode)
  const handleEditDecisions = async () => {
    setShowConfirmationModal(false);
    // Notify backend so admin panel sees the change
    const result = await unsubmitDecisions();
    if (!result.success) {
      console.error('Failed to unsubmit:', result.error);
      // Still allow local editing even if backend fails
      setSubmitted(false);
    }
  };
  
  if (!team || !gameState) return null;
  
  const isPaused = gameState.status === 'paused';
  const isLowTime = displayTime <= 60;
  
  return (
    <div className={cn(
      "min-h-screen bg-slate-100 flex flex-col",
      className
    )}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Magna Logo, Team & Round Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">MAGNA</span>
                <span className="w-2 h-2 bg-magna-red rounded-full" />
              </div>
              <div className="bg-magna-red text-white px-5 py-2 rounded-full font-bold text-lg max-w-[220px] truncate">
                {teamName || `Team ${team.teamId}`}
              </div>
              <div className="text-slate-600 text-lg">
                <span className="text-slate-800 font-semibold">Round {gameState.currentRound}</span>
                <span className="mx-2">•</span>
                <span>FY {2025 + gameState.currentRound}</span>
              </div>
            </div>
            
            {/* Center: Cash Balance */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-sm text-slate-500 uppercase tracking-wide">Starting Cash</div>
                <div className="text-2xl font-bold text-slate-800">${team.cashBalance.toLocaleString()}M</div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <div className="text-sm text-slate-500 uppercase tracking-wide">Selected</div>
                <div className="text-2xl font-bold text-amber-600">-${selectedCost.toLocaleString()}M</div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <div className="text-sm text-slate-500 uppercase tracking-wide">Remaining</div>
                <div className={cn(
                  "text-2xl font-bold",
                  remainingBudget >= 0 ? "text-emerald-600" : "text-magna-red"
                )}>
                  ${remainingBudget.toLocaleString()}M
                </div>
              </div>
            </div>
            
            {/* Right: Timer */}
            <div className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-2xl font-bold",
              isPaused && "bg-amber-100 text-amber-700",
              !isPaused && isLowTime && "bg-red-100 text-magna-red animate-pulse",
              !isPaused && !isLowTime && "bg-slate-100 text-slate-800"
            )}>
              <Timer className="w-6 h-6" />
              {isPaused ? 'PAUSED' : formattedTime}
            </div>
          </div>
        </div>
        
        {/* Scenario Banner */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-slate-600 text-lg">
              <span className="text-slate-800 font-semibold">
                {gameState.scenario.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
              </span>{' '}
              {gameState.scenario.narrative.split('\n')[0]}
            </p>
          </div>
        </div>
      </header>
      
      {/* 1-Minute Warning Banner - flashes for 5 seconds below header */}
      {showOneMinuteWarning && !hasSubmitted && (
        <div className="sticky top-[96px] z-30 animate-in slide-in-from-top duration-300">
          <div className="bg-amber-500 text-white py-3 px-4 flex items-center justify-center gap-3 shadow-lg">
            <Timer className="w-6 h-6" />
            <span className="font-bold text-xl">
              1 Minute Remaining
            </span>
            <span className="text-white/90 text-lg">
              — Don't forget to submit!
            </span>
          </div>
        </div>
      )}
      
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-magna-red/10 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-magna-red" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">How to Play</h2>
                  <p className="text-slate-500">TSR Challenge Rules & Mechanics</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Objective */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-magna-red" />
                  <h3 className="text-lg font-semibold text-slate-800">Objective</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Maximize your company's <strong>Total Shareholder Return (TSR)</strong> over 5 rounds 
                  by making strategic capital allocation decisions. TSR is calculated based on your 
                  stock price growth and dividends. The team with the highest cumulative TSR wins!
                </p>
              </div>
              
              {/* Game Flow */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Game Flow</h3>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-magna-red">1.</span>
                    Each round represents one fiscal year (FY2026-FY2030)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-magna-red">2.</span>
                    You receive a capital budget each year to allocate across investment options
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-magna-red">3.</span>
                    Select decisions within your budget and submit before time runs out
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-magna-red">4.</span>
                    After each round, see your results and how you compare to other teams
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-magna-red">5.</span>
                    Market conditions change each year — adapt your strategy!
                  </li>
                </ul>
              </div>
              
              {/* Decision Categories */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Coins className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Decision Categories</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Grow</div>
                      <p className="text-slate-600 text-sm">
                        Strategic investments to expand capacity, enter new markets, or acquire companies. 
                        Higher risk but higher potential returns.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Optimize</div>
                      <p className="text-slate-600 text-sm">
                        ROI-driven projects for efficiency and margin improvement. 
                        Moderate risk with steady returns through cost savings.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Sustain</div>
                      <p className="text-slate-600 text-sm">
                        Non-discretionary investments to maintain operations and prevent risks. 
                        Lower returns but protects against negative events.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Risky Decisions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Risky Decisions</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Some decisions are marked with a <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-sm font-medium">
                    <AlertTriangle className="w-3 h-3" /> Risky
                  </span> tag. 
                  These offer higher potential returns but come with a chance of negative outcomes. 
                  One risky event will trigger during the game — but you won't know which one!
                </p>
              </div>
              
              {/* Winning */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-slate-800">How to Win</h3>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Balance growth investments with risk management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Adapt your strategy to changing market conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Don't over-allocate — unused cash reduces risk exposure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Consider long-term impacts, not just short-term gains</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-4 bg-magna-red text-white rounded-xl font-semibold text-lg hover:bg-magna-red-dark transition-colors"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Submission Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Decisions Submitted</h2>
                <p className="text-slate-500 text-lg mt-1">
                  FY{2025 + gameState.currentRound} capital allocation locked in
                </p>
              </div>
            </div>
            
            {/* Status Bar - Time & Capital */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={cn(
                "rounded-xl p-4 text-center",
                timeRemaining <= 60 ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
              )}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Timer className={cn("w-5 h-5", timeRemaining <= 60 ? "text-amber-600" : "text-slate-500")} />
                  <span className={cn("text-sm uppercase tracking-wide", timeRemaining <= 60 ? "text-amber-600" : "text-slate-500")}>
                    Time Remaining
                  </span>
                </div>
                <div className={cn(
                  "text-3xl font-bold font-mono",
                  timeRemaining <= 60 ? "text-amber-600" : "text-slate-800"
                )}>
                  {formattedTime}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-500 uppercase tracking-wide">Capital Allocated</span>
                </div>
                <div className="text-3xl font-bold text-amber-600">
                  ${selectedCost.toLocaleString()}M
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  of ${team.cashBalance.toLocaleString()}M ({Math.round((selectedCost / team.cashBalance) * 100)}%)
                </div>
              </div>
            </div>
            
            {/* Decision Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <span className="text-lg font-semibold text-slate-800">
                  {selectedDecisions.length} Decision{selectedDecisions.length !== 1 ? 's' : ''} Selected
                </span>
                <span className="text-lg font-bold text-amber-600">
                  ${selectedCost.toLocaleString()}M
                </span>
              </div>
              {selectedDecisions.length === 0 ? (
                <div className="text-center text-slate-500 py-4 text-lg">
                  No decisions selected
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDecisions.map((decision) => {
                    const categoryConfig = CATEGORY_CONFIG[decision.category];
                    const CategoryIcon = categoryConfig.icon;
                    return (
                      <div 
                        key={decision.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <CategoryIcon className={cn(
                            "w-5 h-5 flex-shrink-0",
                            decision.category === 'grow' && "text-emerald-600",
                            decision.category === 'optimize' && "text-blue-600",
                            decision.category === 'sustain' && "text-amber-600"
                          )} />
                          <span className="text-slate-800 text-base font-medium truncate">
                            {decision.name}
                          </span>
                        </div>
                        <span className="text-slate-600 text-base font-medium ml-3 flex-shrink-0">
                          ${decision.cost}M
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Action Button - Edit only */}
            {timeRemaining > 0 && (
              <div className="flex items-center justify-center">
                <button
                  onClick={handleEditDecisions}
                  className="px-8 py-4 bg-slate-100 text-slate-800 rounded-xl font-semibold text-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Pencil className="w-5 h-5" />
                  Edit Decisions
                </button>
              </div>
            )}
            
            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 text-slate-500 text-base mt-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Waiting for other teams to submit...</span>
            </div>
          </div>
        </div>
      )}
      
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Category Sections */}
        {(['grow', 'optimize', 'sustain'] as DecisionCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const Icon = config.icon;
          const decisions = decisionsByCategory[category];
          const isExpanded = expandedCategories.has(category);
          const selectedInCategory = decisions.filter((d) => selectedDecisionIds.has(d.id)).length;
          
          return (
            <div key={category} className="mb-6">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-xl transition-colors",
                  "bg-white shadow-sm",
                  "border border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    category === 'grow' && "bg-emerald-100",
                    category === 'optimize' && "bg-blue-100",
                    category === 'sustain' && "bg-amber-100"
                  )}>
                    <Icon className={cn(
                      "w-7 h-7",
                      category === 'grow' && "text-emerald-600",
                      category === 'optimize' && "text-blue-600",
                      category === 'sustain' && "text-amber-600"
                    )} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-800">
                      {config.label} Decisions
                      {selectedInCategory > 0 && (
                        <span className="ml-2 px-3 py-1 bg-magna-red/10 text-magna-red rounded-full text-base font-medium">
                          {selectedInCategory} selected
                        </span>
                      )}
                    </h2>
                    <p className="text-base text-slate-500">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-base">{decisions.length} options</span>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </button>
              
              {/* Decision Cards Grid */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
                  {decisions.map((decision) => {
                    const isSelected = selectedDecisionIds.has(decision.id);
                    const canAfford = remainingBudget >= decision.cost || isSelected;
                    
                    return (
                      <DecisionCard
                        key={decision.id}
                        decision={decision}
                        isSelected={isSelected}
                        isDisabled={!canAfford || hasSubmitted}
                        onToggle={() => handleToggleDecision(decision.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </main>
      
      {/* Submit Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200 shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Help Button & Selection Summary */}
          <div className="flex items-center gap-6">
            {/* Help Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Need Help?
            </button>
            
            <div className="w-px h-8 bg-slate-200" />
            
            <div className="text-slate-600 text-lg">
              <span className="text-slate-800 font-bold">{selectedDecisionIds.size}</span> decisions selected
            </div>
            <div className="text-slate-600 text-lg">
              Total: <span className="text-amber-600 font-bold">${selectedCost.toLocaleString()}M</span>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={hasSubmitted || selectedDecisionIds.size === 0 || isSubmitting}
            className={cn(
              "px-10 py-4 rounded-xl font-semibold text-xl transition-colors flex items-center gap-2",
              hasSubmitted
                ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                : selectedDecisionIds.size === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-magna-red text-white hover:bg-magna-red-dark shadow-lg shadow-magna-red/30"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Submitting...
              </>
            ) : hasSubmitted ? (
              <>
                <CheckCircle2 className="w-6 h-6" />
                Submitted
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Submit Decisions
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

DecisionScreen.displayName = 'DecisionScreen';
