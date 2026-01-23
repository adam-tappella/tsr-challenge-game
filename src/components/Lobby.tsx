/**
 * Lobby Component
 * 
 * Displayed after team joins but before the game starts.
 * Shows waiting status and other teams that have joined.
 */

import React, { useMemo } from 'react';
import { Clock, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';

interface LobbyProps {
  className?: string;
}

export const Lobby: React.FC<LobbyProps> = ({ className }) => {
  const teamId = useGameStore((s) => s.teamId);
  const teamName = useGameStore((s) => s.teamName);
  const gameState = useGameStore((s) => s.gameState);
  
  // Count joined teams
  const { joinedCount, totalCount, joinedTeams } = useMemo(() => {
    if (!gameState) return { joinedCount: 0, totalCount: 15, joinedTeams: [] };
    
    const teams = Object.values(gameState.teams);
    const joined = teams.filter((t) => t.isClaimed);
    
    return {
      joinedCount: joined.length,
      totalCount: gameState.teamCount,
      joinedTeams: joined.map((t) => t.teamId).sort((a, b) => a - b),
    };
  }, [gameState]);
  
  return (
    <div className={cn(
      "min-h-screen bg-slate-100",
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      {/* Magna Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-4xl font-black text-slate-800 tracking-tight">MAGNA</span>
        <span className="w-3 h-3 bg-magna-red rounded-full" />
      </div>
      
      {/* Team Badge */}
      <div className="bg-magna-red text-white px-8 py-3 rounded-full text-2xl font-bold mb-8 shadow-lg shadow-magna-red/30 max-w-sm truncate">
        {teamName || `Team ${teamId}`}
      </div>
      
      {/* Main Card */}
      <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-10 w-full max-w-xl text-center">
        {/* Animated Waiting Indicator */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-4 border-magna-red border-t-transparent animate-spin" />
          <div className="absolute inset-4 bg-slate-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-magna-red" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Waiting for Game to Start
        </h1>
        
        <p className="text-slate-600 text-xl mb-8">
          The facilitator will start the game when all teams are ready.
          <br />
          Get ready for Round 1!
        </p>
        
        {/* Teams Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-slate-500" />
            <span className="text-slate-800 font-semibold text-xl">
              Teams Joined: {joinedCount} / {totalCount}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-magna-red to-magna-red-dark rounded-full transition-all duration-500"
              style={{ width: `${(joinedCount / totalCount) * 100}%` }}
            />
          </div>
          
          {/* Joined Teams List */}
          <div className="flex flex-wrap justify-center gap-2">
            {joinedTeams.map((id) => (
              <div
                key={id}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg",
                  id === teamId
                    ? "bg-magna-red text-white"
                    : "bg-slate-200 text-slate-700"
                )}
              >
                {id}
              </div>
            ))}
          </div>
        </div>
        
        {/* Your Status */}
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
          <span className="font-semibold text-xl">You're all set!</span>
        </div>
      </div>
      
      {/* Scenario Preview */}
      <div className="mt-8 max-w-xl text-center">
        <h3 className="text-slate-500 text-base uppercase tracking-wide mb-2">
          Round 1 Scenario
        </h3>
        <p className="text-slate-500 text-lg">
          FY2026 - Business as Usual: The automotive market remains stable with moderate growth expectations.
        </p>
      </div>
      
      {/* Loading Dots */}
      <div className="flex items-center gap-2 mt-8">
        <div className="w-3 h-3 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-magna-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

Lobby.displayName = 'Lobby';
