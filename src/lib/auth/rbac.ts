/**
 * Enterprise Role-Based Access Control (RBAC) System
 * Integrates with Supabase Auth & JWT claims
 */

export type UserRole = 'admin' | 'manager' | 'sdr' | 'viewer';

export type Resource =
  | 'campaigns'
  | 'leads'
  | 'companies'
  | 'opportunities'
  | 'deals'
  | 'projects'
  | 'proposals'
  | 'invoices'
  | 'meetings'
  | 'research'
  | 'outreach'
  | 'approvals'
  | 'capabilities'
  | 'sources'
  | 'budget'
  | 'users'
  | 'audit_logs';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'approve' | 'export';

export interface PermissionRule {
  role: UserRole;
  allowed: Record<Resource, Action[]>;
}

export const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, Action[]>> = {
  admin: {
    campaigns: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    leads: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    companies: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    opportunities: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    deals: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    projects: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    proposals: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    invoices: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    meetings: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    research: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    outreach: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    approvals: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    capabilities: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    sources: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    budget: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    users: ['read', 'create', 'update', 'delete', 'approve', 'export'],
    audit_logs: ['read', 'export'],
  },
  manager: {
    campaigns: ['read', 'create', 'update', 'approve', 'export'],
    leads: ['read', 'create', 'update', 'approve', 'export'],
    companies: ['read', 'create', 'update', 'export'],
    opportunities: ['read', 'create', 'update', 'approve', 'export'],
    deals: ['read', 'create', 'update', 'approve', 'export'],
    projects: ['read', 'create', 'update', 'approve', 'export'],
    proposals: ['read', 'create', 'update', 'approve', 'export'],
    invoices: ['read', 'create', 'update', 'export'],
    meetings: ['read', 'create', 'update', 'delete', 'export'],
    research: ['read', 'create', 'update', 'export'],
    outreach: ['read', 'create', 'update', 'approve', 'export'],
    approvals: ['read', 'approve'],
    capabilities: ['read', 'update'],
    sources: ['read', 'create', 'update'],
    budget: ['read'],
    users: ['read'],
    audit_logs: ['read'],
  },
  sdr: {
    campaigns: ['read'],
    leads: ['read', 'create', 'update', 'export'],
    companies: ['read', 'update'],
    opportunities: ['read', 'update'],
    deals: ['read', 'create', 'update'],
    projects: ['read'],
    proposals: ['read', 'create'],
    invoices: [],
    meetings: ['read', 'create', 'update'],
    research: ['read', 'create'],
    outreach: ['read', 'create', 'update'],
    approvals: ['read'], // Can view drafts, but cannot finalize approve
    capabilities: ['read'],
    sources: ['read'],
    budget: ['read'],
    users: [],
    audit_logs: [],
  },
  viewer: {
    campaigns: ['read'],
    leads: ['read'],
    companies: ['read'],
    opportunities: ['read'],
    deals: ['read'],
    projects: ['read'],
    proposals: ['read'],
    invoices: [],
    meetings: ['read'],
    research: ['read'],
    outreach: ['read'],
    approvals: ['read'],
    capabilities: ['read'],
    sources: ['read'],
    budget: ['read'],
    users: [],
    audit_logs: [],
  },
};

/**
 * Checks if a given role is allowed to perform an action on a resource
 */
export function can(role: UserRole, action: Action, resource: Resource): boolean {
  const permissions = ROLE_PERMISSIONS[role]?.[resource];
  if (!permissions) return false;
  return permissions.includes(action);
}

/**
 * Returns security badge details for UI rendering
 */
export function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        description: 'Full system and RLS policy control',
      };
    case 'manager':
      return {
        label: 'Manager',
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        description: 'Campaign, budget & approval authority',
      };
    case 'sdr':
      return {
        label: 'SDR / Operator',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        description: 'Lead generation & outreach drafting',
      };
    default:
      return {
        label: 'Viewer',
        color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
        description: 'Read-only intelligence access',
      };
  }
}
