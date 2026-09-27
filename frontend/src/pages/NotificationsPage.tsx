import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, FileCheck2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../components/LoadingAndEmpty';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (id: string, link?: string | null) => {
    markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-gov-blue" />
            <span>Notification & Alert Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time regulatory alerts, assignment notifications, and certificate expiry warnings.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="No Notifications"
          description="You are completely caught up with all regulatory alerts and notices."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.link)}
              className={`p-4 sm:p-5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-4 ${
                !n.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white ${
                  n.type === 'CERTIFICATE'
                    ? 'bg-emerald-600'
                    : n.type === 'EXPIRY'
                    ? 'bg-amber-600'
                    : 'bg-gov-blue'
                }`}
              >
                {n.type === 'CERTIFICATE' ? (
                  <FileCheck2 className="w-4 h-4" />
                ) : n.type === 'EXPIRY' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.link && (
                  <div className="text-xs font-bold text-gov-accent flex items-center gap-1 pt-1">
                    <span>View associated record</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>

              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
