'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MailCheck,
  Mail,
  Briefcase,
  MessageSquare,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
  MessageCircle,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface OutreachRecord {
  id: string;
  companyName: string;
  recipient: string;
  channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP';
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'OPENED' | 'REPLIED';
  subject: string;
  sentAt?: string;
  capability: string;
  pitchSnippet: string;
}

const SAMPLE_OUTREACH: OutreachRecord[] = [
  {
    id: 'out-1',
    companyName: 'NexTech Solutions Pvt Ltd',
    recipient: 'vikram@nextechsolutions.in',
    channel: 'EMAIL',
    status: 'APPROVED',
    subject: 'Fixing mobile booking latency on nextechsolutions.in',
    sentAt: 'Today, 10:14 AM',
    capability: 'High-Performance Web Modernization',
    pitchSnippet: 'Teardown of Safari 3.8s load bottleneck + Next.js migration benchmark.',
  },
  {
    id: 'out-2',
    companyName: 'Aura Studio Architecture',
    recipient: '+91 98200 12345',
    channel: 'WHATSAPP',
    status: 'SENT',
    subject: 'WhatsApp Consultation Bot Demo',
    sentAt: 'Today, 09:30 AM',
    capability: 'Visual Portfolio Performance',
    pitchSnippet: 'Instant WebP image optimization and 1-tap WhatsApp consultation link.',
  },
  {
    id: 'out-3',
    companyName: 'FinVantage Wealth Advisors',
    recipient: 'rahul.mehta@finvantage.in',
    channel: 'EMAIL',
    status: 'OPENED',
    subject: 'Google Ads Landing Page Optimization for FinVantage',
    sentAt: 'Yesterday, 04:45 PM',
    capability: 'Conversion Rate Optimization',
    pitchSnippet: 'Audit showing 4.2s desktop delay on active Google PPC landing page.',
  },
  {
    id: 'out-4',
    companyName: 'OmniHealth Diagnostics',
    recipient: 'linkedin.com/in/dromnipath',
    channel: 'LINKEDIN',
    status: 'REPLIED',
    subject: 'Automating Online Patient Reports',
    sentAt: '2 days ago',
    capability: 'Patient Portal Web App',
    pitchSnippet: 'Requested 15-minute Zoom call on Thursday at 3 PM.',
  },
];

export default function OutreachCampaignHub() {
  const { triggerNotification } = useRealtime();
  const [records, setRecords] = useState<OutreachRecord[]>(SAMPLE_OUTREACH);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'EMAIL' | 'LINKEDIN' | 'WHATSAPP'>('ALL');
  const [search, setSearch] = useState('');

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'LINKEDIN':
        return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Phone className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'REPLIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'OPENED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'SENT':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'APPROVED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const filtered = records.filter((r) => {
    if (channelFilter !== 'ALL' && r.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.companyName.toLowerCase().includes(q) ||
        r.recipient.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-blue-500" />
            Outreach Delivery & Engagement Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time multi-channel transmission status, deliverability metrics, and reply outcomes.
          </p>
        </div>

        <Link
          href="/approvals"
          className="text-xs px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 self-start"
        >
          <Clock className="w-3.5 h-3.5" />
          Review Pending Approvals
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#121215] border border-white/10">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span className="font-semibold uppercase">Total Messages</span>
            <Send className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">128</div>
          <div className="text-[10px] text-zinc-500 mt-1">Across 3 active channels</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-white/10">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span className="font-semibold uppercase">Open Rate</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-2">64.2%</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12% vs industry
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-white/10">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span className="font-semibold uppercase">Reply Rate</span>
            <MessageCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">18.5%</div>
          <div className="text-[10px] text-zinc-500 mt-1">High-intent responses</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-white/10">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span className="font-semibold uppercase">Meetings Booked</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 mt-2">8</div>
          <div className="text-[10px] text-zinc-500 mt-1">This month</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3 rounded-xl bg-[#121215] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'EMAIL', 'LINKEDIN', 'WHATSAPP'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                channelFilter === ch
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white bg-[#18181c]'
              }`}
            >
              {ch === 'ALL' ? 'All Channels' : ch}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search outreach records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#18181c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Outreach Table */}
      <div className="rounded-xl bg-[#121215] border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181c]/70 text-zinc-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Prospect Company</th>
                <th className="py-3 px-4 font-semibold">Channel & Target</th>
                <th className="py-3 px-4 font-semibold">Subject / Hook</th>
                <th className="py-3 px-4 font-semibold">Capability Angle</th>
                <th className="py-3 px-4 font-semibold">Delivery State</th>
                <th className="py-3 px-4 font-semibold text-right">Activity Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {item.companyName}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      {getChannelIcon(item.channel)}
                      <span>{item.channel}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-[180px] mt-0.5">
                      {item.recipient}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-zinc-200 truncate">{item.subject}</div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {item.pitchSnippet}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.capability}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-zinc-400 text-[11px]">
                    {item.sentAt || 'Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
