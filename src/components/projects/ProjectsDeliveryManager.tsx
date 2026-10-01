'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  IndianRupee,
  RefreshCw,
  X,
  Layers,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  health: string;
  budget: number;
  companyName?: string;
  company?: { primaryName: string };
  managerName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  deliverables?: any[];
  deliverablesCount?: number;
}

export default function ProjectsDeliveryManager() {
  const { notifications } = useRealtime();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [companyName, setCompanyName] = useState('');

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch {
      // Fallback in devStore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [notifications]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, budget, companyName }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setBudget('');
        setCompanyName('');
        fetchProjects();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'ON_TRACK':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-semibold">
            On Track
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] font-semibold">
            At Risk
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] font-semibold">
            Critical
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#6366F1]" />
            Client Projects & Delivery Operations
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Operational milestone tracking for bespoke software deliverables, web systems, and client retainers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProjects}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 && !isLoading && (
          <div className="col-span-full py-16 text-center text-xs text-[#5E5E5E] border border-dashed border-[#E5E5E2] rounded-xl bg-white">
            <FolderKanban className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
            <p className="font-medium text-[#171717]">No active client delivery projects</p>
            <p className="text-[11px] text-[#5E5E5E] mt-0.5">
              Create a new client project to track work scopes and milestone deliverables.
            </p>
          </div>
        )}

        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-4 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#6366F1] shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F7F7F5] text-[#171717] border border-[#E5E5E2]">
                  {proj.status.replace('_', ' ')}
                </span>
                {getHealthBadge(proj.health || 'ON_TRACK')}
              </div>

              <h3 className="text-sm font-bold text-[#171717] mt-3">{proj.name}</h3>
              <p className="text-xs text-[#5E5E5E] mt-1 line-clamp-2 leading-relaxed">
                {proj.description || 'Custom software solution delivered under Brandex Operations.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F2F2F0] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#5E5E5E]">
                <span className="flex items-center gap-1.5 truncate font-medium text-[#171717]">
                  <Building2 className="w-3.5 h-3.5 text-[#5E5E5E]" />
                  {proj.company?.primaryName || proj.companyName || 'Enterprise Account'}
                </span>
                <span className="font-mono font-bold text-[#171717]">
                  ₹{Number(proj.budget).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5E5E5E]">
                <span>Manager: <strong className="text-[#171717]">{proj.managerName || 'Brandex Team'}</strong></span>
                <span>{proj.deliverables?.length || proj.deliverablesCount || 0} Deliverables</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#6366F1]" />
                Create Client Project
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ERP Ingestion & Dispatch Microservice"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Client / Account Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Singhania Logistics"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Contract Budget (₹ INR)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="450000"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Description / Deliverables Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Architecture outline, milestones, and deliverable breakdown..."
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
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
