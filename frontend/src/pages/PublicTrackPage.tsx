import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, CheckCircle2, Clock, XCircle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const PublicTrackPage: React.FC = () => {
  const { appId } = useParams<{ appId?: string }>();
  const [searchInput, setSearchInput] = useState(appId || '');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const res = await api.get(`/public/track/${encodeURIComponent(id.trim())}`);
      if (res.success) {
        setTrackingData(res);
      } else {
        setError(res.message || 'Application not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to find application tracking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appId) {
      setSearchInput(appId);
      fetchTracking(appId);
    }
  }, [appId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchTracking(searchInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <Search className="w-4 h-4 text-sky-600" />
            <span>Application Lifecycle Tracker</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Verification Application
          </h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            View real-time departmental processing stages from submission to statutory certificate generation.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Application ID (e.g. LM-APP-2026-000101)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-mono uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-blue hover:bg-gov-dark text-white font-bold text-sm rounded-lg shadow-sm transition"
            >
              Track
            </button>
          </form>
        </div>

        {loading && <LoadingSpinner message="Retrieving application lifecycle timeline..." />}

        {error && !loading && (
          <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-bold text-base text-slate-800">Application Not Found</h3>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        )}

        {trackingData && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400">APPLICATION DOSSIER</span>
                <div className="text-2xl font-black font-mono tracking-wider">{trackingData.applicationId}</div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {trackingData.instrumentType} • {trackingData.district}
                </div>
              </div>
              <div>
                <StatusBadge status={trackingData.currentStatus} size="lg" />
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 sm:p-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Verification Progress Milestones
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:z-0">
                {trackingData.milestones.map((milestone: any, index: number) => {
                  const isDone = milestone.status === 'COMPLETED';
                  const isProgress = milestone.status === 'IN_PROGRESS' || milestone.status === 'SCHEDULED';
                  const isFail = milestone.status === 'FAILED';

                  return (
                    <div key={index} className="flex items-start gap-4 relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-600 shadow'
                            : isProgress
                            ? 'bg-sky-500 shadow animate-pulse'
                            : isFail
                            ? 'bg-rose-600 shadow'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-slate-800">{milestone.name}</h4>
                          {milestone.date && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {new Date(milestone.date).toLocaleDateString('en-GB')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{milestone.details}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Certificate Quick Link if Available */}
              {trackingData.certificateNumber && (
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">Certificate Issued</div>
                      <div className="text-xs text-emerald-700 font-mono">{trackingData.certificateNumber}</div>
                    </div>
                  </div>
                  <Link
                    to={`/verify/${trackingData.certificateNumber}`}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    View Certificate →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
