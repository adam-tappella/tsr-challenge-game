/**
 * TeamSelection Component
 * 
 * Allows players to enter their team name and join the game.
 */

import React, { useState } from 'react';
import { Users, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { MagnaLogo } from './MagnaLogo';

interface TeamSelectionProps {
  className?: string;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ className }) => {
  const [teamName, setTeamName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { joinGame, isConnected } = useSocket();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim() || !isConnected || isJoining) return;
    
    setIsJoining(true);
    setError(null);
    
    const result = await joinGame(teamName.trim());
    
    if (!result.success) {
      setError(result.error || 'Failed to join game');
    }
    
    setIsJoining(false);
  };
  
  return (
    <div className={cn(
      "min-h-screen bg-slate-100",
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      {/* Header with Magna Logo */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <MagnaLogo variant="color" size="xl" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
          TSR Challenge
        </h1>
        <p className="text-slate-600 text-xl">
          Capital Allocation Simulation Game
        </p>
      </div>
      
      {/* Connection Status */}
      <div className={cn(
        "flex items-center gap-2 px-5 py-3 rounded-full mb-8",
        isConnected 
          ? "bg-emerald-100 text-emerald-700" 
          : "bg-amber-100 text-amber-700"
      )}>
        <div className={cn(
          "w-3 h-3 rounded-full",
          isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
        )} />
        <span className="text-lg font-medium">
          {isConnected ? 'Connected to Server' : 'Connecting...'}
        </span>
      </div>
      
      {/* Team Name Entry Card */}
      <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-magna-red/10 rounded-xl">
            <Users className="w-8 h-8 text-magna-red" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">Enter Your Team Name</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Team Name Input */}
          <div className="mb-6">
            <label htmlFor="teamName" className="block text-lg font-medium text-slate-600 mb-2">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                // Clear error when user starts typing a new name
                if (error) setError(null);
              }}
              placeholder="e.g., Alpha Team, The Strategists"
              disabled={!isConnected || isJoining}
              className={cn(
                "w-full px-5 py-4 rounded-xl text-xl font-medium",
                "bg-slate-50 border-2 text-slate-800 placeholder-slate-400",
                "focus:outline-none focus:ring-2",
                "transition-all duration-200",
                error 
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-magna-red focus:ring-magna-red/20",
                (!isConnected || isJoining) && "opacity-50 cursor-not-allowed"
              )}
              autoFocus
              maxLength={30}
            />
            <p className="text-base text-slate-700 mt-2">
              Choose a <span className="font-semibold text-slate-800">unique</span> name for your team (max 30 characters)
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl px-5 py-5 mb-6 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-red-700 text-lg font-bold">{error}</p>
                  {error.toLowerCase().includes('already taken') && (
                    <p className="text-red-600 text-base mt-2">
                      💡 Try adding your table number, initials, or something unique!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Join Button */}
          <button
            type="submit"
            disabled={!teamName.trim() || !isConnected || isJoining}
            className={cn(
              "w-full py-5 rounded-xl font-semibold text-xl transition-all duration-200",
              "flex items-center justify-center gap-2",
              teamName.trim() && isConnected && !isJoining
                ? "bg-magna-red text-white hover:bg-magna-red-dark shadow-lg shadow-magna-red/30"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Joining...
              </>
            ) : teamName.trim() ? (
              <>Join Game</>
            ) : (
              'Enter Team Name to Continue'
            )}
          </button>
        </form>
      </div>
      
      {/* Footer */}
      <p className="text-slate-700 text-lg mt-8">
        Magna International Leadership Meeting • 2026
      </p>
    </div>
  );
};

TeamSelection.displayName = 'TeamSelection';
