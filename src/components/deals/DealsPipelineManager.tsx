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
  { id: 'NEW', label: 'New', dot: 'bg-blue-500' },
  { id: 'QUALIFIED', label: 'Qualified', dot: 'bg-cyan-500' },
  { id: 'DISCOVERY', label: 'Discovery', dot: 'bg-indigo-500' },
  { id: 'PROPOSAL', label: 'Proposal', dot: 'bg-amber-500' },
  { id: 'NEGOTIATION', label: 'Negotiation', dot: 'bg-purple-500' },
  { id: 'WON', label: 'Won', dot: 'bg-emerald-500' },
  { id: 'LOST', label: 'Lost', dot: 'bg-rose-500' },
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
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#6366F1]" />
            Sales Deals & Pipeline
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Active pipeline opportunities, stage progressions, and weighted revenue forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5E5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deals or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] placeholder-[#5E5E5E] focus:outline-none focus:border-[#6366F1] w-48 sm:w-60 shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={fetchDeals}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
            title="Refresh Deals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </button>
        </div>
      </div>

      {/* Compact Financial Summary Strip (single line, low cognitive load) */}
      <div className="flex items-center gap-3 py-2 px-3.5 rounded-md bg-[#FAF8F5] border border-[#E2DDD2] text-xs">
        <span className="text-[#1C1917] font-semibold">
          ₹{(totalPipelineValue / 100000).toFixed(1)}L pipeline
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#15803D] font-semibold">
          ₹{(weightedPipeline / 100000).toFixed(1)}L weighted
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#4F46E5] font-semibold">
          ₹{(wonDealsValue / 100000).toFixed(1)}L won
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#57534E] font-medium">
          {deals.length} active deals
        </span>
      </div>

      {/* Kanban Board Columns — Clean Warm Creme Surfaces */}
      <div className="flex gap-3 overflow-x-auto pb-4 items-start">
        {STAGES.map((stage, idx) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((acc, d) => acc + (d.amount || 0), 0);

          return (
            <div
              key={stage.id}
              className="bg-[#FAF8F5] border border-[#E2DDD2] rounded-lg p-3 min-w-[270px] max-w-[270px] shrink-0 flex flex-col min-h-[480px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#EBE7DE] mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className="text-xs font-semibold text-[#1C1917]">
                    {stage.label}
                  </span>
                  <span className="text-[11px] text-[#78716C] font-medium">
                    ({stageDeals.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium text-[#78716C]">
                  ₹{(stageTotal / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Deal Cards Container */}
              <div className="space-y-2 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#A8A29E]">
                    No deals
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 rounded-md bg-[#FFFFFF] border border-[#EAE6DC] hover:border-[#4F46E5] transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#1C1917] line-clamp-2 leading-snug">
                          {deal.title}
                        </div>
                        <div className="text-[11px] text-[#78716C] mt-1 flex items-center gap-1.5 truncate">
                          <Building2 className="w-3 h-3 text-[#A8A29E] shrink-0" />
                          <span className="truncate">{deal.company?.primaryName || deal.companyName || 'Brandex Client'}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-xs">
                        <div className="font-bold text-[#1C1917]">
                          ₹{deal.amount.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[11px] text-[#78716C]">
                          {deal.probability}% win
                        </span>
                      </div>

                      {/* Stage Transition Control */}
                      <div className="mt-2 pt-1.5 border-t border-[#F5F2EB] flex items-center justify-between text-[11px] text-[#78716C]">
                        <span>
                          {deal.expectedClose
                            ? `Close: ${new Date(deal.expectedClose).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                            : 'Stage'}
                        </span>
                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleStageChange(deal.id, STAGES[idx - 1].id)}
                              className="px-1.5 py-0.5 rounded hover:bg-[#EDEAE1] text-[#57534E] hover:text-[#1C1917] transition-colors text-[10px]"
                              title={`Move to ${STAGES[idx - 1].label}`}
                            >
                              ←
                            </button>
                          )}
                          {idx < STAGES.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleStageChange(deal.id, STAGES[idx + 1].id)}
                              className="px-1.5 py-0.5 rounded hover:bg-[#E8E4F9] hover:text-[#4F46E5] text-[#57534E] transition-colors text-[10px]"
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
