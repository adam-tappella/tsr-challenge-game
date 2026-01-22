/**
 * RoundResults Component
 * 
 * Displays results after each round in an investor report format:
 * - Comprehensive financial KPIs with year-over-year comparisons
 * - Analyst commentary quotes
 * - Market benchmark comparisons
 * - Leaderboard snapshot
 * 
 * Uses the InvestorReportSummary component for the main display.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { InvestorReportSummary } from './investor-report';

interface RoundResultsProps {
  className?: string;
}

/**
 * RoundResults Component
 * 
 * Wraps the InvestorReportSummary component for the round results display.
 * This provides a professional investor report-style view of end-of-round results.
 */
export const RoundResults: React.FC<RoundResultsProps> = ({ className }) => {
  return <InvestorReportSummary className={cn(className)} />;
};

RoundResults.displayName = 'RoundResults';
