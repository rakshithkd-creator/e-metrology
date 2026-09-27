import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../api/client';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setSubmitted(true);
        if (res.resetToken) setResetToken(res.resetToken);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetError(null);
    try {
      const res = await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
      });
      if (res.success) {
        setResetSuccess(true);
      } else {
        setResetError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gov-blue text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Scale className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Account Password
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            e-Metrology Official Credential Recovery
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          {resetSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">Password Reset Successful</h3>
              <p className="text-xs text-slate-500">
                Your new password has been safely updated. You can now login.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 bg-gov-blue hover:bg-gov-dark text-white font-bold text-xs rounded-lg transition"
              >
                Go to Sign In →
              </Link>
            </div>
          ) : !submitted ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-gov-accent"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gov-blue hover:bg-gov-dark text-white font-bold text-sm rounded-lg shadow-sm transition"
              >
                {loading ? 'Submitting Request...' : 'Send Password Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-gov-accent hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg">
                Instructions verified. Enter your new password below.
              </div>

              {resetError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{resetError}</div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gov-blue hover:bg-gov-dark text-white font-bold text-sm rounded-lg transition"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
