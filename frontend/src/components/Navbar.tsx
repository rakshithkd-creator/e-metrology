import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  FileCheck2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { user, logout, getDefaultDashboardPath } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">ADMIN HQ</span>;
      case 'LMO':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">LMO OFFICER</span>;
      case 'GATC':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">GATC LAB</span>;
      case 'BUSINESS_USER':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">TRADER / USER</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top National Header Bar */}
      <div className="bg-gov-dark text-slate-300 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">भारत सरकार / Government of India</span>
          <span className="text-slate-400">|</span>
          <span className="hidden sm:inline">Ministry of Consumer Affairs, Food & Public Distribution</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/verify" className="hover:text-amber-400 flex items-center gap-1 transition">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Certificate QR Portal</span>
          </Link>
          <span className="hidden md:inline text-slate-500">•</span>
          <Link to="/track" className="hidden md:flex hover:text-white items-center gap-1 transition">
            <Search className="w-3.5 h-3.5" />
            <span>Track Application</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Portal Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gov-blue text-white flex items-center justify-center shadow-md group-hover:bg-gov-dark transition">
              <Scale className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-gov-blue">e-Metrology</span>
                <span className="bg-gov-blue text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded tracking-widest">
                  National
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight -mt-0.5">
                Legal Metrology Verification & Certification Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                location.pathname === '/' ? 'text-gov-blue font-semibold' : 'text-slate-600 hover:text-gov-blue'
              }`}
            >
              Home
            </Link>
            <Link
              to="/verify"
              className={`text-sm font-medium flex items-center gap-1.5 transition ${
                location.pathname.startsWith('/verify') ? 'text-gov-blue font-semibold' : 'text-slate-600 hover:text-gov-blue'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Verify Certificate</span>
            </Link>
            <Link
              to="/track"
              className={`text-sm font-medium flex items-center gap-1.5 transition ${
                location.pathname.startsWith('/track') ? 'text-gov-blue font-semibold' : 'text-slate-600 hover:text-gov-blue'
              }`}
            >
              <Search className="w-4 h-4 text-sky-600" />
              <span>Track Status</span>
            </Link>

            {user && (
              <Link
                to={getDefaultDashboardPath()}
                className="text-sm font-semibold text-gov-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notifications dropdown trigger */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-gov-blue hover:bg-slate-100 rounded-full relative transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-gov-accent hover:underline"
                        >
                          View all
                        </Link>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                                !n.isRead ? 'bg-blue-50/50 font-medium' : 'text-slate-600'
                              }`}
                            >
                              <div className="font-semibold text-slate-800 mb-0.5">{n.title}</div>
                              <p className="line-clamp-2 text-slate-500">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold text-xs shadow-inner">
                      {user.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                        {user.fullName}
                      </div>
                      <div>{getRoleBadge(user.role)}</div>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-800">{user.fullName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className="mt-1">{getRoleBadge(user.role)}</div>
                      </div>

                      <Link
                        to={getDefaultDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        to="/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Notification Center</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-gov-blue hover:text-gov-dark bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gov-blue hover:bg-gov-dark rounded-lg shadow-sm transition"
                >
                  Register Stakeholder
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link to="/notifications" className="p-2 text-slate-600 relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-gov-blue"
          >
            Home
          </Link>
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-gov-blue"
          >
            Verify Certificate (QR Portal)
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-gov-blue"
          >
            Track Application Status
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-xs text-slate-500">Signed in as:</div>
              <div className="text-sm font-bold text-slate-800">{user.fullName}</div>
              <div className="mb-2">{getRoleBadge(user.role)}</div>

              <Link
                to={getDefaultDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gov-blue"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-gov-blue bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-gov-blue rounded-lg shadow"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
