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
    <div className="flex items-center gap-2">
      <h1 className="text-sm font-semibold text-[#18181B] tracking-tight">
        {title}
      </h1>
    </div>
  );
}
