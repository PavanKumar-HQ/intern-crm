'use client';

import React, { useState, useEffect } from 'react';
import {
  Contact,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Trash2,
  RefreshCw,
  X,
  User,
  ExternalLink,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface ContactItem {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  confidence: number;
  company?: { id: string; primaryName: string; city: string | null } | null;
}

export default function ContactsManager() {
  const { notifications } = useRealtime();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    companyName: '',
    isPrimary: false,
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contacts?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        setContacts(data.contacts);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [notifications]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          role: '',
          email: '',
          phone: '',
          companyName: '',
          isPrimary: false,
        });
        await fetchContacts();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getAvatarBadge = (name: string) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CT';
    const charCode = name.charCodeAt(0) || 0;
    const colors = [
      'bg-[#4F46E5] text-white',
      'bg-[#16A34A] text-white',
      'bg-[#7C3AED] text-white',
      'bg-[#D97706] text-white',
      'bg-[#E11D48] text-white',
      'bg-[#0284C7] text-white',
    ];
    const color = colors[charCode % colors.length];

    return (
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-xs font-bold shrink-0 shadow-xs`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <Contact className="w-6 h-6 text-[#4F46E5]" />
            Contacts Directory
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Verified executive profiles, stakeholder roles, direct email channels, and phone numbers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchContacts}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search and Count Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <span className="text-sm font-bold text-[#1C1917]">
          {contacts.length} Registered Contacts
        </span>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
            className="w-full sm:w-72 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className="flex-1 bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#F0EDE5] border-b border-[#E2DDD2] text-[#78716C]">
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Name</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Company</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Role</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Email</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Phone</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-center">Type</th>
                  <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DC]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#78716C]">
                      Loading contacts from database...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#78716C]">
                      <Contact className="w-8 h-8 text-[#78716C] mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-[#1C1917]">No contacts found</p>
                      <p className="text-xs text-[#78716C] mt-1">
                        Add a contact record to keep key stakeholder details readily accessible.
                      </p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => {
                    const isSelected = selectedContact?.id === contact.id;

                    return (
                      <tr
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EEF2FF]' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                          <div className="flex items-center gap-3">
                            {getAvatarBadge(contact.name)}
                            <span className="font-semibold text-sm">{contact.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#1C1917]">
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <Building2 className="w-4 h-4 text-[#78716C] shrink-0" />
                            <span>{contact.company?.primaryName || 'Independent'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#57534E] text-xs font-medium">
                          {contact.role || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-[#57534E] text-xs">
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#4F46E5] hover:underline font-medium"
                            >
                              {contact.email}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#57534E] text-xs font-mono">
                          {contact.phone || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {contact.isPrimary ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold text-xs">
                              Primary
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium text-xs">
                              Stakeholder
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDelete(contact.id)}
                            className="p-1.5 rounded-md hover:bg-[#FEE2E2] text-[#78716C] hover:text-[#B91C1C] transition-colors"
                            title="Delete contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right-side Detail Inspection Panel */}
        {selectedContact && (
          <div className="w-[320px] bg-white border border-[#E5E5E2] rounded-xl p-4 shadow-xs space-y-4 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Contact Profile
              </h3>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-sm font-bold text-[#171717]">
                {selectedContact.name}
              </div>
              <div className="text-xs text-[#5E5E5E] mt-0.5">
                {selectedContact.role || 'Executive'} · {selectedContact.company?.primaryName || 'Independent'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E2] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Mail className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717] truncate">{selectedContact.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Phone className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717]">{selectedContact.phone || 'No phone registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5E5E5E]">
                <Building2 className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                <span className="text-[#171717]">{selectedContact.company?.primaryName || 'No company account'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E5E2]">
              <a
                href={selectedContact.email ? `mailto:${selectedContact.email}` : '#'}
                className="w-full py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Mail className="w-3.5 h-3.5" />
                Initiate Direct Email
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Contact className="w-4 h-4 text-[#6366F1]" />
                Add Contact Record
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="VP Engineering / Co-Founder"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="NexTech Solutions"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@nextech.io"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 12345"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="rounded border-[#E5E5E2] text-[#6366F1] focus:ring-0"
                />
                <label htmlFor="isPrimary" className="text-xs text-[#171717]">
                  Primary decision maker for this account
                </label>
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
                  {isSubmitting ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
