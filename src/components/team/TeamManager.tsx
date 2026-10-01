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
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

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

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const totalLeads = users.reduce((acc, u) => acc + (u._count?.assignedLeads || 0), 0);
  const totalTasks = users.reduce((acc, u) => acc + (u._count?.assignedTasks || 0), 0);
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const activeCount = users.filter((u) => u.active).length;

  return (
    <div className="space-y-7 fade-in">
      {/* Header - No bottom border line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#4F46E5]" />
            Team Roster & Roles (RBAC)
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Internal Brandex operators, permission levels, workload distribution, and account status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTeam}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh Team"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Capacity & Security KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#78716C]">
            Active Operators
          </span>
          <div className="text-2xl font-black text-[#1C1917] mt-1">
            {activeCount} <span className="text-xs text-[#78716C] font-normal">/ {users.length} total</span>
          </div>
          <p className="text-xs text-[#57534E] mt-1">Verified Brandex seats</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#78716C]">
            Security Admins
          </span>
          <div className="text-2xl font-black text-[#4F46E5] mt-1">
            {adminCount}
          </div>
          <p className="text-xs text-[#57534E] mt-1">Full root access & RBAC controls</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#78716C]">
            Assigned Leads
          </span>
          <div className="text-2xl font-black text-[#047857] mt-1">
            {totalLeads}
          </div>
          <p className="text-xs text-[#57534E] mt-1">Active customer relationships</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#78716C]">
            Workload Tasks
          </span>
          <div className="text-2xl font-black text-[#D97706] mt-1">
            {totalTasks}
          </div>
          <p className="text-xs text-[#57534E] mt-1">In-progress team action items</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'ADMIN', 'MANAGER', 'SDR', 'VIEWER'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === role
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'bg-white border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFE7]'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search member by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-3.5 pr-3.5 py-1.5 text-xs rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2DDD2] text-[#57534E]">
                <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Team Member</th>
                <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Security Role (RBAC)</th>
                <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Account Status</th>
                <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-center">Assigned Leads</th>
                <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-center">Open Tasks</th>
                <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#78716C]">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C1917] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-[#4F46E5] shadow-2xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1C1917]">{u.name}</div>
                          <div className="text-[11px] text-[#78716C] font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="py-1 px-2.5 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs font-semibold focus:outline-none focus:border-[#4F46E5]"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="SDR">SDR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u.id, u.active)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-[#EAE6DC] text-[#44403C] border-[#DDD7C9]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                        {u.active ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#1C1917]">
                      {u._count?.assignedLeads || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#4F46E5]">
                      {u._count?.assignedTasks || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#78716C] font-mono text-xs">
                      {u.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
              <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4F46E5]" />
                Invite Team Member
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1C1917] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1C1917] block mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@brandex.in"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1C1917] block mb-1">
                    Role (RBAC)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="SDR">SDR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1C1917] block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 12345"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2DDD2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-xs text-[#57534E] hover:text-[#1C1917] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-xs cursor-pointer"
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
