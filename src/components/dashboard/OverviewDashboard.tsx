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
    { key: 'NEW',         label: 'New' },
    { key: 'QUALIFIED',   label: 'Qualified' },
    { key: 'DISCOVERY',   label: 'Discovery' },
    { key: 'PROPOSAL',    label: 'Proposal' },
    { key: 'NEGOTIATION', label: 'Negotiation' },
    { key: 'WON',         label: 'Won' },
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
    <div className="space-y-10">
      {/* 1. Header & Priority Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#EEEEEC]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#18181B]">
            Good morning, Pavan
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Here&apos;s what needs attention today across sales, clients, and operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchLiveMetrics}
            disabled={loading}
            className="btn-secondary"
            title="Refresh database state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin text-[#4F46E5]' : ''}`} />
            <span>Sync</span>
          </button>
          <Link href="/deals" className="btn-primary">
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>New Opportunity</span>
          </Link>
        </div>
      </div>

      {/* 2. Today Workspace — Clean Interactive Rows */}
      <div>
        <div className="section-label mb-3">Today</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/tasks" className="today-row group">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#4F46E5] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#18181B]">Follow-ups</div>
                <div className="text-[11px] text-[#71717A]">3 due today</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#18181B] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/enquiries" className="today-row group">
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#18181B]">New enquiries</div>
                <div className="text-[11px] text-[#71717A]">{enquiryCount} awaiting review</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#18181B] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/tasks" className="today-row group">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#18181B]">Overdue tasks</div>
                <div className="text-[11px] text-[#DC2626] font-medium">2 require attention</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#18181B] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/calendar" className="today-row group">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#D97706] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#18181B]">Meetings</div>
                <div className="text-[11px] text-[#71717A]">1 at 3:30 PM</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#18181B] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* 3. Horizontal Sales Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="section-label">Sales Pipeline</div>
          <Link
            href="/deals"
            className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium flex items-center gap-1"
          >
            <span>Manage pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="pipeline-track">
          {stageMetrics.map((stg) => (
            <Link
              key={stg.key}
              href={`/deals?stage=${stg.key}`}
              className="pipeline-step block"
            >
              <div className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                {stg.label}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#18181B]">
                  {stg.count} {stg.count === 1 ? 'deal' : 'deals'}
                </span>
                <span className="text-xs font-mono font-medium text-[#52525B]">
                  ₹{(stg.valueINR / 100000).toFixed(1)}L
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Priority Work & Recent Activity (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Needs Your Attention */}
        <div className="lg:col-span-7 space-y-3">
          <div className="section-label">Needs Your Attention</div>
          <div className="bg-white border border-[#E2DDD2] rounded-lg divide-y divide-[#F4F4F2] overflow-hidden">
            {[
              {
                company: 'NexTech Solutions Pvt Ltd',
                action: 'Proposal follow-up',
                due: 'Due today',
                dueColor: 'text-[#D97706]',
                href: '/deals',
              },
              {
                company: 'Apex Health Diagnostics',
                action: 'Lead qualification & scoping call',
                due: 'Overdue 1 day',
                dueColor: 'text-[#DC2626]',
                href: '/leads',
              },
              {
                company: 'Aura Studio Architecture',
                action: 'Meeting preparation: Delivery milestones',
                due: 'Today, 3:30 PM',
                dueColor: 'text-[#4F46E5]',
                href: '/calendar',
              },
              {
                company: 'Veloce Logistics Fleet',
                action: 'Invoice milestone payment collection',
                due: 'Tomorrow, 11:00 AM',
                dueColor: 'text-[#52525B]',
                href: '/billing',
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="p-3.5 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors group block"
              >
                <div>
                  <div className="text-xs font-semibold text-[#18181B]">
                    {item.company}
                  </div>
                  <div className="text-[11px] text-[#71717A] mt-0.5">
                    {item.action}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${item.dueColor}`}>
                    {item.due}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#18181B] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Recent Activity (Quiet, Editorial Timeline) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="section-label">Recent Activity</div>
          <div className="bg-white border border-[#E2DDD2] rounded-lg p-4 space-y-3.5">
            {[
              { time: '10:42', text: 'Pavan moved NexTech deal to Proposal' },
              { time: '10:18', text: 'Sathvik assigned inbound enquiry to Pavan' },
              { time: '09:52', text: 'New website enquiry received from Aura Studio' },
              { time: '09:20', text: 'Payment of ₹1,00,000 recorded for INV-2026-001' },
              { time: 'Yesterday', text: 'Follow-up task completed for Apex Health' },
            ].map((act, idx) => (
              <div key={idx} className="flex items-baseline gap-3 text-xs">
                <span className="font-mono text-[11px] text-[#A1A1AA] w-14 shrink-0">
                  {act.time}
                </span>
                <span className="text-[#52525B] leading-relaxed">
                  {act.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Active Accounts Table (Clean, Generous Spacing, Subtle Dividers) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-label">Active Accounts & Opportunities</div>
          <Link
            href="/companies"
            className="text-xs text-[#71717A] hover:text-[#18181B] font-medium"
          >
            All accounts →
          </Link>
        </div>

        <div className="bg-white border border-[#E2DDD2] rounded-lg overflow-hidden">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Owner</th>
                <th>Stage</th>
                <th>Value</th>
                <th className="text-right">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'NexTech Solutions Pvt Ltd',
                  owner: 'Pavan',
                  stage: 'Qualified',
                  stageColor: 'text-[#4F46E5]',
                  value: '₹2.4L',
                  action: 'Follow up',
                  href: '/deals',
                },
                {
                  name: 'Aura Studio Architecture',
                  owner: 'Sathvik',
                  stage: 'Proposal',
                  stageColor: 'text-[#D97706]',
                  value: '₹4.8L',
                  action: 'Review proposal',
                  href: '/deals',
                },
                {
                  name: 'Apex Health Diagnostics',
                  owner: 'Pavan',
                  stage: 'Discovery',
                  stageColor: 'text-[#2563EB]',
                  value: '₹1.2L',
                  action: 'Scoping meeting',
                  href: '/deals',
                },
                {
                  name: 'Veloce Logistics Fleet',
                  owner: 'Pavan',
                  stage: 'Won',
                  stageColor: 'text-[#16A34A]',
                  value: '₹7.1L',
                  action: 'Delivery onboarding',
                  href: '/projects',
                },
              ].map((acc, idx) => (
                <tr key={idx}>
                  <td className="font-medium text-[#18181B]">
                    <Link href="/companies" className="hover:text-[#4F46E5] hover:underline">
                      {acc.name}
                    </Link>
                  </td>
                  <td className="text-[#52525B]">{acc.owner}</td>
                  <td>
                    <span className={`font-medium ${acc.stageColor}`}>
                      {acc.stage}
                    </span>
                  </td>
                  <td className="font-mono text-xs font-semibold text-[#18181B]">
                    {acc.value}
                  </td>
                  <td className="text-right">
                    <Link
                      href={acc.href}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] hover:underline"
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
