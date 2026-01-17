/**
 * TeamSelection Component
 * 
 * Allows players to select and join a team number.
 * Shows which teams are already claimed (disabled).
 */

import React, { useState, useMemo } from 'react';
import { Users, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { useSocket } from '@/hooks/useSocket';

interface TeamSelectionProps {
  className?: string;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ className }) => {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const gameState = useGameStore((s) => s.gameState);
  const { joinGame, isConnected } = useSocket();
  
  // Get team count and claimed status from game state
  const teamCount = gameState?.teamCount || 15;
  const teams = gameState?.teams || {};
  
  // Generate team buttons
  const teamButtons = useMemo(() => {
    return Array.from({ length: teamCount }, (_, i) => {
      const teamId = i + 1;
      const team = teams[teamId];
      const isClaimed = team?.isClaimed || false;
      
      return {
        teamId,
        isClaimed,
        isSelected: selectedTeam === teamId,
      };
    });
  }, [teamCount, teams, selectedTeam]);
  
  // Handle team selection
  const handleSelectTeam = (teamId: number) => {
    if (teams[teamId]?.isClaimed) return;
    setSelectedTeam(teamId);
    setError(null);
  };
  
  // Handle join game
  const handleJoinGame = async () => {
    if (!selectedTeam || !isConnected) return;
    
    setIsJoining(true);
    setError(null);
    
    const result = await joinGame(selectedTeam);
    
    if (!result.success) {
      setError(result.error || 'Failed to join team');
    }
    
    setIsJoining(false);
  };
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          Magna TSR Challenge
        </h1>
        <p className="text-slate-400 text-lg">
          Capital Allocation Simulation Game
        </p>
      </div>
      
      {/* Connection Status */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full mb-8",
        isConnected 
          ? "bg-emerald-500/20 text-emerald-400" 
          : "bg-amber-500/20 text-amber-400"
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
        )} />
        <span className="text-sm font-medium">
          {isConnected ? 'Connected to Server' : 'Connecting...'}
        </span>
      </div>
      
      {/* Team Selection Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Select Your Team</h2>
        </div>
        
        {/* Team Grid */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {teamButtons.map(({ teamId, isClaimed, isSelected }) => (
            <button
              key={teamId}
              onClick={() => handleSelectTeam(teamId)}
              disabled={isClaimed || !isConnected}
              className={cn(
                "relative h-16 rounded-xl font-bold text-lg transition-all duration-200",
                "flex items-center justify-center",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
                isClaimed && [
                  "bg-slate-700/50 text-slate-500 cursor-not-allowed",
                ],
                !isClaimed && !isSelected && [
                  "bg-slate-700 text-white hover:bg-slate-600",
                  "border-2 border-transparent hover:border-blue-500/50",
                ],
                isSelected && [
                  "bg-blue-600 text-white",
                  "border-2 border-blue-400",
                  "shadow-lg shadow-blue-500/30",
                  "scale-105",
                ],
              )}
            >
              {teamId}
              {isClaimed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </div>
              )}
              {isSelected && (
                <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-emerald-400" />
              )}
            </button>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm text-slate-400 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-700" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-700/50 flex items-center justify-center">
              <XCircle className="w-3 h-3 text-slate-400" />
            </div>
            <span>Claimed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600" />
            <span>Selected</span>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}
        
        {/* Join Button */}
        <button
          onClick={handleJoinGame}
          disabled={!selectedTeam || !isConnected || isJoining}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200",
            "flex items-center justify-center gap-2",
            selectedTeam && isConnected && !isJoining
              ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
          )}
        >
          {isJoining ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Joining Team {selectedTeam}...
            </>
          ) : selectedTeam ? (
            <>Join as Team {selectedTeam}</>
          ) : (
            'Select a Team to Continue'
          )}
        </button>
      </div>
      
      {/* Footer */}
      <p className="text-slate-500 text-sm mt-8">
        Magna International Leadership Meeting • March 2026
      </p>
    </div>
  );
};

TeamSelection.displayName = 'TeamSelection';
