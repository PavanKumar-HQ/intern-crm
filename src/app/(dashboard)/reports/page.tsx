'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartNoAxesCombined,
  TrendingUp,
  Receipt,
  ListTodo,
  UserRoundPlus,
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

export default function ReportsPage() {
  const { notifications } = useRealtime();
  const [data, setData] = useState<{
    deals?: any[];
    invoices?: any[];
    tasks?: any[];
    leads?: any[];
  }>({});
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [dealsRes, invoicesRes, tasksRes, leadsRes] = await Promise.all([
        fetch('/api/deals').then((r) => r.json()).catch(() => ({ deals: [] })),
        fetch('/api/invoices').then((r) => r.json()).catch(() => ({ invoices: [] })),
        fetch('/api/tasks?status=ALL').then((r) => r.json()).catch(() => ({ tasks: [] })),
        fetch('/api/leads').then((r) => r.json()).catch(() => ({ leads: [] })),
      ]);

      setData({
        deals: dealsRes.deals || [],
        invoices: invoicesRes.invoices || [],
        tasks: tasksRes.tasks || [],
        leads: leadsRes.leads || [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [notifications]);

  const deals = data.deals || [];
  const invoices = data.invoices || [];
  const tasks = data.tasks || [];
  const leads = data.leads || [];

  // Real calculations
  const totalPipeline = deals.reduce((acc, d) => acc + (d.amount || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === 'WON');
  const wonRevenue = wonDeals.reduce((acc, d) => acc + (d.amount || 0), 0);
  const avgDealValue = deals.length > 0 ? Math.round(totalPipeline / deals.length) : 0;

  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.total || 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalOutstanding = totalInvoiced - totalCollected;

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const qualifiedLeads = leads.filter((l) => l.status === 'QUALIFIED' || l.status === 'ENGAGED').length;
  const leadConversionRate = leads.length > 0 ? Math.round((qualifiedLeads / leads.length) * 100) : 0;

  return (
    <div className="space-y-7 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5]">
              <ChartNoAxesCombined className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
              Executive Reports & Business Performance
            </h1>
          </div>
          <p className="text-xs text-[#57534E] mt-1 ml-10">
            Real-time management metrics derived directly from sales pipeline, billing ledger, and operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchReportsData}
            className="btn-secondary text-xs py-2 px-3 cursor-pointer flex items-center gap-1.5"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#57534E] ${loading ? 'animate-spin text-[#4F46E5]' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 3 Executive Sections with Generous Spacing and Visual Progress Meters */}
      <div className="space-y-6">
        {/* Section 1: Sales Performance */}
        <div className="bg-white border border-[#E2DDD2] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F5F2EB] pb-3">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
              Commercial & Sales Pipeline Metrics
            </h2>
            <span className="text-xs text-[#78716C] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E2DDD2]">
              Live Engine Calculation
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Total Pipeline Value</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5 font-mono">₹{totalPipeline.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Active sales opportunities</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Won Deals Revenue</span>
              <div className="text-xl font-bold text-[#15803D] mt-1.5 font-mono">₹{wonRevenue.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">{wonDeals.length} contracts closed</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Avg Deal Size</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5 font-mono">₹{avgDealValue.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Per closed opportunity</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Lead → Qualification</span>
              <div className="text-xl font-bold text-[#4F46E5] mt-1.5">{leadConversionRate}%</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">{qualifiedLeads} of {leads.length} qualified</span>
            </div>
          </div>

          {/* Visual Win-rate Progress Bar */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#57534E]">
              <span>Pipeline Realization Rate</span>
              <span className="font-mono font-bold text-[#1C1917]">
                {totalPipeline > 0 ? Math.round((wonRevenue / totalPipeline) * 100) : 0}% Realized
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#E2DDD2] overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                style={{ width: `${totalPipeline > 0 ? Math.min(100, Math.round((wonRevenue / totalPipeline) * 100)) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financials & Collections */}
        <div className="bg-white border border-[#E2DDD2] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F5F2EB] pb-3">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#15803D]" />
              Financial Billing & Cashflow Ledger
            </h2>
            <span className="text-xs text-[#78716C] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E2DDD2]">
              {invoices.length} Registered Invoices
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Total Invoiced (Inc. GST)</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5 font-mono">₹{totalInvoiced.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Gross billings issued</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Total Cash Collected</span>
              <div className="text-xl font-bold text-[#15803D] mt-1.5 font-mono">₹{totalCollected.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Remitted to HDFC</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Current Outstanding</span>
              <div className="text-xl font-bold text-[#B45309] mt-1.5 font-mono">₹{totalOutstanding.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Pending client payments</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Collection Efficiency</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5">
                {totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}%
              </div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Cash conversion ratio</span>
            </div>
          </div>

          {/* Visual Collection Progress Bar */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#57534E]">
              <span>Collection Realization</span>
              <span className="font-mono font-bold text-[#059669]">
                ₹{totalCollected.toLocaleString('en-IN')} of ₹{totalInvoiced.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#E2DDD2] overflow-hidden">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${totalInvoiced > 0 ? Math.min(100, Math.round((totalCollected / totalInvoiced) * 100)) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Operational Delivery */}
        <div className="bg-white border border-[#E2DDD2] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F5F2EB] pb-3">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#B45309]" />
              Team Tasks & Deliverables Workload
            </h2>
            <span className="text-xs text-[#78716C] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E2DDD2]">
              {tasks.length} Operational Items
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Tasks Completed</span>
              <div className="text-xl font-bold text-[#15803D] mt-1.5">{completedTasks}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Successfully resolved</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Overdue Action Items</span>
              <div className="text-xl font-bold text-[#B91C1C] mt-1.5">{overdueTasks}</div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Needs immediate triage</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">Completion Rate</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
              </div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Team execution velocity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
