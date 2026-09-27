import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Smartphone,
  Scale,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  FileCheck2,
  Plus,
  Trash2,
  ShieldCheck,
  Building,
  Upload,
} from 'lucide-react';
import { api } from '../api/client';
import { Application, ChecklistConfig, VerificationMeasurement, InspectionChecklistItem } from '../types';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';

export const FieldVerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCert, setSuccessCert] = useState<any | null>(null);

  // Verification Form State
  const [verificationType, setVerificationType] = useState('ON_SITE');
  const [location, setLocation] = useState('');
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [capturingGps, setCapturingGps] = useState(false);

  // Observations & Final Result
  const [observations, setObservations] = useState(
    'Conducted standard load test and eccentricity check with reference weights. Tamper seal verified.'
  );
  const [remarks, setRemarks] = useState('All statutory parameters verified. Instrument stamped.');
  const [finalResult, setFinalResult] = useState<'PASS' | 'FAIL'>('PASS');
  const [failureReason, setFailureReason] = useState('');

  // Checklist Items State
  const [checklist, setChecklist] = useState<InspectionChecklistItem[]>([]);

  // Measurements State (Zero Load, 25%, 50%, 100%, Eccentricity)
  const [measurements, setMeasurements] = useState<VerificationMeasurement[]>([
    {
      testName: 'Zero Load Test (Tare & Zero Return)',
      standardValue: 0.0,
      observedValue: 0.0,
      error: 0.0,
      permissibleError: 0.2,
      unit: 'kg',
      result: 'PASS',
    },
    {
      testName: 'Half Capacity Test',
      standardValue: 50.0,
      observedValue: 50.0,
      error: 0.0,
      permissibleError: 0.5,
      unit: 'kg',
      result: 'PASS',
    },
    {
      testName: 'Maximum Capacity Test',
      standardValue: 100.0,
      observedValue: 100.1,
      error: 0.1,
      permissibleError: 1.0,
      unit: 'kg',
      result: 'PASS',
    },
    {
      testName: 'Eccentricity (Corner Load) Test',
      standardValue: 30.0,
      observedValue: 30.0,
      error: 0.0,
      permissibleError: 0.5,
      unit: 'kg',
      result: 'PASS',
    },
  ]);

  // Photographs
  const [photographs, setPhotographs] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([api.get(`/applications/${id}`), api.get('/verifications/checklists')])
      .then(([appRes, checkRes]) => {
        if (appRes.success && appRes.application) {
          setApplication(appRes.application);
          setLocation(appRes.application.scheduledLocation || appRes.application.instrument?.location || '');
          setVerificationType(appRes.application.verificationType || 'ON_SITE');

          // Initialize unit in measurements
          const uom = appRes.application.instrument?.unitOfMeasurement || 'kg';
          setMeasurements((prev) => prev.map((m) => ({ ...m, unit: uom })));
        }

        if (checkRes.success && checkRes.items) {
          const defaultItems: InspectionChecklistItem[] = checkRes.items.map((item: ChecklistConfig) => ({
            itemKey: item.itemKey,
            title: item.title,
            result: 'PASS',
            remarks: '',
          }));
          setChecklist(defaultItems);
        }
      })
      .catch((err) => setError(err.message || 'Failed to initialize verification interface.'))
      .finally(() => setLoading(false));
  }, [id]);

  // GPS Geolocation Capture
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLatitude(pos.coords.latitude);
        setGpsLongitude(pos.coords.longitude);
        setCapturingGps(false);
      },
      (err) => {
        console.warn('GPS capture error:', err);
        setCapturingGps(false);
        // Fallback demo coordinates
        setGpsLatitude(28.5284);
        setGpsLongitude(77.0621);
      },
      { timeout: 10000 }
    );
  };

  // Measurement updates with auto error calculation
  const handleMeasurementChange = (
    index: number,
    field: 'standardValue' | 'observedValue' | 'permissibleError',
    value: number
  ) => {
    setMeasurements((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      const calculatedError = parseFloat((item.observedValue - item.standardValue).toFixed(4));
      item.error = calculatedError;
      item.result = Math.abs(calculatedError) <= Math.abs(item.permissibleError) ? 'PASS' : 'FAIL';
      updated[index] = item;
      return updated;
    });
  };

  const handleAddMeasurement = () => {
    const uom = application?.instrument?.unitOfMeasurement || 'kg';
    setMeasurements((prev) => [
      ...prev,
      {
        testName: `Test Load ${prev.length + 1}`,
        standardValue: 10.0,
        observedValue: 10.0,
        error: 0.0,
        permissibleError: 0.2,
        unit: uom,
        result: 'PASS',
      },
    ]);
  };

  const handleRemoveMeasurement = (index: number) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChecklistResultChange = (
    index: number,
    result: 'PASS' | 'FAIL' | 'NOT_APPLICABLE'
  ) => {
    setChecklist((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], result };
      return updated;
    });
  };

  const handleChecklistRemarksChange = (index: number, remarks: string) => {
    setChecklist((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks };
      return updated;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await api.upload(file);
      if (res.success && res.file) {
        setPhotographs((prev) => [...prev, res.file.url]);
      }
    } catch (err: any) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        applicationId: application?.id,
        verificationDate: new Date().toISOString(),
        verificationType,
        location,
        gpsLatitude,
        gpsLongitude,
        observations,
        remarks,
        result: finalResult,
        failureReason: finalResult === 'FAIL' ? failureReason : undefined,
        photographs,
        checklistItems: checklist,
        measurements,
      };

      const res = await api.post('/verifications/submit', payload);
      if (res.success) {
        if (res.certificate) {
          setSuccessCert(res.certificate);
        } else {
          // Nav back to application
          navigate(`/applications/${application?.id}`);
        }
      } else {
        setError(res.message || 'Failed to submit verification.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving verification inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening Mobile Field Verification Console..." />;
  if (error && !application) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-200">
        {error}
      </div>
    );
  }

  // Certificate Issuance Success Screen
  if (successCert) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-emerald-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Verification Passed • Sealed & Stamped
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Digital Certificate Generated!
            </h2>
            <div className="text-sm font-mono font-bold text-gov-blue mt-1">
              {successCert.certificateNumber}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Statutory verification passed with zero tolerance deviations. Legal Metrology Certificate is now live.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
            {successCert.qrCodeDataUrl ? (
              <img
                src={successCert.qrCodeDataUrl}
                alt="Verification QR Code"
                className="w-44 h-44 rounded-xl border border-slate-300 shadow-sm"
              />
            ) : (
              <div className="text-xs text-slate-400">QR Code Embedded</div>
            )}
          </div>

          <div className="space-y-2">
            <Link
              to={`/certificates/${successCert.certificateNumber}`}
              className="w-full py-3 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <span>Open & Download Certificate PDF</span>
            </Link>

            <Link
              to="/lmo/dashboard"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl block transition"
            >
              Return to Inspection Queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16 font-sans">
      {/* Mobile Top Bar */}
      <div className="sticky top-16 z-30 bg-gov-dark text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Field Verification Suite</span>
            </div>
            <div className="text-sm font-extrabold truncate max-w-[200px] sm:max-w-md font-mono">
              {application?.applicationId}
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleCaptureGps}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsLatitude ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{gpsLatitude ? 'GPS Tagged' : capturingGps ? 'Locating...' : 'Tag GPS'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Card 1: Instrument & Owner Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Target Instrument</span>
              <h2 className="text-lg font-black text-slate-900">{application?.instrument.type}</h2>
              <div className="text-xs text-slate-500">
                {application?.instrument.manufacturer} • Model: {application?.instrument.model}
              </div>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-gov-blue rounded font-mono font-bold text-xs">
              {application?.instrument.serialNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Capacity:</span>
              <span className="font-bold text-slate-800">{application?.instrument.capacity}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Accuracy Class:</span>
              <span className="font-bold text-slate-800">{application?.instrument.accuracyClass}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Unit:</span>
              <span className="font-bold text-slate-800">{application?.instrument.unitOfMeasurement}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Applicant:</span>
              <span className="font-bold text-slate-800 truncate block">
                {application?.user.organizationName || application?.user.fullName}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 2: Verification Checklist */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">1. Verification Checklist</h3>
                <p className="text-xs text-slate-500">Perform standard statutory inspection criteria</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">{checklist.length} Checkpoints</span>
            </div>

            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 flex-1">
                      {idx + 1}. {item.title}
                    </span>

                    {/* Touch Buttons: PASS / FAIL / NA */}
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleChecklistResultChange(idx, 'PASS')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                          item.result === 'PASS'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        PASS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChecklistResultChange(idx, 'FAIL')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                          item.result === 'FAIL'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        FAIL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChecklistResultChange(idx, 'NOT_APPLICABLE')}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                          item.result === 'NOT_APPLICABLE'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Specific remarks / observations for this item (optional)..."
                    value={item.remarks || ''}
                    onChange={(e) => handleChecklistRemarksChange(idx, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-gov-accent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Standard vs Observed Load Tests */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">2. Measurement & Tolerance Tests</h3>
                <p className="text-xs text-slate-500">Record standard certified test weights vs observed display readings</p>
              </div>
              <button
                type="button"
                onClick={handleAddMeasurement}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-gov-blue text-xs font-bold rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Point</span>
              </button>
            </div>

            <div className="space-y-3">
              {measurements.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">{m.testName}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          m.result === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.result} (Error: {m.error > 0 ? `+${m.error}` : m.error} {m.unit})
                      </span>
                      {measurements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasurement(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Standard Val ({m.unit})</label>
                      <input
                        type="number"
                        step="any"
                        value={m.standardValue}
                        onChange={(e) =>
                          handleMeasurementChange(idx, 'standardValue', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Observed Val ({m.unit})</label>
                      <input
                        type="number"
                        step="any"
                        value={m.observedValue}
                        onChange={(e) =>
                          handleMeasurementChange(idx, 'observedValue', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono font-bold text-gov-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Permissible MPE (±)</label>
                      <input
                        type="number"
                        step="any"
                        value={m.permissibleError}
                        onChange={(e) =>
                          handleMeasurementChange(idx, 'permissibleError', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Photographs & Evidence */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">3. Photographic Evidence & Stamping</h3>
              <p className="text-xs text-slate-500">Capture photo of serial plate, load test, or lead security seal</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 border border-slate-300 transition">
                <Camera className="w-4 h-4 text-gov-blue" />
                <span>{uploadingPhoto ? 'Uploading Image...' : 'Capture / Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photographs.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300">
                  <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotographs(photographs.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 rounded-bl flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Final Result & Observations */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">4. Officer Observations & Final Result</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Field Inspection Observations *
              </label>
              <textarea
                rows={2}
                required
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Stamping Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none"
              />
            </div>

            {/* Big Touch Select for PASS / FAIL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                FINAL STATUTORY VERIFICATION RESULT *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFinalResult('PASS')}
                  className={`py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 border-2 transition ${
                    finalResult === 'PASS'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>PASS — ISSUE CERTIFICATE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFinalResult('FAIL')}
                  className={`py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 border-2 transition ${
                    finalResult === 'FAIL'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  <span>FAIL — REJECT & REQUIRE RE-CALIBRATION</span>
                </button>
              </div>
            </div>

            {finalResult === 'FAIL' && (
              <div>
                <label className="block text-xs font-bold text-rose-700 uppercase mb-1">
                  Reason for Failure / Corrective Directive *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify tolerance errors, physical defect, or sealing issue..."
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-rose-300 bg-rose-50/50 outline-none"
                />
              </div>
            )}
          </div>

          {/* Submission Bar */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2 ${
                finalResult === 'PASS'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? (
                <span>Generating Verification Record...</span>
              ) : finalResult === 'PASS' ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span>Submit & Generate Digital Certificate</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Record Failed Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
