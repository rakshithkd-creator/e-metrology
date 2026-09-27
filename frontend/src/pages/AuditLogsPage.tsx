import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, ShieldCheck, User, Clock, Terminal } from 'lucide-react';
import { api } from '../api/client';
import { AuditLog } from '../types';
import { LoadingSpinner, EmptyState } from '../components/LoadingAndEmpty';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        search,
        action: actionFilter,
        entityType: entityFilter,
        page,
        limit: 20,
      });
      if (res.success) {
        setLogs(res.logs);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-gov-blue" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Statutory Digital Audit Trail
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically signed system activity logs recording all administrative, field verification, stamping, and revocation events.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by User, Action, Entity ID, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium outline-none"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="INSTRUMENT_CREATED">INSTRUMENT_CREATED</option>
            <option value="APPLICATION_SUBMITTED">APPLICATION_SUBMITTED</option>
            <option value="OFFICER_ASSIGNED">OFFICER_ASSIGNED</option>
            <option value="VERIFICATION_COMPLETED">VERIFICATION_COMPLETED</option>
            <option value="CERTIFICATE_GENERATED">CERTIFICATE_GENERATED</option>
            <option value="CERTIFICATE_REVOKED">CERTIFICATE_REVOKED</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium outline-none"
          >
            <option value="">All Entities</option>
            <option value="USER">USER</option>
            <option value="INSTRUMENT">INSTRUMENT</option>
            <option value="APPLICATION">APPLICATION</option>
            <option value="INSPECTION">INSPECTION</option>
            <option value="CERTIFICATE">CERTIFICATE</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner message="Querying immutable audit database..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Terminal className="w-12 h-12" />}
          title="No Audit Logs Found"
          description="No system activity matches the current search and filter parameters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition text-xs">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.userRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gov-blue">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                      {log.details || '-'}
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
