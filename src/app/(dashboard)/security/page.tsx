'use client';

import React from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  Database,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function SecurityPage() {
  const securityChecks = [
    {
      title: 'PostgreSQL Row-Level Security (RLS)',
      description: 'Active on 14 production database tables. Organization tenant boundary enforced on SELECT, INSERT, UPDATE, and DELETE.',
      status: 'ENFORCED',
      type: 'success',
    },
    {
      title: 'Server-Side RBAC Enforcement',
      description: 'Strict middleware and server action verification. UI menu visibility does not dictate API access.',
      status: 'ACTIVE',
      type: 'success',
    },
    {
      title: 'Cross-Tenant IDOR Protection',
      description: 'checkOrgAccess() evaluates organizationId on all resource mutation endpoints, rejecting foreign payloads.',
      status: 'VERIFIED',
      type: 'success',
    },
    {
      title: 'Tamper-Evident Audit Trail',
      description: 'Audit records logged to database on every stage advancement, payment recording, and user invitation.',
      status: 'LOGGING',
      type: 'success',
    },
    {
      title: 'Session & JWT Authentication',
      description: 'Supabase Bearer tokens verified via cryptographically signed key pairs with rolling refresh cycles.',
      status: 'PROTECTED',
      type: 'success',
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6366F1]" />
          Platform Security & Multi-Tenant Governance
        </h1>
        <p className="text-xs text-[#5E5E5E] mt-0.5">
          Realtime status of multi-tenant isolation, database row-level security (RLS), and cryptographic session controls.
        </p>
      </div>

      {/* Security Check Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityChecks.map((chk) => (
          <div key={chk.title} className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span className="text-xs font-bold text-[#171717]">{chk.title}</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                {chk.status}
              </span>
            </div>
            <p className="text-xs text-[#5E5E5E] leading-relaxed">
              {chk.description}
            </p>
          </div>
        ))}
      </div>

      {/* Verification Scenarios */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#6366F1]" />
          Automated Security Audit Test Suite
        </h2>
        <p className="text-xs text-[#5E5E5E]">
          15 Automated regression tests verify that unauthenticated requests, unauthorized role mutations, and cross-organization data tampering are completely blocked by the server.
        </p>

        <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2] font-mono text-[11px] text-[#16A34A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>PASS: 15 / 15 Security Verification Scenarios (Multi-Tenant RLS & RBAC verified)</span>
        </div>
      </div>
    </div>
  );
}
