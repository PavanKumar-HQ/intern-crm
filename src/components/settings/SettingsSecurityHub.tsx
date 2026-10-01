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

  // Workspace form state
  const [orgName, setOrgName] = useState('Brandex Global HQ');
  const [orgDomain, setOrgDomain] = useState('brandex.in');
  const [currency] = useState('INR (₹)');
  const [gstRate] = useState('18% Standard');

  const copySqlPath = () => {
    navigator.clipboard.writeText('prisma/migrations/supabase_rls_rbac.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#4F46E5]" />
          System Settings & Platform Governance
        </h1>
        <p className="text-xs text-[#57534E] mt-0.5">
          Workspace organization profile, PostgreSQL Row-Level Security (RLS), and API guardrails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E5E5E2] pb-3">
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
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white border border-[#E5E5E2] text-[#57534E] hover:text-[#1C1917]'
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
        <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-[#1C1917]">Workspace Organization Settings</h2>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                Organization / Workspace Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Primary Domain
                </label>
                <input
                  type="text"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Operating Currency
                </label>
                <input
                  type="text"
                  disabled
                  value={currency}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                Default Tax Schedule
              </label>
              <input
                type="text"
                disabled
                value={gstRate}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] text-xs font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Workspace settings successfully saved')}
                className="px-4 py-2 rounded-lg btn-primary text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
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
        <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-[#1C1917]">External Integrations & Keys</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                PostgreSQL Connection String (DATABASE_URL)
              </label>
              <input
                type="password"
                disabled
                value="postgresql://postgres:••••••••@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                Supabase URL (NEXT_PUBLIC_SUPABASE_URL)
              </label>
              <input
                type="text"
                disabled
                value="https://qrvwyltxrkgpvhzmmeyc.supabase.co"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                disabled
                value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.••••••••"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E5E5E2] text-[#57534E] text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
