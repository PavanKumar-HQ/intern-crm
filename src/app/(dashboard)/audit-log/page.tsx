'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  User,
  Clock,
  Shield,
  Filter,
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

export default function AuditLogPage() {
  const { notifications } = useRealtime();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/audit-log?resource=${resourceFilter}`);
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
  }, [resourceFilter, notifications]);

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
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#6366F1]" />
            Security & Compliance Audit Trail
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Tamper-evident audit log tracking every user mutation, stage transition, payment recording, and permission update.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'Deal', 'Invoice', 'Enquiry', 'Task', 'Lead'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setResourceFilter(r)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                resourceFilter === r
                  ? 'bg-[#171717] text-white'
                  : 'bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#5E5E5E]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5E5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] placeholder-[#5E5E5E] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Operator / User</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Resource</th>
                <th className="py-3 px-4 font-semibold">Details / Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#5E5E5E]">
                    Loading audit trail from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#5E5E5E]">
                    <Shield className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-[#171717]">No audit logs found</p>
                    <p className="text-[11px] text-[#5E5E5E] mt-0.5">
                      Sensitive operations will automatically record here.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const d = new Date(log.timestamp);
                  const timeFormatted = d.toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3 px-4 text-[#5E5E5E] font-mono whitespace-nowrap">
                        {timeFormatted}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#171717]">
                        {log.userName || log.userId || 'System'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E2] text-[#171717]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#6366F1]">
                        {log.resource}
                      </td>
                      <td className="py-3 px-4 text-[#5E5E5E] max-w-[320px] truncate">
                        {log.details || `Mutated ${log.resource}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
