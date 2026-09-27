import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  // Certificate / Verification statuses
  if (['ACTIVE', 'PASS', 'VERIFIED', 'CERTIFICATE_ISSUED', 'APPROVED'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['EXPIRING_SOON', 'SCHEDULED', 'UNDER_REVIEW', 'ASSIGNED', 'INSPECTION_IN_PROGRESS'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['EXPIRED', 'FAIL', 'REJECTED', 'REVOKED', 'CANCELLED', 'SUSPENDED'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (['SUBMITTED', 'PENDING', 'PENDING_VERIFICATION'].includes(normalized)) {
    styles = 'bg-sky-50 text-sky-800 border-sky-200';
    dotColor = 'bg-sky-500';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{formatText(status)}</span>
    </span>
  );
};
