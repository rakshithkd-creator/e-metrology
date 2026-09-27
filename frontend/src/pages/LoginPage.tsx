import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const LoginPage: React.FC = () => {
  const { login, getDefaultDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        const from = (location.state as any)?.from?.pathname;
        navigate(from || getDefaultDashboardPath(res.user.role));
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gov-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Scale className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to e-Metrology
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Government Legal Metrology Verification & Certification Portal
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gov-blue mb-2">
            <UserCheck className="w-4 h-4 text-gov-accent" />
            <span>Quick Demo Login (Password: Password@123):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@emetrology.gov.in')}
              className="p-1.5 bg-white hover:bg-blue-100/60 rounded border border-blue-200 text-left font-semibold text-slate-800 transition truncate"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('lmo.verma@emetrology.gov.in')}
              className="p-1.5 bg-white hover:bg-blue-100/60 rounded border border-blue-200 text-left font-semibold text-slate-800 transition truncate"
            >
              ⚖️ LMO Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('gatc.delhi@emetrology.gov.in')}
              className="p-1.5 bg-white hover:bg-blue-100/60 rounded border border-blue-200 text-left font-semibold text-slate-800 transition truncate"
            >
              🔬 GATC Lab
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user@apollologistics.com')}
              className="p-1.5 bg-white hover:bg-blue-100/60 rounded border border-blue-200 text-left font-semibold text-slate-800 transition truncate"
            >
              🏢 Business User
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@organization.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-gov-accent focus:border-transparent outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-gov-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-gov-accent focus:border-transparent outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gov-blue hover:bg-gov-dark disabled:bg-slate-400 text-white font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-gov-accent hover:underline">
              Register as Stakeholder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
