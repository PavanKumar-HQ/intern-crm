'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface ProposalItem {
  id: string;
  title: string;
  clientName: string;
  value: number;
  status: 'DRAFT' | 'INTERNAL_REVIEW' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  validUntil: string;
  createdAt: string;
}

export default function ProposalsPage() {
  const { notifications } = useRealtime();
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [value, setValue] = useState('');

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/proposals');
      const data = await res.json();
      if (data.proposals) setProposals(data.proposals);
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [notifications]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !value) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, clientName, value: parseFloat(value) }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setClientName('');
        setValue('');
        fetchProposals();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
  });

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'ACCEPTED':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">Accepted</span>;
      case 'SENT':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">Sent</span>;
      case 'INTERNAL_REVIEW':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">Review</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#6366F1]" />
            Proposals & Commercial Scopes
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Client proposals, statements of work (SOW), line items, and approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProposals}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Proposal
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#171717]">
          {proposals.length} Commercial Proposals Issued
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5E5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] placeholder-[#5E5E5E] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                <th className="py-3 px-4 font-semibold">Scope / Proposal</th>
                <th className="py-3 px-4 font-semibold">Client</th>
                <th className="py-3 px-4 font-semibold text-right">Value (INR)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Validity</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5E5E5E]">
                    Loading proposals from persistent database...
                  </td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5E5E5E]">
                    <FileText className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-[#171717]">No proposals found</p>
                    <p className="text-[11px] text-[#5E5E5E] mt-0.5">
                      Create your first proposal to track client agreements and commercial terms.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#171717]">
                      {p.title}
                    </td>
                    <td className="py-3 px-4 text-[#171717]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                        <span>{p.clientName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#171717]">
                      ₹{p.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-3 px-4 text-[#5E5E5E]">
                      {new Date(p.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] text-[#6366F1] font-semibold cursor-pointer hover:underline">
                        View SOW
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6366F1]" />
                Draft Client Proposal
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Scope Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ERP Modernization Phase 1 Scope of Work"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Singhania Logistics"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Total Commercial Value (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="450000"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
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
                  {isSubmitting ? 'Issuing...' : 'Issue Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
