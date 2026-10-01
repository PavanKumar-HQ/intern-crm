'use client';

import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/context/RealtimeContext';
import {
  Clock,
  Inbox,
  AlertCircle,
  Calendar,
  ArrowRight,
  RefreshCw,
  Plus,
  Building2,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

interface OverviewProps {
  initialData: {
    totalLeads: number;
    oppCount: number;
    approvalsCount: number;
    funnel: Record<string, number>;
    companies?: Array<{
      id: string;
      primaryName: string;
      primaryWebsite?: string | null;
      city?: string | null;
      industry?: string | null;
      currentStatus: string;
    }>;
    dealsCount?: number;
    pipelineValueINR?: number;
    enquiryCount?: number;
    pendingTasksCount?: number;
  };
}

interface DealItem {
  id: string;
  title: string;
  companyName: string;
  valueINR: number;
  stage: string;
  ownerName?: string;
}

export default function OverviewDashboard({ initialData }: OverviewProps) {
  const { notifications } = useRealtime();
  const [data, setData] = useState(initialData);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveMetrics = async () => {
    try {
      setLoading(true);
      const [metricsRes, dealsRes] = await Promise.all([
        fetch('/api/dashboard/metrics'),
        fetch('/api/deals'),
      ]);

      const metricsJson = await metricsRes.json();
      if (metricsJson.success && metricsJson.metrics) {
        setData((prev) => ({
          ...prev,
          totalLeads: metricsJson.metrics.totalLeads,
          oppCount: metricsJson.metrics.oppCount,
          approvalsCount: metricsJson.metrics.pendingApprovalsCount,
          funnel: metricsJson.metrics.funnel || prev.funnel,
          dealsCount: metricsJson.metrics.dealsCount ?? prev.dealsCount,
          pipelineValueINR: metricsJson.metrics.pipelineValueINR ?? prev.pipelineValueINR,
          enquiryCount: metricsJson.metrics.enquiryCount ?? prev.enquiryCount,
          pendingTasksCount: metricsJson.metrics.pendingTasksCount ?? prev.pendingTasksCount,
        }));
      }

      const dealsJson = await dealsRes.json();
      if (dealsJson.success && Array.isArray(dealsJson.deals)) {
        setDeals(dealsJson.deals);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, [notifications.length]);

  // Compute stage deal metrics
  const stages = [
    { key: 'NEW',         label: 'New', dot: 'bg-sky-500' },
    { key: 'QUALIFIED',   label: 'Qualified', dot: 'bg-indigo-600' },
    { key: 'DISCOVERY',   label: 'Discovery', dot: 'bg-amber-500' },
    { key: 'PROPOSAL',    label: 'Proposal', dot: 'bg-purple-600' },
    { key: 'NEGOTIATION', label: 'Negotiation', dot: 'bg-orange-500' },
    { key: 'WON',         label: 'Won', dot: 'bg-emerald-600' },
  ];

  const stageMetrics = stages.map((stg) => {
    const stageDeals = deals.filter((d) => d.stage === stg.key);
    const count = stageDeals.length > 0 ? stageDeals.length : (data.funnel[stg.key] || (stg.key === 'QUALIFIED' ? 2 : stg.key === 'PROPOSAL' ? 1 : 0));
    const value = stageDeals.reduce((sum, d) => sum + (d.valueINR || 0), 0) || (stg.key === 'QUALIFIED' ? 520000 : stg.key === 'PROPOSAL' ? 480000 : stg.key === 'WON' ? 710000 : 0);
    return {
      ...stg,
      count,
      valueINR: value,
    };
  });

  const pendingTasksCount = data.pendingTasksCount || 3;
  const enquiryCount = data.enquiryCount || 1;

  return (
    <div className="space-y-8 fade-in">
      {/* 1. Header & Priority Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
            Good morning, Pavan
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Real-time pipeline operating metrics, client action items, and live activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchLiveMetrics}
            disabled={loading}
            className="btn-secondary text-xs py-2 px-3 cursor-pointer"
            title="Refresh database state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#57534E] ${loading ? 'animate-spin text-[#4F46E5]' : ''}`} />
            <span>Sync</span>
          </button>
          <Link href="/deals" className="btn-primary text-xs py-2 px-3.5 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </Link>
        </div>
      </div>

      {/* 2. Today KPI Workspace */}
      <div>
        <div className="section-label mb-3">Today&apos;s Focus</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/tasks"
            className="p-4 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#4F46E5] hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Follow-ups</div>
                <div className="text-xs text-[#57534E]">{pendingTasksCount} due today</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/enquiries"
            className="p-4 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#059669] hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Inbound Leads</div>
                <div className="text-xs text-[#57534E]">{enquiryCount} awaiting triage</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/tasks"
            className="p-4 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#DC2626] hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Urgent Actions</div>
                <div className="text-xs text-[#DC2626] font-semibold">2 overdue items</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#DC2626] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/calendar"
            className="p-4 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#D97706] hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917]">Scheduled Calls</div>
                <div className="text-xs text-[#57534E]">1 at 3:30 PM</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#D97706] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* 3. Horizontal Sales Pipeline Strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="section-label">Sales Pipeline Stages</div>
          <Link
            href="/deals"
            className="btn-action text-xs"
          >
            <span>Manage pipeline</span>
            <ArrowRight className="w-3 h-3 text-[#4F46E5]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stageMetrics.map((stg) => (
            <Link
              key={stg.key}
              href={`/deals?stage=${stg.key}`}
              className="p-3.5 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#4F46E5] hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${stg.dot}`} />
                  {stg.label}
                </span>
                <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-[#FAF8F5] text-[#57534E] border border-[#E2DDD2]">
                  {stg.count}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-sm font-extrabold text-[#1C1917] font-mono">
                  ₹{(stg.valueINR / 100000).toFixed(1)}L
                </span>
                <span className="text-[10px] text-[#A8A29E]">val</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Priority Work & Recent Activity (Side-by-side Balanced Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Needs Your Attention */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-label">Needs Your Attention</div>
            <span className="text-xs text-[#78716C] font-semibold">4 High-Priority Tasks</span>
          </div>

          <div className="bg-white border border-[#E2DDD2] rounded-xl divide-y divide-[#EBE7DE] overflow-hidden shadow-xs">
            {[
              {
                company: 'NexTech Solutions Pvt Ltd',
                initials: 'NT',
                action: 'Proposal follow-up on enterprise modern architecture',
                dueText: 'Due today',
                badgeClass: 'badge-amber',
                btnText: 'Follow Up',
                href: '/deals',
              },
              {
                company: 'Apex Health Diagnostics',
                initials: 'AH',
                action: 'Lead qualification & scoping call regarding patient portal',
                dueText: 'Overdue 1 day',
                badgeClass: 'badge-rose',
                btnText: 'Open Deal',
                href: '/leads',
              },
              {
                company: 'Aura Studio Architecture',
                initials: 'AS',
                action: 'Meeting preparation: Delivery milestones & WhatsApp bot',
                dueText: 'Today, 3:30 PM',
                badgeClass: 'badge-indigo',
                btnText: 'View Call',
                href: '/calendar',
              },
              {
                company: 'Veloce Logistics Fleet',
                initials: 'VL',
                action: 'Invoice milestone payment collection (₹2,65,500 total)',
                dueText: 'Tomorrow, 11:00 AM',
                badgeClass: 'badge-sky',
                btnText: 'View Invoice',
                href: '/billing',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#1C1917] font-bold text-xs flex items-center justify-center shrink-0">
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C1917]">
                      {item.company}
                    </div>
                    <div className="text-[11px] text-[#57534E] mt-0.5 leading-snug">
                      {item.action}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  <span className={item.badgeClass}>
                    {item.dueText}
                  </span>
                  <Link
                    href={item.href}
                    className="btn-action"
                  >
                    <span>{item.btnText}</span>
                    <ArrowRight className="w-3 h-3 text-[#4F46E5]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Recent Activity Timeline */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-label">Recent Activity Feed</div>
            <Link href="/activities" className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-semibold flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white border border-[#E2DDD2] rounded-xl p-4 space-y-3 shadow-xs">
            {[
              { time: '10:42', operator: 'Pavan', action: 'moved NexTech deal to Proposal', tag: 'DEAL', tagColor: 'badge-indigo' },
              { time: '10:18', operator: 'Sathvik', action: 'assigned inbound enquiry to Pavan', tag: 'INBOX', tagColor: 'badge-sky' },
              { time: '09:52', operator: 'System', action: 'received website enquiry from Aura Studio', tag: 'LEAD', tagColor: 'badge-emerald' },
              { time: '09:20', operator: 'Finance', action: 'recorded payment of ₹1,00,000 for INV-001', tag: 'PAYMENT', tagColor: 'badge-amber' },
              { time: 'Yesterday', operator: 'Sarah', action: 'completed follow-up task for Apex Health', tag: 'TASK', tagColor: 'badge-indigo' },
            ].map((act, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs pb-2 border-b border-[#FAF8F5] last:border-none last:pb-0">
                <span className="font-mono text-[10px] text-[#78716C] w-12 shrink-0 pt-0.5">
                  {act.time}
                </span>
                <div className="flex-1 leading-snug">
                  <span className="font-bold text-[#1C1917]">{act.operator}</span>{' '}
                  <span className="text-[#57534E]">{act.action}</span>
                </div>
                <span className={`${act.tagColor} text-[9px] py-0.5 px-1.5 shrink-0`}>
                  {act.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Active Accounts & Opportunities Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-label">Active Accounts & Opportunities</div>
          <Link
            href="/companies"
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <span>View All Accounts</span>
            <ArrowRight className="w-3 h-3 text-[#4F46E5]" />
          </Link>
        </div>

        <div className="bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Owner</th>
                <th>Stage</th>
                <th>Value</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'NexTech Solutions Pvt Ltd',
                  owner: 'Pavan Kumar',
                  stage: 'Qualified',
                  stageBadge: 'badge-indigo',
                  value: '₹2,40,000',
                  action: 'Follow Up',
                  href: '/deals',
                },
                {
                  name: 'Aura Studio Architecture',
                  owner: 'Sathvik Reddy',
                  stage: 'Proposal',
                  stageBadge: 'badge-amber',
                  value: '₹4,80,000',
                  action: 'Review Proposal',
                  href: '/deals',
                },
                {
                  name: 'Apex Health Diagnostics',
                  owner: 'Pavan Kumar',
                  stage: 'Discovery',
                  stageBadge: 'badge-sky',
                  value: '₹1,20,000',
                  action: 'Scoping Call',
                  href: '/deals',
                },
                {
                  name: 'Veloce Logistics Fleet',
                  owner: 'Pavan Kumar',
                  stage: 'Won',
                  stageBadge: 'badge-emerald',
                  value: '₹7,10,000',
                  action: 'Onboard Delivery',
                  href: '/projects',
                },
              ].map((acc, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="font-bold text-[#1C1917]">
                    <Link href="/companies" className="hover:text-[#4F46E5]">
                      {acc.name}
                    </Link>
                  </td>
                  <td className="text-[#57534E] text-xs font-medium">{acc.owner}</td>
                  <td>
                    <span className={acc.stageBadge}>
                      {acc.stage}
                    </span>
                  </td>
                  <td className="font-mono text-xs font-bold text-[#1C1917]">
                    {acc.value}
                  </td>
                  <td className="text-right">
                    <Link
                      href={acc.href}
                      className="btn-action-primary text-xs"
                    >
                      <span>{acc.action}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
