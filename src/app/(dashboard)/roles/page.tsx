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
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#6366F1]" />
            Roles & Granular Permissions (RBAC)
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Strict database and server-enforced authorization matrix mapping roles to authorized operations.
          </p>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E2] pb-3">
        {(['admin', 'manager', 'sdr', 'viewer'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSelectedRole(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              selectedRole === r
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-white border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E5E5E2] bg-[#FAFAF9] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#171717] capitalize">
              Role: {selectedRole}
            </h2>
            <p className="text-[11px] text-[#5E5E5E]">
              {selectedRole === 'admin'
                ? 'Full system governance, RLS bypass within tenant organization, user management, and security audit logs.'
                : selectedRole === 'manager'
                ? 'Team oversight, approvals, deal allocations, and export capabilities.'
                : selectedRole === 'sdr'
                ? 'Operational lead ingestion, pipeline updates, and contact updates.'
                : 'Read-only visibility for reporting and auditing.'}
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E5E5E2] text-[#6366F1] font-bold">
            RLS ENFORCED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                <th className="py-3 px-4 font-semibold">Resource / Module</th>
                {actions.map((act) => (
                  <th key={act} className="py-3 px-4 text-center font-semibold uppercase tracking-wider text-[10px]">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {resources.map((res) => {
                const allowedActions = ROLE_PERMISSIONS[selectedRole][res] || [];

                return (
                  <tr key={res} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#171717] capitalize">
                      {res.replace('_', ' ')}
                    </td>
                    {actions.map((act) => {
                      const isAllowed = allowedActions.includes(act as any);

                      return (
                        <td key={act} className="py-3 px-4 text-center">
                          {isAllowed ? (
                            <span className="w-5 h-5 mx-auto rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0] flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 mx-auto rounded-full bg-[#F7F7F5] text-[#D1D5DB] flex items-center justify-center">
                              <X className="w-3 h-3 stroke-[2]" />
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
