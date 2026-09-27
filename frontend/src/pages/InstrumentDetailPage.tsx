import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Scale,
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  FileCheck2,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { Instrument } from '../types';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const InstrumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/instruments/${id}`)
      .then((res) => {
        if (res.success && res.instrument) {
          setInstrument(res.instrument);
        } else {
          setError(res.message || 'Instrument not found.');
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch instrument.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Retrieving instrument dossier..." />;
  if (error || !instrument) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-200">
        {error || 'Instrument not found.'}
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back button and title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/instruments"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-mono">
                {instrument.instrumentId}
              </h1>
              <StatusBadge status={instrument.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500">{instrument.type}</p>
          </div>
        </div>

        <Link
          to={`/applications/new?instrumentId=${instrument.id}`}
          className="px-4 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Apply for Verification</span>
        </Link>
      </div>

      {/* Specifications Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Metrological Specifications & Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Manufacturer</span>
              <span className="font-bold text-slate-800 text-sm">{instrument.manufacturer}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Model Designation</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{instrument.model}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Serial Number</span>
              <span className="font-bold text-gov-blue text-sm font-mono">{instrument.serialNumber}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Capacity / Unit</span>
              <span className="font-bold text-slate-800 text-sm">{instrument.capacity} ({instrument.unitOfMeasurement})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
          <div>
            <span className="text-slate-400 block mb-0.5">Accuracy Classification:</span>
            <span className="font-bold text-slate-800">{instrument.accuracyClass}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Installation Location:</span>
            <span className="font-bold text-slate-800">{instrument.location}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">District / Jurisdiction:</span>
            <span className="font-bold text-slate-800">{instrument.district}, {instrument.state}</span>
          </div>
        </div>

        {/* Owner Details */}
        {instrument.owner && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Registered Commercial Holder
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block">Name:</span>
                <span className="font-bold text-slate-800">{instrument.owner.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Organization:</span>
                <span className="font-bold text-slate-800">{instrument.owner.organizationName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Phone:</span>
                <span className="font-bold text-slate-800">{instrument.owner.phone}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Linked Certificates & Verification History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Applications History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-800">Verification Dossiers</h3>
          {(!instrument.applications || instrument.applications.length === 0) ? (
            <div className="text-xs text-slate-400 py-6 text-center">No applications filed yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {instrument.applications.map((app: any) => (
                <div key={app.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-gov-blue">{app.applicationId}</div>
                    <div className="text-slate-400 text-[11px]">{new Date(app.createdAt).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} size="sm" />
                    <Link to={`/applications/${app.id}`} className="text-gov-accent font-semibold hover:underline">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issued Certificates History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-800">Legal Metrology Certificates</h3>
          {(!instrument.certificates || instrument.certificates.length === 0) ? (
            <div className="text-xs text-slate-400 py-6 text-center">No certificates issued yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {instrument.certificates.map((cert: any) => (
                <div key={cert.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-emerald-800">{cert.certificateNumber}</div>
                    <div className="text-slate-400 text-[11px]">Valid until: {new Date(cert.validUntil).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={cert.status} size="sm" />
                    <Link to={`/certificates/${cert.certificateNumber}`} className="text-gov-accent font-semibold hover:underline">
                      Certificate →
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
