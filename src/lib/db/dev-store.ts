/**
 * Development fallback persistent store.
 * Automatically activates if PostgreSQL (DATABASE_URL) is offline / unreachable.
 * Ensures zero disruption to development and full CRUD functionality.
 */

export interface DevEnquiry {
  id: string;
  title: string;
  source: string;
  contactName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  message: string | null;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo?: { id: string; name: string } | null;
  convertedLead?: { id: string; companyName: string } | null;
}

export interface DevTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  category: string;
  assignedTo?: { id: string; name: string } | null;
  company?: { id: string; primaryName: string } | null;
  lead?: { id: string; companyName: string } | null;
  createdAt: string;
}

export interface DevContact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  confidence: number;
  company?: { id: string; primaryName: string; city: string | null } | null;
  createdAt: string;
}

export interface DevLead {
  id: string;
  companyName: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  source: string;
  normalizedDomain: string | null;
  isDuplicate: boolean;
  status: string;
  createdAt: string;
  assignedTo?: { id: string; name: string } | null;
}

export interface DevDeal {
  id: string;
  title: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  expectedClose: string | null;
  companyName: string;
  contactName?: string | null;
  ownerName?: string | null;
  createdAt: string;
}

export interface DevProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  health: string;
  budget: number;
  companyName: string;
  managerName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  deliverablesCount: number;
  createdAt: string;
}

export interface DevInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  tax: number;
  total: number;
  paidAmount: number;
  companyName: string;
  dueDate: string | null;
  createdAt: string;
}

export interface DevMeeting {
  id: string;
  title: string;
  meetingType: string;
  startTime: string;
  endTime: string;
  agenda: string | null;
  companyName?: string | null;
  organizerName?: string | null;
}

class DevStore {
  private static instance: DevStore;

  public enquiries: DevEnquiry[] = [
    {
      id: 'enq-1',
      title: 'Enterprise ERP Migration & AI Ingestion',
      source: 'Website Inbound',
      contactName: 'Vikramaditya Singhania',
      email: 'vikram@singhaniagroup.com',
      phone: '+91 98200 11223',
      companyName: 'Singhania Logistics & Supply',
      message: 'Looking to overhaul legacy SAP ERP with AI-powered automated dispatching and custom CRM dashboard.',
      status: 'NEW',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'enq-2',
      title: 'Full Stack Web App & Client Portal Redesign',
      source: 'Google Ads',
      contactName: 'Neha Bansal',
      email: 'neha@bansalretail.in',
      phone: '+91 98450 33445',
      companyName: 'Bansal Retail & Distribution',
      message: 'Need a fast Next.js web application for 40,000 retail suppliers with real-time stock sync.',
      status: 'QUALIFIED',
      priority: 'URGENT',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];

  public tasks: DevTask[] = [
    {
      id: 'tsk-1',
      title: 'Follow up with Vikramaditya on ERP technical architecture requirements',
      description: 'Prepare custom solution architecture deck and proposed 8-week deliverable timeline.',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      priority: 'URGENT',
      status: 'PENDING',
      category: 'FOLLOW_UP',
      assignedTo: { id: 'usr-1', name: 'Pavan Kumar' },
      company: { id: 'comp-1', primaryName: 'Singhania Logistics' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tsk-2',
      title: 'Schedule discovery demo with Bansal Retail procurement team',
      description: 'Demo our live Next.js supplier portal performance and real-time SSE sync.',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      priority: 'HIGH',
      status: 'PENDING',
      category: 'MEETING',
      assignedTo: { id: 'usr-2', name: 'Sarah Jenkins' },
      company: { id: 'comp-2', primaryName: 'Bansal Retail' },
      createdAt: new Date().toISOString(),
    },
  ];

  public contacts: DevContact[] = [
    {
      id: 'cnt-1',
      name: 'Rohan Deshmukh',
      role: 'Chief Technology Officer',
      email: 'rohan.d@nextechsolutions.in',
      phone: '+91 80 4123 4568',
      isPrimary: true,
      confidence: 0.96,
      company: { id: 'comp-1', primaryName: 'NexTech Solutions Pvt Ltd', city: 'Bengaluru' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cnt-2',
      name: 'Pooja Mehta',
      role: 'Principal Architect & Owner',
      email: 'pooja@aurastudio.co.in',
      phone: '+91 22 6789 0123',
      isPrimary: true,
      confidence: 0.91,
      company: { id: 'comp-2', primaryName: 'Aura Studio Architects', city: 'Mumbai' },
      createdAt: new Date().toISOString(),
    },
  ];

  public companies: Array<{
    id: string;
    primaryName: string;
    primaryWebsite: string | null;
    city: string | null;
    industry: string | null;
    currentStatus: string;
    updatedAt: string;
  }> = [
    {
      id: 'comp-1',
      primaryName: 'NexTech Solutions Pvt Ltd',
      primaryWebsite: 'nextechsolutions.in',
      city: 'Bengaluru',
      industry: 'Enterprise SaaS',
      currentStatus: 'OUTREACH_READY',
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'comp-2',
      primaryName: 'Aura Studio Architecture',
      primaryWebsite: 'aurastudio.co.in',
      city: 'Mumbai',
      industry: 'Luxury Residential Interiors',
      currentStatus: 'QUALIFIED',
      updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'comp-3',
      primaryName: 'Apex Health Diagnostics',
      primaryWebsite: 'apexhealthdiag.com',
      city: 'Delhi NCR',
      industry: 'Diagnostic Labs & Pathology',
      currentStatus: 'VALIDATED',
      updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    {
      id: 'comp-4',
      primaryName: 'Veloce Logistics Fleet',
      primaryWebsite: 'velocelogistics.in',
      city: 'Chennai',
      industry: '3PL & Freight Logistics',
      currentStatus: 'WON',
      updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
  ];

  public leads: DevLead[] = [
    {
      id: 'ld-1',
      companyName: 'NexTech Solutions Pvt Ltd',
      website: 'https://nextechsolutions.in',
      phone: '+91 80 4123 4567',
      email: 'contact@nextechsolutions.in',
      city: 'Bengaluru',
      state: 'Karnataka',
      industry: 'Enterprise SaaS',
      source: 'Google Places API',
      normalizedDomain: 'nextechsolutions.in',
      isDuplicate: false,
      status: 'OUTREACH_READY',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      assignedTo: { id: 'usr-1', name: 'Pavan Kumar' },
    },
    {
      id: 'ld-2',
      companyName: 'Aura Studio Architecture',
      website: 'https://aurastudio.co.in',
      phone: '+91 22 6789 0123',
      email: 'hello@aurastudio.co.in',
      city: 'Mumbai',
      state: 'Maharashtra',
      industry: 'Luxury Residential Interiors',
      source: 'Web Bot Crawler',
      normalizedDomain: 'aurastudio.co.in',
      isDuplicate: false,
      status: 'QUALIFIED',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      assignedTo: { id: 'usr-3', name: 'Karan Malhotra' },
    },
    {
      id: 'ld-3',
      companyName: 'Apex Health Diagnostics',
      website: 'https://apexhealthdiag.com',
      phone: '+91 11 4567 8901',
      email: 'operations@apexhealthdiag.com',
      city: 'Delhi NCR',
      state: 'Delhi',
      industry: 'Diagnostic Labs & Pathology',
      source: 'CSV Import',
      normalizedDomain: 'apexhealthdiag.com',
      isDuplicate: false,
      status: 'VALIDATED',
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      assignedTo: { id: 'usr-1', name: 'Pavan Kumar' },
    },
    {
      id: 'ld-4',
      companyName: 'Veloce Logistics Fleet',
      website: 'https://velocelogistics.in',
      phone: '+91 44 2811 0022',
      email: 'dispatch@velocelogistics.in',
      city: 'Chennai',
      state: 'Tamil Nadu',
      industry: '3PL & Freight Logistics',
      source: 'Website Inbound',
      normalizedDomain: 'velocelogistics.in',
      isDuplicate: false,
      status: 'WON',
      createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
      assignedTo: { id: 'usr-2', name: 'Sarah Jenkins' },
    },
    {
      id: 'ld-5',
      companyName: 'Zenith Legal Partners',
      website: 'https://zenithlegal.in',
      phone: '+91 40 6677 8899',
      email: 'contact@zenithlegal.in',
      city: 'Hyderabad',
      state: 'Telangana',
      industry: 'Corporate Law Firm',
      source: 'Google Places API',
      normalizedDomain: 'zenithlegal.in',
      isDuplicate: false,
      status: 'RESEARCHING',
      createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
      assignedTo: { id: 'usr-1', name: 'Pavan Kumar' },
    },
    {
      id: 'ld-6',
      companyName: 'Kaveri Renewable Energy',
      website: 'https://kaverisolar.in',
      phone: '+91 80 2345 6789',
      email: 'leads@kaverisolar.in',
      city: 'Bengaluru',
      state: 'Karnataka',
      industry: 'CleanTech & Solar EPC',
      source: 'Google Places API',
      normalizedDomain: 'kaverisolar.in',
      isDuplicate: false,
      status: 'DISCOVERED',
      createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      assignedTo: { id: 'usr-3', name: 'Karan Malhotra' },
    },
  ];

  public deals: DevDeal[] = [
    {
      id: 'dl-1',
      title: 'Singhania Logistics - Custom Enterprise Portal',
      amount: 450000,
      currency: 'INR',
      stage: 'PROPOSAL',
      probability: 70,
      expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      companyName: 'Singhania Logistics & Supply',
      contactName: 'Vikramaditya Singhania',
      ownerName: 'Pavan Kumar',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'dl-2',
      title: 'Bansal Retail - Next.js Supplier Hub',
      amount: 820000,
      currency: 'INR',
      stage: 'NEGOTIATION',
      probability: 85,
      expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      companyName: 'Bansal Retail & Distribution',
      contactName: 'Neha Bansal',
      ownerName: 'Sarah Jenkins',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'dl-3',
      title: 'Aura Studio - Luxury Portfolio & Lead Engine',
      amount: 280000,
      currency: 'INR',
      stage: 'QUALIFIED',
      probability: 40,
      expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
      companyName: 'Aura Studio Architecture',
      contactName: 'Pooja Mehta',
      ownerName: 'Karan Malhotra',
      createdAt: new Date().toISOString(),
    },
  ];

  public projects: DevProject[] = [
    {
      id: 'prj-1',
      name: 'Singhania ERP Custom Dispatch Module',
      description: 'Phase 1: Real-time driver allocation, routing microservices, and management dashboard.',
      status: 'IN_PROGRESS',
      health: 'ON_TRACK',
      budget: 450000,
      companyName: 'Singhania Logistics & Supply',
      managerName: 'Pavan Kumar',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
      deliverablesCount: 5,
      createdAt: new Date().toISOString(),
    },
  ];

  public invoices: DevInvoice[] = [
    {
      id: 'inv-1',
      invoiceNumber: 'BX-2026-0042',
      status: 'ISSUED',
      amount: 225000,
      tax: 40500,
      total: 265500,
      paidAmount: 100000,
      companyName: 'Singhania Logistics & Supply',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  public auditLogs: Array<{
    id: string;
    userId?: string;
    userName?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    timestamp: string;
  }> = [
    {
      id: 'aud-1',
      userId: 'usr-pavan',
      userName: 'Pavan Kumar',
      action: 'UPDATE_DEAL_STAGE',
      resource: 'Deal',
      resourceId: 'dl-singhania-erp',
      details: 'Stage changed: Proposal → Negotiation (₹4,50,000)',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'aud-2',
      userId: 'usr-sathvik',
      userName: 'Sathvik Reddy',
      action: 'RECORD_PAYMENT',
      resource: 'Invoice',
      resourceId: 'inv-1',
      details: 'Recorded payment of ₹1,00,000 via NEFT for BX-2026-0042',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
    {
      id: 'aud-3',
      userId: 'usr-pavan',
      userName: 'Pavan Kumar',
      action: 'CREATE_ENQUIRY',
      resource: 'Enquiry',
      resourceId: 'enq-1',
      details: 'Inbound enquiry received: Web Portal Architecture from NexTech Solutions',
      timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    },
    {
      id: 'aud-4',
      userId: 'usr-karan',
      userName: 'Karan Malhotra',
      action: 'COMPLETE_TASK',
      resource: 'Task',
      resourceId: 'tsk-2',
      details: 'Completed client contract milestone follow-up with Aura Studio',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ];

  public proposals: Array<{
    id: string;
    title: string;
    clientName: string;
    value: number;
    status: 'DRAFT' | 'INTERNAL_REVIEW' | 'SENT' | 'ACCEPTED' | 'REJECTED';
    validUntil: string;
    createdAt: string;
  }> = [
    {
      id: 'prp-1',
      title: 'ERP Modernization & Automated Dispatch Scope of Work',
      clientName: 'Singhania Logistics & Supply',
      value: 450000,
      status: 'SENT',
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'prp-2',
      title: 'Luxury Residential 3D Configurator Engine',
      clientName: 'Aura Studio Architecture',
      value: 280000,
      status: 'INTERNAL_REVIEW',
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'prp-3',
      title: 'Automated Diagnostic Patient Notification API',
      clientName: 'Apex Health Diagnostics',
      value: 175000,
      status: 'ACCEPTED',
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
  ];

  public meetings: DevMeeting[] = [
    {
      id: 'mtg-1',
      title: 'ERP Discovery Call & Technical Deep Dive',
      meetingType: 'VIDEO_CALL',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
      agenda: 'Review legacy API endpoints, auth model, and database migration schedule.',
      companyName: 'Singhania Logistics',
      organizerName: 'Pavan Kumar',
    },
  ];

  public static getInstance(): DevStore {
    if (!DevStore.instance) {
      DevStore.instance = new DevStore();
    }
    return DevStore.instance;
  }
}

export const devStore = DevStore.getInstance();
