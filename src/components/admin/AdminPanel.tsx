/**
 * AdminPanel Component
 * 
 * Wrapper component that handles admin authentication state
 * and displays either login, dashboard, framework overview, or scoreboard.
 */

import React, { useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { FrameworkOverview } from './FrameworkOverview';
import { TeamScoreboard } from './TeamScoreboard';

type AdminView = 'dashboard' | 'framework' | 'scoreboard';

export const AdminPanel: React.FC = () => {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const [view, setView] = useState<AdminView>('dashboard');
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  if (view === 'framework') {
    return <FrameworkOverview onBack={() => setView('dashboard')} />;
  }
  
  if (view === 'scoreboard') {
    return <TeamScoreboard onBack={() => setView('dashboard')} />;
  }
  
  return (
    <AdminDashboard
      onOpenFramework={() => setView('framework')}
      onOpenScoreboard={() => setView('scoreboard')}
    />
  );
};

AdminPanel.displayName = 'AdminPanel';
