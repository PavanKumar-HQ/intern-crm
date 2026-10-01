'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Plus,
  Play,
  Pause,
  Trash2,
  Users,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  Layers,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface CampaignItem {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'COMPLETED';
  spentINR: number;
  budgetLimitINR: number | null;
  targetLeadCount: number | null;
  currentLeads: number;
  createdAt: string;
  location: string;
  industries: string[];
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Bangalore B2B Tech Startups',
    description: 'Target Series A/B funded tech companies with missing automated booking links and slow web performance.',
    status: 'ACTIVE',
    spentINR: 340,
    budgetLimitINR: 800,
    targetLeadCount: 150,
    currentLeads: 84,
    createdAt: '2026-09-28',
    location: 'Bengaluru, KA',
    industries: ['SaaS', 'Cloud', 'FinTech'],
  },
  {
    id: 'camp-2',
    name: 'Mumbai & Pune Interior Design Studios',
    description: 'Find premium design firms with portfolio image load lag and no WhatsApp live chat widget.',
    status: 'ACTIVE',
    spentINR: 190,
    budgetLimitINR: 500,
    targetLeadCount: 100,
    currentLeads: 62,
    createdAt: '2026-09-29',
    location: 'Mumbai & Pune, MH',
    industries: ['Interior Design', 'Architecture'],
  },
  {
    id: 'camp-3',
    name: 'Delhi NCR Specialized Healthcare & Clinics',
    description: 'Identify specialized dental and diagnostic clinics with missing SEO schema or mobile viewport issues.',
    status: 'PAUSED',
    spentINR: 120,
    budgetLimitINR: 400,
    targetLeadCount: 80,
    currentLeads: 45,
    createdAt: '2026-09-25',
    location: 'Delhi, Gurgaon, Noida',
    industries: ['Healthcare', 'Clinics'],
  },
  {
    id: 'camp-4',
    name: 'Enterprise Logistics & Supply Chain Ingestion',
    description: 'High-ticket logistics providers ready for automated dispatch software pitch.',
    status: 'DRAFT',
    spentINR: 0,
    budgetLimitINR: 600,
    targetLeadCount: 200,
    currentLeads: 0,
    createdAt: '2026-09-30',
    location: 'Pan India',
    industries: ['Logistics', 'Warehousing'],
  },
];

export default function CampaignListManager() {
  const { triggerNotification } = useRealtime();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'PAUSED'>('ALL');
  const [search, setSearch] = useState('');

  const toggleCampaignStatus = async (id: string, current: string) => {
    const nextStatus = current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus as CampaignItem['status'] } : c))
    );

    await triggerNotification({
      title: `Campaign ${nextStatus === 'ACTIVE' ? 'Activated' : 'Paused'}`,
      message: `Campaign status changed to ${nextStatus}. Real-time job schedulers notified.`,
      type: 'campaign_updated',
      priority: 'normal',
    });
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter !== 'ALL' && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        c.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Campaign Management Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure discovery parameters, AI target criteria, and monitor automated prospecting velocity.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="btn btn-brand inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#121215] border border-white/10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'ACTIVE', 'PAUSED', 'DRAFT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'ALL' ? 'All Campaigns' : tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, industry, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#18181c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCampaigns.map((camp) => {
          const target = camp.targetLeadCount || 100;
          const progressPct = Math.min(100, Math.round((camp.currentLeads / target) * 100));

          return (
            <div
              key={camp.id}
              className="p-5 rounded-xl bg-[#121215] border border-white/10 hover:border-white/20 transition-all shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                        {camp.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          camp.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : camp.status === 'PAUSED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181c] text-zinc-400 border border-white/5">
                    📍 {camp.location}
                  </span>
                  {camp.industries.map((ind) => (
                    <span
                      key={ind}
                      className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    >
                      {ind}
                    </span>
                  ))}
                </div>

                {/* Progress Stats */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      Lead Discovery Progress:
                    </span>
                    <span className="font-semibold text-white">
                      {camp.currentLeads} / {target} leads ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        progressPct >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-1">
                    <span>
                      Spend: <strong>₹{camp.spentINR}</strong> / ₹{camp.budgetLimitINR || 500}
                    </span>
                    <span>Created: {camp.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleCampaignStatus(camp.id, camp.status)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                    camp.status === 'ACTIVE'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                >
                  {camp.status === 'ACTIVE' ? (
                    <>
                      <Pause className="w-3 h-3" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Activate
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/prospects?campaign=${camp.id}`}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    View Prospects <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
