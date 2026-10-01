'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Plus,
  Play,
  Pause,
  Users,
  Search,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
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
    <div className="space-y-6 fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#4F46E5]" />
            Campaign Management Hub
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Configure discovery parameters, AI target criteria, and monitor automated prospecting velocity.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg text-white shadow-xs transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'ACTIVE', 'PAUSED', 'DRAFT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {tab === 'ALL' ? 'All Campaigns' : tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, industry, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#4F46E5]"
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
              className="p-5 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#D6D3D1] hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#1C1917] text-sm group-hover:text-[#4F46E5] transition-colors">
                        {camp.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          camp.status === 'ACTIVE'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : camp.status === 'PAUSED'
                            ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                            : 'bg-[#F5F5F4] text-[#57534E] border border-[#E7E5E4]'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#57534E] mt-1 line-clamp-2 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF8F5] text-[#57534E] border border-[#E5E5E2] flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-[#78716C]" /> {camp.location}
                  </span>
                  {camp.industries.map((ind) => (
                    <span
                      key={ind}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] font-medium"
                    >
                      {ind}
                    </span>
                  ))}
                </div>

                {/* Progress Stats */}
                <div className="mt-4 pt-3 border-t border-[#E5E5E2] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#57534E] flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#78716C]" />
                      Lead Discovery Progress:
                    </span>
                    <span className="font-bold text-[#1C1917]">
                      {camp.currentLeads} / {target} leads ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#E5E5E2] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        progressPct >= 80 ? 'bg-[#059669]' : 'bg-[#4F46E5]'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#78716C] pt-1">
                    <span>
                      Spend: <strong className="text-[#1C1917]">₹{camp.spentINR}</strong> / ₹{camp.budgetLimitINR || 500}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#A8A29E]" /> {camp.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#E5E5E2] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleCampaignStatus(camp.id, camp.status)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    camp.status === 'ACTIVE'
                      ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] hover:bg-[#FEF3C7]'
                      : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] hover:bg-[#D1FAE5]'
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
                    className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-semibold flex items-center gap-1 transition-colors"
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
