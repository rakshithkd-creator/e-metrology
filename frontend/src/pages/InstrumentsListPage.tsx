import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, PlusCircle, Search, Filter, Eye, MapPin, Building, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { Instrument } from '../types';
import { LoadingSpinner, EmptyState } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const InstrumentsListPage: React.FC = () => {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/instruments', {
        search,
        category,
        status,
        page,
        limit: 12,
      });
      if (res.success) {
        setInstruments(res.instruments);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load instruments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, [category, status, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInstruments();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Registered Weighing & Measuring Instruments
          </h1>
          <p className="text-xs text-slate-500">
            {user?.role === 'BUSINESS_USER'
              ? 'Catalog of instruments registered under your organization'
              : 'Master registry of all instruments under state statutory jurisdiction'}
          </p>
        </div>

        {user?.role === 'BUSINESS_USER' || user?.role === 'SUPER_ADMIN' ? (
          <Link
            to="/instruments/new"
            className="px-4 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Register New Instrument</span>
          </Link>
        ) : null}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Instrument ID, Serial No, Make, or Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium outline-none"
          >
            <option value="">All Categories</option>
            <option value="WEIGHING">Weighing</option>
            <option value="VOLUME">Volume</option>
            <option value="LENGTH">Length</option>
            <option value="FLOW">Flow / Dispenser</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Instruments Grid */}
      {loading ? (
        <LoadingSpinner message="Querying instrument catalog..." />
      ) : instruments.length === 0 ? (
        <EmptyState
          icon={<Scale className="w-12 h-12" />}
          title="No Instruments Found"
          description="No weighing or measuring instruments match the selected criteria."
          action={
            user?.role === 'BUSINESS_USER'
              ? { label: 'Register First Instrument', onClick: () => window.location.assign('/instruments/new') }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instruments.map((inst) => (
            <div
              key={inst.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono font-bold text-xs text-gov-blue bg-blue-50 px-2 py-0.5 rounded">
                    {inst.instrumentId}
                  </span>
                  <StatusBadge status={inst.status} size="sm" />
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-800 line-clamp-1">{inst.type}</h3>
                  <div className="text-xs text-slate-500">{inst.manufacturer} • {inst.model}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial No:</span>
                    <span className="font-mono font-bold text-slate-700">{inst.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacity & Class:</span>
                    <span className="font-semibold text-slate-700">{inst.capacity} ({inst.accuracyClass})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-700 truncate max-w-[160px]">{inst.district}, {inst.state}</span>
                  </div>
                </div>

                {inst.owner && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Building className="w-3.5 h-3.5" />
                    <span className="truncate">{inst.owner.organizationName || inst.owner.fullName}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/instruments/${inst.id}`}
                  className="text-xs font-bold text-gov-blue hover:text-gov-dark flex items-center gap-1 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>

                <Link
                  to={`/applications/new?instrumentId=${inst.id}`}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-gov-blue font-bold text-xs rounded border border-slate-300 shadow-2xs transition"
                >
                  Apply Verification →
                </Link>
              </div>
            </div>
          ))}
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
