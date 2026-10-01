'use client';

import React, { useState } from 'react';
import {
  MailCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  Send,
  Briefcase,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface PendingMessage {
  id: string;
  companyName: string;
  city: string;
  industry: string;
  channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP' | 'CALL';
  targetContact: string;
  targetRole: string;
  targetEmail: string;
  opportunityScore: number;
  capabilityName: string;
  subject: string;
  body: string;
  evidenceAnchor: string;
}

const SAMPLE_PENDING: PendingMessage[] = [
  {
    id: 'out-1',
    companyName: 'NexTech Solutions Pvt Ltd',
    city: 'Bengaluru',
    industry: 'Enterprise SaaS',
    channel: 'EMAIL',
    targetContact: 'Vikramaditya Rao',
    targetRole: 'VP of Engineering',
    targetEmail: 'vikram@nextechsolutions.in',
    opportunityScore: 94,
    capabilityName: 'High-Performance Web Modernization',
    subject: 'Fixing mobile booking latency on nextechsolutions.in (+ benchmark comparison)',
    body: `Hi Vikramaditya,\n\nI was reviewing nextechsolutions.in earlier today and noticed your team recently expanded cloud capacity in South Asia.\n\nHowever, on mobile Safari, the solution calculator takes 3.8s to initialize, which typically causes a 28-35% drop-off before visitors reach your demo request form.\n\nWe recently re-architected a similar Next.js enterprise portal for a Bangalore SaaS team, bringing LCP down to 1.1s and lifting demo conversions by 42%.\n\nWould you be open to a 10-minute teardown where I walk you through the DOM profiler findings?\n\nBest regards,\nPavan Kumar\nBrandex Intelligence Team`,
    evidenceAnchor: 'LCP 3.8s on Mobile Safari; missing viewport optimization tag.',
  },
  {
    id: 'out-2',
    companyName: 'Aura Studio Architecture',
    city: 'Mumbai',
    industry: 'High-End Interiors',
    channel: 'WHATSAPP',
    targetContact: 'Pooja Singhania',
    targetRole: 'Principal Architect',
    targetEmail: 'pooja@aurastudio.co.in',
    opportunityScore: 91,
    capabilityName: 'Visual Portfolio Performance & Conversion',
    subject: 'WhatsApp Consultation Pipeline for Aura Studio',
    body: `Hello Pooja,\n\nLoved Aura Studio’s recent Worli penthouse project featured on Architectural Digest India.\n\nWe ran a brief performance inspection on aurastudio.co.in and noticed that 4.8MB uncompressed project photos are creating a 5.2s load delay for mobile visitors.\n\nAdding instant WebP compression and a direct WhatsApp 1-tap consultation link typically doubles high-net-worth inquiries without touching your design aesthetics.\n\nCan I send over a 2-minute video demo of how this would look on your site?\n\nWarmly,\nBrandex Studio`,
    evidenceAnchor: '4.8MB uncompressed image assets; zero WhatsApp consultation CTA.',
  },
  {
    id: 'out-3',
    companyName: 'CarePlus Multi-Speciality Clinics',
    city: 'Delhi NCR',
    industry: 'Healthcare Diagnostics',
    channel: 'LINKEDIN',
    targetContact: 'Dr. Sameer Kapoor',
    targetRole: 'Medical Director',
    targetEmail: 'sameer.k@careplusclinics.com',
    opportunityScore: 86,
    capabilityName: 'Patient Self-Serve Portal & Automation',
    subject: 'Automating online patient report delivery for CarePlus',
    body: `Hi Dr. Sameer,\n\nNoticed CarePlus has garnered over 200+ 5-star Google reviews across your South Delhi branches this quarter.\n\nSeveral recent patient reviews mentioned having to call reception to receive their lab test PDFs. We build HIPAA/NABH-compliant patient report delivery bots that automatically notify patients via WhatsApp/SMS the moment test results are signed off.\n\nWould it be worthwhile to connect for 5 minutes this Thursday?\n\nRegards,\nPavan`,
    evidenceAnchor: 'Direct PDF download lacks auth; reception manual dispatch bottleneck.',
  },
];

export default function ApprovalsQueueManager() {
  const { triggerNotification } = useRealtime();
  const [items, setItems] = useState<PendingMessage[]>(SAMPLE_PENDING);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'LINKEDIN':
        return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Phone className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const handleApprove = async (msg: PendingMessage) => {
    setItems((prev) => prev.filter((i) => i.id !== msg.id));
    await triggerNotification({
      title: 'Outreach Approved & Dispatched',
      message: `Approved ${msg.channel} pitch to ${msg.targetContact} (${msg.companyName}). Transmission queued via provider.`,
      type: 'outreach_queued',
      priority: 'high',
    });
  };

  const handleReject = async (msg: PendingMessage) => {
    setItems((prev) => prev.filter((i) => i.id !== msg.id));
    await triggerNotification({
      title: 'Outreach Rejected by SDR',
      message: `Draft for ${msg.companyName} rejected. AI reasoning flagged for retraining.`,
      type: 'system',
      priority: 'normal',
    });
  };

  const startEdit = (msg: PendingMessage) => {
    setEditingId(msg.id);
    setEditedText(msg.body);
  };

  const saveEdit = (msgId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === msgId ? { ...i, body: editedText } : i))
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-amber-400" />
            Human-in-the-Loop Outreach Approvals
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Mandatory SDR review gate: verify AI draft claims, personalization angle, and accuracy before dispatch.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5 self-start">
          <Clock className="w-3.5 h-3.5" />
          <span>{items.length} Drafts Awaiting Sign-Off</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121215] border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Approval Queue Clear!</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            All AI personalized messages have been reviewed or sent. New drafts will appear in real time as research completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((msg) => (
            <div
              key={msg.id}
              className="p-5 rounded-2xl bg-[#121215] border border-white/10 hover:border-white/20 transition-all shadow-xl space-y-4"
            >
              {/* Top Row: Channel, Company, Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#18181c] border border-white/10 text-white font-semibold text-[11px]">
                      {getChannelIcon(msg.channel)}
                      {msg.channel}
                    </span>
                    <h3 className="text-base font-bold text-white">{msg.companyName}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {msg.capabilityName}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span>{msg.city}</span>
                    <span>•</span>
                    <span className="text-zinc-500">{msg.industry}</span>
                    <span>•</span>
                    <span className="text-zinc-300 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-blue-400" />
                      Target: <strong>{msg.targetContact}</strong> ({msg.targetRole})
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold text-emerald-400">
                    {msg.opportunityScore}/100
                  </div>
                  <div className="text-[10px] text-zinc-500">Quality Score</div>
                </div>
              </div>

              {/* Verified Evidence Anchor */}
              <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/15 text-[11px] text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  <strong className="text-blue-300">Grounding Evidence: </strong>
                  {msg.evidenceAnchor}
                </span>
              </div>

              {/* Subject Line if present */}
              {msg.subject && (
                <div className="p-2.5 rounded-lg bg-[#18181c] border border-white/5 text-xs text-white">
                  <span className="text-zinc-500 font-semibold mr-2">Subject:</span>
                  <span className="font-medium">{msg.subject}</span>
                </div>
              )}

              {/* Message Body Box */}
              {editingId === msg.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full min-h-[160px] p-3 rounded-xl bg-[#18181c] border border-blue-500 text-xs text-white leading-relaxed focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(msg.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#18181c] border border-white/5 text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                  {msg.body}
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(msg)}
                    className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Approve & Dispatch
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(msg)}
                    className="text-xs px-3 py-2 rounded-lg bg-[#202026] hover:bg-[#282830] border border-white/10 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Draft
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleReject(msg)}
                  className="text-xs px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
