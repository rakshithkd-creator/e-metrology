import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  ArrowLeft,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Building,
  Scale,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { Certificate } from '../types';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const CertificateDetailPage: React.FC = () => {
  const { certNumber } = useParams<{ certNumber: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Revoke Modal (Admin only)
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchCertificate = async () => {
    if (!certNumber) return;
    setLoading(true);
    try {
      const res = await api.get(`/certificates/${certNumber}`);
      if (res.success && res.certificate) {
        setCertificate(res.certificate);
      } else {
        setError(res.message || 'Certificate not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch certificate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, [certNumber]);

  const handleDownloadPdf = () => {
    if (!certificate) return;
    window.open(`/api/certificates/${certificate.certificateNumber}/pdf`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevoking(true);
    setRevokeError(null);
    try {
      const res = await api.post(`/certificates/${certificate?.certificateNumber}/revoke`, {
        reason: revokeReason,
      });
      if (res.success) {
        setRevokeModalOpen(false);
        fetchCertificate();
      } else {
        setRevokeError(res.message || 'Failed to revoke certificate.');
      }
    } catch (err: any) {
      setRevokeError(err.message || 'Revocation request failed.');
    } finally {
      setRevoking(false);
    }
  };

  if (loading) return <LoadingSpinner message="Rendering official digital certificate..." />;
  if (error || !certificate) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-200">
        {error || 'Certificate not found.'}
      </div>
    );
  }

  const isAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Action Bar (No-print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 font-mono">
                {certificate.certificateNumber}
              </h1>
              <StatusBadge status={certificate.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Statutory Verification Document under Legal Metrology Act, 2009
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Official PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>
          {isAdmin && certificate.status !== 'REVOKED' && (
            <button
              onClick={() => setRevokeModalOpen(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-300 transition"
            >
              Revoke Certificate
            </button>
          )}
        </div>
      </div>

      {/* Official Certificate Visual Document */}
      <div className="bg-white rounded-3xl shadow-xl border-4 border-gov-blue p-8 sm:p-12 space-y-8 relative overflow-hidden printable">
        {/* Subtle background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Scale className="w-96 h-96" />
        </div>

        {/* Certificate Decorative Border */}
        <div className="border border-amber-600/60 p-6 sm:p-8 rounded-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base text-gov-blue tracking-widest uppercase">
              GOVERNMENT OF INDIA
            </h3>
            <h2 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight font-serif">
              DEPARTMENT OF LEGAL METROLOGY
            </h2>
            <p className="text-[11px] text-slate-500">
              (Under Section 24 of The Legal Metrology Act, 2009 & Rule 14 of Legal Metrology Rules, 2011)
            </p>

            <div className="pt-3">
              <div className="inline-block bg-gov-blue text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase px-6 py-1.5 rounded-full shadow-sm">
                Digital Certificate of Verification
              </div>
            </div>
          </div>

          {/* Certificate Identification Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Certificate No: </span>
              <span className="font-mono font-bold text-gov-blue text-sm">{certificate.certificateNumber}</span>
            </div>
            <div>
              <span className="text-slate-500">Security Seal No: </span>
              <span className="font-mono font-bold text-slate-800">{certificate.sealNumber || 'LM-SEAL-VERIFIED'}</span>
            </div>
            <div>
              <span className="text-slate-500">Status: </span>
              <StatusBadge status={certificate.status} size="sm" />
            </div>
          </div>

          {/* Legal Certification Preamble */}
          <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            This is to certify that the weighing / measuring instrument described below has been officially inspected, tested, verified and stamped by the designated Legal Metrology Officer in accordance with the provisions of the Legal Metrology Act, 2009 and the rules made thereunder, having satisfied all statutory verification parameters and Maximum Permissible Error (MPE) thresholds.
          </p>

          {/* Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Column 1: Instrument Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-gov-blue text-xs uppercase tracking-wider mb-2">
                Instrument Specifications
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Instrument ID:</span>
                <span className="font-mono font-bold">{certificate.instrument.instrumentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instrument Type:</span>
                <span className="font-bold text-slate-800">{certificate.instrument.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Manufacturer / Make:</span>
                <span className="font-semibold text-slate-800">{certificate.instrument.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model Designation:</span>
                <span className="font-mono font-semibold">{certificate.instrument.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Number:</span>
                <span className="font-mono font-bold text-gov-blue">{certificate.instrument.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maximum Capacity:</span>
                <span className="font-bold">{certificate.instrument.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Accuracy Class:</span>
                <span className="font-bold">{certificate.instrument.accuracyClass} ({certificate.instrument.unitOfMeasurement})</span>
              </div>
            </div>

            {/* Column 2: Holder & Site Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-gov-blue text-xs uppercase tracking-wider mb-2">
                User & Location of Use
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Holder:</span>
                <span className="font-bold text-slate-800">{certificate.issuedTo.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Enterprise Name:</span>
                <span className="font-bold text-slate-800">{certificate.issuedTo.organizationName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-medium text-slate-800">{certificate.issuedTo.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Installation Site:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">{certificate.instrument.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">District / State:</span>
                <span className="font-medium text-slate-800">{certificate.instrument.district}, {certificate.instrument.state}</span>
              </div>
            </div>
          </div>

          {/* Statutory Validity Banner */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-widest block mb-1">
              STATUTORY VALIDITY PERIOD
            </span>
            <div className="text-sm sm:text-base font-extrabold text-gov-blue">
              Valid From: {new Date(certificate.validFrom).toLocaleDateString('en-GB')} &nbsp; | &nbsp; Valid Until: {new Date(certificate.validUntil).toLocaleDateString('en-GB')}
            </div>
          </div>

          {/* QR Code & Digital Signature */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* QR Authentication Box */}
            <div className="flex items-center gap-4">
              {certificate.qrCodeDataUrl ? (
                <img
                  src={certificate.qrCodeDataUrl}
                  alt="Certificate QR"
                  className="w-24 h-24 rounded-lg border border-slate-300 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 flex items-center justify-center rounded-lg border">
                  <QrCode className="w-10 h-10 text-slate-400" />
                </div>
              )}
              <div className="text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Scan to Verify Authenticity</span>
                </div>
                <div>Public QR Validation Link:</div>
                <Link
                  to={`/verify/${certificate.certificateNumber}`}
                  className="text-gov-accent hover:underline font-mono text-[10px] break-all block"
                >
                  /verify/{certificate.certificateNumber}
                </Link>
                <div className="text-[10px] text-slate-400">Cryptographically anchored to registry</div>
              </div>
            </div>

            {/* Officer Stamp */}
            <div className="text-right text-xs space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="text-[11px] font-bold text-emerald-700">
                ✔ DIGITALLY SIGNED & VERIFIED
              </div>
              <div className="font-bold text-slate-900 text-sm">{certificate.issuedBy.fullName}</div>
              <div className="text-slate-500">{certificate.issuedBy.organizationName || 'District Legal Metrology Wing'}</div>
              <div className="text-[10px] text-slate-400">Date: {new Date(certificate.verificationDate).toLocaleDateString('en-GB')}</div>
              <div className="text-[9px] text-slate-400 italic">No physical signature required under IT Act 2000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Revoke Modal */}
      {revokeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Revoke Legal Metrology Certificate</span>
              </h3>
              <button onClick={() => setRevokeModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {revokeError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {revokeError}
              </div>
            )}

            <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Revoking this certificate immediately invalidates statutory stamping for instrument <strong>{certificate.instrument.instrumentId}</strong>. A notice of revocation will be served on the holder.
              </p>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Statutory Grounds / Reason for Revocation *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Broken physical security seal, consumer tampering complaint substantiated, altered electronic calibration..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revoking}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  {revoking ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
