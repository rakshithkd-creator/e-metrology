import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { LmoDashboard } from './LmoDashboard';
import { GatcDashboard } from './GatcDashboard';
import { BusinessDashboard } from './BusinessDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <AdminDashboard />;
    case 'LMO':
      return <LmoDashboard />;
    case 'GATC':
      return <GatcDashboard />;
    case 'BUSINESS_USER':
    default:
      return <BusinessDashboard />;
  }
};
