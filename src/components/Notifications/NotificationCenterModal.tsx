import React, { useState } from 'react';
import { NotificationItem } from '../../types';
import { notificationService } from '../../services/notificationService';
import { Bell, CheckCheck, Radio, Calendar, Zap, Tag, Clock, X } from 'lucide-react';

interface NotificationCenterModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  onClose,
  onRefresh,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    notificationService.getNotifications()
  );
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications([...notificationService.getNotifications()]);
    onRefresh();
  };

  const handleMarkSingle = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications([...notificationService.getNotifications()]);
    onRefresh();
  };

  const filtered = notifications.filter(n => (tab === 'unread' ? !n.read : true));

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'iot_alert':
        return <Radio className="w-4 h-4 text-amber-600" />;
      case 'ev':
        return <Zap className="w-4 h-4 text-cyan-600" />;
      case 'promo':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Notifications</h3>
              <p className="text-[11px] text-slate-500">Live booking alerts & IoT sensor updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              title="Mark all as read"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              tab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setTab('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              tab === 'unread' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No notifications right now.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => handleMarkSingle(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  !item.read
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
