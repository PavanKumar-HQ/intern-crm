'use client';

import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Building2,
  Calendar,
  RefreshCw,
  X,
  GripVertical,
  Trash2,
  Edit2,
  CheckCircle2,
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
  { id: 'PROPOSAL', label: 'Proposal', dot: 'bg-purple-600', topBorder: 'border-t-purple-600' },
  { id: 'NEGOTIATION', label: 'Negotiation', dot: 'bg-orange-500', topBorder: 'border-t-orange-500' },
  { id: 'WON', label: 'Won', dot: 'bg-emerald-600', topBorder: 'border-t-emerald-600' },
  { id: 'LOST', label: 'Lost', dot: 'bg-rose-500', topBorder: 'border-t-rose-500' },
];

export default function DealsPipelineManager() {
  const { notifications, triggerNotification } = useRealtime();
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and Drop state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Edit / Delete Deal state
  const [editingDeal, setEditingDeal] = useState<DealItem | null>(null);

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
      if (data.deals && Array.isArray(data.deals) && data.deals.length > 0) {
        setDeals(data.deals);
      } else {
        // High quality default deals
        setDeals([
          {
            id: 'dl-1',
            title: 'Singhania Logistics - Custom Enterprise Portal',
            amount: 450000,
            currency: 'INR',
            stage: 'PROPOSAL',
            probability: 70,
            expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
            companyName: 'Singhania Logistics & Supply',
            contactName: 'Vikramaditya Singhania',
            ownerName: 'Pavan Kumar',
          },
          {
            id: 'dl-2',
            title: 'Bansal Retail - Next.js Supplier Hub',
            amount: 820000,
            currency: 'INR',
            stage: 'NEGOTIATION',
            probability: 85,
            expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
            companyName: 'Bansal Retail & Distribution',
            contactName: 'Neha Bansal',
            ownerName: 'Sarah Jenkins',
          },
          {
            id: 'dl-3',
            title: 'Aura Studio - Luxury Portfolio & Lead Engine',
            amount: 280000,
            currency: 'INR',
            stage: 'QUALIFIED',
            probability: 40,
            expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
            companyName: 'Aura Studio Architecture',
            contactName: 'Pooja Mehta',
            ownerName: 'Karan Malhotra',
          },
          {
            id: 'dl-4',
            title: 'Apex Health - Diagnostic Patient Portal',
            amount: 120000,
            currency: 'INR',
            stage: 'NEW',
            probability: 25,
            expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            companyName: 'Apex Health Diagnostics',
            contactName: 'Dr. Ramesh Gupta',
            ownerName: 'Pavan Kumar',
          },
        ]);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [notifications.length]);

  const handleStageChange = async (dealId: string, targetStage: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === targetStage) return;

    // Optimistic UI update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
    );

    await triggerNotification({
      title: `Deal Stage Updated`,
      message: `Moved "${deal.title}" to ${targetStage}. Probability recalculating.`,
      type: 'system',
      priority: 'normal',
    });

    try {
      await fetch('/api/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId, stage: targetStage }),
      });
    } catch {
      // Handled gracefully
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if actually leaving the column element
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      handleStageChange(dealId, targetStageId);
    }
    setDragOverStage(null);
    setDraggedDealId(null);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    setIsSubmitting(true);
    const amountVal = parseFloat(newAmount) || 100000;
    const probVal = parseInt(newProbability) || 50;

    const createdDeal: DealItem = {
      id: `dl-${Date.now()}`,
      title: newTitle,
      amount: amountVal,
      currency: 'INR',
      stage: newStage,
      probability: probVal,
      expectedClose: newCloseDate ? new Date(newCloseDate).toISOString() : null,
      companyName: newCompany || 'Brandex Prospect',
      ownerName: 'Pavan Kumar',
    };

    setDeals((prev) => [createdDeal, ...prev]);

    await triggerNotification({
      title: 'New Opportunity Created',
      message: `Added deal "${newTitle}" worth ₹${amountVal.toLocaleString('en-IN')}`,
      type: 'system',
      priority: 'high',
    });

    try {
      await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          amount: amountVal,
          currency: 'INR',
          stage: newStage,
          probability: probVal,
          expectedClose: newCloseDate ? new Date(newCloseDate).toISOString() : null,
          companyName: newCompany || 'Brandex Prospect',
        }),
      });
    } catch {
      // offline fallback
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setNewTitle('');
      setNewAmount('');
      setNewCompany('');
      setNewCloseDate('');
    }
  };

  const handleUpdateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === editingDeal.id ? editingDeal : d))
    );
    setEditingDeal(null);
  };

  const handleDeleteDeal = (dealId: string) => {
    if (confirm('Are you sure you want to remove this deal?')) {
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      if (editingDeal?.id === dealId) setEditingDeal(null);
    }
  };

  const filteredDeals = deals.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const cName = d.company?.primaryName || d.companyName || '';
    return d.title.toLowerCase().includes(q) || cName.toLowerCase().includes(q);
  });

  const totalPipelineValue = deals.reduce((acc, d) => acc + (d.amount || 0), 0);
  const weightedPipeline = deals.reduce(
    (acc, d) => acc + (d.amount * (d.probability || 50)) / 100,
    0
  );
  const wonDealsValue = deals
    .filter((d) => d.stage === 'WON')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DDD2]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Handshake className="w-6 h-6 text-[#4F46E5]" />
            Deals & Opportunities Pipeline
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Drag-and-drop opportunity board tracking pipeline velocity, revenue probability, and closing stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchDeals}
            className="btn-secondary text-xs py-2 px-3 cursor-pointer"
            title="Refresh Deals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#4F46E5]' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Control Strip & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3.5 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
        <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2]">
            <span className="text-[#78716C]">Total Pipeline:</span>
            <span className="font-bold text-[#1C1917] font-mono">
              ₹{(totalPipelineValue / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">
            <span>Weighted Forecast:</span>
            <span className="font-bold font-mono">
              ₹{(weightedPipeline / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-[#4338CA]">
            <span>Settled Won:</span>
            <span className="font-bold font-mono">
              ₹{(wonDealsValue / 100000).toFixed(1)}L
            </span>
          </div>
          <span className="text-xs text-[#78716C] ml-1">
            {deals.length} active opportunities
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Kanban Board Columns with Native Drag & Drop */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start">
        {STAGES.map((stage, idx) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((acc, d) => acc + (d.amount || 0), 0);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`bg-[#FAF8F5] border rounded-xl p-3.5 w-[310px] min-w-[310px] max-w-[310px] shrink-0 flex flex-col min-h-[520px] transition-all shadow-xs ${
                isOver
                  ? 'border-2 border-dashed border-[#4F46E5] bg-[#EEF2FF]/60 shadow-md'
                  : `border-[#E2DDD2] border-t-4 ${stage.topBorder}`
              }`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE7DE] mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                  <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
                    {stage.label}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-[#EAE6DC] text-[#44403C]">
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
                  <div className={`h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                    isOver ? 'border-[#4F46E5] bg-white/80' : 'border-[#DDD7C9] bg-[#FAF8F5]/60'
                  }`}>
                    <span className="text-xs font-medium text-[#78716C]">
                      {isOver ? 'Drop deal here' : `No deals in ${stage.label}`}
                    </span>
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const isDragging = draggedDealId === deal.id;

                    return (
                      <div
                        key={deal.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={() => {
                          setDraggedDealId(null);
                          setDragOverStage(null);
                        }}
                        className={`p-3.5 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#4F46E5] hover:shadow-xs transition-all flex flex-col justify-between group space-y-3 cursor-grab active:cursor-grabbing ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-[#4F46E5]' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-bold text-[#1C1917] line-clamp-2 leading-snug group-hover:text-[#4F46E5] transition-colors">
                              {deal.title}
                            </div>
                            <GripVertical className="w-4 h-4 text-[#A8A29E] group-hover:text-[#4F46E5] shrink-0 opacity-60 group-hover:opacity-100" />
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
                          <span className="badge-indigo text-[11px]">
                            {deal.probability}% win
                          </span>
                        </div>

                        {/* Stage Transition & Quick Edit */}
                        <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-xs text-[#78716C]">
                          <span className="truncate max-w-[120px]">
                            {deal.expectedClose
                              ? `Close: ${new Date(deal.expectedClose).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                              : 'Active'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingDeal(deal)}
                              className="p-1 rounded hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#1C1917] transition-colors"
                              title="Edit deal parameters"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleStageChange(deal.id, STAGES[idx - 1].id)}
                                className="px-2 py-0.5 rounded border border-[#E2DDD2] hover:bg-[#EFECE4] text-[#57534E] hover:text-[#1C1917] transition-colors text-xs font-bold"
                                title={`Move to ${STAGES[idx - 1].label}`}
                              >
                                ←
                              </button>
                            )}
                            {idx < STAGES.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleStageChange(deal.id, STAGES[idx + 1].id)}
                                className="px-2 py-0.5 rounded border border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] transition-colors text-xs font-bold"
                                title={`Advance to ${STAGES[idx + 1].label}`}
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
              <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <Handshake className="w-4 h-4 text-[#4F46E5]" />
                Create New Deal
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Deal Title / Requirement *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ERP Modernization & Supplier Portal"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Client / Company Name
                </label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Singhania Logistics"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Value (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="450000"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProbability}
                    onChange={(e) => setNewProbability(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">Initial Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={newCloseDate}
                    onChange={(e) => setNewCloseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2DDD2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs px-4 py-1.5 cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
              <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#4F46E5]" />
                Edit Deal Parameters
              </h2>
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDeal} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingDeal.title}
                  onChange={(e) => setEditingDeal({ ...editingDeal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Value (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingDeal.amount}
                    onChange={(e) => setEditingDeal({ ...editingDeal, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Win Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingDeal.probability}
                    onChange={(e) => setEditingDeal({ ...editingDeal, probability: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={editingDeal.stage}
                  onChange={(e) => setEditingDeal({ ...editingDeal, stage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2DDD2]">
                <button
                  type="button"
                  onClick={() => handleDeleteDeal(editingDeal.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold hover:bg-[#FEE2E2] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Deal</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDeal(null)}
                    className="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs px-3.5 py-1.5 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
