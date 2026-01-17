/**
 * Admin Store - State management for facilitator admin panel
 * 
 * Manages:
 * - Admin authentication state
 * - Admin-specific UI state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AdminStoreState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: string | null;
}

interface AdminStoreActions {
  setAuthenticated: (authenticated: boolean) => void;
  setAuthenticating: (authenticating: boolean) => void;
  setAuthError: (error: string | null) => void;
  logout: () => void;
}

type AdminStore = AdminStoreState & AdminStoreActions;

const initialState: AdminStoreState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authError: null,
};

export const useAdminStore = create<AdminStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setAuthenticated: (authenticated) => set({ 
        isAuthenticated: authenticated,
        isAuthenticating: false,
        authError: null,
      }),
      
      setAuthenticating: (authenticating) => set({ isAuthenticating: authenticating }),
      
      setAuthError: (error) => set({ 
        authError: error,
        isAuthenticating: false,
      }),
      
      logout: () => set(initialState),
    }),
    { name: 'admin-store' }
  )
);
