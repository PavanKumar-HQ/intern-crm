'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Building2,
  Calendar,
  Download,
  Trash2,
  FileCheck,
} from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  companyName: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Brandex_Master_Services_Agreement_2026.pdf',
    type: 'Legal Contract',
    companyName: 'Singhania Logistics & Supply',
    size: '1.2 MB',
    uploadedBy: 'Pavan Kumar',
    uploadedAt: '2 days ago',
  },
  {
    id: 'doc-2',
    name: 'AuraStudio_3DConfigurator_Architecture_Spec_v1.pdf',
    type: 'Technical SOW',
    companyName: 'Aura Studio Architecture',
    size: '3.4 MB',
    uploadedBy: 'Pavan Kumar',
    uploadedAt: '4 days ago',
  },
  {
    id: 'doc-3',
    name: 'ApexHealth_Diagnostic_API_Security_Audit.pdf',
    type: 'Security Review',
    companyName: 'Apex Health Diagnostics',
    size: '890 KB',
    uploadedBy: 'Sathvik Reddy',
    uploadedAt: '1 week ago',
  },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>(INITIAL_DOCS);
  const [search, setSearch] = useState('');

  const filtered = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#6366F1]" />
            Client Documents & Deliverables
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Central repository for client agreements, statements of work, architecture specs, and invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Document upload modal connected to Supabase Storage')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors cursor-pointer self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex justify-between items-center">
        <span className="text-xs font-semibold text-[#171717]">
          {docs.length} Stored Documents
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5E5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] placeholder-[#5E5E5E] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                <th className="py-3 px-4 font-semibold">Document Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Associated Account</th>
                <th className="py-3 px-4 font-semibold">Size</th>
                <th className="py-3 px-4 font-semibold">Uploaded By</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#FAFAF9] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#171717]">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#6366F1] shrink-0" />
                      <span>{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#5E5E5E]">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E2]">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#171717]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                      <span>{doc.companyName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#5E5E5E] font-mono">
                    {doc.size}
                  </td>
                  <td className="py-3 px-4 text-[#5E5E5E]">
                    {doc.uploadedBy} · {doc.uploadedAt}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="p-1 rounded text-[#5E5E5E] hover:text-[#6366F1] transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
