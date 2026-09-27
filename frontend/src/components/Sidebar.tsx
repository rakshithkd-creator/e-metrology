import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Scale,
  FileText,
  FileCheck2,
  Users,
  ShieldAlert,
  ClipboardList,
  FileSpreadsheet,
  PlusCircle,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/instruments', icon: Scale, label: 'All Instruments' },
    { to: '/applications', icon: FileText, label: 'All Applications' },
    { to: '/certificates', icon: FileCheck2, label: 'Certificate Repository' },
    { to: '/admin/users', icon: Users, label: 'Manage Stakeholders' },
    { to: '/admin/settings', icon: ClipboardList, label: 'Verification Checklist' },
    { to: '/audit-logs', icon: ShieldAlert, label: 'Audit Trail' },
    { to: '/reports', icon: FileSpreadsheet, label: 'Statutory Reports' },
  ];

  const lmoLinks = [
    { to: '/lmo/dashboard', icon: LayoutDashboard, label: 'Officer Dashboard' },
    { to: '/applications', icon: CalendarCheck, label: 'Assigned Inspections' },
    { to: '/instruments', icon: Scale, label: 'Instruments Catalog' },
    { to: '/certificates', icon: FileCheck2, label: 'Issued Certificates' },
  ];

  const gatcLinks = [
    { to: '/gatc/dashboard', icon: LayoutDashboard, label: 'Lab Dashboard' },
    { to: '/applications', icon: CalendarCheck, label: 'Testing Queue' },
    { to: '/instruments', icon: Scale, label: 'Instruments Directory' },
    { to: '/certificates', icon: FileCheck2, label: 'Test Certificates' },
  ];

  const businessLinks = [
    { to: '/business/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/instruments', icon: Scale, label: 'My Instruments' },
    { to: '/instruments/new', icon: PlusCircle, label: 'Register Instrument' },
    { to: '/applications', icon: FileText, label: 'My Applications' },
    { to: '/applications/new', icon: CheckCircle2, label: 'Apply for Verification' },
    { to: '/certificates', icon: FileCheck2, label: 'Digital Certificates' },
  ];

  let links = businessLinks;
  if (role === 'SUPER_ADMIN') links = adminLinks;
  else if (role === 'LMO') links = lmoLinks;
  else if (role === 'GATC') links = gatcLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col border-r border-slate-800 shrink-0">
      {/* Role Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          Current Portal
        </div>
        <div className="text-sm font-bold text-white mt-0.5 truncate">
          {role === 'SUPER_ADMIN' && 'Directorate Admin Console'}
          {role === 'LMO' && 'Legal Metrology Field Wing'}
          {role === 'GATC' && 'GATC Testing Laboratory'}
          {role === 'BUSINESS_USER' && 'Trade & Industry Portal'}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {user.organizationName || user.fullName}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to.includes('dashboard') || link.to.endsWith('/new')}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-gov-blue text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500">
        <div>Legal Metrology Act, 2009</div>
        <div className="text-slate-400 font-mono mt-0.5">v1.0.0-PROD</div>
      </div>
    </aside>
  );
};
