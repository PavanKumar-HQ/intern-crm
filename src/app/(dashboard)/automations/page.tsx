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
  X,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

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
    trigger: 'New Enquiry Created',
    action: 'Notify sales lead, create initial 24h follow-up task, assign owner',
    active: true,
    lastExecuted: '18 mins ago',
    executionCount: 142,
  },
  {
    id: 'auto-2',
    name: 'Deal Won Milestone & Project Scaffold',
    trigger: 'Deal Stage Transition → WON',
    action: 'Scaffold client project workspace, generate initial invoice draft',
    active: true,
    lastExecuted: '2 days ago',
    executionCount: 28,
  },
  {
    id: 'auto-3',
    name: 'Invoice Overdue Alert Escalation',
    trigger: 'Invoice Due Date Passed & Outstanding > 0',
    action: 'Mark status OVERDUE, dispatch urgent notification to account owner',
    active: true,
    lastExecuted: 'Today at 09:00',
    executionCount: 65,
  },
  {
    id: 'auto-4',
    name: 'Payment Receipt Ledger Reconciliation',
    trigger: 'Payment Manually Recorded',
    action: 'Recalculate invoice balance, create audit log, broadcast realtime update',
    active: true,
    lastExecuted: '42 mins ago',
    executionCount: 89,
  },
];

export default function AutomationsPage() {
  const { triggerNotification } = useRealtime();
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_RULES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('New Inbound Enquiry Created');
  const [actionEvent, setActionEvent] = useState('Notify Sales Lead & Assign Owner');

  const toggleRule = async (id: string) => {
    const target = rules.find((r) => r.id === id);
    const nextState = !target?.active;
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: nextState } : r))
    );

    if (target) {
      await triggerNotification({
        title: `Automation Rule ${nextState ? 'Activated' : 'Paused'}`,
        message: `Rule "${target.name}" is now ${nextState ? 'active in runtime engine' : 'suspended'}.`,
        type: 'system',
        priority: 'normal',
      });
    }
  };

  const handleTestRule = async (rule: AutomationRule) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id
          ? { ...r, executionCount: r.executionCount + 1, lastExecuted: 'Just now' }
          : r
      )
    );

    await triggerNotification({
      title: `Automation Test Fired: ${rule.name}`,
      message: `Simulated trigger successfully executed action: "${rule.action}"`,
      type: 'system',
      priority: 'high',
    });
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const newRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: ruleName,
      trigger: triggerEvent,
      action: actionEvent,
      active: true,
      lastExecuted: 'Never',
      executionCount: 0,
    };

    setRules((prev) => [newRule, ...prev]);

    await triggerNotification({
      title: 'New Automation Rule Deployed',
      message: `Rule "${ruleName}" is live and listening for event: ${triggerEvent}`,
      type: 'system',
      priority: 'high',
    });

    setIsModalOpen(false);
    setRuleName('');
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Delete this automation rule?')) {
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DDD2]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[#4F46E5]" />
            Workflow Automations & Event Triggers
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Event-driven triggers executing automated lead triage, pipeline progressions, and overdue task alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs py-2 px-4 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3.5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-xl bg-white border transition-all shadow-xs flex flex-col justify-between gap-4 ${
              rule.active
                ? 'border-[#E2DDD2] hover:border-[#4F46E5]'
                : 'border-[#E2DDD2] opacity-70 bg-[#FAF8F5]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-bold text-[#1C1917]">{rule.name}</span>
                <span
                  className={rule.active ? 'badge-emerald' : 'badge-amber'}
                >
                  {rule.active ? 'Active Engine' : 'Paused'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTestRule(rule)}
                  className="btn-action text-xs"
                  title="Test Trigger"
                >
                  <Play className="w-3 h-3 text-[#4F46E5]" />
                  <span>Test Run</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className="cursor-pointer"
                  title={rule.active ? 'Pause Rule' : 'Activate Rule'}
                >
                  {rule.active ? (
                    <ToggleRight className="w-8 h-8 text-[#4F46E5]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-[#A8A29E]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1 rounded hover:bg-[#FEF2F2] text-[#A8A29E] hover:text-[#DC2626] transition-colors"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trigger to Action Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#F5F2EB] text-xs">
              <div className="p-3 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] space-y-1">
                <span className="text-[10px] font-bold text-[#4338CA] uppercase tracking-wider block">
                  ⚡ Trigger Condition
                </span>
                <div className="font-semibold text-[#1C1917]">{rule.trigger}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] space-y-1">
                <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">
                  ⚙ Automated Execution
                </span>
                <div className="font-medium text-[#44403C]">{rule.action}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1">
              <span>Last executed: <strong className="text-[#1C1917]">{rule.lastExecuted}</strong></span>
              <span>Fired {rule.executionCount} times</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
              <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#4F46E5]" />
                Create New Automation Rule
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Inbound High-Value Alert"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Trigger Event
                </label>
                <select
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="New Inbound Enquiry Created">New Inbound Enquiry Created</option>
                  <option value="Deal Stage Transition → WON">Deal Stage Transition → WON</option>
                  <option value="Invoice Due Date Passed (Overdue)">Invoice Due Date Passed (Overdue)</option>
                  <option value="Payment Remittance Recorded">Payment Remittance Recorded</option>
                  <option value="Task Follow-up Due in 24 Hours">Task Follow-up Due in 24 Hours</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Target Automated Action
                </label>
                <select
                  value={actionEvent}
                  onChange={(e) => setActionEvent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="Notify sales lead, create follow-up task, assign owner">
                    Notify sales lead, create follow-up task, assign owner
                  </option>
                  <option value="Scaffold client project workspace, generate initial invoice draft">
                    Scaffold client project workspace, generate initial invoice draft
                  </option>
                  <option value="Mark status OVERDUE, dispatch urgent notification to account owner">
                    Mark status OVERDUE, dispatch urgent notification to account owner
                  </option>
                  <option value="Recalculate invoice balance, create audit log, broadcast realtime update">
                    Recalculate invoice balance, create audit log, broadcast realtime update
                  </option>
                  <option value="Send instant WhatsApp confirmation to client contact">
                    Send instant WhatsApp confirmation to client contact
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2DDD2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-1.5 cursor-pointer"
                >
                  Deploy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
