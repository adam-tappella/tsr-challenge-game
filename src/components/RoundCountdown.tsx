/**
 * RoundCountdown Component
 * 
 * Displays an elegant 3-2-1 countdown before each round starts.
 * Professional and understated design that builds anticipation.
 */

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MagnaLogo } from './MagnaLogo';

interface RoundCountdownProps {
  round: number;
  onComplete: () => void;
  className?: string;
}

export const RoundCountdown: React.FC<RoundCountdownProps> = ({
  round,
  onComplete,
  className,
}) => {
  const [count, setCount] = useState(3);
  const [showGo, setShowGo] = useState(false);
  const hasCompletedRef = useRef(false);
  
  // Simple countdown: 3 -> 2 -> 1 -> GO -> complete
  useEffect(() => {
    // Prevent running if already completed
    if (hasCompletedRef.current) return;
    
    const timer = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1);
      } else if (count === 1) {
        setCount(0);
        setShowGo(true);
      } else if (showGo && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete();
      }
    }, 800); // 800ms per step
    
    return () => clearTimeout(timer);
  }, [count, showGo, onComplete]);
  
  return (
    <div className={cn(
      "min-h-screen bg-slate-100",
      "flex flex-col items-center justify-center",
      className
    )}>
      {/* Magna Header */}
      <div className="flex items-center justify-center mb-12">
        <MagnaLogo variant="color" size="lg" />
      </div>
      
      {/* Round Indicator */}
      <div className="text-slate-600 text-2xl font-semibold tracking-wide uppercase mb-8">
        Round {round} • FY{2025 + round}
      </div>
      
      {/* Countdown Number - Clean and elegant */}
      <div className="relative mb-12">
        {/* Subtle ring */}
        <div className="absolute inset-0 w-48 h-48 rounded-full border-4 border-magna-red/20" 
          style={{ 
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Main countdown display */}
        <div className={cn(
          "w-44 h-44 rounded-full flex items-center justify-center",
          "bg-white border-4 border-magna-red/40 shadow-lg",
          "transition-all duration-200",
        )}>
          <span className={cn(
            "font-bold text-slate-800",
            showGo ? "text-5xl" : "text-8xl"
          )}>
            {showGo ? "GO" : count}
          </span>
        </div>
      </div>
      
      {/* Status Text */}
      <div className="text-center">
        <h2 className="text-4xl font-semibold text-slate-800 mb-3">
          {showGo ? "Begin" : "Get Ready"}
        </h2>
        <p className="text-slate-600 text-xl">
          Capital allocation decisions
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mt-10">
        {[3, 2, 1].map((num) => (
          <div
            key={num}
            className={cn(
              "w-4 h-4 rounded-full transition-all duration-300",
              count < num || showGo
                ? "bg-magna-red"
                : "bg-slate-300"
            )}
          />
        ))}
      </div>
    </div>
  );
};

RoundCountdown.displayName = 'RoundCountdown';
