import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileCheck2, Search, Download, Eye, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { Certificate } from '../types';
import { LoadingSpinner, EmptyState } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const CertificatesListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/certificates', {
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      if (res.success) {
        setCertificates(res.certificates);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter, page, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCertificates();
  };

  const handleDownloadPdf = (certNum: string) => {
    window.open(`/api/certificates/${certNum}/pdf`, '_blank');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Digital Legal Metrology Certificates Repository
          </h1>
          <p className="text-xs text-slate-500">
            Statutory repository of digital verification certificates issued under the Legal Metrology Act, 2009.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Certificate Number, Instrument ID, Serial No, or Owner..."
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
            <option value="ACTIVE">ACTIVE (Valid)</option>
            <option value="EXPIRING_SOON">EXPIRING SOON (30 Days)</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="REVOKED">REVOKED</option>
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      {loading ? (
        <LoadingSpinner message="Querying certificate vault..." />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="w-12 h-12" />}
          title="No Certificates Found"
          description="There are currently no legal metrology certificates matching the specified criteria."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Certificate No</th>
                  <th className="py-3.5 px-4">Instrument</th>
                  <th className="py-3.5 px-4">Owner / Trader</th>
                  <th className="py-3.5 px-4">Valid From</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4">Issuing Officer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gov-blue">
                      <Link to={`/certificates/${cert.certificateNumber}`} className="hover:underline">
                        {cert.certificateNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{cert.instrument.type}</div>
                      <div className="text-[11px] text-slate-400 font-mono">SN: {cert.instrument.serialNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">
                        {cert.issuedTo.organizationName || cert.issuedTo.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400">{cert.instrument.district}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {new Date(cert.validFrom).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {new Date(cert.validUntil).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {cert.issuedBy.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cert.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPdf(cert.certificateNumber)}
                          title="Download Official PDF"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                        >
                          <Download className="w-3.5 h-3.5 text-gov-blue" />
                        </button>
                        <Link
                          to={`/certificates/${cert.certificateNumber}`}
                          className="px-2.5 py-1 bg-gov-blue hover:bg-gov-dark text-white font-bold rounded transition"
                        >
                          View
                        </Link>
                      </div>
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
