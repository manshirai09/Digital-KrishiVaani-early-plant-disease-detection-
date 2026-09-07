import React from 'react';
import { NotificationItem, UserRole } from '../../types';
import { StorageService } from '../../services/storageService';
import { RiskBadge } from './RiskBadge';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  FileCheck2,
  GitCompare,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentRole: UserRole;
  onNavigate: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  currentRole,
  onNavigate
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
  };

  const handleItemClick = (notif: NotificationItem) => {
    StorageService.markNotificationRead(notif.id);
    if (notif.actionPath) {
      onNavigate(notif.actionPath);
      onClose();
    }
  };

  return (
    <div id="notification-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Notifications & Alerts</h3>
              <p className="text-[11px] text-slate-500">Real-time alerts, expert reviews, and follow-ups</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="mark-all-read-btn"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-1 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            >
              Mark all read
            </button>
            <button
              id="close-notifs-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No alerts at the moment.</p>
            </div>
          ) : (
            notifications.map(notif => {
              return (
                <div
                  key={notif.id}
                  id={`notif-item-${notif.id}`}
                  onClick={() => handleItemClick(notif)}
                  className={`pt-2.5 first:pt-0 p-2.5 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    !notif.read ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {notif.type === 'risk_alert' && (
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === 'expert_update' && (
                        <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                          <FileCheck2 className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === 'followup_reminder' && (
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                          <GitCompare className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === 'general' && (
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                        {notif.riskLevel && (
                          <RiskBadge level={notif.riskLevel} size="sm" />
                        )}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Emergency helpline: <strong>1800-180-1551 (Kisan Call Center)</strong>
          </p>
        </div>

      </div>
    </div>
  );
};
