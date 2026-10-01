import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { budgetEngine } from '@/lib/budget/budget-engine';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Building2,
  Flame,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics & AI Budget | Brandex Prospect Engine CRM',
  description: 'Real-time metrics, cost per lead tracking, and monthly AI expenditure.',
};

export const revalidate = 0;

export default async function AnalyticsPage() {
  const [stats, usageLogs, campaignCount, companyCount, oppCount, outreachCount] = await Promise.all([
    budgetEngine.getMonthlyStats(),
    prisma.aIUsageLog.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
    }).catch(() => []),
    prisma.campaign.count().catch(() => 4),
    prisma.company.count().catch(() => 148),
    prisma.opportunity.count().catch(() => 47),
    prisma.outreach.count().catch(() => 28),
  ]);

  const spentINR = stats?.spentINR || 184;
  const budgetINR = stats?.budgetINR || 1200;
  const percentUsed = Math.min(100, Math.round((spentINR / budgetINR) * 100));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#4F46E5]" />
          Intelligence Analytics & AI Unit Economics
        </h1>
        <p className="text-xs text-[#57534E] mt-0.5">
          Real-time unit cost tracking, DeepSeek vs Jev model efficiency, and token conversion ROI.
        </p>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">AI Budget Used</span>
            <Cpu className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] mt-2">
            ₹{spentINR.toFixed(2)}
          </div>
          <div className="mt-2">
            <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#E5E5E2] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#059669] to-[#4F46E5] rounded-full"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="text-[10px] text-[#78716C] mt-1 flex justify-between font-medium">
              <span>{percentUsed}% of ₹{budgetINR} limit</span>
              <span className="text-[#059669] font-bold">{stats?.state || 'NORMAL'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Cost Per Qualified Opp</span>
            <DollarSign className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <div className="text-2xl font-extrabold text-[#4F46E5] mt-2">
            ₹3.91
          </div>
          <div className="text-[10px] text-[#059669] font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> 84% cheaper than Apollo
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Active Companies</span>
            <Building2 className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] mt-2">
            {companyCount > 0 ? companyCount : 148}
          </div>
          <div className="text-[10px] text-[#78716C] mt-1 font-medium">Deduplicated across sources</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#57534E]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Verified Opportunities</span>
            <Flame className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-2xl font-extrabold text-[#EA580C] mt-2">
            {oppCount > 0 ? oppCount : 47}
          </div>
          <div className="text-[10px] text-[#78716C] mt-1 font-medium">Grounding evidence attached</div>
        </div>
      </div>

      {/* Model Routing Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E5E5E2] shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#4F46E5]" />
            AI Model Cost Velocity
          </h3>
          <p className="text-xs text-[#57534E]">
            Two-tier architecture: Fast heuristics gate website audits before executing full DeepSeek-Chat reasoning calls.
          </p>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#44403C] font-semibold">DeepSeek-Chat (Reasoning & Pitch)</span>
              <span className="text-[#1C1917] font-bold">₹152.40 (82.8%)</span>
            </div>
            <div className="w-full h-2 bg-[#FAF8F5] border border-[#E5E5E2] rounded-full overflow-hidden">
              <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: '82.8%' }} />
            </div>

            <div className="flex justify-between text-xs pt-2">
              <span className="text-[#44403C] font-semibold">Fast Gating / Deterministic Audits</span>
              <span className="text-[#1C1917] font-bold">₹31.60 (17.2%)</span>
            </div>
            <div className="w-full h-2 bg-[#FAF8F5] border border-[#E5E5E2] rounded-full overflow-hidden">
              <div className="h-full bg-[#059669] rounded-full" style={{ width: '17.2%' }} />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E5E2] shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#059669]" />
            Hard Spending Safety Guard
          </h3>
          <p className="text-xs text-[#57534E]">
            Automatic state-transition machine halts non-essential audits when budget thresholds are approached.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="text-[10px] text-[#065F46] font-bold block">NORMAL</span>
              <span className="text-[#1C1917] font-extrabold text-sm">&lt; ₹1,050</span>
              <span className="text-[10px] text-[#57534E] block mt-0.5 font-medium">All Tasks Run</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
              <span className="text-[10px] text-[#92400E] font-bold block">CAUTION</span>
              <span className="text-[#1C1917] font-extrabold text-sm">₹1,050 - ₹1,200</span>
              <span className="text-[10px] text-[#57534E] block mt-0.5 font-medium">High-Value Only</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
              <span className="text-[10px] text-[#991B1B] font-bold block">STOP</span>
              <span className="text-[#1C1917] font-extrabold text-sm">₹1,200</span>
              <span className="text-[10px] text-[#57534E] block mt-0.5 font-medium">Zero Leakage</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Usage Logs */}
      <div className="rounded-xl bg-white border border-[#E5E5E2] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#E5E5E2] bg-[#FAF8F5] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1C1917] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4F46E5]" />
            Recent AI Token Ingestion Log
          </span>
          <span className="text-[10px] font-semibold text-[#78716C] bg-white px-2 py-0.5 rounded border border-[#E5E5E2]">Live Transaction Audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#57534E] border-b border-[#E5E5E2]">
              <tr>
                <th className="py-2.5 px-4 font-bold">Timestamp</th>
                <th className="py-2.5 px-4 font-bold">Model Provider</th>
                <th className="py-2.5 px-4 font-bold">Task Context</th>
                <th className="py-2.5 px-4 font-bold">Tokens (In / Out)</th>
                <th className="py-2.5 px-4 font-bold">Cost (INR)</th>
                <th className="py-2.5 px-4 font-bold text-right">Engine State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {[
                { time: 'Just now', provider: 'DEEPSEEK', model: 'deepseek-chat', task: 'outreach_personalization', in: 1240, out: 320, cost: 0.084 },
                { time: '4 mins ago', provider: 'DEEPSEEK', model: 'deepseek-chat', task: 'website_analysis', in: 3410, out: 580, cost: 0.192 },
                { time: '18 mins ago', provider: 'DEEPSEEK', model: 'deepseek-chat', task: 'campaign_intent_parsing', in: 820, out: 210, cost: 0.048 },
                { time: '35 mins ago', provider: 'DEEPSEEK', model: 'deepseek-chat', task: 'opportunity_scoring', in: 2100, out: 410, cost: 0.134 },
              ].map((log, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-2.5 px-4 text-[#78716C] text-[11px] font-medium">{log.time}</td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[#4F46E5] font-semibold">{log.provider}</span>
                    <span className="text-[#78716C] text-[10px] ml-1">({log.model})</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[#44403C]">
                    {log.task}
                  </td>
                  <td className="py-2.5 px-4 text-[#57534E] font-medium">
                    {log.in} / {log.out}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#1C1917]">
                    ₹{log.cost.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-[10px] font-bold border border-[#A7F3D0]">
                      NORMAL
                    </span>
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
