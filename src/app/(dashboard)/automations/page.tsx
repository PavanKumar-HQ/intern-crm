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
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[#4F46E5]" />
            Workflow Automations & Event Triggers
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Event-driven triggers executing automated lead triage, pipeline progressions, and overdue task alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('New automation rule editor is connected and ready.')}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3.5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#4F46E5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-[#1C1917]">{rule.name}</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    rule.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-[#EAE6DC] text-[#44403C] border-[#DDD7C9]'
                  }`}
                >
                  {rule.active ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono text-[#57534E]">
                <span className="text-[#4F46E5] font-bold">{rule.trigger}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] hidden sm:inline" />
                <span className="text-[#1C1917] font-medium">{rule.action}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F5F2EB]">
              <div className="text-right text-xs text-[#78716C]">
                <div>Last run: <strong className="text-[#1C1917]">{rule.lastExecuted}</strong></div>
                <div>Fired {rule.executionCount} times</div>
              </div>

              <button
                type="button"
                onClick={() => toggleRule(rule.id)}
                className="text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
                title={rule.active ? 'Pause Rule' : 'Activate Rule'}
              >
                {rule.active ? (
                  <ToggleRight className="w-8 h-8 text-[#4F46E5]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[#A8A29E]" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
