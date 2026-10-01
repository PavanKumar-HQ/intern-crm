'use client';

import React, { useState } from 'react';
import {
  Cpu,
  TrendingUp,
  Palette,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface CapabilityItem {
  id: string;
  name: string;
  category: 'TECHNOLOGY' | 'GROWTH' | 'CREATIVE' | 'INFRASTRUCTURE' | 'EDUCATION';
  enabled: boolean;
  description: string;
  idealCustomers: string;
  positiveSignals: string[];
  pitchAngles: string[];
}

const DEFAULT_CAPABILITIES: CapabilityItem[] = [
  {
    id: 'cap-1',
    name: 'Full-Stack Modernization & Next.js Replatforming',
    category: 'TECHNOLOGY',
    enabled: true,
    description: 'Transform legacy, slow WordPress/PHP sites into high-velocity Next.js & React enterprise web apps.',
    idealCustomers: 'B2B SaaS, Mid-market services with >3s page load times',
    positiveSignals: ['jQuery detected', 'Slow LCP > 3.5s', 'Outdated PHP headers', 'No mobile viewport'],
    pitchAngles: ['Cut mobile bounce rates by 40%', 'Modern responsive UI that closes enterprise deals'],
  },
  {
    id: 'cap-2',
    name: 'AI Workflow Automation & Agent Integration',
    category: 'TECHNOLOGY',
    enabled: true,
    description: 'Autonomous customer intake, qualification bots, and internal workflow agent pipelines.',
    idealCustomers: 'Logistics, healthcare clinics, high-volume inquiry businesses',
    positiveSignals: ['Manual contact forms', 'No auto-response', 'Hiring support reps', 'Complex dispatch workflow'],
    pitchAngles: ['Instant 24/7 lead qualification', 'Zero-leakage customer intake automation'],
  },
  {
    id: 'cap-3',
    name: 'High-Converting Landing Pages & Funnel Optimization',
    category: 'GROWTH',
    enabled: true,
    description: 'Conversion rate optimization for active Google/Meta advertisers with high bounce rates.',
    idealCustomers: 'Businesses running active Google Ads or Meta Campaigns',
    positiveSignals: ['Active Google Ads tags', 'Missing conversion tracking', 'No sticky CTA', 'No clear pricing tier'],
    pitchAngles: ['Double demo bookings from existing ad budget', 'Fix the leak in your acquisition funnel'],
  },
  {
    id: 'cap-4',
    name: 'WhatsApp Business API & Conversational Bots',
    category: 'GROWTH',
    enabled: true,
    description: 'Direct conversational commerce and booking funnels embedded into web and mobile.',
    idealCustomers: 'Retail, clinics, luxury real estate, interior design studios',
    positiveSignals: ['No WhatsApp consultation button', 'High local search volume', 'Manual appointment booking'],
    pitchAngles: ['Close high-ticket clients directly in WhatsApp', 'Instant 1-tap consultation link'],
  },
  {
    id: 'cap-5',
    name: 'Executive Brand Identity & Design System',
    category: 'CREATIVE',
    enabled: true,
    description: 'Premium UI/UX overhaul, unified design tokens, typography, and interactive components.',
    idealCustomers: 'Funded tech startups, boutique architectural studios, executive law firms',
    positiveSignals: ['Inconsistent typography', 'Low-res logo', 'Fragmented mobile experience'],
    pitchAngles: ['Look like a Category Leader', 'Build enterprise trust before the first pitch call'],
  },
  {
    id: 'cap-6',
    name: 'Enterprise Security, Compliance & Data Protection',
    category: 'INFRASTRUCTURE',
    enabled: true,
    description: 'Data encryption, SSL certificate hardening, and compliance readiness (SOC2, ISO, HIPAA).',
    idealCustomers: 'FinTech, MedTech, and corporate legal firms',
    positiveSignals: ['Expiring SSL cert', 'Plaintext contact form', 'Missing privacy policy / terms'],
    pitchAngles: ['Protect enterprise client reputation', 'Bank-grade compliance and data safety'],
  },
];

export default function CapabilityLibraryManager() {
  const { triggerNotification } = useRealtime();
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>(DEFAULT_CAPABILITIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'TECHNOLOGY':
        return <Cpu className="w-3.5 h-3.5 text-[#4F46E5]" />;
      case 'GROWTH':
        return <TrendingUp className="w-3.5 h-3.5 text-[#059669]" />;
      case 'CREATIVE':
        return <Palette className="w-3.5 h-3.5 text-[#7C3AED]" />;
      case 'INFRASTRUCTURE':
        return <Building2 className="w-3.5 h-3.5 text-[#EA580C]" />;
      default:
        return <GraduationCap className="w-3.5 h-3.5 text-[#0284C7]" />;
    }
  };

  const toggleCapability = async (id: string, current: boolean) => {
    const next = !current;
    setCapabilities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: next } : c))
    );

    const cap = capabilities.find((c) => c.id === id);
    await triggerNotification({
      title: `Capability ${next ? 'Enabled' : 'Disabled'}`,
      message: `AI scoring rule for "${cap?.name}" updated in matching engine.`,
      type: 'system',
      priority: 'low',
    });
  };

  const filtered = capabilities.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.positiveSignals.some((s) => s.toLowerCase().includes(q))
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
            <Cpu className="w-5 h-5 text-[#4F46E5]" />
            Service Capability Library & Matching Rules
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Core Brandex agency delivery capabilities used by AI to score opportunity fit and draft custom value propositions.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'TECHNOLOGY', 'GROWTH', 'CREATIVE', 'INFRASTRUCTURE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {cat === 'ALL' ? 'All Domains' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search capabilities, signals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cap) => (
          <div
            key={cap.id}
            className={`p-5 rounded-xl bg-white border transition-all shadow-xs flex flex-col justify-between ${
              cap.enabled
                ? 'border-[#E5E5E2] hover:border-[#D6D3D1]'
                : 'border-[#E5E5E2] opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E5E2] text-[#44403C] flex items-center gap-1">
                      {getCategoryIcon(cap.category)}
                      {cap.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1C1917] text-base mt-1.5">{cap.name}</h3>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggleCapability(cap.id, cap.enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    cap.enabled ? 'bg-[#4F46E5]' : 'bg-[#D6D3D1]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute top-1 ${
                      cap.enabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-[#57534E] mt-2.5 leading-relaxed">
                {cap.description}
              </p>

              {/* Signals */}
              <div className="mt-3.5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  Deficiency Triggers & Signals:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cap.positiveSignals.map((sig, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] font-medium"
                    >
                      ✓ {sig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pitch Angles */}
              <div className="mt-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  Approved Pitch Angles:
                </span>
                <div className="text-[11px] text-[#44403C] space-y-0.5">
                  {cap.pitchAngles.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#059669] shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E5E2] flex items-center justify-between text-[11px] text-[#78716C]">
              <span>Target: <strong className="text-[#1C1917]">{cap.idealCustomers}</strong></span>
              <span className={cap.enabled ? 'text-[#059669] font-bold' : 'text-[#78716C]'}>
                {cap.enabled ? 'Active Engine Rule' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
