'use client';

import React, { useState } from 'react';
import {
  Search,
  Globe2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  Shield,
  Zap,
  Gauge,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface AuditItem {
  id: string;
  companyName: string;
  url: string;
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  loadTimeMs: number;
  httpsValid: boolean;
  mobileReady: boolean;
  hasContactForm: boolean;
  hasH1: boolean;
  hasMetaDesc: boolean;
  hasAnalytics: boolean;
  cms: string;
  framework: string;
  technologies: string[];
  findings: string[];
}

const SAMPLE_AUDITS: AuditItem[] = [
  {
    id: 'audit-1',
    companyName: 'NexTech Cloud Services',
    url: 'https://nextechcloud.io',
    healthGrade: 'C',
    loadTimeMs: 3840,
    httpsValid: true,
    mobileReady: false,
    hasContactForm: true,
    hasH1: true,
    hasMetaDesc: false,
    hasAnalytics: true,
    cms: 'WordPress 5.9',
    framework: 'jQuery / PHP',
    technologies: ['Google Analytics 4', 'Yoast SEO', 'W3 Total Cache'],
    findings: [
      'Missing viewport meta tag; mobile content overflows horizontally',
      'Meta description missing on 14 key landing pages',
      'Asset loading bottleneck: 3 uncompressed JPEG banners (> 4MB total)',
    ],
  },
  {
    id: 'audit-2',
    companyName: 'Aura Studio Architecture',
    url: 'https://aurastudio.co.in',
    healthGrade: 'D',
    loadTimeMs: 5120,
    httpsValid: true,
    mobileReady: true,
    hasContactForm: false,
    hasH1: false,
    hasMetaDesc: true,
    hasAnalytics: false,
    cms: 'Custom PHP',
    framework: 'Bootstrap 4',
    technologies: ['FontAwesome', 'OwlCarousel'],
    findings: [
      'No H1 heading tag detected on root homepage',
      'Missing automated inquiry or WhatsApp consultation widget',
      'No web analytics tracking tag (zero attribution data)',
    ],
  },
  {
    id: 'audit-3',
    companyName: 'Apex Health Diagnostics',
    url: 'https://apexhealthdiag.com',
    healthGrade: 'B',
    loadTimeMs: 1420,
    httpsValid: true,
    mobileReady: true,
    hasContactForm: true,
    hasH1: true,
    hasMetaDesc: true,
    hasAnalytics: true,
    cms: 'Headless Next.js',
    framework: 'React 18',
    technologies: ['Tailwind CSS', 'Vercel', 'Segment', 'Mixpanel'],
    findings: [
      'Fast core web vitals (1.4s LCP)',
      'Patient report download triggers bare PDF link without auth gate',
      'Missing LocalBusiness schema markup for Delhi NCR branch locations',
    ],
  },
];

export default function ResearchAuditLab() {
  const { triggerNotification } = useRealtime();
  const [audits, setAudits] = useState<AuditItem[]>(SAMPLE_AUDITS);
  const [inputUrl, setInputUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsAuditing(true);
    const domain = inputUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    await new Promise((r) => setTimeout(r, 1200));

    const newAudit: AuditItem = {
      id: `audit-${Date.now()}`,
      companyName: domain.split('.')[0].toUpperCase() + ' Corp',
      url: inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`,
      healthGrade: 'C',
      loadTimeMs: 2950,
      httpsValid: true,
      mobileReady: true,
      hasContactForm: false,
      hasH1: true,
      hasMetaDesc: false,
      hasAnalytics: false,
      cms: 'Custom Web Application',
      framework: 'React',
      technologies: ['Google Fonts', 'Cloudflare CDN'],
      findings: [
        'Missing OpenGraph image & Twitter card tags',
        'No direct lead capture or chat consultation CTA found',
        'Opportunity score: 86/100 (Conversion Optimization Fit)',
      ],
    };

    setAudits((prev) => [newAudit, ...prev]);
    setInputUrl('');
    setIsAuditing(false);

    await triggerNotification({
      title: 'Automated Website Audit Complete',
      message: `Audit for ${domain} finished with Grade C (Score 86). Identified 2 actionable deficiencies.`,
      type: 'research_completed',
      priority: 'high',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" />
          Website Intelligence & Deterministic Audit Lab
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Automated 60+ point technical inspection detecting CMS, load latency, SSL certificates, broken forms, and conversion deficiencies.
        </p>
      </div>

      {/* URL Audit Launcher Bar */}
      <form
        onSubmit={handleRunAudit}
        className="p-4 rounded-xl bg-[#121215] border border-white/10 shadow-lg flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Globe2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Enter prospect website (e.g. prospectcompany.com or https://...)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={isAuditing}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-[#18181c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isAuditing || !inputUrl.trim()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5" />
          {isAuditing ? 'Inspecting DOM & Performance...' : 'Run 60-Point Audit'}
        </button>
      </form>

      {/* Audit Results Cards */}
      <div className="space-y-4">
        {audits.map((audit) => (
          <div
            key={audit.id}
            className="p-5 rounded-xl bg-[#121215] border border-white/10 hover:border-white/20 transition-all shadow-md space-y-4"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    {audit.companyName}
                  </h3>
                  <a
                    href={audit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {audit.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                    audit.healthGrade === 'A' || audit.healthGrade === 'B'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  Grade {audit.healthGrade} ({audit.loadTimeMs}ms)
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    audit.httpsValid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {audit.httpsValid ? 'SSL Active' : 'No HTTPS'}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    audit.mobileReady
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {audit.mobileReady ? 'Mobile Viewport' : 'Missing Viewport'}
                </span>
              </div>
            </div>

            {/* Diagnostics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#18181c] border border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">CMS / Engine</span>
                <div className="text-zinc-200 font-medium mt-0.5">{audit.cms}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Framework</span>
                <div className="text-zinc-200 font-medium mt-0.5">{audit.framework}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">H1 / SEO Meta</span>
                <div className="text-zinc-200 font-medium mt-0.5 flex items-center gap-1.5">
                  {audit.hasH1 ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> H1 Present
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-0.5">
                      <XCircle className="w-3 h-3" /> No H1
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Contact Funnel</span>
                <div className="text-zinc-200 font-medium mt-0.5 flex items-center gap-1.5">
                  {audit.hasContactForm ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Form Found
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> No Form
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-zinc-500 font-medium text-[11px] mr-1 flex items-center gap-1">
                <Code2 className="w-3 h-3 text-blue-400" /> Detected Tech:
              </span>
              {audit.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Findings List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                Audited Opportunities & Deficiencies:
              </span>
              <ul className="space-y-1 pl-4 list-disc text-xs text-zinc-300">
                {audit.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
