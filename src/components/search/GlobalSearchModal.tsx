'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Inbox,
  Contact,
  Building2,
  CheckSquare,
  ArrowRight,
  X,
  Command,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  type: 'lead' | 'enquiry' | 'contact' | 'task';
  title: string;
  subtitle: string;
  status?: string;
  href: string;
}

export default function GlobalSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Execute federated search across endpoints
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const q = encodeURIComponent(query.trim());

      try {
        const [leadsRes, enquiriesRes, contactsRes, tasksRes] = await Promise.all([
          fetch(`/api/leads?search=${q}`).then((r) => r.json()).catch(() => ({ leads: [] })),
          fetch(`/api/enquiries?search=${q}`).then((r) => r.json()).catch(() => ({ enquiries: [] })),
          fetch(`/api/contacts?search=${q}`).then((r) => r.json()).catch(() => ({ contacts: [] })),
          fetch(`/api/tasks?search=${q}`).then((r) => r.json()).catch(() => ({ tasks: [] })),
        ]);

        const combined: SearchResultItem[] = [];

        if (Array.isArray(leadsRes.leads)) {
          leadsRes.leads.slice(0, 4).forEach((l: any) => {
            combined.push({
              id: l.id,
              type: 'lead',
              title: l.companyName,
              subtitle: l.normalizedDomain || l.email || 'Qualified Lead Record',
              status: l.status,
              href: `/leads`,
            });
          });
        }

        if (Array.isArray(enquiriesRes.enquiries)) {
          enquiriesRes.enquiries.slice(0, 4).forEach((e: any) => {
            combined.push({
              id: e.id,
              type: 'enquiry',
              title: e.title || e.contactName,
              subtitle: `${e.contactName} (${e.companyName || 'Inbound'})`,
              status: e.status,
              href: `/enquiries`,
            });
          });
        }

        if (Array.isArray(contactsRes.contacts)) {
          contactsRes.contacts.slice(0, 4).forEach((c: any) => {
            combined.push({
              id: c.id,
              type: 'contact',
              title: c.name,
              subtitle: `${c.role || 'Executive'} • ${c.company?.primaryName || 'Account'}`,
              href: `/contacts`,
            });
          });
        }

        if (Array.isArray(tasksRes.tasks)) {
          tasksRes.tasks.slice(0, 4).forEach((t: any) => {
            combined.push({
              id: t.id,
              type: 'task',
              title: t.title,
              subtitle: `Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'} • ${t.priority}`,
              status: t.status,
              href: `/tasks`,
            });
          });
        }

        setResults(combined);
        setSelectedIndex(0);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const getItemIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'lead':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'enquiry':
        return <Inbox className="w-4 h-4 text-emerald-400" />;
      case 'contact':
        return <Contact className="w-4 h-4 text-amber-400" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-purple-400" />;
      default:
        return <Building2 className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <>
      {/* Topbar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-[#F7F7F6] hover:bg-[#F2F2F0] text-xs text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer border border-[#EEEEEC]"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#A1A1AA]" />
          <span>Search...</span>
        </div>
        <kbd className="text-[10px] bg-white text-[#71717A] px-1.5 py-0.5 rounded border border-[#EEEEEC] font-mono flex items-center gap-0.5 shadow-2xs">
          ⌘K
        </kbd>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div
            className="w-full max-w-2xl bg-white border border-[#E5E5E2] rounded-xl shadow-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="p-3.5 border-b border-[#E5E5E2] flex items-center gap-3 bg-white">
              <Search className="w-4 h-4 text-[#4F46E5] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads, enquiries, contacts, tasks..."
                className="flex-1 bg-transparent text-[#171717] placeholder-[#8C8C88] text-xs focus:outline-none"
              />
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-[#8C8C88] hover:text-[#171717] hover:bg-[#F7F7F5]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5 bg-white">
              {query && results.length === 0 && !isLoading && (
                <div className="py-10 text-center text-xs text-[#8C8C88]">
                  No records matching &quot;{query}&quot; found in database.
                </div>
              )}

              {!query && (
                <div className="py-6 px-4 text-center">
                  <p className="text-xs text-[#8C8C88]">
                    Type a company name, domain, contact person, or task title to search.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-2.5 text-[11px] text-[#5E5E5E]">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#4F46E5]" /> Leads</span>
                    <span className="flex items-center gap-1"><Inbox className="w-3.5 h-3.5 text-emerald-600" /> Enquiries</span>
                    <span className="flex items-center gap-1"><Contact className="w-3.5 h-3.5 text-amber-600" /> Contacts</span>
                    <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-purple-600" /> Tasks</span>
                  </div>
                </div>
              )}

              {results.map((item, idx) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    idx === selectedIndex ? 'bg-[#F2F2EF] text-[#171717]' : 'hover:bg-[#F7F7F5] text-[#5E5E5E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded bg-[#F7F7F5] border border-[#E5E5E2] shrink-0">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#171717] truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.status && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F7F7F5] text-[#5E5E5E] border border-[#E5E5E2]">
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8C8C88] truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-[#8C8C88] shrink-0 ml-2" />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[#FAFAF9] border-t border-[#E5E5E2] flex items-center justify-between text-[11px] text-[#8C8C88] px-3.5">
              <span>ESC to close</span>
              <span>Search across authorized records</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
