/**
 * AccessGate Component
 * 
 * Simple password gate for restricting access.
 * No branding - clean, minimal design.
 */

import React, { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  // Show children if access granted
  if (isGranted) {
    return <>{children}</>;
  }

  // Show access gate
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-white border border-slate-200 shadow-lg rounded-2xl flex items-center justify-center">
            <Lock className="w-9 h-9 text-slate-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-slate-800 text-center mb-3">
          Access Required
        </h1>
        <p className="text-slate-500 text-center text-xl mb-8">
          Enter the access code to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
              "w-full px-5 py-4 bg-white border-2 rounded-xl text-slate-800 text-center text-xl",
              "placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-magna-red/20 focus:border-magna-red",
              "transition-colors shadow-sm",
              error ? "border-red-400" : "border-slate-200"
            )}
          />
          
          {error && (
            <p className="text-red-500 text-lg text-center mt-3">
              Invalid access code
            </p>
          )}

          <button
            type="submit"
            disabled={!inputCode}
            className={cn(
              "w-full mt-6 py-4 rounded-xl font-semibold text-xl transition-colors",
              inputCode
                ? "bg-magna-red text-white hover:bg-magna-red-dark shadow-lg"
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
