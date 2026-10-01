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
  Trash2,
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
  const [viewingProposal, setViewingProposal] = useState<ProposalItem | null>(null);
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

  const handleUpdateProposalStatus = async (id: string, status: ProposalItem['status']) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    if (viewingProposal?.id === id) {
      setViewingProposal((prev) => (prev ? { ...prev, status } : null));
    }
    try {
      await fetch('/api/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchProposals();
    } catch {
      fetchProposals();
    }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    try {
      await fetch('/api/proposals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setProposals((prev) => prev.filter((p) => p.id !== id));
      if (viewingProposal?.id === id) setViewingProposal(null);
    } catch (err) {
      console.error(err);
    }
  };

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
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Accepted</span>;
      case 'SENT':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Sent</span>;
      case 'INTERNAL_REVIEW':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Review</span>;
      case 'REJECTED':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Declined</span>;
      default:
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAE6DC] text-[#44403C] border border-[#DDD7C9]">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#4F46E5]" />
            Proposals & Commercial Scopes
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Client proposals, statements of work (SOW), line items, and approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProposals}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh Proposals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Proposal
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <span className="text-xs font-bold text-[#1C1917]">
          {proposals.length} Commercial Proposals Issued
        </span>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2DDD2] text-[#57534E]">
                <th className="py-3 px-4 font-semibold">Scope / Proposal</th>
                <th className="py-3 px-4 font-semibold">Client</th>
                <th className="py-3 px-4 font-semibold text-right">Value (INR)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Validity</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#57534E]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#4F46E5]" />
                      Loading proposals from persistent database...
                    </div>
                  </td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5E5E5E]">
                    <FileText className="w-8 h-8 text-[#A8A29E] mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-[#1C1917] text-sm">No proposals found</p>
                    <p className="text-xs text-[#57534E] mt-0.5">
                      Create your first proposal to track client agreements and commercial terms.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1C1917]">
                      {p.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#1C1917]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                        <span>{p.clientName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#1C1917]">
                      ₹{p.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-3.5 px-4 text-[#57534E]">
                      {new Date(p.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingProposal(p)}
                          className="btn-action text-xs"
                          title="View Statement of Work"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                          <span>View SOW</span>
                        </button>
                        <select
                          value={p.status}
                          onChange={(e) => handleUpdateProposalStatus(p.id, e.target.value as any)}
                          className="text-xs px-2 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] font-semibold cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="INTERNAL_REVIEW">Review</option>
                          <option value="SENT">Sent</option>
                          <option value="ACCEPTED">Accept</option>
                          <option value="REJECTED">Decline</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteProposal(p.id)}
                          className="p-1.5 rounded-lg border border-[#E2DDD2] bg-white text-[#78716C] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors"
                          title="Delete proposal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Statement of Work (SOW) Viewer Modal */}
      {viewingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-[#E2DDD2] rounded-xl p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD2]">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAE6DC] text-[#44403C]">
                  Statement of Work · SOW
                </span>
                <h2 className="text-lg font-bold text-[#1C1917] mt-1.5">
                  {viewingProposal.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingProposal(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1.5 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2]">
              <div>
                <span className="text-xs text-[#78716C] font-semibold block">Client Account</span>
                <span className="text-sm font-bold text-[#1C1917]">{viewingProposal.clientName}</span>
              </div>
              <div>
                <span className="text-xs text-[#78716C] font-semibold block">Proposal Value</span>
                <span className="text-sm font-mono font-bold text-[#1C1917]">₹{viewingProposal.value.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-xs text-[#78716C] font-semibold block">Validity Window</span>
                <span className="text-xs font-semibold text-[#57534E]">
                  {new Date(viewingProposal.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#78716C] font-semibold block">Commercial Status</span>
                <span className="mt-0.5 inline-block">{getStatusBadge(viewingProposal.status)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Milestone Deliverables & Scope
              </h3>
              <div className="space-y-2 text-xs text-[#44403C]">
                <div className="p-3 rounded-lg border border-[#E2DDD2] bg-[#FAF8F5] flex items-center justify-between">
                  <div>
                    <strong className="text-[#1C1917] block">Phase 1: Architecture, Scoping & System Modeling</strong>
                    <span className="text-[#78716C]">Discovery sessions, stakeholder interviews, technical schema definition</span>
                  </div>
                  <span className="font-mono font-bold text-[#1C1917]">40% Milestone</span>
                </div>
                <div className="p-3 rounded-lg border border-[#E2DDD2] bg-[#FAF8F5] flex items-center justify-between">
                  <div>
                    <strong className="text-[#1C1917] block">Phase 2: Core Engineering, Integration & UAT Deployment</strong>
                    <span className="text-[#78716C]">Full buildout, API connectors, migration scripting, staging environment</span>
                  </div>
                  <span className="font-mono font-bold text-[#1C1917]">40% Milestone</span>
                </div>
                <div className="p-3 rounded-lg border border-[#E2DDD2] bg-[#FAF8F5] flex items-center justify-between">
                  <div>
                    <strong className="text-[#1C1917] block">Phase 3: Production Handover & Hypercare Support</strong>
                    <span className="text-[#78716C]">Operator enablement, security audit sign-off, live monitoring SLA</span>
                  </div>
                  <span className="font-mono font-bold text-[#1C1917]">20% Milestone</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2DDD2]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateProposalStatus(viewingProposal.id, 'ACCEPTED')}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Accepted
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateProposalStatus(viewingProposal.id, 'SENT')}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Copy
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingProposal(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Close SOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
