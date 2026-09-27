import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Printer,
  Scale,
  Search,
  Building,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingAndEmpty';

export const PublicVerifyPage: React.FC = () => {
  const { certNumber } = useParams<{ certNumber?: string }>();
  const [searchInput, setSearchInput] = useState(certNumber || '');
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = async (certId: string) => {
    if (!certId.trim()) return;
    setLoading(true);
    setError(null);
    setCertificateData(null);

    try {
      const res = await api.get(`/public/verify/${encodeURIComponent(certId.trim())}`);
      if (res.success && res.found) {
        setCertificateData(res.certificate);
      } else {
        setError(res.message || 'No certificate record found for this identifier.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification lookup failed. Please check the certificate number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certNumber) {
      setSearchInput(certNumber);
      fetchVerification(certNumber);
    }
  }, [certNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchVerification(searchInput.trim());
    }
  };

  const handleDownloadPdf = () => {
    if (!certificateData) return;
    window.open(`/api/certificates/${certificateData.certificateNumber}/pdf`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-gov-blue text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>National Verification Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Digital Certificate Authentication
          </h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Direct public query interface to verify statutory stamping and authenticity under the Legal Metrology Act, 2009.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Certificate Number (e.g. LM-CERT-2026-000101) or QR Token"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-mono uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-blue hover:bg-gov-dark text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && <LoadingSpinner message="Querying National Legal Metrology Registry..." />}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Certificate Not Authenticated</h3>
              <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">{error}</p>
            </div>
            <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg max-w-md mx-auto text-left leading-relaxed">
              <strong>Warning:</strong> If an instrument displays a certificate number or QR code that cannot be found here, it may be uncertified or counterfeit. Please report this to your District Legal Metrology Officer.
            </div>
          </div>
        )}

        {/* Verified Certificate Display Card */}
        {certificateData && !loading && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden printable">
            {/* Status Header Banner */}
            <div
              className={`p-6 text-white text-center sm:text-left sm:flex justify-between items-center ${
                certificateData.status === 'VALID'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-600'
                  : certificateData.status === 'EXPIRED'
                  ? 'bg-gradient-to-r from-amber-800 to-amber-600'
                  : 'bg-gradient-to-r from-rose-900 to-rose-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {certificateData.status === 'VALID' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                  ) : certificateData.status === 'EXPIRED' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-200" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-200" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                    Official Verification Result
                  </span>
                </div>
                <div className="text-3xl font-extrabold tracking-tight">
                  STATUS: {certificateData.status}
                </div>
                <div className="text-xs text-slate-100 opacity-90">
                  Certificate No: <span className="font-mono font-bold">{certificateData.certificateNumber}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 flex gap-2 justify-center no-print">
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-gov-blue" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Revocation notice if revoked */}
            {certificateData.status === 'REVOKED' && (
              <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs">
                <strong>Notice of Revocation:</strong> This certificate was officially REVOKED by the Directorate on {new Date(certificateData.revokedAt).toLocaleDateString('en-GB')}. Reason: {certificateData.revocationReason}
              </div>
            )}

            {/* Certificate Details Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Instrument Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Instrument Identification & Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Instrument Type:</span>
                    <span className="font-bold text-slate-800 text-sm">{certificateData.instrument.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Manufacturer:</span>
                    <span className="font-semibold text-slate-800">{certificateData.instrument.manufacturer}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Model No:</span>
                    <span className="font-mono font-semibold text-slate-800">{certificateData.instrument.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Serial Number (Masked):</span>
                    <span className="font-mono font-bold text-gov-blue">{certificateData.instrument.maskedSerialNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Capacity / Range:</span>
                    <span className="font-bold text-slate-800">{certificateData.instrument.capacity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accuracy Class:</span>
                    <span className="font-bold text-slate-800">{certificateData.instrument.accuracyClass}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Validity Dates */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Statutory Validity Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/40 text-xs">
                  <div>
                    <span className="text-slate-500 block">Verification Date:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {new Date(certificateData.verificationDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Valid Until:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {new Date(certificateData.validUntil).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Validity Remaining:</span>
                    <span
                      className={`font-extrabold text-sm ${
                        certificateData.daysRemaining > 30
                          ? 'text-emerald-700'
                          : certificateData.daysRemaining > 0
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {certificateData.daysRemaining > 0
                        ? `${certificateData.daysRemaining} Days`
                        : 'Lapsed / Expired'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Issuing Authority & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 block font-semibold mb-1">Holder / Installation Site:</span>
                  <div className="font-bold text-slate-800 text-sm">{certificateData.holder.organization}</div>
                  <div className="text-slate-600 mt-0.5">District: {certificateData.instrument.district}, {certificateData.instrument.state}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 block font-semibold mb-1">Issuing Authority:</span>
                  <div className="font-bold text-slate-800 text-sm">{certificateData.issuingAuthority.officerName}</div>
                  <div className="text-slate-600 mt-0.5">{certificateData.issuingAuthority.department}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Seal: {certificateData.sealNumber || 'N/A'}</div>
                </div>
              </div>

              {/* Tamper Evidence Statement */}
              <div className="p-3.5 bg-slate-100 rounded-lg text-[11px] text-slate-500 text-center leading-relaxed">
                ✔ Digitally certified by the Department of Legal Metrology. Physical stamping seal verified under Section 24 of the Legal Metrology Act, 2009.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
