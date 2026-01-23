/**
 * RoundCountdown Component
 * 
 * Displays an elegant 3-2-1 countdown before each round starts.
 * Professional and understated design that builds anticipation.
 */

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

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
      "min-h-screen bg-gradient-to-br from-magna-darker via-magna-dark to-magna-darker",
      "flex flex-col items-center justify-center",
      className
    )}>
      {/* Magna Header */}
      <div className="flex items-center gap-2 mb-12">
        <span className="text-2xl font-black text-white tracking-tight">MAGNA</span>
        <span className="w-2 h-2 bg-magna-red rounded-full" />
      </div>
      
      {/* Round Indicator */}
      <div className="text-magna-gray text-lg font-medium tracking-wide uppercase mb-8">
        Round {round} • FY{2025 + round}
      </div>
      
      {/* Countdown Number - Clean and elegant */}
      <div className="relative mb-12">
        {/* Subtle ring */}
        <div className="absolute inset-0 w-40 h-40 rounded-full border-2 border-magna-red/20" 
          style={{ 
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Main countdown display */}
        <div className={cn(
          "w-36 h-36 rounded-full flex items-center justify-center",
          "bg-magna-dark border-2 border-magna-red/40",
          "transition-all duration-200",
        )}>
          <span className={cn(
            "font-bold text-white",
            showGo ? "text-4xl" : "text-7xl"
          )}>
            {showGo ? "GO" : count}
          </span>
        </div>
      </div>
      
      {/* Status Text */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">
          {showGo ? "Begin" : "Get Ready"}
        </h2>
        <p className="text-magna-gray text-base">
          Capital allocation decisions
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mt-10">
        {[3, 2, 1].map((num) => (
          <div
            key={num}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              count < num || showGo
                ? "bg-magna-red"
                : "bg-magna-gray/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

RoundCountdown.displayName = 'RoundCountdown';
