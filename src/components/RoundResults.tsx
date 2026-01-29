/**
 * RoundResults Component
 * 
 * Displays results after each round with tabbed navigation:
 * 1. Equity Research - Professional investor report with financial KPIs
 * 2. Rankings & Next Round - Team standings and preview of coming year
 * 
 * Uses the InvestorReportSummary and RankingsPreview components.
 */

import React, { useState } from 'react';
import { FileText, Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InvestorReportSummary } from './investor-report';
import { RankingsPreview } from './RankingsPreview';

type ResultsTab = 'equity-research' | 'rankings-preview';

interface RoundResultsProps {
  className?: string;
}

/**
 * RoundResults Component
 * 
 * Provides tabbed navigation between equity research report and rankings/preview.
 * Helps teams understand their performance and prepare for the next round.
 */
export const RoundResults: React.FC<RoundResultsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<ResultsTab>('equity-research');
  
  return (
    <div className={cn("relative", className)}>
      {/* Tab Navigation - Fixed at top */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Tab Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('equity-research')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
                  activeTab === 'equity-research'
                    ? "bg-magna-red text-white shadow-lg shadow-magna-red/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <FileText className="w-4 h-4" />
                Equity Research
              </button>
              
              <ChevronRight className="w-4 h-4 text-slate-400" />
              
              <button
                onClick={() => setActiveTab('rankings-preview')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
                  activeTab === 'rankings-preview'
                    ? "bg-magna-red text-white shadow-lg shadow-magna-red/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Trophy className="w-4 h-4" />
                Rankings & Next Round
              </button>
            </div>
            
            {/* Navigation hint */}
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
              {activeTab === 'equity-research' && (
                <>
                  <span>Review your results, then</span>
                  <button
                    onClick={() => setActiveTab('rankings-preview')}
                    className="text-magna-red font-semibold hover:underline flex items-center gap-1"
                  >
                    see rankings & prep for next round
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {activeTab === 'rankings-preview' && (
                <>
                  <button
                    onClick={() => setActiveTab('equity-research')}
                    className="text-magna-red font-semibold hover:underline"
                  >
                    ← Back to Equity Research
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'equity-research' && <InvestorReportSummary />}
        {activeTab === 'rankings-preview' && <RankingsPreview />}
      </div>
    </div>
  );
};

RoundResults.displayName = 'RoundResults';
