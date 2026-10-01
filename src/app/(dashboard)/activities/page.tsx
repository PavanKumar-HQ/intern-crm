'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  RefreshCw,
  Search,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface LogItem {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  timestamp: string;
}

export default function ActivitiesPage() {
  const { notifications } = useRealtime();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit-log');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [notifications]);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) ||
      (l.userName && l.userName.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#4F46E5]" />
            Real-time Activity Timeline
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Operational event log across leads, sales pipeline transitions, task completions, and billing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live SSE Stream Active
          </span>

          <button
            type="button"
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <span className="text-xs font-bold text-[#1C1917]">
          {filtered.length} Logged Realtime Operations
        </span>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activities by keyword, user, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-sm text-[#57534E] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#4F46E5]" />
            Streaming operational events from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#78716C]">
            <Activity className="w-8 h-8 text-[#A8A29E] mx-auto mb-2 opacity-60" />
            <p className="font-bold text-[#1C1917]">No activity records matching your search</p>
            <p className="text-xs text-[#57534E] mt-0.5">Try a different query or clear the filter.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2DDD2]">
            {filtered.map((item) => {
              const time = new Date(item.timestamp);
              const formattedTime = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const formattedDate = time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#4F46E5] ring-4 ring-white shadow-xs" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="text-xs font-bold text-[#1C1917] flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {(item.userName || item.userId || 'S').charAt(0).toUpperCase()}
                      </span>
                      <span>{item.userName || item.userId || 'System Operator'}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAE6DC] border border-[#DDD7C9] text-[#44403C]">
                        {item.resource}
                      </span>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                        {item.action}
                      </span>
                    </div>
                    <div className="text-xs text-[#78716C] font-mono">
                      {formattedDate} · {formattedTime}
                    </div>
                  </div>

                  <p className="text-xs text-[#1C1917] mt-1.5 leading-relaxed font-medium pl-8">
                    {item.details || `${item.action} performed on ${item.resource}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
