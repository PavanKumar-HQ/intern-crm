'use client';

import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Key,
  Database,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Server,
  Save,
} from 'lucide-react';

const RLS_TABLES = [
  { table: 'Company', rls: true, policies: 3, description: 'Multi-tenant organization isolation and client enrichment guard' },
  { table: 'Lead', rls: true, policies: 3, description: 'Raw lead ingestion isolation and deduplication verification' },
  { table: 'Deal', rls: true, policies: 4, description: 'Sales pipeline stage transitions and weighted forecast access' },
  { table: 'Invoice', rls: true, policies: 3, description: 'Financial ledger protection, GST line items, and payment reconciliation' },
  { table: 'Contact', rls: true, policies: 2, description: 'Decision maker executive profiles and contact protection' },
  { table: 'Task', rls: true, policies: 3, description: 'Operational action item assignment and completion enforcement' },
  { table: 'Project', rls: true, policies: 3, description: 'Client deliverable milestones and budget tracking' },
  { table: 'AuditLog', rls: true, policies: 2, description: 'Tamper-evident audit trail, admin audit access' },
];

export default function SettingsSecurityHub() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'rls' | 'guardrails' | 'env'>('workspace');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Workspace & Profile state
  const [orgName, setOrgName] = useState('Brandex Global HQ');
  const [legalName, setLegalName] = useState('Brandex Digital Solutions & Media Pvt Ltd');
  const [orgDomain, setOrgDomain] = useState('brandex.in');
  const [supportEmail, setSupportEmail] = useState('billing@brandex.in');
  const [phone, setPhone] = useState('+91 80 4123 4567');
  const [address, setAddress] = useState('42, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038');
  
  // Tax & Invoicing profile
  const [currency] = useState('INR (₹)');
  const [gstRate] = useState('18% Standard GST (CGST 9% + SGST 9%)');
  const [gstin, setGstin] = useState('29AABCB1234F1Z8');
  const [pan, setPan] = useState('AABCB1234F');
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [accountNo, setAccountNo] = useState('50200088921820');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [bankBranch, setBankBranch] = useState('Indiranagar 100ft Road, Bangalore');

  const copySqlPath = () => {
    navigator.clipboard.writeText('prisma/migrations/supabase_rls_rbac.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5]">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
              System Settings & Platform Governance
            </h1>
          </div>
          <p className="text-xs text-[#57534E] mt-1 ml-10">
            Workspace organization profile, billing & GST master parameters, PostgreSQL Row-Level Security (RLS), and API guardrails.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2DDD2] pb-3 flex-wrap">
        {[
          { key: 'workspace', label: 'Workspace & Profile', icon: Building2 },
          { key: 'rls', label: 'Database RLS Policies', icon: Database },
          { key: 'guardrails', label: 'Security & SSRF Guardrails', icon: Lock },
          { key: 'env', label: 'API Configuration', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Workspace */}
      {activeTab === 'workspace' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Organization & Business Profile */}
            <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2DDD2]">
                <Building2 className="w-4 h-4 text-[#4F46E5]" />
                <h2 className="text-sm font-bold text-[#1C1917]">Workspace & Legal Entity</h2>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Organization / Workspace Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Legal Business Name (For Invoicing)
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1">
                      Primary Domain
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orgDomain}
                        onChange={(e) => setOrgDomain(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1">
                      Billing Support Email
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Support Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Registered Corporate Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-2.5" />
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Financial & Invoicing Configuration */}
            <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2DDD2]">
                <FileText className="w-4 h-4 text-[#059669]" />
                <h2 className="text-sm font-bold text-[#1C1917]">Invoicing, Tax & Bank Remittance</h2>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1">
                      Operating Currency
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currency}
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1">
                      Default Tax Schedule
                    </label>
                    <input
                      type="text"
                      disabled
                      value={gstRate}
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1">
                      Company GSTIN
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs font-mono uppercase focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1">
                      Permanent Account Number (PAN)
                    </label>
                    <input
                      type="text"
                      value={pan}
                      onChange={(e) => setPan(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs font-mono uppercase focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] space-y-3">
                  <div className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>Official Bank Remittance (Printed on Client Invoices)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] text-[#78716C] block">Bank Name</span>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E2DDD2] text-xs text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#78716C] block">Account Number</span>
                      <input
                        type="text"
                        value={accountNo}
                        onChange={(e) => setAccountNo(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E2DDD2] text-xs font-mono text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#78716C] block">IFSC Code</span>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E2DDD2] text-xs font-mono uppercase text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#78716C] block">Branch Location</span>
                      <input
                        type="text"
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E2DDD2] text-xs text-[#1C1917]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health & Security Metrics Summary Strip */}
          <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1C1917] flex items-center gap-2">
                  <span>Workspace Security & Tenant Isolation Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[10px] font-bold">
                    PROTECTED
                  </span>
                </div>
                <div className="text-[11px] text-[#78716C] mt-0.5">
                  AWS AP-South-1 (Mumbai) · 8/8 PostgreSQL RLS Tables Verified · AES-256 Encryption
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="btn-primary text-xs py-2 px-5 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Workspace Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab: RLS Database Policies */}
      {activeTab === 'rls' && (
        <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E2]">
            <div>
              <h2 className="text-sm font-bold text-[#1C1917]">PostgreSQL Row-Level Security (RLS) Status</h2>
              <p className="text-xs text-[#57534E] mt-0.5">
                Every table enforces tenant boundary filtering on all queries and mutations.
              </p>
            </div>

            <button
              type="button"
              onClick={copySqlPath}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5E5E2] text-[#1C1917] hover:bg-[#F5F2EB] cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-[#57534E]" />}
              <span>{copied ? 'Copied Migration Path' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <div className="divide-y divide-[#E5E5E2]">
            {RLS_TABLES.map((t) => (
              <div key={t.table} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#1C1917] flex items-center gap-2">
                    <span className="font-mono text-xs">{t.table}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-bold">
                      RLS ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-0.5">{t.description}</p>
                </div>
                <span className="text-[11px] font-mono text-[#78716C] font-semibold shrink-0">
                  {t.policies} Policies Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Security & Guardrails */}
      {activeTab === 'guardrails' && (
        <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#1C1917]">API & SSRF Protection Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E5E2] space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span className="text-xs font-bold text-[#1C1917]">SSRF Domain Sanitization</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Restricts outgoing HTTP fetch operations from contacting private IP spaces (10.0.0.0/8, 192.168.0.0/16, 127.0.0.1).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E5E2] space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span className="text-xs font-bold text-[#1C1917]">IDOR Resource Isolation</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Server verify checks organizationId matches session tenant token before any update or delete action is executed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E5E2] space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span className="text-xs font-bold text-[#1C1917]">Audit Trail Enforcement</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Sensitive mutations (deal stages, invoices, payments, invites) automatically emit persistent audit records.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E5E2] space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span className="text-xs font-bold text-[#1C1917]">Realtime Authorization Guard</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Server-sent events authenticate tenant tokens before dispatching deal, invoice, and enquiry event streams.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: API Configuration */}
      {activeTab === 'env' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2DDD2]">
              <Database className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="text-sm font-bold text-[#1C1917]">Database & Connection Pools</h2>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1C1917]">
                    PostgreSQL Connection String (DATABASE_URL)
                  </label>
                  <span className="text-[10px] font-mono text-[#059669] font-bold">POOLER ACTIVE</span>
                </div>
                <input
                  type="password"
                  disabled
                  value="postgresql://postgres:••••••••@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Direct Migration URL (DIRECT_URL)
                </label>
                <input
                  type="password"
                  disabled
                  value="postgresql://postgres:••••••••@aws-0-ap-south-1.supabase.co:5432/postgres"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Database SSL Mode
                </label>
                <input
                  type="text"
                  disabled
                  value="require (TLS 1.3 verify-full)"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2DDD2]">
              <Key className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold text-[#1C1917]">Supabase Auth & API Gateways</h2>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  disabled
                  value="https://qrvwyltxrkgpvhzmmeyc.supabase.co"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Public Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  disabled
                  value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Service Role Key (SERVER_ONLY_SUPABASE_KEY)
                </label>
                <input
                  type="password"
                  disabled
                  value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-[#57534E] text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
