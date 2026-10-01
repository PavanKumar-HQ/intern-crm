'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Receipt,
  Download,
  Plus,
  X,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface PaymentItem {
  id: string;
  invoiceRef: string;
  companyName: string;
  invoiceTotal: number;
  amountCollected: number;
  status: 'SETTLED' | 'PARTIAL' | 'PENDING';
  paymentChannel: string;
  date: string;
  utrRef?: string;
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 'pay-1',
    invoiceRef: 'BX-2026-0042',
    companyName: 'Singhania Logistics & Supply',
    invoiceTotal: 265500,
    amountCollected: 100000,
    status: 'PARTIAL',
    paymentChannel: 'Bank Transfer (NEFT/RTGS)',
    date: 'Today, 09:20 AM',
    utrRef: 'HDFCN26098124912',
  },
  {
    id: 'pay-2',
    invoiceRef: 'BX-2026-0038',
    companyName: 'Bansal Retail & Distribution',
    invoiceTotal: 820000,
    amountCollected: 820000,
    status: 'SETTLED',
    paymentChannel: 'Corporate UPI Auto-Collect',
    date: '28 Sep 2026',
    utrRef: 'UPI202609287612',
  },
  {
    id: 'pay-3',
    invoiceRef: 'BX-2026-0035',
    companyName: 'Aura Studio Architecture',
    invoiceTotal: 140000,
    amountCollected: 140000,
    status: 'SETTLED',
    paymentChannel: 'NEFT / RTGS Corporate Direct',
    date: '25 Sep 2026',
    utrRef: 'ICIC26092500891',
  },
];

export default function PaymentsPage() {
  const { notifications, triggerNotification } = useRealtime();
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Payment Form State
  const [invoiceRef, setInvoiceRef] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [amount, setAmount] = useState('');
  const [channel, setChannel] = useState('Bank Transfer (NEFT/RTGS)');
  const [utrRef, setUtrRef] = useState('');

  const totalCollected = payments.reduce((acc, p) => acc + p.amountCollected, 0);
  const settledCount = payments.filter((p) => p.status === 'SETTLED').length;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceRef.trim() || !amount) return;

    const amountNum = parseFloat(amount) || 50000;
    const newPayment: PaymentItem = {
      id: `pay-${Date.now()}`,
      invoiceRef: invoiceRef.toUpperCase(),
      companyName: companyName || 'Brandex Client Partner',
      invoiceTotal: amountNum,
      amountCollected: amountNum,
      status: 'SETTLED',
      paymentChannel: channel,
      date: 'Just now',
      utrRef: utrRef || `UTR${Date.now().toString().slice(-8)}`,
    };

    setPayments((prev) => [newPayment, ...prev]);

    await triggerNotification({
      title: 'Payment Recorded',
      message: `Received ₹${amountNum.toLocaleString('en-IN')} for invoice ${newPayment.invoiceRef} via ${channel}.`,
      type: 'system',
      priority: 'high',
    });

    setIsModalOpen(false);
    setInvoiceRef('');
    setCompanyName('');
    setAmount('');
    setUtrRef('');
  };

  const filtered = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.invoiceRef.toLowerCase().includes(q) ||
      p.companyName.toLowerCase().includes(q) ||
      p.paymentChannel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#4F46E5]" />
            Payments & Collections Ledger
          </h1>
          <p className="text-xs text-[#57534E] mt-0.5">
            Audit history of all verified client payments, bank remittances, and settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 400);
            }}
            className="btn-secondary text-xs py-2 px-3 cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#57534E] ${loading ? 'animate-spin text-[#4F46E5]' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip — Responsive 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">
              Total Collections Verified
            </span>
            <div className="text-2xl font-extrabold text-[#059669] mt-1.5 font-mono">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#78716C] mt-0.5 block font-medium">Reconciled in bank ledger</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">
              Settled Invoices / Accounts
            </span>
            <div className="text-2xl font-extrabold text-[#1C1917] mt-1.5 font-mono">
              {settledCount} Accounts
            </div>
            <span className="text-[11px] text-[#78716C] mt-0.5 block font-medium">100% remittance verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">
              Primary Settlement Channel
            </span>
            <div className="text-sm font-bold text-[#1C1917] mt-1.5 truncate">
              NEFT / RTGS Corporate Direct
            </div>
            <span className="text-[11px] text-[#78716C] mt-0.5 block font-medium">Auto-cleared via pooler</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#78716C] flex items-center justify-center shrink-0 border border-[#E2DDD2]">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
        <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#4F46E5]" />
          <span>{filtered.length} Recorded Payment Remittances</span>
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice # or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Payments Table with Uniform Typography */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2DDD2] text-[#57534E]">
                <th className="py-3 px-4 font-bold">Invoice Ref</th>
                <th className="py-3 px-4 font-bold">Client Account</th>
                <th className="py-3 px-4 font-bold text-right">Invoice Total</th>
                <th className="py-3 px-4 font-bold text-right">Amount Collected</th>
                <th className="py-3 px-4 font-bold text-center">Settlement Status</th>
                <th className="py-3 px-4 font-bold">Payment Channel</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD2]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-[#1C1917]">
                    {item.invoiceRef}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                      <span>{item.companyName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-[#57534E]">
                    ₹{item.invoiceTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs font-bold text-[#059669]">
                    ₹{item.amountCollected.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.status === 'SETTLED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-semibold border border-[#A7F3D0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Fully Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] font-semibold border border-[#FDE68A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                        Partial Receipt
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#57534E]">
                    <div className="font-medium text-[#1C1917]">{item.paymentChannel}</div>
                    {item.utrRef && (
                      <div className="text-[10px] font-mono text-[#78716C] mt-0.5">Ref: {item.utrRef}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Receipt for ${item.invoiceRef} downloaded.`)}
                      className="btn-action text-xs py-1 px-2.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#4F46E5]" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
              <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#4F46E5]" />
                Record Verified Payment
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Invoice Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BX-2026-0045"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs font-mono focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  Client / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Singhania Logistics & Supply"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1917] block mb-1">
                    Remittance Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Bank Transfer (NEFT/RTGS)">NEFT / RTGS</option>
                    <option value="Corporate UPI Auto-Collect">UPI Corporate</option>
                    <option value="Direct Wire Transfer">Wire Transfer</option>
                    <option value="Corporate Cheque Deposit">Cheque Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1917] block mb-1">
                  UTR / Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC260981928"
                  value={utrRef}
                  onChange={(e) => setUtrRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] text-xs font-mono focus:outline-none focus:border-[#4F46E5]"
                />
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
                  Save Remittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
