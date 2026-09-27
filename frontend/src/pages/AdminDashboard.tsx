import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  FileText,
  Clock,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  MapPin,
  Users,
  Filter,
  Download,
  ArrowRight,
} from 'lucide-react';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load dashboard data.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to analytics engine.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Aggregating Directorate MIS Analytics..." size="lg" />;
  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-200">
        {error || 'Unable to load dashboard.'}
      </div>
    );
  }

  const { cards, charts } = data;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-gov-accent uppercase tracking-wider">
            DIRECTORATE MIS EXECUTIVE CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Legal Metrology Administration
          </h1>
          <p className="text-xs text-slate-500">
            Real-time statutory verification metrics, officer workload, and certificate compliance oversight.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/reports"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Statutory MIS</span>
          </Link>
          <Link
            to="/applications"
            className="px-3.5 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Verifications</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid (8 Core Requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Instruments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Instruments</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{cards.totalInstruments}</div>
            <Link to="/instruments" className="text-[11px] text-gov-accent font-semibold hover:underline mt-1 inline-block">
              View catalog →
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applications</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{cards.totalApplications}</div>
            <div className="text-[11px] text-slate-500 mt-1">Total filed</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{cards.pendingApplications}</div>
            <Link to="/applications?status=SUBMITTED" className="text-[11px] text-amber-700 font-semibold hover:underline mt-1 inline-block">
              Needs allocation →
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Scheduled Inspections */}
        <div className="bg-white p-4 rounded-xl border border-sky-200 bg-sky-50/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Scheduled</div>
            <div className="text-2xl font-black text-sky-900 mt-1">{cards.scheduledInspections}</div>
            <div className="text-[11px] text-sky-600 mt-1">In field queue</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Verifications */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Tests</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{cards.completedVerifications}</div>
            <div className="text-[11px] text-slate-500 mt-1">Verified on-site</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Certificates Issued</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{cards.certificatesIssued}</div>
            <Link to="/certificates" className="text-[11px] text-emerald-700 font-semibold hover:underline mt-1 inline-block">
              Repository →
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* Certificates Expiring Soon */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Expiring Soon (30d)</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{cards.expiringSoonCertificates}</div>
            <Link to="/certificates?status=EXPIRING_SOON" className="text-[11px] text-amber-700 font-semibold hover:underline mt-1 inline-block">
              Send notices →
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Expired Certificates */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Expired Certificates</div>
            <div className="text-2xl font-black text-rose-900 mt-1">{cards.expiredCertificates}</div>
            <Link to="/certificates?status=EXPIRED" className="text-[11px] text-rose-700 font-semibold hover:underline mt-1 inline-block">
              Enforce renewal →
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Applications Monthly Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-800">Verification Application Volume</h3>
              <p className="text-xs text-slate-500">Monthly statutory verification applications submitted</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Active FY 2025-26
            </span>
          </div>

          <div className="h-56 flex items-end gap-6 pt-6 pb-2 px-4 border-b border-slate-100">
            {charts.applicationsByMonth.map((item: any, i: number) => {
              const max = Math.max(...charts.applicationsByMonth.map((m: any) => m.count), 1);
              const heightPct = Math.max((item.count / max) * 100, 15);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                    {item.count}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[48px] bg-gov-blue hover:bg-gov-dark rounded-t-lg transition-all shadow-sm"
                  />
                  <span className="text-[11px] font-semibold text-slate-500 mt-1">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: PASS vs FAIL Ratio */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">Inspection Pass / Fail Ratio</h3>
            <p className="text-xs text-slate-500">Accuracy & stamping results</p>
          </div>

          <div className="py-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-600">{charts.passVsFail.pass}</div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-1">PASSED</div>
              </div>
              <div className="text-2xl font-light text-slate-300">/</div>
              <div className="text-center">
                <div className="text-3xl font-black text-rose-600">{charts.passVsFail.fail}</div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-1">FAILED</div>
              </div>
            </div>

            {/* Simple progress bar */}
            <div className="w-full bg-rose-100 h-3 rounded-full mt-6 overflow-hidden flex">
              <div
                style={{
                  width: `${
                    charts.passVsFail.pass + charts.passVsFail.fail > 0
                      ? (charts.passVsFail.pass / (charts.passVsFail.pass + charts.passVsFail.fail)) * 100
                      : 100
                  }%`,
                }}
                className="bg-emerald-600 h-full"
              />
            </div>
            <div className="w-full flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>Pass Rate: {charts.passVsFail.pass + charts.passVsFail.fail > 0 ? Math.round((charts.passVsFail.pass / (charts.passVsFail.pass + charts.passVsFail.fail)) * 100) : 100}%</span>
              <span>Tolerance Fail: {charts.passVsFail.fail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown & District Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-800">Instruments by Category</h3>
          <div className="space-y-3">
            {charts.categoryBreakdown.map((cat: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{cat.name}</span>
                  <span className="font-mono text-slate-500">{cat.count} units</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(cat.count * 20, 100)}%` }}
                    className="bg-gov-accent h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-800">District-wise Activity</h3>
          <div className="space-y-3">
            {charts.districtBreakdown.map((dist: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-800">{dist.district}</span>
                </div>
                <span className="font-bold font-mono text-gov-blue">{dist.count} applications</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Officer Workload */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-slate-800">Officer Workload & Allocation</h3>
            <p className="text-xs text-slate-500">Assigned vs completed field inspections per officer</p>
          </div>
          <Link to="/admin/users" className="text-xs text-gov-accent font-semibold hover:underline">
            Manage Officers →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {charts.officerWorkload.map((officer: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-gov-blue flex items-center justify-center font-bold text-xs">
                  {officer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">{officer.name}</div>
                  <div className="text-[10px] text-slate-500">{officer.district}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Assigned Queue</span>
                  <span className="font-extrabold text-gov-blue">{officer.assigned}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Completed</span>
                  <span className="font-extrabold text-emerald-700">{officer.completed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
