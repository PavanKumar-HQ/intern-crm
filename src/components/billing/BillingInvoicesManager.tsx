'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  X,
  ArrowUpRight,
  Filter,
  Trash2,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface PaymentItem {
  id: string;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  createdAt: string;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  tax: number;
  total: number;
  paidAmount: number;
  companyName?: string;
  company?: { primaryName: string };
  dueDate: string | null;
  createdAt: string;
  payments?: PaymentItem[];
}

export default function BillingInvoicesManager() {
  const { notifications } = useRealtime();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // New Invoice Form
  const [amount, setAmount] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Recording Form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('NEFT_RTGS');
  const [referenceNo, setReferenceNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.invoices) setInvoices(data.invoices);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [notifications]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          dueDate,
          notes,
        }),
      });
      if (res.ok) {
        setIsInvoiceModalOpen(false);
        setAmount('');
        setDueDate('');
        setNotes('');
        fetchInvoices();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !payAmount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          paymentAmount: parseFloat(payAmount),
          paymentMethod: payMethod,
          referenceNo,
        }),
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        setSelectedInvoice(null);
        setPayAmount('');
        setReferenceNo('');
        fetchInvoices();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await fetch('/api/invoices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations directly from records
  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.total || 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalOutstanding = totalInvoiced - totalCollected;
  const totalOverdue = invoices
    .filter((i) => i.status === 'OVERDUE' || (i.dueDate && new Date(i.dueDate) < new Date() && i.paidAmount < i.total))
    .reduce((acc, i) => acc + (i.total - i.paidAmount), 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const numMatch = inv.invoiceNumber.toLowerCase().includes(q);
    const clientMatch = (inv.company?.primaryName || inv.companyName || '').toLowerCase().includes(q);
    return numMatch || clientMatch;
  });

  const getStatusBadge = (status: string, dueDate: string | null, total: number, paid: number) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date() && paid < total;
    if (paid >= total && total > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-medium border border-[#A7F3D0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          Paid
        </span>
      );
    }
    if (isOverdue || status === 'OVERDUE') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#991B1B] font-medium border border-[#FECACA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          Overdue
        </span>
      );
    }
    if (paid > 0 && paid < total) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] font-medium border border-[#FDE68A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          Partial
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#1E3A8A] font-medium border border-[#BFDBFE]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
        Issued
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#4F46E5]" />
            Invoices & Client Billing
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Operational billing ledger, GST tax items, real payments, and outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchInvoices}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Compact Financial Summary Strip (single line, low cognitive load) */}
      <div className="flex items-center gap-3.5 py-2.5 px-4 rounded-xl bg-white border border-[#E2DDD2] text-sm flex-wrap shadow-xs">
        <span className="text-[#1C1917] font-bold">
          ₹{(totalInvoiced / 100000).toFixed(2)}L invoiced
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#15803D] font-bold">
          ₹{(totalCollected / 100000).toFixed(2)}L collected
        </span>
        <span className="text-[#A8A29E]">·</span>
        <span className="text-[#B45309] font-bold">
          ₹{(totalOutstanding / 100000).toFixed(2)}L outstanding
        </span>
        {totalOverdue > 0 && (
          <>
            <span className="text-[#A8A29E]">·</span>
            <span className="text-[#B91C1C] font-bold">
              ₹{(totalOverdue / 100000).toFixed(2)}L overdue
            </span>
          </>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white hover:bg-[#EFECE4] text-[#57534E] border border-[#E2DDD2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Production Invoices Table */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                <th className="py-3 px-4 font-semibold">Invoice</th>
                <th className="py-3 px-4 font-semibold">Client</th>
                <th className="py-3 px-4 font-semibold">Issue Date</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Paid</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#5E5E5E]">
                    <Receipt className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-[#171717]">No invoices found</p>
                    <p className="text-[11px] text-[#5E5E5E] mt-0.5">
                      Create your first invoice to begin tracking billing and collections.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const clientName = inv.company?.primaryName || inv.companyName || 'Brandex Client';
                  const outstanding = Math.max(0, inv.total - inv.paidAmount);
                  const issueDateFormatted = inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-';
                  const dueDateFormatted = inv.dueDate
                    ? new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-';

                  return (
                    <tr key={inv.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#171717]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-[#171717]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                          <span>{clientName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#5E5E5E]">
                        {issueDateFormatted}
                      </td>
                      <td className="py-3 px-4 text-[#5E5E5E]">
                        {dueDateFormatted}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#171717]">
                        ₹{inv.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#16A34A]">
                        ₹{inv.paidAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#D97706]">
                        ₹{outstanding.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(inv.status, inv.dueDate, inv.total, inv.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {outstanding > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPayAmount(outstanding.toString());
                                setIsPaymentModalOpen(true);
                              }}
                              className="btn-action-primary text-xs py-1 px-2.5"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Record Pay</span>
                            </button>
                          ) : (
                            <span className="badge-emerald text-xs py-1 px-2.5 inline-flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              Settled
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 rounded-lg border border-[#E2DDD2] bg-white text-[#78716C] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#6366F1]" />
                Issue New Invoice
              </h2>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Subtotal Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="225000"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
                <p className="text-[10px] text-[#5E5E5E] mt-1">
                  18% GST (₹{amount ? (parseFloat(amount) * 0.18).toLocaleString('en-IN') : '0'}) is automatically calculated.
                  Total = ₹{amount ? (parseFloat(amount) * 1.18).toLocaleString('en-IN') : '0'}.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment due upon milestone acceptance. Brandex Bank Account details enclosed."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E2]">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-xs text-[#5E5E5E] hover:text-[#171717] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#16A34A]" />
                Record Payment — {selectedInvoice.invoiceNumber}
              </h2>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#F7F7F5] border border-[#E5E5E2] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Invoice Total:</span>
                <span className="font-bold text-[#171717]">₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Already Collected:</span>
                <span className="font-bold text-[#16A34A]">₹{selectedInvoice.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E5E2] pt-1">
                <span className="text-[#5E5E5E]">Current Outstanding:</span>
                <span className="font-bold text-[#D97706]">₹{(selectedInvoice.total - selectedInvoice.paidAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Payment Amount Received (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedInvoice.total - selectedInvoice.paidAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="NEFT_RTGS">Bank Transfer / NEFT / RTGS</option>
                  <option value="UPI">UPI Direct Payment</option>
                  <option value="CHEQUE">Cheque Clearance</option>
                  <option value="WIRE">International Wire (SWIFT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Transaction / UTR Reference No.
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC-99214488"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E2]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-xs text-[#5E5E5E] hover:text-[#171717] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
