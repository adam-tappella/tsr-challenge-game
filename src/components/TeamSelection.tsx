/**
 * TeamSelection Component
 * 
 * Allows players to enter their team name and join the game.
 */

import React, { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';

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
      "min-h-screen bg-gradient-to-br from-magna-darker via-magna-dark to-magna-darker",
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      {/* Header with Magna Logo */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl font-black text-white tracking-tight">MAGNA</span>
          <span className="w-3 h-3 bg-magna-red rounded-full" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          TSR Challenge
        </h1>
        <p className="text-magna-gray text-lg">
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
      
      {/* Team Name Entry Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-magna-red/20 rounded-xl">
            <Users className="w-6 h-6 text-magna-red" />
          </div>
          <h2 className="text-xl font-semibold text-white">Enter Your Team Name</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Team Name Input */}
          <div className="mb-6">
            <label htmlFor="teamName" className="block text-sm font-medium text-magna-gray mb-2">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Alpha Team, The Strategists"
              disabled={!isConnected || isJoining}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-lg font-medium",
                "bg-white/10 border-2 border-white/20 text-white placeholder-magna-gray/50",
                "focus:outline-none focus:border-magna-red focus:ring-2 focus:ring-magna-red/20",
                "transition-all duration-200",
                (!isConnected || isJoining) && "opacity-50 cursor-not-allowed"
              )}
              autoFocus
              maxLength={30}
            />
            <p className="text-xs text-magna-gray mt-2">
              Choose a memorable name for your team (max 30 characters)
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          {/* Join Button */}
          <button
            type="submit"
            disabled={!teamName.trim() || !isConnected || isJoining}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200",
              "flex items-center justify-center gap-2",
              teamName.trim() && isConnected && !isJoining
                ? "bg-magna-red text-white hover:bg-magna-red-dark shadow-lg shadow-magna-red/30"
                : "bg-magna-gray/20 text-magna-gray cursor-not-allowed"
            )}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
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
      <p className="text-magna-gray text-sm mt-8">
        Magna International Leadership Meeting • 2026
      </p>
    </div>
  );
};

TeamSelection.displayName = 'TeamSelection';
