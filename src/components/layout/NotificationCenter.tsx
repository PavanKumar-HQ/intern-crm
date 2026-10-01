'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRealtime } from '@/context/RealtimeContext';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Sparkles,
  Search,
  MailCheck,
  Radio,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isConnected,
    activeToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
  } = useRealtime();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'approval_needed':
        return <MailCheck className="w-4 h-4 text-amber-400" />;
      case 'research_completed':
        return <Search className="w-4 h-4 text-cyan-400" />;
      case 'lead_discovered':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'budget_alert':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Layers className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast Alert Popup */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white border border-[#E5E5E2] rounded-lg shadow-lg p-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-[#F7F7F5] border border-[#E5E5E2]">
              {getIconForType(activeToast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider">
                  Update
                </span>
                <span className="text-[10px] text-[#8C8C88]">Just now</span>
              </div>
              <h4 className="text-xs font-semibold text-[#171717] truncate mt-0.5">
                {activeToast.title}
              </h4>
              <p className="text-xs text-[#5E5E5E] mt-0.5 line-clamp-2">
                {activeToast.message}
              </p>
            </div>
            <button
              onClick={dismissToast}
              className="text-[#8C8C88] hover:text-[#171717] p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-md bg-[#F7F7F5] hover:bg-[#F0F0ED] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-all flex items-center gap-1 focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#4F46E5] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-84 max-w-[90vw] bg-white border border-[#E5E5E2] rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-[#E5E5E2]/60 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-2.5 flex items-center justify-between bg-[#FAFAF9]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#171717]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-[#5E5E5E] hover:text-[#4F46E5] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E5E2]/40 bg-white">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C8C88]">
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-2.5 flex items-start gap-2.5 hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                    !notif.read ? 'bg-[#EEF2FF]/30' : ''
                  }`}
                >
                  <div className="p-1 rounded bg-[#F7F7F5] border border-[#E5E5E2] shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-semibold truncate ${!notif.read ? 'text-[#171717]' : 'text-[#5E5E5E]'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-[#8C8C88] shrink-0">
                        {formatRelativeTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5E5E] mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-[#FAFAF9] flex items-center justify-between text-xs text-[#8C8C88] px-3">
            <span className="text-[10px] flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isConnected ? 'Real-time connected' : 'Connecting...'}
            </span>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[#4F46E5] hover:text-[#4338CA] text-[11px] font-medium flex items-center gap-0.5"
            >
              All Notifications <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
