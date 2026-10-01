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
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <MailCheck className="w-6 h-6 text-[#4F46E5]" />
            Human-in-the-Loop Outreach Approvals
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Mandatory SDR review gate: verify AI draft claims, personalization angle, and accuracy before dispatch.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 self-start">
          <Clock className="w-3.5 h-3.5" />
          <span>{items.length} Drafts Awaiting Sign-Off</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#E2DDD2] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1C1917]">Approval Queue Clear!</h3>
          <p className="text-xs text-[#57534E] max-w-sm mx-auto">
            All AI personalized messages have been reviewed or sent. New drafts will appear in real time as research completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((msg) => (
            <div
              key={msg.id}
              className="p-5 rounded-2xl bg-white border border-[#E2DDD2] hover:border-[#4F46E5] transition-all shadow-xs space-y-4"
            >
              {/* Top Row: Channel, Company, Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAE6DC] border border-[#DDD7C9] text-[#1C1917] font-semibold text-[11px]">
                      {getChannelIcon(msg.channel)}
                      {msg.channel}
                    </span>
                    <h3 className="text-base font-bold text-[#1C1917]">{msg.companyName}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {msg.capabilityName}
                    </span>
                  </div>

                  <div className="text-xs text-[#57534E] flex items-center gap-2">
                    <span>{msg.city}</span>
                    <span>•</span>
                    <span className="text-[#78716C]">{msg.industry}</span>
                    <span>•</span>
                    <span className="text-[#1C1917] flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
                      Target: <strong>{msg.targetContact}</strong> ({msg.targetRole})
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-[#15803D]">
                    {msg.opportunityScore}/100
                  </div>
                  <div className="text-[10px] font-semibold text-[#78716C] uppercase">Quality Score</div>
                </div>
              </div>

              {/* Verified Evidence Anchor */}
              <div className="p-3 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-xs text-[#3730A3] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <span>
                  <strong className="text-[#312E81]">Grounding Evidence: </strong>
                  {msg.evidenceAnchor}
                </span>
              </div>

              {/* Subject Line if present */}
              {msg.subject && (
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD2] text-xs text-[#1C1917]">
                  <span className="text-[#78716C] font-semibold mr-2">Subject:</span>
                  <span className="font-semibold">{msg.subject}</span>
                </div>
              )}

              {/* Message Body Box */}
              {editingId === msg.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full min-h-[160px] p-3 rounded-xl bg-white border border-[#4F46E5] text-xs text-[#1C1917] leading-relaxed focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(msg.id)}
                      className="text-xs px-3.5 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] text-xs text-[#1C1917] leading-relaxed font-sans whitespace-pre-line">
                  {msg.body}
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(msg)}
                    className="text-xs px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Approve & Dispatch
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(msg)}
                    className="text-xs px-3.5 py-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#1C1917] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Draft
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleReject(msg)}
                  className="text-xs px-3.5 py-2 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Draft
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
