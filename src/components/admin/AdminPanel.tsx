/**
 * AdminPanel Component
 * 
 * Wrapper component that handles admin authentication state
 * and displays either login, dashboard, or framework overview.
 */

import React, { useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { FrameworkOverview } from './FrameworkOverview';

type AdminView = 'dashboard' | 'framework';

export const AdminPanel: React.FC = () => {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const [view, setView] = useState<AdminView>('dashboard');
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  if (view === 'framework') {
    return <FrameworkOverview onBack={() => setView('dashboard')} />;
  }
  
  return <AdminDashboard onOpenFramework={() => setView('framework')} />;
};

AdminPanel.displayName = 'AdminPanel';
