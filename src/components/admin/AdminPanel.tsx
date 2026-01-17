/**
 * AdminPanel Component
 * 
 * Wrapper component that handles admin authentication state
 * and displays either login or dashboard.
 */

import React from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export const AdminPanel: React.FC = () => {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  return <AdminDashboard />;
};

AdminPanel.displayName = 'AdminPanel';
