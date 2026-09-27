import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, XCircle, Shield, Building, Phone, Mail } from 'lucide-react';
import { api } from '../api/client';
import { User } from '../types';
import { LoadingSpinner, EmptyState } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 15,
      });
      if (res.success) {
        setUsers(res.users);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/users/${userId}/status`, { status: newStatus });
      if (res.success) {
        fetchUsers();
      }
    } catch (err: any) {
      alert('Failed to update user status: ' + err.message);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Stakeholder Account Administration
        </h1>
        <p className="text-xs text-slate-500">
          Super Admin oversight for approving, suspending, and inspecting stakeholder profiles and credentials.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by User Name, Email, Organization, or District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium outline-none"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="LMO">Legal Metrology Officer (LMO)</option>
            <option value="GATC">Govt Approved Test Centre (GATC)</option>
            <option value="BUSINESS_USER">Business / Trader</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium outline-none"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PENDING">PENDING</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Querying user directory..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="No Users Found"
          description="No stakeholder accounts match the specified filters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Stakeholder</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">District / State</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.email} • {u.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {u.organizationName || 'Individual Trader'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.district || 'Unassigned'}, {u.state || ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'SUPER_ADMIN' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleStatusChange(u.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold transition"
                            >
                              Approve
                            </button>
                          )}
                          {u.status !== 'SUSPENDED' && (
                            <button
                              onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold transition"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      )}
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
