import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FileText, Scale, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { Instrument } from '../types';

export const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstrumentId = searchParams.get('instrumentId') || '';

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    instrumentId: preselectedInstrumentId,
    type: 'NEW_VERIFICATION',
    verificationType: 'ON_SITE',
    remarks: '',
    scheduledLocation: '',
  });

  useEffect(() => {
    api.get('/instruments').then((res) => {
      if (res.success && res.instruments) {
        setInstruments(res.instruments);
        if (preselectedInstrumentId) {
          const match = res.instruments.find(
            (i: Instrument) => i.id === preselectedInstrumentId || i.instrumentId === preselectedInstrumentId
          );
          if (match) {
            setSelectedInstrument(match);
            setFormData((prev) => ({
              ...prev,
              instrumentId: match.id,
              scheduledLocation: match.location,
              type: match.previousVerificationNumber ? 'RE_VERIFICATION' : 'NEW_VERIFICATION',
            }));
          }
        }
      }
    });
  }, [preselectedInstrumentId]);

  const handleInstrumentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const instId = e.target.value;
    const match = instruments.find((i) => i.id === instId);
    setSelectedInstrument(match || null);
    setFormData({
      ...formData,
      instrumentId: instId,
      scheduledLocation: match ? match.location : '',
      type: match?.previousVerificationNumber ? 'RE_VERIFICATION' : 'NEW_VERIFICATION',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.instrumentId) {
      setError('Please select an instrument to verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/applications', formData);
      if (res.success && res.application) {
        navigate(`/applications/${res.application.id}`);
      } else {
        setError(res.message || 'Failed to submit application.');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/applications" className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Apply for Statutory Verification
          </h1>
          <p className="text-xs text-slate-500">
            Submit request for initial statutory stamping or periodic re-verification under the Legal Metrology Act.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Instrument Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Registered Weighing / Measuring Instrument *
            </label>
            <select
              value={formData.instrumentId}
              onChange={handleInstrumentSelect}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-medium"
            >
              <option value="">-- Choose an Instrument from Registry --</option>
              {instruments.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.instrumentId} — {inst.type} ({inst.manufacturer}, {inst.capacity})
                </option>
              ))}
            </select>
            {instruments.length === 0 && (
              <p className="text-xs text-amber-700 mt-2">
                No instruments registered yet.{' '}
                <Link to="/instruments/new" className="font-bold underline">
                  Register your instrument first →
                </Link>
              </p>
            )}
          </div>

          {/* Auto-filled Instrument Details Card */}
          {selectedInstrument && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800 text-sm">{selectedInstrument.type}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block">Manufacturer:</span>
                  <span className="font-semibold text-slate-800">{selectedInstrument.manufacturer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Serial Number:</span>
                  <span className="font-mono font-bold text-gov-blue">{selectedInstrument.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Capacity & Accuracy:</span>
                  <span className="font-semibold text-slate-800">{selectedInstrument.capacity} ({selectedInstrument.accuracyClass})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">District:</span>
                  <span className="font-semibold text-slate-800">{selectedInstrument.district}, {selectedInstrument.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Status:</span>
                  <span className="font-semibold text-emerald-700">{selectedInstrument.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Verification Type & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Category *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-medium"
              >
                <option value="NEW_VERIFICATION">New Verification (Initial Stamping)</option>
                <option value="RE_VERIFICATION">Periodic Re-Verification (Renewal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Inspection Venue Mode *
              </label>
              <select
                name="verificationType"
                value={formData.verificationType}
                onChange={(e) => setFormData({ ...formData, verificationType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-medium"
              >
                <option value="ON_SITE">On-Site Field Verification (LMO Officer Visit)</option>
                <option value="LABORATORY">Government Approved Test Centre (GATC Lab)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Field Inspection Premises / Location Address *
            </label>
            <input
              type="text"
              name="scheduledLocation"
              required
              placeholder="e.g. Warehouse Bay 4, Bijwasan Depot, New Delhi"
              value={formData.scheduledLocation}
              onChange={(e) => setFormData({ ...formData, scheduledLocation: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Applicant Remarks / Operational Notes
            </label>
            <textarea
              name="remarks"
              rows={3}
              placeholder="Any specific instructions for the visiting officer, preferred time windows, or reference calibration notes..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Link
              to="/applications"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-2"
            >
              {loading ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Submit Verification Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
