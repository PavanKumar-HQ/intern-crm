'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  UserRoundPlus,
  Handshake,
  Contact,
  Building2,
  FolderKanban,
  ListTodo,
  CalendarDays,
  FileText,
  Receipt,
  CreditCard,
  BarChart3,
  Zap,
  Users,
  Settings,
  ChevronDown,
} from 'lucide-react';
import React from 'react';
import { BrandexLogo } from '@/components/brand/BrandexLogo';

const NAV_GROUPS = [
  {
    title: 'Main',
    items: [
      { href: '/overview',  label: 'Overview',  icon: LayoutDashboard },
      { href: '/enquiries', label: 'Inbox',     icon: Inbox },
      { href: '/leads',     label: 'Leads',     icon: UserRoundPlus },
      { href: '/deals',     label: 'Deals',     icon: Handshake },
      { href: '/contacts',  label: 'Contacts',  icon: Contact },
      { href: '/companies', label: 'Companies', icon: Building2 },
    ],
  },
  {
    title: 'Delivery',
    items: [
      { href: '/projects', label: 'Projects', icon: FolderKanban },
      { href: '/tasks',    label: 'Tasks',    icon: ListTodo },
      { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'Commercial',
    items: [
      { href: '/proposals', label: 'Proposals', icon: FileText },
      { href: '/billing',   label: 'Invoices',  icon: Receipt },
      { href: '/payments',  label: 'Payments',  icon: CreditCard },
    ],
  },
  {
    title: 'Insights',
    items: [
      { href: '/reports',     label: 'Reports',     icon: BarChart3 },
      { href: '/automations', label: 'Automations', icon: Zap },
    ],
  },
  {
    title: 'Admin',
    items: [
      { href: '/team',     label: 'Team',     icon: Users },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar select-none">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-[#E2DDD2] flex items-center justify-between shrink-0">
        <Link href="/overview" className="flex items-center gap-2">
          <BrandexLogo size="sm" showText={true} />
        </Link>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-[#78716C] bg-[#E8E4DA]">
          CRM
        </span>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 py-2 border-b border-[#E2DDD2] shrink-0">
        <div className="flex items-center justify-between text-xs text-[#1C1917] font-medium py-1.5 px-2 rounded-md hover:bg-[#E8E4DA] cursor-pointer transition-colors">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate font-semibold">Brandex Global HQ</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
        </div>
      </div>

      {/* Navigation Groups — Independently Scrollable */}
      <nav className="sidebar-nav space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider px-2 mb-1">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/overview' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-[#E5E0F8] text-[#4F46E5] font-semibold'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#E8E4DA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#4F46E5]' : 'text-[#78716C]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Subtle Sidebar Footer */}
      <div className="px-3.5 py-3 border-t border-[#E2DDD2] flex items-center justify-between text-[11px] text-[#78716C] shrink-0 bg-[#EFECE4]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Connected</span>
        </span>
        <span className="font-mono text-[10px] text-[#A8A29E]">v2.4</span>
      </div>
    </aside>
  );
}
