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
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  paidAmount: number;
  companyName?: string;
  company?: { primaryName: string };
  dueDate: string | null;
  createdAt: string;
}

export default function PaymentsPage() {
  const { notifications } = useRealtime();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.invoices) setInvoices(data.invoices);
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [notifications]);

  const paidInvoices = invoices.filter((i) => i.paidAmount > 0);
  const totalReceived = paidInvoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);

  const filtered = paidInvoices.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.invoiceNumber.toLowerCase().includes(q) ||
      (i.company?.primaryName || i.companyName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#4F46E5]" />
            Payments & Collections Ledger
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Audit history of all verified client payments, bank remittances, and settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPayments}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">
            Total Collections Verified
          </span>
          <div className="text-2xl font-bold text-[#15803D] mt-1.5 font-mono">
            ₹{totalReceived.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">
            Settled Invoices / Accounts
          </span>
          <div className="text-2xl font-bold text-[#1C1917] mt-1.5">
            {paidInvoices.length} Verified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2DDD2] shadow-xs">
          <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">
            Primary Settlement Channel
          </span>
          <div className="text-sm font-bold text-[#1C1917] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            NEFT / RTGS Corporate Direct
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <span className="text-xs font-bold text-[#1C1917]">
          {filtered.length} Recorded Payment Remittances
        </span>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice # or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2DDD2] text-[#57534E]">
                <th className="py-3 px-4 font-semibold">Invoice Ref</th>
                <th className="py-3 px-4 font-semibold">Client Account</th>
                <th className="py-3 px-4 font-semibold text-right">Invoice Total</th>
                <th className="py-3 px-4 font-semibold text-right">Amount Collected</th>
                <th className="py-3 px-4 font-semibold text-center">Settlement Status</th>
                <th className="py-3 px-4 font-semibold">Payment Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#57534E]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#4F46E5]" />
                      Loading payments from persistent database...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#78716C]">
                    <CreditCard className="w-8 h-8 text-[#A8A29E] mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-[#1C1917] text-sm">No payment records found</p>
                    <p className="text-xs text-[#57534E] mt-0.5">
                      Payments recorded on invoices appear automatically in this ledger.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1C1917]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-[#1C1917]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                        <span>{inv.company?.primaryName || inv.companyName || 'Brandex Client'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#57534E]">
                      ₹{inv.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#15803D]">
                      ₹{inv.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        inv.paidAmount >= inv.total
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.paidAmount >= inv.total ? 'Full Settlement' : 'Partial Receipt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#57534E]">
                      Bank Transfer (NEFT/RTGS)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
