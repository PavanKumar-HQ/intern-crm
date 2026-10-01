'use client';

import { usePathname } from 'next/navigation';

const ROUTE_TITLES: Record<string, string> = {
  '/overview': 'Overview',
  '/enquiries': 'Inbox',
  '/leads': 'Leads',
  '/deals': 'Deals',
  '/contacts': 'Contacts',
  '/companies': 'Companies',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/proposals': 'Proposals',
  '/billing': 'Invoices',
  '/payments': 'Payments',
  '/reports': 'Reports',
  '/automations': 'Automations',
  '/team': 'Team',
  '/settings': 'Settings',
  '/audit-log': 'Audit Log',
};

export default function TopBarTitle() {
  const pathname = usePathname();
  const title = ROUTE_TITLES[pathname] || 'Workspace';

  return (
    <div className="flex items-center gap-2 select-none">
      <span className="text-xs font-semibold text-[#78716C] tracking-tight hidden sm:inline">Brandex</span>
      <span className="text-xs text-[#A8A29E] hidden sm:inline">/</span>
      <h1 className="text-xs font-bold text-[#1C1917] tracking-tight bg-[#FAF8F5] border border-[#E2DDD2] px-2.5 py-1 rounded-md">
        {title}
      </h1>
    </div>
  );
}
