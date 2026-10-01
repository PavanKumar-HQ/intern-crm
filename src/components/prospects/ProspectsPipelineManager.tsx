'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Cpu,
  MailCheck,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface OpportunityRecord {
  id: string;
  companyName: string;
  website: string;
  city: string;
  industry: string;
  status: 'STRONG_OPPORTUNITY' | 'QUALIFIED' | 'POTENTIAL';
  totalScore: number;
  problem: string;
  capabilityName: string;
  evidenceCount: number;
  evidenceSnippets: string[];
  opportunityStrength: number;
  evidenceQuality: number;
  brandexFit: number;
}

const SAMPLE_PROSPECTS: OpportunityRecord[] = [
  {
    id: 'opp-1',
    companyName: 'NexTech Cloud Services',
    website: 'nextechcloud.io',
    city: 'Bengaluru',
    industry: 'Enterprise Cloud Infrastructure',
    status: 'STRONG_OPPORTUNITY',
    totalScore: 94,
    problem: 'Homepage has no interactive pricing calculator and fails mobile responsiveness on Safari.',
    capabilityName: 'Full-Stack Web Modernization',
    evidenceCount: 3,
    evidenceSnippets: [
      'Missing viewport meta tag detected in DOM audit',
      'Contact form lacks rate-limiting or automated validation',
      'Competitor CloudForge launched interactive calculator 2 weeks ago',
    ],
    opportunityStrength: 95,
    evidenceQuality: 92,
    brandexFit: 96,
  },
  {
    id: 'opp-2',
    companyName: 'Aura Interior Architecture',
    website: 'aurainteriors.co.in',
    city: 'Mumbai',
    industry: 'High-End Residential Architecture',
    status: 'STRONG_OPPORTUNITY',
    totalScore: 91,
    problem: 'Portfolio gallery has 4.8MB unoptimized assets causing 5.2s load delay; no WhatsApp booking link.',
    capabilityName: 'High-Performance Portfolio & Conversion',
    evidenceCount: 4,
    evidenceSnippets: [
      'Google PageSpeed score: 32/100 on Mobile',
      'Zero schema.org LocalBusiness markup found in HEAD',
      'No direct WhatsApp or Calendly consultation trigger',
    ],
    opportunityStrength: 90,
    evidenceQuality: 94,
    brandexFit: 89,
  },
  {
    id: 'opp-3',
    companyName: 'Apex Health Diagnostics',
    website: 'apexhealthdiag.com',
    city: 'Delhi NCR',
    industry: 'Diagnostic Labs & Pathology',
    status: 'QUALIFIED',
    totalScore: 86,
    problem: 'Booking workflow requires downloading a PDF report instead of a self-serve patient portal.',
    capabilityName: 'Patient Portal & Web App Engineering',
    evidenceCount: 2,
    evidenceSnippets: [
      'PDF link triggers direct download rather than patient sign-in',
      'Over 200+ monthly Google Reviews asking for online test report download',
    ],
    opportunityStrength: 88,
    evidenceQuality: 82,
    brandexFit: 88,
  },
  {
    id: 'opp-4',
    companyName: 'Veloce Logistics Fleet',
    website: 'velocelogistics.in',
    city: 'Chennai',
    industry: '3PL & Freight Logistics',
    status: 'QUALIFIED',
    totalScore: 82,
    problem: 'Quote request form is broken with no email confirmation or CRM webhook integration.',
    capabilityName: 'Workflow Automation & CRM Integration',
    evidenceCount: 2,
    evidenceSnippets: [
      'HTTP POST /api/quote returns unhandled 500 error on mobile devices',
      'Job postings indicate expanding fleet by 50 vehicles in South India',
    ],
    opportunityStrength: 84,
    evidenceQuality: 80,
    brandexFit: 83,
  },
  {
    id: 'opp-5',
    companyName: 'Zenith Legal Partners',
    website: 'zenithlegal.in',
    city: 'Hyderabad',
    industry: 'Corporate Law Firm',
    status: 'POTENTIAL',
    totalScore: 74,
    problem: 'Legacy WordPress theme with outdated copyright year and no HTTPS SSL renewal notification.',
    capabilityName: 'Corporate Re-platforming & Security',
    evidenceCount: 2,
    evidenceSnippets: [
      'SSL certificate expires in 12 days; no auto-renewal found',
      'Outdated WordPress 5.8 vulnerable core plugins',
    ],
    opportunityStrength: 76,
    evidenceQuality: 72,
    brandexFit: 74,
  },
];

export default function ProspectsPipelineManager() {
  const { triggerNotification } = useRealtime();
  const [prospects, setProspects] = useState<OpportunityRecord[]>(SAMPLE_PROSPECTS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'STRONG_OPPORTUNITY' | 'QUALIFIED' | 'POTENTIAL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<OpportunityRecord | null>(null);

  const handleGeneratePitch = async (opp: OpportunityRecord) => {
    await triggerNotification({
      title: 'Outreach Draft Initialized',
      message: `AI generated custom pitch for ${opp.companyName} targeting "${opp.capabilityName}". Queued in Approvals.`,
      type: 'approval_needed',
      priority: 'high',
    });
    alert(`Outreach draft for "${opp.companyName}" generated! Check the Approvals queue to review and send.`);
  };

  const filteredProspects = prospects.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.companyName.toLowerCase().includes(q) ||
        p.website.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.capabilityName.toLowerCase().includes(q) ||
        p.problem.toLowerCase().includes(q)
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
            <Flame className="w-5 h-5 text-[#EA580C]" />
            Prospect Opportunities & Accounts
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Client engagement opportunities scored by high-value fit and operational requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/proposals"
            className="btn-primary text-xs px-4 py-2 rounded-lg text-white font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MailCheck className="w-4 h-4" />
            Outreach & Proposals
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'STRONG_OPPORTUNITY', 'QUALIFIED', 'POTENTIAL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {tab === 'ALL'
                ? 'All Prospects'
                : tab === 'STRONG_OPPORTUNITY'
                ? 'Strong Fit (≥90)'
                : tab === 'QUALIFIED'
                ? 'Qualified (≥80)'
                : 'Potential (≥70)'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by company, problem, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Prospects Cards Grid */}
      <div className="space-y-4">
        {filteredProspects.map((opp) => (
          <div
            key={opp.id}
            className="p-5 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#D6D3D1] hover:shadow-xs transition-all group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Column: Company & Capability */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[#1C1917] group-hover:text-[#4F46E5] transition-colors">
                    {opp.companyName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      opp.status === 'STRONG_OPPORTUNITY'
                        ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                        : opp.status === 'QUALIFIED'
                        ? 'bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]'
                        : 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                    }`}
                  >
                    {opp.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#4F46E5] border border-[#E5E5E2] flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[#4F46E5]" />
                    {opp.capabilityName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#57534E]">
                  <a
                    href={`https://${opp.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4F46E5] hover:text-[#4338CA] font-medium flex items-center gap-1"
                  >
                    {opp.website} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <span>•</span>
                  <span>{opp.city}</span>
                  <span>•</span>
                  <span className="text-[#78716C]">{opp.industry}</span>
                </div>
              </div>

              {/* Right Column: Score Metrics & Quick Pitch Button */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl font-extrabold text-[#1C1917]">
                      {opp.totalScore}
                    </span>
                    <span className="text-xs text-[#78716C]">/ 100</span>
                  </div>
                  <div className="text-[10px] font-medium text-[#78716C]">Client Fit Score</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOpp(selectedOpp?.id === opp.id ? null : opp)}
                    className="text-xs px-3 py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E5E5E2] text-[#44403C] hover:text-[#1C1917] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Audit Findings ({opp.evidenceCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGeneratePitch(opp)}
                    className="text-xs px-3.5 py-2 rounded-lg btn-primary text-white font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MailCheck className="w-3.5 h-3.5" /> Create Proposal
                  </button>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="mt-3.5 p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E5E2] text-xs text-[#44403C] leading-relaxed">
              <strong className="text-[#1C1917] font-semibold">Client Requirement: </strong>
              {opp.problem}
            </div>

            {/* Evidence details accordion if active */}
            {selectedOpp?.id === opp.id && (
              <div className="mt-3 p-4 rounded-xl bg-[#EEF2FF]/60 border border-[#C7D2FE] text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[#4338CA] font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
                    Key Audit Findings & Data Points
                  </span>
                  <button
                    onClick={() => setSelectedOpp(null)}
                    className="text-[#78716C] hover:text-[#1C1917] text-[11px] font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#C7D2FE] text-center">
                  <div>
                    <span className="text-[10px] text-[#57534E] font-medium">Conversion Impact</span>
                    <div className="text-[#1C1917] font-extrabold">{opp.opportunityStrength}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#57534E] font-medium">Technical Urgency</span>
                    <div className="text-[#1C1917] font-extrabold">{opp.evidenceQuality}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#57534E] font-medium">Brandex Service Fit</span>
                    <div className="text-[#1C1917] font-extrabold">{opp.brandexFit}%</div>
                  </div>
                </div>
                <ul className="space-y-1.5 pl-4 list-disc text-[#44403C] pt-1">
                  {opp.evidenceSnippets.map((snip, idx) => (
                    <li key={idx}>{snip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
