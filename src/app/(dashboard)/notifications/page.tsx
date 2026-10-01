'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
  Inbox,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } = useRealtime();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#6366F1]" />
            Notification Center
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Realtime event stream of incoming enquiries, deal assignments, invoice payments, and task deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#171717] transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#5E5E5E]'
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#5E5E5E]'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filter === 'unread' ? 'bg-white/20 text-white' : 'bg-[#6366F1] text-white'}`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#5E5E5E]">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`} />
          <span>{isConnected ? 'Realtime Stream Live' : 'Polling Sync Active'}</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs divide-y divide-[#E5E5E2]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#5E5E5E]">
            <Bell className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
            <p className="font-medium text-[#171717]">No notifications</p>
            <p className="text-[11px] text-[#5E5E5E] mt-0.5">
              {filter === 'unread' ? 'You have read all notifications.' : 'New events will broadcast here in realtime.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-4 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                !item.read ? 'bg-[#F5F3FF]/40 hover:bg-[#F5F3FF]/70' : 'hover:bg-[#FAFAF9]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-1.5 shrink-0" style={{ opacity: item.read ? 0 : 1 }} />
                <div>
                  <div className="text-xs font-bold text-[#171717] flex items-center gap-2">
                    <span>{item.title}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#FAFAF9] border border-[#E5E5E2] text-[#5E5E5E]">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E5E5E] mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-[#5E5E5E] font-mono">
                  {new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {(item as any).link && (
                  <Link
                    href={(item as any).link}
                    className="p-1 rounded text-[#5E5E5E] hover:text-[#6366F1] hover:bg-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
