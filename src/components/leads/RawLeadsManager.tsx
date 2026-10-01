'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface RawLeadItem {
  id: string;
  companyName: string;
  source: string;
  domain: string;
  phone: string;
  email: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  status: 'DISCOVERED' | 'VALIDATED' | 'RESEARCHING' | 'QUALIFIED';
  discoveredAt: string;
}

const INITIAL_LEADS: RawLeadItem[] = [
  {
    id: 'lead-1',
    companyName: 'NexTech Cloud Solutions',
    source: 'Google Places API',
    domain: 'nextechcloud.io',
    phone: '+91 80 4123 4567',
    email: 'info@nextechcloud.io',
    isDuplicate: false,
    status: 'QUALIFIED',
    discoveredAt: '10 mins ago',
  },
  {
    id: 'lead-2',
    companyName: 'NexTech Solutions India',
    source: 'Apollo Directory',
    domain: 'nextechcloud.io',
    phone: '+91 80 4123 4567',
    email: 'sales@nextechcloud.io',
    isDuplicate: true,
    duplicateOf: 'lead-1',
    status: 'DISCOVERED',
    discoveredAt: '8 mins ago',
  },
  {
    id: 'lead-3',
    companyName: 'Aura Interior Architecture',
    source: 'Web Bot Crawler',
    domain: 'aurainteriors.co.in',
    phone: '+91 22 6789 0123',
    email: 'contact@aurainteriors.co.in',
    isDuplicate: false,
    status: 'RESEARCHING',
    discoveredAt: '25 mins ago',
  },
  {
    id: 'lead-4',
    companyName: 'Apex Health Diagnostics',
    source: 'Google Places API',
    domain: 'apexhealthdiag.com',
    phone: '+91 11 2345 6789',
    email: 'help@apexhealthdiag.com',
    isDuplicate: false,
    status: 'VALIDATED',
    discoveredAt: '42 mins ago',
  },
  {
    id: 'lead-5',
    companyName: 'SpeedLogix Freight Network',
    source: 'CSV Upload: logistics_leads.xlsx',
    domain: 'speedlogix.in',
    phone: '+91 44 8877 6655',
    email: 'ops@speedlogix.in',
    isDuplicate: false,
    status: 'VALIDATED',
    discoveredAt: '1 hour ago',
  },
];

export default function RawLeadsManager() {
  const { triggerNotification } = useRealtime();
  const [leads, setLeads] = useState<RawLeadItem[]>(INITIAL_LEADS);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [isIngesting, setIsIngesting] = useState(false);

  // Live ingestion simulator
  const handleSimulateIngest = async () => {
    setIsIngesting(true);
    const newLead: RawLeadItem = {
      id: `lead-${Date.now()}`,
      companyName: 'CloudScale Automations',
      source: 'Google Places API',
      domain: 'cloudscale.net',
      phone: '+91 80 9988 7766',
      email: 'founder@cloudscale.net',
      isDuplicate: false,
      status: 'DISCOVERED',
      discoveredAt: 'Just now',
    };

    setLeads((prev) => [newLead, ...prev]);

    await triggerNotification({
      title: 'New Raw Lead Ingested',
      message: `Ingested ${newLead.companyName} (${newLead.domain}) via ${newLead.source}. Queued for deduplication.`,
      type: 'lead_discovered',
      priority: 'normal',
    });

    setIsIngesting(false);
  };

  const filtered = leads.filter((lead) => {
    if (sourceFilter !== 'ALL' && !lead.source.includes(sourceFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        lead.companyName.toLowerCase().includes(q) ||
        lead.domain.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#4F46E5]" />
            Raw Leads Ingestion & Normalization
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Audit trail of all incoming leads prior to entity resolution, phone/domain deduplication, and capability matching.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isIngesting}
            onClick={handleSimulateIngest}
            className="text-xs px-3.5 py-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#1C1917] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            {isIngesting ? 'Ingesting...' : 'Simulate Ingestion'}
          </button>
          <Link
            href="/sources"
            className="text-xs px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import CSV / Sources
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] text-[#78716C] font-semibold uppercase tracking-wider">Total Ingested</span>
          <div className="text-xl font-bold text-[#1C1917] mt-1">{leads.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] text-[#78716C] font-semibold uppercase tracking-wider">Unique Companies</span>
          <div className="text-xl font-bold text-[#15803D] mt-1">
            {leads.filter((l) => !l.isDuplicate).length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] text-[#78716C] font-semibold uppercase tracking-wider">Duplicates Filtered</span>
          <div className="text-xl font-bold text-[#B45309] mt-1">
            {leads.filter((l) => l.isDuplicate).length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] text-[#78716C] font-semibold uppercase tracking-wider">Enrichment Queue</span>
          <div className="text-xl font-bold text-[#4F46E5] mt-1">
            {leads.filter((l) => l.status === 'DISCOVERED' || l.status === 'RESEARCHING').length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, domain, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'Google Places', 'Apollo', 'Web Bot', 'CSV Upload'].map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                sourceFilter === s
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white hover:bg-[#EFECE4] text-[#57534E] border border-[#E2DDD2]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl bg-white border border-[#E2DDD2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#57534E] border-b border-[#E2DDD2]">
              <tr>
                <th className="py-3 px-4 font-semibold">Company Name</th>
                <th className="py-3 px-4 font-semibold">Connector Source</th>
                <th className="py-3 px-4 font-semibold">Canonical Domain</th>
                <th className="py-3 px-4 font-semibold">Normalized Phone / Email</th>
                <th className="py-3 px-4 font-semibold">Deduplication</th>
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Discovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1C1917]">
                    {lead.companyName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAE6DC] text-[#44403C] text-[11px] font-medium border border-[#DDD7C9]">
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-[#4F46E5] font-semibold">
                      {lead.domain}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#57534E]">
                    <div>{lead.phone}</div>
                    <div className="text-[11px] text-[#78716C]">{lead.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {lead.isDuplicate ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Duplicate Domain
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Unique
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        lead.status === 'QUALIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : lead.status === 'VALIDATED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#78716C] text-xs">
                    {lead.discoveredAt}
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
