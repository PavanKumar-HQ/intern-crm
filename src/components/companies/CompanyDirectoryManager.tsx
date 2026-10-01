'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Globe,
  Users,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  Filter,
  Plus,
  RefreshCw,
  X,
  Handshake,
  FolderKanban,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface CompanyRecord {
  id: string;
  primaryName: string;
  canonicalDomain?: string | null;
  city?: string | null;
  industry?: string | null;
  currentStatus: string;
  primaryPhone?: string | null;
  primaryEmail?: string | null;
  contacts?: Array<{ id: string; name: string; role?: string; email?: string; phone?: string }>;
  deals?: Array<{ id: string; title: string; amount: number; stage: string }>;
  projects?: Array<{ id: string; name: string; status: string; budget: number }>;
  invoices?: Array<{ id: string; invoiceNumber: string; total: number; status: string }>;
}

export default function CompanyDirectoryManager() {
  const { notifications } = useRealtime();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Company form
  const [primaryName, setPrimaryName] = useState('');
  const [domain, setDomain] = useState('');
  const [city, setCity] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/companies?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.companies)) {
        setCompanies(data.companies);
        if (selectedCompany) {
          const updated = data.companies.find((c: any) => c.id === selectedCompany.id);
          if (updated) setSelectedCompany(updated);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter, notifications]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryName,
          domain: domain || undefined,
          city: city || undefined,
          industry: industry || undefined,
          phone: phone || undefined,
          email: email || undefined,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setPrimaryName('');
        setDomain('');
        setCity('');
        setIndustry('');
        setPhone('');
        setEmail('');
        await fetchCompanies();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompanyStatus = async (id: string, currentStatus: string) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, currentStatus } : c)));
    if (selectedCompany?.id === id) {
      setSelectedCompany((prev) => (prev ? { ...prev, currentStatus } : null));
    }
    try {
      await fetch('/api/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentStatus }),
      });
      fetchCompanies();
    } catch {
      fetchCompanies();
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      await fetch('/api/companies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      if (selectedCompany?.id === id) setSelectedCompany(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.primaryName.toLowerCase().includes(q) ||
      (c.canonicalDomain && c.canonicalDomain.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q))
    );
  });

  const getCompanyStatusBadge = (status: string) => {
    switch (status) {
      case 'CUSTOMER':
      case 'WON':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            Customer
          </span>
        );
      case 'OUTREACH_READY':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-300">
            Outreach Ready
          </span>
        );
      case 'QUALIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-300">
            Qualified
          </span>
        );
      case 'ENGAGED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300">
            Engaged
          </span>
        );
      case 'VALIDATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
            Validated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-300">
            {status}
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
            <Building2 className="w-6 h-6 text-[#4F46E5]" />
            Client Accounts & Companies
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Deduplicated organization entities, stakeholder contacts, active pipeline deals, and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCompanies}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'DISCOVERED', 'QUALIFIED', 'ENGAGED', 'CUSTOMER'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white hover:bg-[#EAE6DC] text-[#57534E] border border-[#E2DDD2]'
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
            placeholder="Search companies by name, domain, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCompanies()}
            className="w-full sm:w-72 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4 items-start">
        {/* Companies Table */}
        <div className="flex-1 bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#F0EDE5] border-b border-[#E2DDD2] text-[#78716C]">
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Account / Company</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Domain</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">City / Region</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Industry</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-center">Contacts</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-center">Deals</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DC]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#78716C]">
                      Loading company directory...
                    </td>
                  </tr>
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#78716C]">
                      <Building2 className="w-8 h-8 text-[#78716C] mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-[#1C1917]">No companies found</p>
                      <p className="text-xs text-[#78716C] mt-1">
                        Add an account record or ingest client leads to populate the company directory.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((comp) => {
                    const isSelected = selectedCompany?.id === comp.id;

                    return (
                      <tr
                        key={comp.id}
                        onClick={() => setSelectedCompany(comp)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EEF2FF]' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#EFECE4] border border-[#DDD7C9] flex items-center justify-center shrink-0 text-[#4F46E5]">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span>{comp.primaryName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#57534E]">
                          {comp.canonicalDomain ? (
                            <span className="text-[#4F46E5] font-mono text-xs font-semibold">
                              {comp.canonicalDomain}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#57534E] text-xs font-medium">
                          {comp.city || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-[#57534E] text-xs font-medium">
                          {comp.industry || 'Enterprise Services'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#1C1917]">
                          <span className="px-2 py-0.5 rounded-full bg-[#EAE6DC] text-xs">
                            {comp.contacts?.length || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#4F46E5]">
                          <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-xs">
                            {comp.deals?.length || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getCompanyStatusBadge(comp.currentStatus)}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCompany(comp)}
                              className="btn-action text-xs py-1 px-2.5"
                            >
                              <span>Inspect</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCompany(comp.id)}
                              className="p-1 rounded-lg border border-[#E2DDD2] bg-[#FAF8F5] text-[#78716C] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors"
                              title="Delete company"
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

        {/* Right-side Account Record Inspection Panel */}
        {selectedCompany && (
          <div className="w-[340px] bg-white border border-[#E5E5E2] rounded-xl p-4 shadow-xs space-y-4 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Account Record
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-sm font-bold text-[#171717] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#6366F1]" />
                {selectedCompany.primaryName}
              </div>
              <div className="text-xs text-[#5E5E5E] mt-0.5">
                {selectedCompany.industry || 'Commercial Client'} · {selectedCompany.city || 'India'}
              </div>
            </div>

            {/* Quick Meta */}
            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Globe className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717]">{selectedCompany.canonicalDomain || 'No domain'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Phone className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717]">{selectedCompany.primaryPhone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Mail className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717] truncate">{selectedCompany.primaryEmail || 'No email recorded'}</span>
              </div>
            </div>

            {/* Associated Contacts */}
            <div>
              <span className="text-[11px] font-semibold text-[#5E5E5E] uppercase tracking-wider block mb-1.5">
                Stakeholders & Contacts ({selectedCompany.contacts?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedCompany.contacts && selectedCompany.contacts.length > 0 ? (
                  selectedCompany.contacts.map((ct) => (
                    <div key={ct.id} className="p-2 rounded bg-[#F7F7F5] border border-[#E5E5E2] text-xs flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-[#171717]">{ct.name}</div>
                        <div className="text-[10px] text-[#5E5E5E]">{ct.role || 'Contact'}</div>
                      </div>
                      {ct.email && <span className="text-[10px] text-[#6366F1] truncate max-w-[100px]">{ct.email}</span>}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[#5E5E5E] italic">No contacts linked to this company.</p>
                )}
              </div>
            </div>

            {/* Associated Deals */}
            <div>
              <span className="text-[11px] font-semibold text-[#5E5E5E] uppercase tracking-wider block mb-1.5">
                Active Deals ({selectedCompany.deals?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedCompany.deals && selectedCompany.deals.length > 0 ? (
                  selectedCompany.deals.map((dl) => (
                    <div key={dl.id} className="p-2 rounded bg-[#F7F7F5] border border-[#E5E5E2] text-xs flex justify-between items-center">
                      <div className="truncate max-w-[180px] font-medium text-[#171717]">{dl.title}</div>
                      <div className="font-bold text-[#16A34A] text-[11px]">₹{dl.amount.toLocaleString('en-IN')}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[#5E5E5E] italic">No active deals registered.</p>
                )}
              </div>
            </div>

            {/* Account Status & Actions */}
            <div className="pt-3 border-t border-[#E2DDD2] space-y-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider block">
                  Account Pipeline Status
                </label>
                <select
                  value={selectedCompany.currentStatus}
                  onChange={(e) => handleUpdateCompanyStatus(selectedCompany.id, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] font-semibold focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="DISCOVERED">Discovered</option>
                  <option value="ENGAGED">Engaged</option>
                  <option value="CLIENT">Active Client</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteCompany(selectedCompany.id)}
                className="btn-secondary text-[#B91C1C] hover:bg-[#FEE2E2] text-xs py-2 w-full flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Company Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6366F1]" />
                Add Company Account
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Company Primary Name *
                </label>
                <input
                  type="text"
                  required
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  placeholder="e.g. Apex Health Diagnostics"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Canonical Domain
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="apexhealth.in"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    City / HQ
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Healthcare & Biotech"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 22 2345 6789"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@apexhealth.in"
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
                  {isSubmitting ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
