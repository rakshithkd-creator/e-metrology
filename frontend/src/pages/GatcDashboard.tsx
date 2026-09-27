import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, CheckCircle2, Clock, CalendarCheck, FileCheck2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const GatcDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner message="Loading GATC Testing Console..." />;

  const { cards, pendingList = [] } = data || { cards: {}, pendingList: [] };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
          GOVERNMENT APPROVED TEST CENTRE (GATC)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Laboratory Calibration & Testing Roster
        </h1>
        <p className="text-xs text-slate-500">
          Conduct accredited laboratory evaluations for high-precision, bulk volumetric, and flow metering equipment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Assigned Applications</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{cards.assignedApplications || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-teal-200 bg-teal-50/20 shadow-sm">
          <div className="text-xs font-bold text-teal-700 uppercase">Completed Lab Tests</div>
          <div className="text-3xl font-black text-teal-900 mt-1">{cards.completedTests || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-xs font-bold text-amber-700 uppercase">Pending In-Queue</div>
          <div className="text-3xl font-black text-amber-900 mt-1">{cards.pendingTests || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-800">Pending Laboratory Queue</h3>
        {pendingList.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">No pending laboratory evaluations.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingList.map((app: any) => (
              <div key={app.id} className="py-4 flex justify-between items-center text-xs">
                <div>
                  <div className="font-mono font-bold text-gov-blue">{app.applicationId}</div>
                  <div className="font-semibold text-slate-800">{app.instrument.type} ({app.instrument.model})</div>
                  <div className="text-slate-400 text-[11px]">Applicant: {app.user.organizationName || app.user.fullName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} size="sm" />
                  <Link
                    to={`/field-verification/${app.id}`}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded font-bold transition"
                  >
                    Enter Lab Results →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
