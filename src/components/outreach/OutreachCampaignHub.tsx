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
  Eye,
  MessageCircle,
  TrendingUp,
  Search,
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
        return <Mail className="w-3.5 h-3.5 text-[#4F46E5]" />;
      case 'LINKEDIN':
        return <Briefcase className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-[#059669]" />;
      default:
        return <Phone className="w-3.5 h-3.5 text-[#EA580C]" />;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'REPLIED':
        return 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]';
      case 'OPENED':
        return 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      case 'SENT':
        return 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]';
      case 'APPROVED':
        return 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]';
      default:
        return 'bg-[#F5F5F4] text-[#57534E] border-[#E7E5E4]';
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
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-[#4F46E5]" />
            Outreach Delivery & Engagement Engine
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Real-time multi-channel transmission status, deliverability metrics, and reply outcomes.
          </p>
        </div>

        <Link
          href="/approvals"
          className="btn-primary text-xs px-4 py-2 rounded-lg text-white font-semibold shadow-xs transition-all flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          Review Pending Approvals
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Total Messages</span>
            <Send className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] mt-2">128</div>
          <div className="text-[10px] text-[#78716C] mt-1 font-medium">Across 3 active channels</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Open Rate</span>
            <Eye className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0284C7] mt-2">64.2%</div>
          <div className="text-[10px] text-[#059669] mt-1 flex items-center gap-0.5 font-semibold">
            <TrendingUp className="w-3 h-3" /> +12% vs industry
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Reply Rate</span>
            <MessageCircle className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl font-extrabold text-[#059669] mt-2">18.5%</div>
          <div className="text-[10px] text-[#78716C] mt-1 font-medium">High-intent responses</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Meetings Booked</span>
            <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="text-2xl font-extrabold text-[#7C3AED] mt-2">8</div>
          <div className="text-[10px] text-[#78716C] mt-1 font-medium">This month</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'EMAIL', 'LINKEDIN', 'WHATSAPP'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                channelFilter === ch
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {ch === 'ALL' ? 'All Channels' : ch}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search outreach records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Outreach Table */}
      <div className="rounded-xl bg-white border border-[#E5E5E2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#57534E] border-b border-[#E5E5E2]">
              <tr>
                <th className="py-3 px-4 font-bold">Prospect Company</th>
                <th className="py-3 px-4 font-bold">Channel & Target</th>
                <th className="py-3 px-4 font-bold">Subject / Hook</th>
                <th className="py-3 px-4 font-bold">Capability Angle</th>
                <th className="py-3 px-4 font-bold">Delivery State</th>
                <th className="py-3 px-4 font-bold text-right">Activity Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1C1917]">
                    {item.companyName}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                      {getChannelIcon(item.channel)}
                      <span>{item.channel}</span>
                    </div>
                    <div className="text-[11px] text-[#78716C] truncate max-w-[180px] mt-0.5 font-medium">
                      {item.recipient}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-[#1C1917] truncate">{item.subject}</div>
                    <div className="text-[11px] text-[#78716C] truncate mt-0.5">
                      {item.pitchSnippet}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                      {item.capability}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#78716C] text-[11px] font-medium">
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
