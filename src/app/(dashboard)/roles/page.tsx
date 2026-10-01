'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Check,
  X,
  Lock,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { ROLE_PERMISSIONS, UserRole, Resource } from '@/lib/auth/rbac';

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const resources: Resource[] = [
    'leads',
    'deals',
    'companies',
    'projects',
    'proposals',
    'invoices',
    'meetings',
    'users',
    'audit_logs',
  ];

  const actions = ['read', 'create', 'update', 'delete', 'approve', 'export'] as const;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#4F46E5]" />
            Roles & Granular Permissions (RBAC)
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Strict database and server-enforced authorization matrix mapping roles to authorized operations.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-xs self-start">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          4 Production Roles Configured
        </span>
      </div>

      {/* Role Selector Tabs */}
      <div className="p-1.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] flex items-center gap-2 flex-wrap shadow-xs">
        {(['admin', 'manager', 'sdr', 'viewer'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSelectedRole(r)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedRole === r
                ? 'bg-[#1C1917] text-white shadow-xs'
                : 'bg-white hover:bg-[#EFECE4] text-[#57534E] border border-[#E2DDD2]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E2DDD2] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1C1917] capitalize">
              Role: {selectedRole}
            </h2>
            <p className="text-xs text-[#57534E] mt-0.5">
              {selectedRole === 'admin'
                ? 'Full system governance, RLS bypass within tenant organization, user management, and security audit logs.'
                : selectedRole === 'manager'
                ? 'Team oversight, approvals, deal allocations, and export capabilities.'
                : selectedRole === 'sdr'
                ? 'Operational lead ingestion, pipeline updates, and contact updates.'
                : 'Read-only visibility for reporting and auditing.'}
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[#4F46E5] font-bold">
            RLS ENFORCED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2DDD2] text-[#57534E]">
                <th className="py-3 px-4 font-semibold">Resource / Module</th>
                {actions.map((act) => (
                  <th key={act} className="py-3 px-4 text-center font-bold uppercase tracking-wider text-[10px]">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {resources.map((res) => {
                const allowedActions = ROLE_PERMISSIONS[selectedRole][res] || [];

                return (
                  <tr key={res} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1C1917] capitalize">
                      {res.replace('_', ' ')}
                    </td>
                    {actions.map((act) => {
                      const isAllowed = allowedActions.includes(act as any);

                      return (
                        <td key={act} className="py-3 px-4 text-center">
                          {isAllowed ? (
                            <span className="w-6 h-6 mx-auto rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200 flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-6 h-6 mx-auto rounded-full bg-[#FAF8F5] text-[#A8A29E] flex items-center justify-center">
                              <X className="w-3.5 h-3.5 stroke-[2]" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
