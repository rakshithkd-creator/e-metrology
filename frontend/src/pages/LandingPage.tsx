import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  QrCode,
  Smartphone,
  FileText,
  Search,
  Building2,
  ArrowRight,
  Shield,
  Clock,
  Award,
  Lock,
  ChevronRight,
  Check,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickCertNumber, setQuickCertNumber] = useState('');
  const [quickAppNumber, setQuickAppNumber] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCertNumber.trim()) {
      navigate(`/verify/${encodeURIComponent(quickCertNumber.trim())}`);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAppNumber.trim()) {
      navigate(`/track/${encodeURIComponent(quickAppNumber.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-gov-dark to-gov-blue text-white overflow-hidden py-16 lg:py-24">
        {/* Subtle geometric background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Statutory Compliance • Legal Metrology Act, 2009</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                e-Metrology
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-sky-300 mt-2 font-serif">
                  Digital Legal Metrology Verification & Certification Platform
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Securely register, verify, certify and manage weighing and measuring instruments throughout their lifecycle with tamper-evident QR verification and mobile field inspections.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/instruments/new"
                  className="px-6 py-3 rounded-lg font-bold text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg hover:shadow-xl transition flex items-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  <span>Register Instrument</span>
                </Link>
                <Link
                  to="/applications/new"
                  className="px-6 py-3 rounded-lg font-bold text-sm bg-white hover:bg-slate-100 text-gov-blue shadow-lg hover:shadow-xl transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Apply for Verification</span>
                </Link>
                <Link
                  to="/verify"
                  className="px-6 py-3 rounded-lg font-semibold text-sm bg-blue-900/60 hover:bg-blue-800 text-white border border-blue-400/40 transition flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>Verify Certificate</span>
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-lg font-semibold text-sm bg-transparent hover:bg-white/10 text-white border border-slate-600 transition"
                >
                  Login
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-700/60 max-w-lg mx-auto lg:mx-0">
                <div className="text-left">
                  <div className="text-xl font-bold text-amber-400">100%</div>
                  <div className="text-xs text-slate-400">Digital Audit Trail</div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-sky-400">QR-Secured</div>
                  <div className="text-xs text-slate-400">Tamper-Proof Seals</div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-emerald-400">Paperless</div>
                  <div className="text-xs text-slate-400">Field Inspections</div>
                </div>
              </div>
            </div>

            {/* Right Card: Instant Public Verification Box */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-100 relative">
                <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Live Public Service
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-gov-blue flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-gov-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Instant Certificate Verification</h3>
                    <p className="text-xs text-slate-500">Scan QR or enter certificate number to verify legitimacy</p>
                  </div>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Certificate Number / QR Token
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. LM-CERT-2026-000101"
                        value={quickCertNumber}
                        onChange={(e) => setQuickCertNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-gov-accent focus:border-transparent outline-none uppercase font-mono tracking-wider"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gov-blue hover:bg-gov-dark text-white rounded-lg text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Verify Authenticity Now</span>
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Track Application Timeline:</span>
                  </div>
                  <form onSubmit={handleTrackSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. LM-APP-2026-000101"
                      value={quickAppNumber}
                      onChange={(e) => setQuickAppNumber(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                    >
                      Track
                    </button>
                  </form>
                </div>

                {/* Demo Quick Links */}
                <div className="mt-4 p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex justify-between items-center">
                  <span>Try Demo Cert:</span>
                  <button
                    onClick={() => navigate('/verify/LM-CERT-2026-000101')}
                    className="text-gov-accent hover:underline font-mono font-bold"
                  >
                    LM-CERT-2026-000101 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-gov-accent uppercase tracking-widest">End-to-End Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How e-Metrology Works</h2>
            <p className="text-slate-600 text-sm mt-2">
              A transparent, standardized, and tamper-resistant 5-stage lifecycle for all legal metrology instruments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center relative hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">Instrument Registration</h3>
              <p className="text-xs text-slate-500">
                User registers scale or meter with model approval, serial number, and specifications.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center relative hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">Apply for Verification</h3>
              <p className="text-xs text-slate-500">
                Submit application for initial verification or periodic re-verification online.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center relative hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">Officer Assignment</h3>
              <p className="text-xs text-slate-500">
                Directorate allocates LMO officer or GATC laboratory with automated schedule conflict checks.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center relative hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">Field Verification</h3>
              <p className="text-xs text-slate-500">
                LMO conducts on-site accuracy load testing, checks checklist, captures photo evidence.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center relative hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                5
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">QR Digital Certificate</h3>
              <p className="text-xs text-slate-500">
                Instant digital certificate issued with verifiable QR code, security seal, and validity alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-gov-accent uppercase tracking-widest">System Capabilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Core Architecture & Features</h2>
            <p className="text-slate-600 text-sm mt-2">
              Engineered to meet the statutory rigor of state legal metrology directorates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Cryptographic QR Authentication</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every certificate contains a unique QR code pointing to official verification servers, displaying validity, issuing officer, and security seal without exposing sensitive data.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Mobile Field Inspection Suite</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Touch-optimized interface for Legal Metrology Officers to record multi-point load tests, tolerance errors, upload geo-tagged photo evidence, and complete checklists on-site.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Automated Expiry & Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Smart expiry tracking calculates certificate lifecycles, alerting businesses at 90, 60, 30, and 7 days prior to lapse to prevent penalties under the Act.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Immutable Audit Logging</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every administrative, verification, and revocation action is logged with IP address, timestamp, previous status, and actor for tamper-evident oversight.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Government PDF Certificate Engine</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generates high-resolution vector PDF certificates with formal statutory emblems, security borders, seal codes, and embedded QR tokens compliant with Section 24.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rigorous privilege boundaries isolate Super Admin, Legal Metrology Officers, GATC Labs, and Commercial Users with granular API security and rate-limiting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-gov-accent uppercase tracking-widest">Multi-Stakeholder Architecture</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Designed for Every Participant</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-bold text-purple-700 bg-purple-100 inline-block px-2.5 py-1 rounded-md mb-3">
                DIRECTORATE HQ
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Super Admin</h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• State & District-wide oversight</li>
                <li>• Officer workload & scheduling</li>
                <li>• Certificate revocation controls</li>
                <li>• Statutory MIS analytics & export</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-bold text-blue-700 bg-blue-100 inline-block px-2.5 py-1 rounded-md mb-3">
                FIELD WING
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">LMO Officer</h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• Daily inspection route queues</li>
                <li>• Standard vs observed load testing</li>
                <li>• On-site pass/fail stamping</li>
                <li>• Photo & seal evidence capture</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-bold text-teal-700 bg-teal-100 inline-block px-2.5 py-1 rounded-md mb-3">
                TESTING CENTRES
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">GATC Laboratories</h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• Accredited laboratory testing</li>
                <li>• High-precision instrument audits</li>
                <li>• Calibration records submission</li>
                <li>• Co-verification endorsement</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-bold text-amber-700 bg-amber-100 inline-block px-2.5 py-1 rounded-md mb-3">
                COMMERCE & TRADE
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-2">Traders & Industry</h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• Register multi-site instruments</li>
                <li>• Apply for periodic re-verification</li>
                <li>• Download certified digital PDFs</li>
                <li>• Real-time validity countdowns</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory & Security Section */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Statutory Authority & Compliance</span>
              </div>
              <h3 className="text-2xl font-bold">Standard Weights and Measures Legal Framework</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Operating under the provisions of Section 24 of the Legal Metrology Act, 2009. Digital records generated by this portal constitute legal evidence of stamping and certification under Section 4 and Section 65B of the Indian Evidence Act.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                to="/register"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg shadow-lg transition"
              >
                Onboard Your Enterprise →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
