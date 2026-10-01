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
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <ChartNoAxesCombined className="w-6 h-6 text-[#4F46E5]" />
            Executive Reports & Business Performance
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Real-time management metrics derived directly from sales pipeline, billing ledger, and operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchReportsData}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 Executive Sections */}
      <div className="space-y-6">
        {/* Section 1: Sales Performance */}
        <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE7DE] pb-3">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
              Commercial & Sales Pipeline Metrics
            </h2>
            <span className="text-xs text-[#78716C] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E2DDD2]">
              Live Engine Calculation
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Total Pipeline Value</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5 font-mono">₹{totalPipeline.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Won Deals Revenue</span>
              <div className="text-xl font-bold text-[#15803D] mt-1.5 font-mono">₹{wonRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Avg Deal Size</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5 font-mono">₹{avgDealValue.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Lead → Qualification</span>
              <div className="text-xl font-bold text-[#4F46E5] mt-1.5">{leadConversionRate}%</div>
            </div>
          </div>
        </div>

        {/* Section 2: Financials & Collections */}
        <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE7DE] pb-3">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#15803D]" />
              Financial Billing & Cashflow Ledger
            </h2>
            <span className="text-xs text-[#78716C] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E2DDD2]">
              {invoices.length} Registered Invoices
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Total Invoiced (Inc. GST)</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5 font-mono">₹{totalInvoiced.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Total Cash Collected</span>
              <div className="text-xl font-bold text-[#15803D] mt-1.5 font-mono">₹{totalCollected.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Current Outstanding</span>
              <div className="text-xl font-bold text-[#B45309] mt-1.5 font-mono">₹{totalOutstanding.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Collection Efficiency</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5">
                {totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Operational Delivery */}
        <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE7DE] pb-3">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#B45309]" />
              Team Tasks & Deliverables Workload
            </h2>
            <span className="text-xs text-[#78716C] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E2DDD2]">
              {tasks.length} Operational Items
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Tasks Completed</span>
              <div className="text-xl font-bold text-[#15803D] mt-1.5">{completedTasks}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Overdue Action Items</span>
              <div className="text-xl font-bold text-[#B91C1C] mt-1.5">{overdueTasks}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Completion Rate</span>
              <div className="text-xl font-bold text-[#1C1917] mt-1.5">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
