/**
 * AccessGate Component
 * 
 * Simple password gate for restricting access.
 * No branding - clean, minimal design.
 */

import React, { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagnaLogo } from './MagnaLogo';

interface AccessGateProps {
  accessCode: string;
  children: React.ReactNode;
}

const STORAGE_KEY = 'tsr_access_granted';

export const AccessGate: React.FC<AccessGateProps> = ({ accessCode, children }) => {
  const [isGranted, setIsGranted] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check for stored access on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsGranted(true);
    }
    setIsChecking(false);
  }, []);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputCode.toLowerCase() === accessCode.toLowerCase()) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsGranted(true);
      setError(false);
    } else {
      setError(true);
      setInputCode('');
    }
  };

  // Show loading while checking stored access
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-magna-ignition-red animate-spin" />
      </div>
    );
  }

  // Show children if access granted
  if (isGranted) {
    return <>{children}</>;
  }

  // Show access gate
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
      {/* Magna Header */}
      <div className="flex items-center justify-center mb-8">
        <MagnaLogo variant="color" size="md" />
      </div>
      
      <div className="w-full max-w-md">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-magna-ignition-red shadow-lg rounded-2xl flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-magna-carbon-black text-center mb-3">
          Access Required
        </h1>
        <p className="text-slate-600 text-center text-lg mb-8">
          Enter the access code to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          <input
            type="password"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              setError(false);
            }}
            placeholder="Access code"
            autoFocus
            className={cn(
              "w-full px-5 py-4 bg-slate-50 border-2 rounded-xl text-magna-carbon-black text-center text-xl font-medium",
              "placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-magna-ignition-red focus:border-magna-ignition-red",
              "transition-all",
              error ? "border-magna-ignition-red bg-red-50" : "border-slate-300"
            )}
          />
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-magna-ignition-red mt-4 bg-red-50 py-3 px-4 rounded-xl">
              <span className="font-medium">Invalid access code</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!inputCode}
            className={cn(
              "w-full mt-6 py-4 rounded-xl font-semibold text-xl transition-all",
              inputCode
                ? "bg-magna-ignition-red text-white hover:bg-magna-red-dark shadow-md hover:shadow-lg"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

AccessGate.displayName = 'AccessGate';
