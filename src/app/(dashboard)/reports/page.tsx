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
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <ChartNoAxesCombined className="w-5 h-5 text-[#6366F1]" />
            Executive Reports & Business Performance
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Real-time management metrics derived directly from sales pipeline, billing ledger, and operations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReportsData}
          className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
          title="Refresh Reports"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 3 Executive Sections */}
      <div className="space-y-6">
        {/* Section 1: Sales Performance */}
        <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-3">
            <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6366F1]" />
              Commercial & Sales Pipeline Metrics
            </h2>
            <span className="text-[11px] text-[#5E5E5E] font-medium">Direct DB Calculations</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Total Pipeline Value</span>
              <div className="text-lg font-bold text-[#171717] mt-1">₹{totalPipeline.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Won Deals Revenue</span>
              <div className="text-lg font-bold text-[#16A34A] mt-1">₹{wonRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Avg Deal Size</span>
              <div className="text-lg font-bold text-[#171717] mt-1">₹{avgDealValue.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Lead → Qualification</span>
              <div className="text-lg font-bold text-[#6366F1] mt-1">{leadConversionRate}%</div>
            </div>
          </div>
        </div>

        {/* Section 2: Financials & Collections */}
        <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-3">
            <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#16A34A]" />
              Financial Billing & Cashflow Ledger
            </h2>
            <span className="text-[11px] text-[#5E5E5E] font-medium">{invoices.length} Registered Invoices</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Total Invoiced (Inc. GST)</span>
              <div className="text-lg font-bold text-[#171717] mt-1">₹{totalInvoiced.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Total Cash Collected</span>
              <div className="text-lg font-bold text-[#16A34A] mt-1">₹{totalCollected.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Current Outstanding</span>
              <div className="text-lg font-bold text-[#D97706] mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Collection Efficiency</span>
              <div className="text-lg font-bold text-[#171717] mt-1">
                {totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Operational Delivery */}
        <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-3">
            <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#D97706]" />
              Team Tasks & Deliverables Workload
            </h2>
            <span className="text-[11px] text-[#5E5E5E] font-medium">{tasks.length} Operational Items</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Tasks Completed</span>
              <div className="text-lg font-bold text-[#16A34A] mt-1">{completedTasks}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Overdue Action Items</span>
              <div className="text-lg font-bold text-[#DC2626] mt-1">{overdueTasks}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2]">
              <span className="text-[11px] text-[#5E5E5E] font-medium block">Completion Rate</span>
              <div className="text-lg font-bold text-[#171717] mt-1">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
