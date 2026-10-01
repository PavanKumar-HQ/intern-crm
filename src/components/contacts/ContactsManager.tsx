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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <Contact className="w-5 h-5 text-[#6366F1]" />
            Contacts Directory
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Verified executive profiles, stakeholder roles, direct email channels, and phone numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchContacts}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search and Count Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#171717]">
          {contacts.length} Registered Contacts
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5E5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] placeholder-[#5E5E5E] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className="flex-1 bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Company</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold text-center">Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E2]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#5E5E5E]">
                      Loading contacts from database...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#5E5E5E]">
                      <Contact className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
                      <p className="font-medium text-[#171717]">No contacts found</p>
                      <p className="text-[11px] text-[#5E5E5E] mt-0.5">
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
                          isSelected ? 'bg-[#F5F3FF]' : 'hover:bg-[#FAFAF9]'
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-[#171717]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#FAFAF9] border border-[#E5E5E2] flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                              {contact.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{contact.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#171717]">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                            <span>{contact.company?.primaryName || 'Independent'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#5E5E5E]">
                          {contact.role || '-'}
                        </td>
                        <td className="py-3 px-4 text-[#5E5E5E]">
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#6366F1] hover:underline"
                            >
                              {contact.email}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#5E5E5E]">
                          {contact.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {contact.isPrimary ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-medium">
                              Primary
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F7F5] text-[#5E5E5E] border border-[#E5E5E2]">
                              Stakeholder
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDelete(contact.id)}
                            className="p-1 rounded text-[#5E5E5E] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                            title="Delete contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
