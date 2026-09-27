import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  MapPin,
  Calendar,
  Scale,
  ArrowRight,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const LmoDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');

  useEffect(() => {
    fetchLmoStats();
  }, []);

  const fetchLmoStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load LMO stats.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to LMO service.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Officer Inspection Roster..." size="lg" />;
  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-200">
        {error || 'Unable to load dashboard.'}
      </div>
    );
  }

  const { cards, scheduledInspections, recentInspections } = data;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
            LEGAL METROLOGY FIELD INSPECTION CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Officer Verification Roster
          </h1>
          <p className="text-xs text-slate-500">
            Conduct on-site testing, record standard/observed load tests, and issue statutory certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'LIST' ? 'CALENDAR' : 'LIST')}
            className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg border border-slate-300 shadow-sm flex items-center gap-1.5 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch to {viewMode === 'LIST' ? 'Calendar View' : 'List View'}</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Assigned */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Assigned Total</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{cards.assignedTotal}</div>
        </div>

        {/* Today's Inspections */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Today's Schedule</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{cards.todayInspections}</div>
        </div>

        {/* Upcoming */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Upcoming</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{cards.upcomingInspections}</div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Pending Tests</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{cards.pendingInspections}</div>
        </div>

        {/* Completed (PASS) */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Passed & Stamped</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{cards.completedVerifications}</div>
        </div>

        {/* Failed */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Tolerance Failed</div>
          <div className="text-2xl font-black text-rose-900 mt-1">{cards.failedVerifications}</div>
        </div>
      </div>

      {/* Scheduled Inspections Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-bold text-base text-slate-900">Active Field Inspection Queue</h2>
            <p className="text-xs text-slate-500">
              Select an instrument to open the mobile-optimized physical field verification interface.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            {scheduledInspections.length} Inspections Pending Action
          </span>
        </div>

        {scheduledInspections.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No pending inspections assigned to your queue.
          </div>
        ) : viewMode === 'LIST' ? (
          <div className="divide-y divide-slate-100">
            {scheduledInspections.map((app: any) => (
              <div
                key={app.id}
                className="p-5 hover:bg-slate-50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gov-blue">{app.applicationId}</span>
                    <StatusBadge status={app.status} size="sm" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      {app.type.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800">
                    {app.instrument.type} — <span className="font-normal text-slate-600">{app.instrument.model}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Capacity: <strong>{app.instrument.capacity}</strong> ({app.instrument.accuracyClass})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Owner: <strong>{app.user.organizationName || app.user.fullName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{app.scheduledLocation || app.instrument.location}</span>
                    </div>
                  </div>

                  {app.scheduledDate && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Scheduled: {new Date(app.scheduledDate).toLocaleDateString('en-GB')} at {app.scheduledTime || 'TBD'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Primary Field Verification CTA */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Link
                    to={`/field-verification/${app.id}`}
                    className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-200" />
                    <span>Launch Field Verification →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Calendar Style Grid */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {scheduledInspections.map((app: any) => (
              <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-gov-blue">{app.applicationId}</span>
                  <StatusBadge status={app.status} size="sm" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{app.instrument.type}</div>
                  <div className="text-xs text-slate-500">{app.instrument.model}</div>
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{app.scheduledDate ? new Date(app.scheduledDate).toLocaleDateString('en-GB') : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{app.scheduledTime || 'Unscheduled'}</span>
                  </div>
                </div>
                <Link
                  to={`/field-verification/${app.id}`}
                  className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Verify Now →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed Inspections */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-800">Your Recently Completed Verifications</h3>
        {recentInspections.length === 0 ? (
          <div className="text-xs text-slate-400">No completed verifications yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentInspections.map((insp: any) => (
              <div key={insp.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-700">{insp.inspectionId}</span>
                  <span className="text-slate-500 ml-2">{insp.instrument.type} ({insp.instrument.manufacturer})</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={insp.result} size="sm" />
                  {insp.certificate && (
                    <Link
                      to={`/certificates/${insp.certificate.certificateNumber}`}
                      className="text-gov-accent font-semibold hover:underline"
                    >
                      {insp.certificate.certificateNumber} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
