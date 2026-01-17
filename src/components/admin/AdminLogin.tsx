/**
 * AdminLogin Component
 * 
 * PIN entry form for facilitator authentication.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/adminStore';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminLoginProps {
  className?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ className }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const isAuthenticating = useAdminStore((s) => s.isAuthenticating);
  const authError = useAdminStore((s) => s.authError);
  const { authenticate, checkStoredAuth } = useAdmin();
  
  // Check for stored auth on mount
  useEffect(() => {
    checkStoredAuth();
  }, [checkStoredAuth]);
  
  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  
  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        handleSubmit(fullPin);
      }
    }
  };
  
  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    
    if (pastedData.length === 4) {
      const newPin = pastedData.split('');
      setPin(newPin);
      handleSubmit(pastedData);
    }
  };
  
  // Submit PIN
  const handleSubmit = async (pinValue?: string) => {
    const fullPin = pinValue || pin.join('');
    if (fullPin.length !== 4) return;
    
    await authenticate(fullPin);
  };
  
  // Clear PIN on error
  useEffect(() => {
    if (authError) {
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }, [authError]);
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Facilitator Access
        </h1>
        <p className="text-slate-400">
          Enter the admin PIN to access game controls
        </p>
      </div>
      
      {/* Login Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 w-full max-w-md">
        {/* Lock Icon */}
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
        
        {/* PIN Input */}
        <div className="flex justify-center gap-3 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isAuthenticating}
              className={cn(
                "w-14 h-16 text-center text-2xl font-bold rounded-xl",
                "bg-slate-800 border-2 text-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "transition-colors",
                authError ? "border-red-500" : "border-slate-700",
                isAuthenticating && "opacity-50"
              )}
            />
          ))}
        </div>
        
        {/* Error Message */}
        {authError && (
          <div className="flex items-center justify-center gap-2 text-red-400 mb-6">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{authError}</span>
          </div>
        )}
        
        {/* Loading Indicator */}
        {isAuthenticating && (
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verifying...</span>
          </div>
        )}
        
        {/* Hint */}
        {!isAuthenticating && !authError && (
          <p className="text-center text-slate-500 text-sm">
            Enter the 4-digit PIN provided by the event organizer
          </p>
        )}
      </div>
      
      {/* Back Link */}
      <a
        href="/"
        className="mt-8 text-slate-500 hover:text-slate-400 text-sm transition-colors"
      >
        ← Back to Team View
      </a>
    </div>
  );
};

AdminLogin.displayName = 'AdminLogin';
