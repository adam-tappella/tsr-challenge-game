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

import React, { useMemo, useState } from 'react';
import { 
  Timer, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Shield,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore, useCurrentTeam, useRemainingBudget, useSelectedCost } from '@/stores/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { DecisionCard } from './DecisionCard';
import type { Decision, DecisionCategory } from '@/types/game';

interface DecisionScreenProps {
  className?: string;
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

export const DecisionScreen: React.FC<DecisionScreenProps> = ({ className }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<DecisionCategory>>(
    new Set(['grow', 'optimize', 'sustain'])
  );
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  
  const team = useCurrentTeam();
  const gameState = useGameStore((s) => s.gameState);
  const availableDecisions = useGameStore((s) => s.availableDecisions);
  const selectedDecisionIds = useGameStore((s) => s.selectedDecisionIds);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);
  const isSubmitting = useGameStore((s) => s.isSubmitting);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const toggleDecision = useGameStore((s) => s.toggleDecision);
  
  const remainingBudget = useRemainingBudget();
  const selectedCost = useSelectedCost();
  
  const { submitDecisions } = useSocket();
  
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
  
  // Format time
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);
  
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
  
  // Handle submit
  const handleSubmit = async () => {
    if (hasSubmitted || selectedDecisionIds.size === 0) return;
    
    if (!confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }
    
    const decisionIds = Array.from(selectedDecisionIds);
    const result = await submitDecisions(decisionIds);
    
    if (!result.success) {
      console.error('Submit failed:', result.error);
    }
    
    setConfirmSubmit(false);
  };
  
  // Cancel confirm
  const cancelConfirm = () => setConfirmSubmit(false);
  
  if (!team || !gameState) return null;
  
  const isPaused = gameState.status === 'paused';
  const isLowTime = timeRemaining <= 60;
  
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
              <div className="bg-magna-red text-white px-4 py-1.5 rounded-full font-bold">
                Team {team.teamId}
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
      
      {/* Submitted Overlay */}
      {hasSubmitted && (
        <div className="fixed inset-0 z-30 bg-magna-darker/95 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-magna-dark border border-white/10 rounded-2xl p-10 text-center max-w-md">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Decisions Submitted!</h2>
            <p className="text-magna-gray mb-6">
              Your capital allocation decisions for Round {gameState.currentRound} have been recorded.
              Waiting for other teams to submit...
            </p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
          {confirmSubmit ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <span>Confirm submission?</span>
              </div>
              <button
                onClick={cancelConfirm}
                className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={hasSubmitted || selectedDecisionIds.size === 0}
              className={cn(
                "px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
                hasSubmitted
                  ? "bg-emerald-500/20 text-emerald-400 cursor-not-allowed"
                  : selectedDecisionIds.size === 0
                    ? "bg-magna-gray/20 text-magna-gray cursor-not-allowed"
                    : "bg-magna-red text-white hover:bg-magna-red-dark shadow-lg shadow-magna-red/30"
              )}
            >
              {hasSubmitted ? (
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
          )}
        </div>
      </footer>
    </div>
  );
};

DecisionScreen.displayName = 'DecisionScreen';
