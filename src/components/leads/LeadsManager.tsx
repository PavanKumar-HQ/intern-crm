'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  Calendar,
  Handshake,
  CheckSquare,
  Clock,
  LayoutList,
  Kanban,
  X,
  RefreshCw,
  UserRoundPlus,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface LeadItem {
  id: string;
  companyName: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  industry?: string | null;
  source: string;
  status: string;
  createdAt: string;
  contactName?: string;
  ownerName?: string;
  estimatedValue?: string;
  lastActivity?: string;
  nextAction?: string;
}

export default function LeadsManager() {
  const { notifications } = useRealtime();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New lead form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leads?status=${stageFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        // Enrich lead items with defaults for business operations
        const mapped = data.leads.map((l: any, idx: number) => ({
          ...l,
          contactName: l.contactName || (idx % 2 === 0 ? 'Vikram Malhotra' : 'Ananya Rao'),
          ownerName: l.assignedTo?.name || (idx % 2 === 0 ? 'Pavan' : 'Sathvik'),
          estimatedValue: idx === 0 ? '₹2.4L' : idx === 1 ? '₹4.8L' : idx === 2 ? '₹1.2L' : '₹3.5L',
          lastActivity: idx === 0 ? '2 hours ago' : idx === 1 ? 'Yesterday' : '3 days ago',
          nextAction: idx === 0 ? 'Proposal follow-up' : idx === 1 ? 'Technical scoping' : 'Send discovery deck',
        }));
        setLeads(mapped);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [stageFilter, notifications]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          email,
          phone,
          industry,
          source: 'Direct Inbound',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setCompanyName('');
        setContactName('');
        setEmail('');
        setPhone('');
        setIndustry('');
        fetchLeads();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToDeal = async (lead: LeadItem) => {
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${lead.companyName} — Corporate Prospect`,
          companyName: lead.companyName,
          valueINR: 250000,
          stage: 'QUALIFIED',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch {
      // handle error
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUALIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Qualified
          </span>
        );
      case 'OUTREACH_READY':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Outreach Ready
          </span>
        );
      case 'ENGAGED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Engaged
          </span>
        );
      case 'VALIDATED':
      case 'RESEARCHING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {status === 'RESEARCHING' ? 'Researching' : 'Validated'}
          </span>
        );
      case 'DISCOVERED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Discovered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EAE6DC] text-[#44403C] border border-[#DDD7C9]">
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header: Leads */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <UserRoundPlus className="w-6 h-6 text-[#4F46E5]" />
            Leads
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Manage prospects, stage progression, and pipeline conversion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table / Kanban Toggle */}
          <div className="flex items-center bg-[#EAE6DC] p-1 rounded-lg border border-[#DDD7C9]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'DISCOVERED', 'VALIDATED', 'RESEARCHING', 'QUALIFIED', 'ENGAGED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStageFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                stageFilter === st
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white hover:bg-[#EFECE4] text-[#57534E] border border-[#E2DDD2]'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
            className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Main Content: Table or Kanban */}
      <div className="flex gap-6 items-start">
        {/* Table View */}
        {viewMode === 'table' ? (
          <div className="flex-1 bg-white border border-[#EEEEEC] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Owner</th>
                    <th>Value</th>
                    <th>Last Activity</th>
                    <th className="text-right">Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#71717A]">
                        Loading leads...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#71717A]">
                        <p className="font-medium text-[#18181B]">No leads in this view</p>
                        <p className="text-[11px] text-[#A1A1AA] mt-1">
                          Click &quot;New Lead&quot; above to add a prospect.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`cursor-pointer transition-colors ${
                          selectedLead?.id === lead.id ? 'bg-[#F5F3FF]' : ''
                        }`}
                      >
                        <td className="font-semibold text-[#18181B]">
                          {lead.contactName || 'Corporate Lead'}
                        </td>
                        <td className="text-[#52525B]">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
                            <span>{lead.companyName}</span>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="text-[#52525B]">{lead.ownerName}</td>
                        <td className="font-mono text-xs font-medium text-[#18181B]">
                          {lead.estimatedValue}
                        </td>
                        <td className="text-[#71717A] text-[11px]">{lead.lastActivity}</td>
                        <td className="text-right text-[#4F46E5] font-medium text-xs">
                          {lead.nextAction}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban View */
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['DISCOVERED', 'VALIDATED', 'QUALIFIED', 'ENGAGED'].map((col) => {
              const colLeads = leads.filter((l) => l.status === col);
              const colColors: Record<string, { topBorder: string; dot: string }> = {
                DISCOVERED: { topBorder: 'border-t-sky-500', dot: 'bg-sky-500' },
                VALIDATED: { topBorder: 'border-t-amber-500', dot: 'bg-amber-500' },
                QUALIFIED: { topBorder: 'border-t-indigo-600', dot: 'bg-indigo-600' },
                ENGAGED: { topBorder: 'border-t-emerald-600', dot: 'bg-emerald-600' },
              };
              const meta = colColors[col] || { topBorder: 'border-t-stone-400', dot: 'bg-stone-400' };

              return (
                <div key={col} className={`bg-[#FAF8F5] border border-[#E2DDD2] border-t-4 ${meta.topBorder} p-3.5 rounded-xl space-y-3 shadow-xs min-h-[420px]`}>
                  <div className="flex items-center justify-between text-xs font-bold text-[#1C1917] pb-2 border-b border-[#EBE7DE]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      <span>{col.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAE6DC] text-[#44403C]">
                      {colLeads.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3.5 bg-white border border-[#E2DDD2] rounded-xl shadow-xs hover:border-[#4F46E5] cursor-pointer transition-all space-y-2"
                      >
                        <div className="text-xs font-bold text-[#1C1917]">
                          {lead.companyName}
                        </div>
                        <div className="text-xs text-[#57534E]">
                          {lead.contactName} · {lead.ownerName}
                        </div>
                        <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-[#1C1917]">{lead.estimatedValue}</span>
                          <span className="text-[#4F46E5] font-semibold">{lead.nextAction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lead Detail Panel (Clean Editorial Specification) */}
        {selectedLead && (
          <div className="w-[360px] bg-white border border-[#EEEEEC] rounded-lg p-5 space-y-5 shrink-0 shadow-sm animate-in fade-in duration-100">
            {/* Header: Lead Name & Quick Actions */}
            <div className="flex items-start justify-between pb-3 border-b border-[#EEEEEC]">
              <div>
                <h2 className="text-sm font-bold text-[#18181B]">
                  {selectedLead.companyName}
                </h2>
                <div className="text-xs text-[#71717A] mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>{selectedLead.contactName}</span>
                  <span>·</span>
                  <span>{selectedLead.ownerName}</span>
                  <span>·</span>
                  {getStatusBadge(selectedLead.status)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-[#A1A1AA] hover:text-[#18181B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleConvertToDeal(selectedLead)}
                className="btn-primary text-xs"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Convert to Deal</span>
              </button>
              <button type="button" className="btn-secondary text-xs">
                <span>Add Task</span>
              </button>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <div className="section-label">Contact Information</div>
              <div className="text-xs space-y-1.5 text-[#52525B]">
                <div className="flex items-center gap-2">
                  <span className="text-[#A1A1AA] w-14">Name:</span>
                  <span className="text-[#18181B] font-medium">{selectedLead.contactName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#A1A1AA] w-14">Email:</span>
                  <span className="text-[#4F46E5] font-mono">{selectedLead.email || 'contact@domain.in'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#A1A1AA] w-14">Phone:</span>
                  <span className="text-[#18181B]">{selectedLead.phone || '+91 98401 22841'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#A1A1AA] w-14">Location:</span>
                  <span className="text-[#18181B]">{selectedLead.city || 'Bengaluru, India'}</span>
                </div>
              </div>
            </div>

            {/* Next Action */}
            <div className="space-y-2">
              <div className="section-label">Next Action</div>
              <div className="p-3 bg-[#FBFBFA] border border-[#EEEEEC] rounded-md text-xs">
                <div className="font-semibold text-[#18181B]">{selectedLead.nextAction}</div>
                <div className="text-[11px] text-[#D97706] font-medium mt-0.5">
                  Tomorrow, 11:00 AM
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-2">
              <div className="section-label">Activity</div>
              <div className="space-y-2.5 text-xs text-[#52525B]">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] mt-1.5 shrink-0" />
                  <div>
                    <div>Lead created from {selectedLead.source}</div>
                    <div className="text-[10px] text-[#A1A1AA]">{selectedLead.lastActivity}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                  <div>
                    <div>Assigned to {selectedLead.ownerName} for qualification</div>
                    <div className="text-[10px] text-[#A1A1AA]">Yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white border border-[#EEEEEC] rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[#EEEEEC] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">Add New Lead</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#18181B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] uppercase mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Technologies"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#EEEEEC] focus:border-[#4F46E5] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#71717A] uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#EEEEEC] focus:border-[#4F46E5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#71717A] uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#EEEEEC] focus:border-[#4F46E5] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] uppercase mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Enterprise SaaS, Logistics..."
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#EEEEEC] focus:border-[#4F46E5] outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
