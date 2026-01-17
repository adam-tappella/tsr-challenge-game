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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
      </div>
    );
  }

  // Show children if access granted
  if (isGranted) {
    return <>{children}</>;
  }

  // Show access gate
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center">
            <Lock className="w-7 h-7 text-neutral-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-white text-center mb-2">
          Access Required
        </h1>
        <p className="text-neutral-500 text-center text-sm mb-8">
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
              "w-full px-4 py-3 bg-neutral-900 border rounded-xl text-white text-center",
              "placeholder:text-neutral-600",
              "focus:outline-none focus:ring-2 focus:ring-neutral-700",
              "transition-colors",
              error ? "border-red-500/50" : "border-neutral-800"
            )}
          />
          
          {error && (
            <p className="text-red-400 text-sm text-center mt-3">
              Invalid access code
            </p>
          )}

          <button
            type="submit"
            disabled={!inputCode}
            className={cn(
              "w-full mt-4 py-3 rounded-xl font-medium transition-colors",
              inputCode
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
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
