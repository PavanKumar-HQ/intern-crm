'use client';

import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Building2,
  Calendar,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  User,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface DealItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  expectedClose: string | null;
  companyName?: string;
  company?: { primaryName: string };
  contactName?: string | null;
  ownerName?: string | null;
  owner?: { name: string };
}

const STAGES = [
  { id: 'NEW', label: 'New', dot: 'bg-sky-500', topBorder: 'border-t-sky-500' },
  { id: 'QUALIFIED', label: 'Qualified', dot: 'bg-indigo-600', topBorder: 'border-t-indigo-600' },
  { id: 'DISCOVERY', label: 'Discovery', dot: 'bg-amber-500', topBorder: 'border-t-amber-500' },
  { id: 'PROPOSAL', label: 'Proposal', dot: 'bg-violet-600', topBorder: 'border-t-violet-600' },
  { id: 'NEGOTIATION', label: 'Negotiation', dot: 'bg-orange-500', topBorder: 'border-t-orange-500' },
  { id: 'WON', label: 'Won', dot: 'bg-emerald-600', topBorder: 'border-t-emerald-600' },
  { id: 'LOST', label: 'Lost', dot: 'bg-rose-500', topBorder: 'border-t-rose-500' },
];

export default function DealsPipelineManager() {
  const { notifications } = useRealtime();
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Deal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newProbability, setNewProbability] = useState('40');
  const [newCloseDate, setNewCloseDate] = useState('');
  const [newStage, setNewStage] = useState('NEW');

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.deals) setDeals(data.deals);
    } catch {
      // Handled by API fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [notifications]);

  const handleStageChange = async (dealId: string, targetStage: string) => {
    // Optimistic UI update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
    );

    try {
      const res = await fetch('/api/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId, stage: targetStage }),
      });
      if (!res.ok) {
        fetchDeals();
      }
    } catch {
      fetchDeals();
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          amount: parseFloat(newAmount),
          stage: newStage,
          probability: parseInt(newProbability, 10) || 30,
          expectedClose: newCloseDate || undefined,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewAmount('');
        setNewCompany('');
        setNewCloseDate('');
        fetchDeals();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDeals = deals.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const titleMatch = d.title.toLowerCase().includes(q);
    const companyMatch = (d.company?.primaryName || d.companyName || '').toLowerCase().includes(q);
    return titleMatch || companyMatch;
  });

  const totalPipelineValue = deals.reduce((acc, d) => acc + (d.amount || 0), 0);
  const weightedPipeline = deals.reduce(
    (acc, d) => acc + ((d.amount || 0) * (d.probability || 20)) / 100,
    0
  );
  const wonDealsValue = deals
    .filter((d) => d.stage === 'WON')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Handshake className="w-6 h-6 text-[#4F46E5]" />
            Sales Deals & Pipeline
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Active pipeline opportunities, stage progressions, and weighted revenue forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deals or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5] w-52 sm:w-64 shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={fetchDeals}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh Deals"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="flex items-center gap-3.5 py-2.5 px-4 rounded-xl bg-white border border-[#E2DDD2] text-sm flex-wrap shadow-xs">
        <span className="text-[#1C1917] font-bold">
          ₹{(totalPipelineValue / 100000).toFixed(1)}L pipeline
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#15803D] font-bold">
          ₹{(weightedPipeline / 100000).toFixed(1)}L weighted
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#4F46E5] font-bold">
          ₹{(wonDealsValue / 100000).toFixed(1)}L won
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#57534E] font-medium">
          {deals.length} active deals
        </span>
      </div>

      {/* Kanban Board Columns — Uniform Widths & Proportions */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start">
        {STAGES.map((stage, idx) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((acc, d) => acc + (d.amount || 0), 0);

          return (
            <div
              key={stage.id}
              className={`bg-[#FAF8F5] border border-[#E2DDD2] border-t-4 ${stage.topBorder} rounded-xl p-3.5 w-[310px] min-w-[310px] max-w-[310px] shrink-0 flex flex-col min-h-[520px] shadow-xs`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE7DE] mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                  <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
                    {stage.label}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAE6DC] text-[#44403C]">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#57534E]">
                  ₹{(stageTotal / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Deal Cards Container */}
              <div className="space-y-3 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="h-44 border-2 border-dashed border-[#DDD7C9] rounded-xl flex flex-col items-center justify-center p-4 text-center bg-[#FAF8F5]/60">
                    <span className="text-xs font-medium text-[#78716C]">
                      No deals in {stage.label}
                    </span>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3.5 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#4F46E5] hover:shadow-xs transition-all flex flex-col justify-between group space-y-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#1C1917] line-clamp-2 leading-snug">
                          {deal.title}
                        </div>
                        <div className="text-xs font-medium text-[#57534E] mt-1.5 flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                          <span className="truncate">{deal.company?.primaryName || deal.companyName || 'Brandex Client'}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#F5F2EB] flex items-center justify-between">
                        <div className="text-base font-bold text-[#1C1917] font-mono">
                          ₹{deal.amount.toLocaleString('en-IN')}
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                          {deal.probability}% win
                        </span>
                      </div>

                      {/* Stage Transition Control */}
                      <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-xs text-[#78716C]">
                        <span>
                          {deal.expectedClose
                            ? `Close: ${new Date(deal.expectedClose).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                            : 'Active'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleStageChange(deal.id, STAGES[idx - 1].id)}
                              className="px-2 py-1 rounded-md border border-[#E2DDD2] hover:bg-[#EFECE4] text-[#57534E] hover:text-[#1C1917] transition-colors text-xs font-semibold"
                              title={`Move to ${STAGES[idx - 1].label}`}
                            >
                              ←
                            </button>
                          )}
                          {idx < STAGES.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleStageChange(deal.id, STAGES[idx + 1].id)}
                              className="px-2 py-1 rounded-md border border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] transition-colors text-xs font-semibold"
                              title={`Advance to ${STAGES[idx + 1].label}`}
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Handshake className="w-4 h-4 text-[#6366F1]" />
                Create New Deal
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Deal Title / Requirement *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ERP Modernization & Supplier Portal"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Value (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="450000"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProbability}
                    onChange={(e) => setNewProbability(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">Initial Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={newCloseDate}
                    onChange={(e) => setNewCloseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-xs text-[#5E5E5E] hover:text-[#171717] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
