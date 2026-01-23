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
  
  const { submitDecisions, unsubmitDecisions } = useSocket();
  
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
      "min-h-screen bg-magna-darker flex flex-col",
      className
    )}>
      {/* Header */}
      <header className="bg-magna-dark border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Magna Logo, Team & Round Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight">MAGNA</span>
                <span className="w-1.5 h-1.5 bg-magna-red rounded-full" />
              </div>
              <div className="bg-magna-red text-white px-4 py-1.5 rounded-full font-bold max-w-[200px] truncate">
                {teamName || `Team ${team.teamId}`}
              </div>
              <div className="text-magna-gray">
                <span className="text-white font-medium">Round {gameState.currentRound}</span>
                <span className="mx-2">•</span>
                <span>FY {2025 + gameState.currentRound}</span>
              </div>
            </div>
            
            {/* Center: Cash Balance */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-xs text-magna-gray uppercase tracking-wide">Starting Cash</div>
                <div className="text-lg font-bold text-white">${team.cashBalance.toLocaleString()}M</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-magna-gray uppercase tracking-wide">Selected</div>
                <div className="text-lg font-bold text-amber-400">-${selectedCost.toLocaleString()}M</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-magna-gray uppercase tracking-wide">Remaining</div>
                <div className={cn(
                  "text-lg font-bold",
                  remainingBudget >= 0 ? "text-emerald-400" : "text-magna-red"
                )}>
                  ${remainingBudget.toLocaleString()}M
                </div>
              </div>
            </div>
            
            {/* Right: Timer */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold",
              isPaused && "bg-amber-500/20 text-amber-400",
              !isPaused && isLowTime && "bg-magna-red/20 text-magna-red animate-pulse",
              !isPaused && !isLowTime && "bg-white/10 text-white"
            )}>
              <Timer className="w-5 h-5" />
              {isPaused ? 'PAUSED' : formattedTime}
            </div>
          </div>
        </div>
        
        {/* Scenario Banner */}
        <div className="bg-black/30 border-t border-white/10 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-magna-gray text-sm">
              <span className="text-white font-medium">
                {gameState.scenario.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
              </span>{' '}
              {gameState.scenario.narrative.split('\n')[0]}
            </p>
          </div>
        </div>
      </header>
      
      {/* 1-Minute Warning Banner - flashes for 5 seconds below header */}
      {showOneMinuteWarning && !hasSubmitted && (
        <div className="sticky top-[88px] z-30 animate-in slide-in-from-top duration-300">
          <div className="bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-lg">
            <Timer className="w-5 h-5" />
            <span className="font-bold text-lg">
              1 Minute Remaining
            </span>
            <span className="text-white/90">
              — Don't forget to submit!
            </span>
          </div>
        </div>
      )}
      
      {/* Submission Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 bg-magna-darker/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-magna-dark border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Decisions Submitted</h2>
                <p className="text-magna-gray text-sm mt-1">
                  FY{2025 + gameState.currentRound} capital allocation locked in
                </p>
              </div>
            </div>
            
            {/* Status Bar - Time & Capital */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={cn(
                "rounded-xl p-3 text-center",
                timeRemaining <= 60 ? "bg-amber-500/20 border border-amber-500/30" : "bg-white/5"
              )}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Timer className={cn("w-4 h-4", timeRemaining <= 60 ? "text-amber-400" : "text-magna-gray")} />
                  <span className={cn("text-xs uppercase tracking-wide", timeRemaining <= 60 ? "text-amber-400" : "text-magna-gray")}>
                    Time Remaining
                  </span>
                </div>
                <div className={cn(
                  "text-2xl font-bold font-mono",
                  timeRemaining <= 60 ? "text-amber-400" : "text-white"
                )}>
                  {formattedTime}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-magna-gray" />
                  <span className="text-xs text-magna-gray uppercase tracking-wide">Capital Allocated</span>
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  ${selectedCost.toLocaleString()}M
                </div>
                <div className="text-xs text-magna-gray mt-0.5">
                  of ${team.cashBalance.toLocaleString()}M ({Math.round((selectedCost / team.cashBalance) * 100)}%)
                </div>
              </div>
            </div>
            
            {/* Decision Summary */}
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <span className="text-sm font-semibold text-white">
                  {selectedDecisions.length} Decision{selectedDecisions.length !== 1 ? 's' : ''} Selected
                </span>
                <span className="text-sm font-bold text-amber-400">
                  ${selectedCost.toLocaleString()}M
                </span>
              </div>
              {selectedDecisions.length === 0 ? (
                <div className="text-center text-magna-gray py-4">
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
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <CategoryIcon className={cn(
                            "w-4 h-4 flex-shrink-0",
                            decision.category === 'grow' && "text-emerald-400",
                            decision.category === 'optimize' && "text-blue-400",
                            decision.category === 'sustain' && "text-amber-400"
                          )} />
                          <span className="text-white text-sm font-medium truncate">
                            {decision.name}
                          </span>
                        </div>
                        <span className="text-magna-gray text-sm font-medium ml-3 flex-shrink-0">
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
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Decisions
                </button>
              </div>
            )}
            
            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 text-magna-gray text-xs mt-4">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                  "w-full flex items-center justify-between p-4 rounded-xl transition-colors",
                  `bg-gradient-to-r ${config.gradient}`,
                  "border border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">
                      {config.label} Decisions
                      {selectedInCategory > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-magna-red/20 text-magna-red rounded-full text-sm">
                          {selectedInCategory} selected
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-magna-gray">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-magna-gray text-sm">{decisions.length} options</span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-magna-gray" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-magna-gray" />
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
      <footer className="sticky bottom-0 bg-magna-dark border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Selection Summary */}
          <div className="flex items-center gap-6">
            <div className="text-magna-gray">
              <span className="text-white font-bold">{selectedDecisionIds.size}</span> decisions selected
            </div>
            <div className="text-magna-gray">
              Total: <span className="text-amber-400 font-bold">${selectedCost.toLocaleString()}M</span>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={hasSubmitted || selectedDecisionIds.size === 0 || isSubmitting}
            className={cn(
              "px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
              hasSubmitted
                ? "bg-emerald-500/20 text-emerald-400 cursor-not-allowed"
                : selectedDecisionIds.size === 0
                  ? "bg-magna-gray/20 text-magna-gray cursor-not-allowed"
                  : "bg-magna-red text-white hover:bg-magna-red-dark shadow-lg shadow-magna-red/30"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : hasSubmitted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Submitted
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
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
