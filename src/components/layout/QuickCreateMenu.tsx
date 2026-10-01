'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Inbox,
  UserRoundPlus,
  Handshake,
  Contact,
  Building2,
  ListTodo,
  CalendarDays,
  FolderKanban,
  Receipt,
  ChevronDown,
} from 'lucide-react';

const CREATE_ITEMS = [
  { label: 'New Enquiry',  href: '/enquiries', icon: Inbox,        desc: 'Log inbound customer enquiry' },
  { label: 'New Lead',     href: '/leads',     icon: UserRoundPlus,desc: 'Add prospect to pipeline' },
  { label: 'New Deal',     href: '/deals',     icon: Handshake,    desc: 'Create sales opportunity' },
  { label: 'New Contact',  href: '/contacts',  icon: Contact,      desc: 'Add client stakeholder' },
  { label: 'New Company',  href: '/companies', icon: Building2,    desc: 'Register client company' },
  { label: 'New Task',     href: '/tasks',     icon: ListTodo,     desc: 'Schedule follow-up or action' },
  { label: 'New Meeting',  href: '/calendar',  icon: CalendarDays, desc: 'Schedule client discussion' },
  { label: 'New Project',  href: '/projects',  icon: FolderKanban, desc: 'Create delivery project' },
  { label: 'New Invoice',  href: '/billing',   icon: Receipt,      desc: 'Issue invoice with GST' },
];

export default function QuickCreateMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-sm transition-all"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>Create</span>
        <ChevronDown className="w-3 h-3 opacity-80" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#E5E5E2] rounded-lg shadow-lg z-50 py-1 divide-y divide-[#E5E5E2]/60 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-bold text-[#8C8C88] uppercase tracking-wider">
            Quick Actions
          </div>
          <div className="py-1">
            {CREATE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#F7F7F5] transition-colors group"
                >
                  <Icon className="w-3.5 h-3.5 text-[#5E5E5E] group-hover:text-[#4F46E5] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#171717] group-hover:text-[#4F46E5]">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#8C8C88] truncate">
                      {item.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
