'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  active: boolean;
  phone: string | null;
  createdAt: string;
  _count?: {
    assignedLeads: number;
    assignedTasks: number;
    assignedEnquiries: number;
  };
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Pavan Kumar',
    email: 'admin@brandex.in',
    role: 'ADMIN',
    active: true,
    phone: '+91 98200 12345',
    createdAt: '2026-09-01',
    _count: { assignedLeads: 24, assignedTasks: 8, assignedEnquiries: 5 },
  },
  {
    id: 'usr-2',
    name: 'Anita Desai',
    email: 'anita.d@brandex.in',
    role: 'MANAGER',
    active: true,
    phone: '+91 98200 67890',
    createdAt: '2026-09-10',
    _count: { assignedLeads: 38, assignedTasks: 12, assignedEnquiries: 8 },
  },
  {
    id: 'usr-3',
    name: 'Karan Malhotra',
    email: 'karan.m@brandex.in',
    role: 'SDR',
    active: true,
    phone: '+91 98200 11223',
    createdAt: '2026-09-15',
    _count: { assignedLeads: 52, assignedTasks: 19, assignedEnquiries: 14 },
  },
];

export default function TeamManager() {
  const [users, setUsers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SDR',
    phone: '',
  });

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setUsers(data.users);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (userId: string, current: boolean) => {
    const next = !current;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: next } : u))
    );

    try {
      await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, active: next }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'SDR', phone: '' });
        await fetchTeam();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6366F1]" />
            Team Roster & Roles (RBAC)
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Internal Brandex operators, permission levels, workload distribution, and account status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTeam}
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
            Invite Member
          </button>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                <th className="py-3 px-4 font-semibold">Team Member</th>
                <th className="py-3 px-4 font-semibold">Security Role (RBAC)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Assigned Leads</th>
                <th className="py-3 px-4 font-semibold text-center">Tasks</th>
                <th className="py-3 px-4 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAFAF9] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#171717] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FAFAF9] border border-[#E5E5E2] flex items-center justify-center font-bold text-xs text-[#6366F1]">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[11px] text-[#5E5E5E] font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-1 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs font-semibold focus:outline-none focus:border-[#6366F1]"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="SDR">SDR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id, u.active)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        u.active
                          ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                          : 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'}`} />
                      {u.active ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-[#171717]">
                    {u._count?.assignedLeads || 0}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-[#6366F1]">
                    {u._count?.assignedTasks || 0}
                  </td>
                  <td className="py-3 px-4 text-right text-[#5E5E5E] font-mono">
                    {u.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6366F1]" />
                Invite Team Member
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@brandex.in"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Role (RBAC)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="SDR">SDR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 12345"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
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
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
