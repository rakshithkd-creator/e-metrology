import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, PlusCircle, Search, Filter, CalendarCheck, ArrowRight, Clock } from 'lucide-react';
import { api } from '../api/client';
import { Application } from '../types';
import { LoadingSpinner, EmptyState } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const ApplicationsListPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications', {
        status: statusFilter,
        search,
        page,
        limit: 15,
        scope: searchParams.get('scope') || undefined,
      });
      if (res.success) {
        setApplications(res.applications);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verification & Stamping Applications
          </h1>
          <p className="text-xs text-slate-500">
            {user?.role === 'BUSINESS_USER'
              ? 'Track the processing timeline of your submitted applications'
              : 'Review dossiers, schedule inspections, and allocate verifying officers'}
          </p>
        </div>

        {user?.role === 'BUSINESS_USER' || user?.role === 'SUPER_ADMIN' ? (
          <Link
            to="/applications/new"
            className="px-4 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>New Verification Application</span>
          </Link>
        ) : null}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Application ID, Instrument ID, or Applicant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="CERTIFICATE_ISSUED">CERTIFICATE ISSUED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <LoadingSpinner message="Querying application register..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No Applications Found"
          description="There are currently no verification applications matching the criteria."
          action={
            user?.role === 'BUSINESS_USER'
              ? { label: 'Submit Application', onClick: () => window.location.assign('/applications/new') }
              : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Instrument</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Assigned Officer</th>
                  <th className="py-3.5 px-4">Scheduled Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gov-blue">
                      <Link to={`/applications/${app.id}`} className="hover:underline">
                        {app.applicationId}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.instrument.type}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.instrument.instrumentId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-600">
                        {app.type === 'NEW_VERIFICATION' ? 'New Verification' : 'Re-Verification'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">
                        {app.user.organizationName || app.user.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400">{app.instrument.district}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {app.assignedOfficer ? (
                        <span className="font-medium text-slate-700">{app.assignedOfficer.fullName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {app.scheduledDate ? (
                        <span className="font-medium text-slate-700">
                          {new Date(app.scheduledDate).toLocaleDateString('en-GB')} {app.scheduledTime ? `(${app.scheduledTime})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/applications/${app.id}`}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-gov-blue font-bold rounded transition inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-xs rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-slate-600 font-medium">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-xs rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
