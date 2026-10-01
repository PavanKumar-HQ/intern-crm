'use client';

import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  lastExecuted: string;
  executionCount: number;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Auto-Triage & Assign New Inbound Enquiries',
    trigger: 'WHEN: New Enquiry Created',
    action: 'THEN: Notify sales lead, create initial 24h follow-up task, assign owner',
    active: true,
    lastExecuted: '18 mins ago',
    executionCount: 142,
  },
  {
    id: 'auto-2',
    name: 'Deal Won Milestone & Project Scaffold',
    trigger: 'WHEN: Deal Stage Transition → WON',
    action: 'THEN: Scaffold client project workspace, generate initial invoice draft',
    active: true,
    lastExecuted: '2 days ago',
    executionCount: 28,
  },
  {
    id: 'auto-3',
    name: 'Invoice Overdue Alert Escalation',
    trigger: 'WHEN: Invoice Due Date Passed & Outstanding > 0',
    action: 'THEN: Mark status OVERDUE, dispatch urgent notification to account owner',
    active: true,
    lastExecuted: 'Today at 09:00',
    executionCount: 65,
  },
  {
    id: 'auto-4',
    name: 'Payment Receipt Ledger Reconciliation',
    trigger: 'WHEN: Payment Manually Recorded',
    action: 'THEN: Recalculate invoice balance, create audit log, broadcast realtime update',
    active: true,
    lastExecuted: '42 mins ago',
    executionCount: 89,
  },
];

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_RULES);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6366F1]" />
            Workflow Automations & Event Triggers
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Event-driven triggers executing automated lead triage, pipeline progressions, and overdue task alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('New automation builder rule editor connected')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors cursor-pointer self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#171717]">{rule.name}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                    rule.active
                      ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                      : 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
                  }`}
                >
                  {rule.active ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono text-[#5E5E5E]">
                <span className="text-[#6366F1] font-semibold">{rule.trigger}</span>
                <ArrowRight className="w-3 h-3 text-[#5E5E5E] hidden sm:inline" />
                <span className="text-[#171717]">{rule.action}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5E5E2]">
              <div className="text-right text-[11px] text-[#5E5E5E]">
                <div>Last run: <strong className="text-[#171717]">{rule.lastExecuted}</strong></div>
                <div>Fired {rule.executionCount} times</div>
              </div>

              <button
                type="button"
                onClick={() => toggleRule(rule.id)}
                className="text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                title={rule.active ? 'Pause Rule' : 'Activate Rule'}
              >
                {rule.active ? (
                  <ToggleRight className="w-7 h-7 text-[#6366F1]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-[#5E5E5E]" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
