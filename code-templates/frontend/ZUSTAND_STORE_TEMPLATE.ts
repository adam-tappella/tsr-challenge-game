import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface State {
  count: number;
  user: { name: string } | null;
}

interface Actions {
  increment: () => void;
  decrement: () => void;
  setUser: (user: { name: string }) => void;
  reset: () => void;
}

// Combine State and Actions for the store type
type Store = State & Actions;

const initialState: State = {
  count: 0,
  user: null,
};

/**
 * useStoreName
 * 
 * Global state management for [Feature Name].
 * Uses persist middleware to save to localStorage.
 */
export const useStoreName = create<Store>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        increment: () => set((state) => ({ count: state.count + 1 })),
        
        decrement: () => set((state) => ({ count: state.count - 1 })),
        
        setUser: (user) => set({ user }),
        
        reset: () => set(initialState),
      }),
      {
        name: 'store-name-storage', // unique name in localStorage
        // partialize: (state) => ({ count: state.count }), // optional: only persist some fields
      }
    )
  )
);
