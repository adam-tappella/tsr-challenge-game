/**
 * DecisionCard Component
 * 
 * Displays a single investment decision card with:
 * - Front: Name, cost, brief description, category badge
 * - Back (expanded): Full narrative, impact details, guiding principle
 * - States: available, selected, disabled, risky
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Settings, 
  Shield, 
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Decision } from '@/types/game';

interface DecisionCardProps {
  decision: Decision;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  className?: string;
}

const CATEGORY_CONFIG = {
  grow: {
    label: 'Grow',
    icon: TrendingUp,
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    accentColor: 'emerald',
  },
  optimize: {
    label: 'Optimize',
    icon: Settings,
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    accentColor: 'blue',
  },
  sustain: {
    label: 'Sustain',
    icon: Shield,
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    accentColor: 'amber',
  },
};

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  isSelected,
  isDisabled,
  onToggle,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const config = CATEGORY_CONFIG[decision.category];
  const CategoryIcon = config.icon;
  
  const handleCardClick = () => {
    if (!isDisabled) {
      onToggle();
    }
  };
  
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
  };
  
  // Impact summary for the card
  const impactSummary = getImpactSummary(decision);
  
  return (
    <>
      {/* Card */}
      <div
        onClick={handleCardClick}
        className={cn(
          "relative rounded-2xl p-5 cursor-pointer transition-all duration-200",
          "border-2 group",
          // Base styles
          "bg-slate-800/50",
          // Disabled state
          isDisabled && !isSelected && [
            "opacity-50 cursor-not-allowed",
            "border-slate-700",
          ],
          // Available state
          !isDisabled && !isSelected && [
            "border-slate-700 hover:border-slate-600",
            "hover:bg-slate-800",
          ],
          // Selected state
          isSelected && [
            config.borderColor.replace('/30', ''),
            `bg-${config.accentColor}-500/10`,
            "shadow-lg",
          ],
          className
        )}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <div className={cn(
            "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center",
            `bg-${config.accentColor}-500`
          )}>
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
        
        {/* Risky Badge */}
        {decision.isRisky && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">Risky</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3",
          config.bgColor,
          config.textColor
        )}>
          <CategoryIcon className="w-3 h-3" />
          {config.label}
        </div>
        
        {/* Name */}
        <h3 className="font-semibold text-white mb-2 leading-snug">
          {decision.name}
        </h3>
        
        {/* Cost */}
        <div className="flex items-center gap-1.5 mb-3">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <span className="text-lg font-bold text-white">${decision.cost}M</span>
        </div>
        
        {/* Brief Description */}
        <p className="text-sm text-slate-400 line-clamp-3 mb-4">
          {decision.narrative.split('.')[0]}.
        </p>
        
        {/* Impact Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {impactSummary.map((impact, i) => (
            <span 
              key={i}
              className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
            >
              {impact}
            </span>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {decision.durationYears}yr • {decision.rampUpYears}yr ramp
          </div>
          
          <button
            onClick={handleExpandClick}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Details
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Expanded Modal */}
      {isExpanded && (
        <DecisionModal
          decision={decision}
          config={config}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onToggle={onToggle}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

// =============================================================================
// Decision Modal (Expanded View)
// =============================================================================

interface DecisionModalProps {
  decision: Decision;
  config: typeof CATEGORY_CONFIG['grow'];
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const DecisionModal: React.FC<DecisionModalProps> = ({
  decision,
  config,
  isSelected,
  isDisabled,
  onToggle,
  onClose,
}) => {
  const CategoryIcon = config.icon;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn(
          "p-6 border-b",
          config.borderColor.replace('/30', '/20'),
          `bg-${config.accentColor}-500/5`
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
              config.bgColor,
              config.textColor
            )}>
              <CategoryIcon className="w-4 h-4" />
              {config.label}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {decision.name}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <span className="text-2xl font-bold text-white">${decision.cost}M</span>
            </div>
            
            {decision.isRisky && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Risky Investment</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Narrative */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
              Investment Overview
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {decision.narrative}
            </p>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem 
              label="Type" 
              value={decision.type === 'organic' ? 'Organic Growth' : 'Inorganic (M&A)'} 
            />
            <DetailItem 
              label="Duration" 
              value={`${decision.durationYears} year${decision.durationYears > 1 ? 's' : ''}`} 
            />
            <DetailItem 
              label="Ramp-up Period" 
              value={`${decision.rampUpYears} year${decision.rampUpYears > 1 ? 's' : ''}`} 
            />
            <DetailItem 
              label="Impact Magnitude" 
              value={`${decision.impactMagnitude}/5`} 
            />
          </div>
          
          {/* Impact Details */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
              Expected Impact
            </h4>
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
              {decision.revenueImpact && (
                <ImpactRow 
                  label="Revenue" 
                  value={`${decision.revenueImpact > 0 ? '+' : ''}${(decision.revenueImpact * 100).toFixed(1)}%`}
                  positive={decision.revenueImpact > 0}
                />
              )}
              {decision.cogsImpact && (
                <ImpactRow 
                  label="Cost of Goods" 
                  value={`${decision.cogsImpact > 0 ? '+' : ''}${(decision.cogsImpact * 100).toFixed(1)}%`}
                  positive={decision.cogsImpact < 0}
                />
              )}
              {decision.sgaImpact && (
                <ImpactRow 
                  label="SG&A" 
                  value={`${decision.sgaImpact > 0 ? '+' : ''}${(decision.sgaImpact * 100).toFixed(1)}%`}
                  positive={decision.sgaImpact < 0}
                />
              )}
              {decision.recurringBenefit && !decision.isOneTimeBenefit && (
                <ImpactRow 
                  label="Recurring Benefit" 
                  value={`$${decision.recurringBenefit}M/year`}
                  positive={true}
                />
              )}
              {decision.isOneTimeBenefit && decision.recurringBenefit && (
                <ImpactRow 
                  label="One-time Benefit" 
                  value={`$${decision.recurringBenefit}M`}
                  positive={true}
                />
              )}
              {decision.riskPrevention && (
                <ImpactRow 
                  label="Risk Prevention" 
                  value={decision.riskPrevention.replace(/_/g, ' ')}
                  positive={true}
                />
              )}
            </div>
          </div>
          
          {/* Guiding Principle */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-400 mb-1">
              Guiding Principle
            </h4>
            <p className="text-white font-medium">
              {decision.guidingPrinciple}
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (!isDisabled) {
                onToggle();
                onClose();
              }
            }}
            disabled={isDisabled && !isSelected}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl font-medium transition-colors",
              isSelected
                ? "bg-red-600 text-white hover:bg-red-500"
                : isDisabled
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : `bg-${config.accentColor}-600 text-white hover:bg-${config.accentColor}-500`
            )}
          >
            {isSelected ? 'Remove Selection' : isDisabled ? 'Cannot Afford' : 'Select Investment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Helper Components
// =============================================================================

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-800/50 rounded-xl p-3">
    <div className="text-xs text-slate-500 mb-1">{label}</div>
    <div className="text-white font-medium">{value}</div>
  </div>
);

const ImpactRow: React.FC<{ label: string; value: string; positive: boolean }> = ({ 
  label, 
  value, 
  positive 
}) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-400">{label}</span>
    <span className={cn(
      "font-medium",
      positive ? "text-emerald-400" : "text-slate-300"
    )}>
      {value}
    </span>
  </div>
);

// =============================================================================
// Helper Functions
// =============================================================================

function getImpactSummary(decision: Decision): string[] {
  const impacts: string[] = [];
  
  if (decision.revenueImpact) {
    const sign = decision.revenueImpact > 0 ? '+' : '';
    impacts.push(`Rev ${sign}${(decision.revenueImpact * 100).toFixed(0)}%`);
  }
  if (decision.cogsImpact) {
    const sign = decision.cogsImpact < 0 ? '' : '+';
    impacts.push(`COGS ${sign}${(decision.cogsImpact * 100).toFixed(0)}%`);
  }
  if (decision.sgaImpact) {
    const sign = decision.sgaImpact < 0 ? '' : '+';
    impacts.push(`SG&A ${sign}${(decision.sgaImpact * 100).toFixed(0)}%`);
  }
  if (decision.riskPrevention) {
    impacts.push('Risk Shield');
  }
  
  return impacts.slice(0, 3);
}

DecisionCard.displayName = 'DecisionCard';
