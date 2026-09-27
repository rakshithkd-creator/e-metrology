import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  FileCheck2,
  Clock,
  AlertTriangle,
  XCircle,
  PlusCircle,
  CheckCircle2,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const BusinessDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessStats();
  }, []);

  const fetchBusinessStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load business dashboard.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to dashboard service.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Enterprise Legal Metrology Dashboard..." size="lg" />;
  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-200">
        {error || 'Unable to load dashboard.'}
      </div>
    );
  }

  const { cards, recentCertificates, activeApplications } = data;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
            ENTERPRISE WEIGHING & MEASUREMENT COMPLIANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Commercial Instrument Portfolio
          </h1>
          <p className="text-xs text-slate-500">
            Monitor statutory certificate validity, track verification schedules, and ensure uninterrupted legal trade.
          </p>
        </div>

        {/* 4 Quick Actions (Prompt requirement) */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/instruments/new"
            className="px-3.5 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Register Instrument</span>
          </Link>
          <Link
            to="/applications/new"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply for Verification</span>
          </Link>
          <Link
            to="/certificates"
            className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
            <span>View Certificates</span>
          </Link>
          <Link
            to="/track"
            className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Track Application</span>
          </Link>
        </div>
      </div>

      {/* Expiring Alert Banner if any */}
      {cards.expiringCertificates > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900">
                Action Required: {cards.expiringCertificates} Certificate{cards.expiringCertificates > 1 ? 's' : ''} Expiring Soon
              </div>
              <p className="text-xs text-amber-700">
                Statutory validity expires within 30 days. Operating an unverified instrument is an offense under Section 30.
              </p>
            </div>
          </div>
          <Link
            to="/applications/new"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm shrink-0 transition"
          >
            Apply for Re-Verification Now →
          </Link>
        </div>
      )}

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Registered Instruments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Registered Units</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{cards.registeredInstruments}</div>
          <Link to="/instruments" className="text-[11px] text-gov-accent font-semibold hover:underline mt-1 inline-block">
            View all →
          </Link>
        </div>

        {/* Active Certificates */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Active Valid</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{cards.activeCertificates}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Legally compliant</div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Pending Review</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{cards.pendingApplications}</div>
          <div className="text-[11px] text-blue-600 mt-1">In review/assigned</div>
        </div>

        {/* Upcoming Verification */}
        <div className="bg-white p-4 rounded-xl border border-sky-200 bg-sky-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-sky-700 uppercase">Scheduled Visits</div>
          <div className="text-2xl font-black text-sky-900 mt-1">{cards.upcomingVerifications}</div>
          <div className="text-[11px] text-sky-600 mt-1">Officer visit date</div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Expiring (30d)</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{cards.expiringCertificates}</div>
          <div className="text-[11px] text-amber-700 mt-1">Re-verification due</div>
        </div>

        {/* Expired Certificates */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Expired / Lapsed</div>
          <div className="text-2xl font-black text-rose-900 mt-1">{cards.expiredCertificates}</div>
          <div className="text-[11px] text-rose-700 mt-1">Needs urgent renewal</div>
        </div>
      </div>

      {/* Two Columns: Recent Applications & Active Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-800">Your Verification Applications</h3>
            <Link to="/applications" className="text-xs text-gov-accent font-semibold hover:underline">
              All applications →
            </Link>
          </div>

          {activeApplications.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              No verification applications currently on file.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeApplications.map((app: any) => (
                <div key={app.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-slate-800">{app.applicationId}</div>
                    <div className="text-slate-500">{app.instrument.type} ({app.instrument.instrumentId})</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} size="sm" />
                    <Link
                      to={`/applications/${app.id}`}
                      className="text-gov-accent font-semibold hover:underline"
                    >
                      Track →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Digital Certificates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-800">Your Digital Certificates</h3>
            <Link to="/certificates" className="text-xs text-gov-accent font-semibold hover:underline">
              Certificate repository →
            </Link>
          </div>

          {recentCertificates.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              No certificates issued yet. Submit an application to get certified.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentCertificates.map((cert: any) => (
                <div key={cert.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-gov-blue">{cert.certificateNumber}</div>
                    <div className="text-slate-500">
                      {cert.instrument.type} • Valid until {new Date(cert.validUntil).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={cert.status} size="sm" />
                    <Link
                      to={`/certificates/${cert.certificateNumber}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold transition"
                    >
                      View / PDF
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
