import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Scale,
  Building,
  MapPin,
  Calendar,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { api } from '../api/client';
import { Application, User } from '../types';
import { LoadingSpinner } from '../components/LoadingAndEmpty';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Schedule form state
  const [officerId, setOfficerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('11:00 AM');
  const [scheduledLocation, setScheduledLocation] = useState('');

  // Review form state
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchApplication = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.success && res.application) {
        setApplication(res.application);
        setTimeline(res.timeline || []);
        setScheduledLocation(res.application.scheduledLocation || res.application.instrument?.location || '');
        if (res.application.assignedOfficerId) {
          setOfficerId(res.application.assignedOfficerId);
        }
        if (res.application.scheduledDate) {
          setScheduledDate(new Date(res.application.scheduledDate).toISOString().split('T')[0]);
        }
        if (res.application.scheduledTime) {
          setScheduledTime(res.application.scheduledTime);
        }
      } else {
        setError(res.message || 'Application not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
    if (user?.role === 'SUPER_ADMIN') {
      api.get('/users/officers').then((res) => {
        if (res.success && res.officers) {
          setOfficers(res.officers);
        }
      });
    }
  }, [id, user]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await api.post(`/applications/${application?.id}/schedule`, {
        officerId,
        scheduledDate,
        scheduledTime,
        scheduledLocation,
      });
      if (res.success) {
        setScheduleModalOpen(false);
        fetchApplication();
      } else {
        setModalError(res.message || 'Failed to assign officer.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Scheduling conflict or error.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await api.post(`/applications/${application?.id}/review`, {
        action: reviewAction,
        rejectionReason,
      });
      if (res.success) {
        setReviewModalOpen(false);
        fetchApplication();
      } else {
        setModalError(res.message || 'Failed to review application.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Review processing failed.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving application lifecycle..." />;
  if (error || !application) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-200">
        {error || 'Application not found.'}
      </div>
    );
  }

  const isLMO = user?.role === 'LMO';
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const canVerify = (isLMO || isAdmin) && ['ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS'].includes(application.status);

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link to="/applications" className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 font-mono tracking-wider">
                {application.applicationId}
              </h1>
              <StatusBadge status={application.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Submitted on {new Date(application.submittedAt).toLocaleDateString('en-GB')} •{' '}
              {application.type.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Admin Schedule Modal Trigger */}
          {isAdmin && (
            <>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm transition"
              >
                Review Dossier
              </button>
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="px-3.5 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Assign & Schedule</span>
              </button>
            </>
          )}

          {/* LMO Field Verification Direct CTA */}
          {canVerify && (
            <Link
              to={`/field-verification/${application.id}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>Perform Field Verification →</span>
            </Link>
          )}

          {/* Certificate View CTA */}
          {application.certificate && (
            <Link
              to={`/certificates/${application.certificate.certificateNumber}`}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition"
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <span>View Certificate ({application.certificate.certificateNumber})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instrument Specifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-gov-blue" />
              <span>Instrument To Be Verified</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Instrument Type:</span>
                <span className="font-bold text-slate-800 text-sm">{application.instrument.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Manufacturer / Model:</span>
                <span className="font-semibold text-slate-800">
                  {application.instrument.manufacturer} ({application.instrument.model})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Serial Number:</span>
                <span className="font-mono font-bold text-gov-blue">{application.instrument.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Capacity & Accuracy:</span>
                <span className="font-semibold text-slate-800">
                  {application.instrument.capacity} ({application.instrument.accuracyClass})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Inspection Venue:</span>
                <span className="font-semibold text-slate-800">
                  {application.verificationType === 'ON_SITE' ? 'On-Site Field Visit' : 'GATC Laboratory'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Location:</span>
                <span className="text-slate-700">{application.scheduledLocation || application.instrument.location}</span>
              </div>
            </div>
          </div>

          {/* Allocation & Officer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gov-blue" />
              <span>Statutory Assignment & Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-semibold">Assigned Officer:</span>
                {application.assignedOfficer ? (
                  <>
                    <div className="font-bold text-slate-800 text-sm">{application.assignedOfficer.fullName}</div>
                    <div className="text-slate-500">{application.assignedOfficer.organizationName}</div>
                    <div className="text-slate-500">{application.assignedOfficer.phone}</div>
                  </>
                ) : (
                  <div className="text-slate-400 italic">Pending officer assignment by Directorate</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-semibold">Scheduled Date & Time:</span>
                {application.scheduledDate ? (
                  <>
                    <div className="font-bold text-slate-800 text-sm">
                      {new Date(application.scheduledDate).toLocaleDateString('en-GB')}
                    </div>
                    <div className="text-blue-700 font-semibold">{application.scheduledTime || 'TBD'}</div>
                    <div className="text-slate-500 mt-1 truncate">{application.scheduledLocation}</div>
                  </>
                ) : (
                  <div className="text-slate-400 italic">Inspection date not yet scheduled</div>
                )}
              </div>
            </div>
          </div>

          {/* Applicant & Organization */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-gov-blue" />
              <span>Applicant Holder</span>
            </h3>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="font-bold text-sm text-slate-900">{application.user.organizationName || application.user.fullName}</div>
              <div>Representative: {application.user.fullName} • Phone: {application.user.phone} • Email: {application.user.email}</div>
              <div>Address: {application.user.address || 'Registered site'}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chronological Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
            Verification Lifecycle Timeline
          </h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 before:z-0">
            {timeline.map((step: any, index: number) => {
              const isPassed = step.completed;
              return (
                <div key={index} className="flex items-start gap-3 relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] ${
                      isPassed ? 'bg-emerald-600 shadow' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">{step.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{step.description}</div>
                    {step.date && (
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        {new Date(step.date).toLocaleDateString('en-GB')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Assign & Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Assign Officer & Schedule Inspection</h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Select Legal Metrology Officer *</label>
                <select
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                >
                  <option value="">-- Choose Verifying Officer --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.fullName} ({o.role}) — {o.district || 'All Zones'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Inspection Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Time Slot *</label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none font-medium"
                  >
                    <option value="10:00 AM">10:00 AM - 11:30 AM</option>
                    <option value="11:30 AM">11:30 AM - 01:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 03:30 PM</option>
                    <option value="03:30 PM">03:30 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Inspection Venue / Address *</label>
                <input
                  type="text"
                  required
                  value={scheduledLocation}
                  onChange={(e) => setScheduledLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-gov-blue hover:bg-gov-dark text-white rounded-lg font-bold"
                >
                  {modalLoading ? 'Confirming...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review Dossier Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Review Application Dossier</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">Review Decision</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewAction === 'APPROVE'}
                      onChange={() => setReviewAction('APPROVE')}
                    />
                    <span className="font-bold text-emerald-700">Approve for Assignment</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewAction === 'REJECT'}
                      onChange={() => setReviewAction('REJECT')}
                    />
                    <span className="font-bold text-rose-700">Reject Application</span>
                  </label>
                </div>
              </div>

              {reviewAction === 'REJECT' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Reason for Rejection *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter reason for rejection (e.g. invalid model approval, missing test invoice)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-gov-blue hover:bg-gov-dark text-white rounded-lg font-bold"
                >
                  {modalLoading ? 'Processing...' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
