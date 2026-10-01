'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Mail,
  Phone,
  Building2,
  Clock,
  UserCheck,
  Trash2,
  RefreshCw,
  CheckCircle2,
  X,
  User,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface EnquiryItem {
  id: string;
  title: string;
  source: string;
  contactName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  message: string | null;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo?: { id: string; name: string | null } | null;
  convertedLead?: { id: string; companyName: string } | null;
}

const ENQUIRY_STATUSES = [
  'ALL',
  'NEW',
  'REVIEWING',
  'CONTACTED',
  'QUALIFIED',
  'CONVERTED',
  'CLOSED',
];

export default function EnquiriesManager() {
  const { notifications } = useRealtime();
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    contactName: '',
    email: '',
    phone: '',
    companyName: '',
    message: '',
    priority: 'MEDIUM',
    source: 'Website Contact Form',
  });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/enquiries?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.enquiries)) {
        setEnquiries(data.enquiries);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, notifications]);

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.contactName) return;

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          contactName: '',
          email: '',
          phone: '',
          companyName: '',
          message: '',
          priority: 'MEDIUM',
          source: 'Website Contact Form',
        });
        await fetchEnquiries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToLead = async (id: string) => {
    setConvertingId(id);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, convertToLead: true }),
      });

      if (res.ok) {
        await fetchEnquiries();
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry(null);
        }
      }
    } finally {
      setConvertingId(null);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      await fetchEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await fetch('/api/enquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            High
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Converted
          </span>
        );
      case 'QUALIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Qualified
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Contacted
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Reviewing
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            New
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-[#4F46E5]" />
            Inbound Enquiries
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Capture, triage, and qualify client prospect inquiries before converting to pipeline leads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEnquiries}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Enquiry
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          {ENQUIRY_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-white hover:bg-[#EFECE4] text-[#57534E] border border-[#E2DDD2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEnquiries()}
            className="w-full sm:w-72 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4 items-start">
        {/* Enquiries Table */}
        <div className="flex-1 bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                  <th className="py-3 px-4 font-semibold">Contact / Name</th>
                  <th className="py-3 px-4 font-semibold">Company</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Requirement / Service</th>
                  <th className="py-3 px-4 font-semibold">Owner</th>
                  <th className="py-3 px-4 font-semibold text-center">Priority</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E2]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#5E5E5E]">
                      Loading enquiries from database...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#5E5E5E]">
                      <Inbox className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
                      <p className="font-medium text-[#171717]">No inbound enquiries</p>
                      <p className="text-[11px] text-[#5E5E5E] mt-0.5">
                        Inquiries from website contact forms, emails, and direct outreach appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq) => {
                    const isSelected = selectedEnquiry?.id === enq.id;
                    const dateFormatted = enq.createdAt
                      ? new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      : '-';

                    return (
                      <tr
                        key={enq.id}
                        onClick={() => setSelectedEnquiry(enq)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#F5F3FF]' : 'hover:bg-[#FAFAF9]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#1C1917] text-sm">
                          <div>{enq.contactName}</div>
                          {enq.email && (
                            <div className="text-xs text-[#78716C] font-normal truncate max-w-[160px] mt-0.5">
                              {enq.email}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#1C1917] text-sm">
                          <div className="flex items-center gap-2 font-medium">
                            <Building2 className="w-4 h-4 text-[#78716C] shrink-0" />
                            <span>{enq.companyName || 'Individual'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EFECE4] text-[#57534E] border border-[#E2DDD2] whitespace-nowrap">
                            {enq.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#1C1917] max-w-[220px] truncate font-medium text-sm">
                          {enq.title}
                        </td>
                        <td className="py-3.5 px-4 text-[#57534E] text-xs font-medium">
                          {enq.assignedTo?.name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getPriorityBadge(enq.priority)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(enq.status)}
                        </td>
                        <td className="py-3.5 px-4 text-[#78716C] text-xs">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2.5">
                            {enq.status !== 'CONVERTED' ? (
                              <button
                                type="button"
                                disabled={convertingId === enq.id}
                                onClick={() => handleConvertToLead(enq.id)}
                                className="btn-primary text-xs py-1.5 px-3"
                                title="Convert this enquiry to a full CRM Lead"
                              >
                                <span>{convertingId === enq.id ? 'Converting...' : 'Convert'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-xs text-[#15803D] font-semibold inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Converted
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(enq.id)}
                              className="p-1.5 rounded-md hover:bg-[#FEE2E2] text-[#78716C] hover:text-[#B91C1C] transition-colors"
                              title="Delete enquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right-side Detail Inspection Panel */}
        {selectedEnquiry && (
          <div className="w-[320px] bg-white border border-[#E5E5E2] rounded-xl p-4 shadow-xs space-y-4 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Enquiry Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-sm font-bold text-[#171717]">
                {selectedEnquiry.title}
              </div>
              <div className="text-xs text-[#5E5E5E] mt-0.5">
                From {selectedEnquiry.contactName} · {selectedEnquiry.companyName || 'Private Client'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Mail className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717] truncate">{selectedEnquiry.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Phone className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717]">{selectedEnquiry.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Tag className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span>Source: <strong className="text-[#171717]">{selectedEnquiry.source}</strong></span>
              </div>
            </div>

            {selectedEnquiry.message && (
              <div>
                <span className="text-[11px] font-semibold text-[#5E5E5E] uppercase tracking-wider block mb-1">
                  Message / Requirements
                </span>
                <p className="text-xs text-[#171717] bg-[#F7F7F5] p-3 rounded-lg border border-[#E5E5E2] leading-relaxed">
                  {selectedEnquiry.message}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-[#E5E5E2]">
              <label className="text-[11px] font-semibold text-[#5E5E5E] uppercase tracking-wider block">
                Update Status
              </label>
              <select
                value={selectedEnquiry.status}
                onChange={(e) => handleUpdateStatus(selectedEnquiry.id, e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] focus:outline-none focus:border-[#6366F1]"
              >
                {ENQUIRY_STATUSES.filter((s) => s !== 'ALL').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 pt-2">
                {selectedEnquiry.status !== 'CONVERTED' && (
                  <button
                    type="button"
                    onClick={() => handleConvertToLead(selectedEnquiry.id)}
                    className="flex-1 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Convert to CRM Lead
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(selectedEnquiry.id)}
                  className="p-2 rounded-lg border border-[#E2DDD2] bg-white text-[#78716C] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                  title="Delete enquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#6366F1]" />
                Log Inbound Enquiry
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Enquiry Subject / Requirement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Website Redesign & Brand Strategy"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Acme Healthtech"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@acme.com"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="Website Contact Form">Website Contact Form</option>
                    <option value="Direct Email">Direct Email</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="LinkedIn Referral">LinkedIn Referral</option>
                    <option value="Partner Network">Partner Network</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Message / Details
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Additional context on project requirements, budget, timeline..."
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
                  className="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Log Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
