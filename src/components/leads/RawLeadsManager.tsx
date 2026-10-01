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
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Raw Leads Ingestion & Normalization
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Audit trail of all incoming leads prior to entity resolution, phone/domain deduplication, and capability matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isIngesting}
            onClick={handleSimulateIngest}
            className="text-xs px-3 py-2 rounded-lg bg-[#202026] hover:bg-[#282830] border border-white/10 text-zinc-200 hover:text-white font-medium transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            {isIngesting ? 'Ingesting...' : 'Simulate Ingestion'}
          </button>
          <Link
            href="/sources"
            className="text-xs px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV / Sources
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#121215] border border-white/10">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Total Ingested</span>
          <div className="text-xl font-extrabold text-white mt-1">{leads.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121215] border border-white/10">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Unique Companies</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {leads.filter((l) => !l.isDuplicate).length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121215] border border-white/10">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Duplicates Filtered</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">
            {leads.filter((l) => l.isDuplicate).length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121215] border border-white/10">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Enrichment Queue</span>
          <div className="text-xl font-extrabold text-cyan-400 mt-1">
            {leads.filter((l) => l.status === 'DISCOVERED' || l.status === 'RESEARCHING').length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 rounded-xl bg-[#121215] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, domain, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#18181c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'Google Places', 'Apollo', 'Web Bot', 'CSV Upload'].map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                sourceFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white bg-[#18181c]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl bg-[#121215] border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181c]/70 text-zinc-400 border-b border-white/10">
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
            <tbody className="divide-y divide-white/5">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {lead.companyName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-blue-400">
                      {lead.domain}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    <div>{lead.phone}</div>
                    <div className="text-[11px] text-zinc-500">{lead.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {lead.isDuplicate ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold">
                        <AlertCircle className="w-3 h-3" /> Duplicate Domain
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Verified Unique
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        lead.status === 'QUALIFIED'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-zinc-500 text-[11px]">
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
