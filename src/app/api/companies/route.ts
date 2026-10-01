import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'leads');

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.currentStatus = status;
    if (search) {
      where.OR = [
        { primaryName: { contains: search, mode: 'insensitive' } },
        { canonicalDomain: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    let companies: any[] = [];
    try {
      companies = await prisma.company.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          contacts: { select: { id: true, name: true, role: true, email: true, phone: true } },
          deals: { select: { id: true, title: true, amount: true, stage: true } },
          projects: { select: { id: true, name: true, status: true, budget: true } },
          invoices: { select: { id: true, invoiceNumber: true, total: true, status: true } },
        },
        take: 100,
      });
    } catch {
      companies = devStore.companies.filter((c: any) => {
        if (status && status !== 'ALL' && c.currentStatus !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            c.primaryName?.toLowerCase().includes(q) ||
            c.canonicalDomain?.toLowerCase().includes(q) ||
            c.city?.toLowerCase().includes(q) ||
            c.industry?.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'leads');

    const body = await request.json();
    const { primaryName, domain, city, industry, phone, email, currentStatus, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!primaryName) {
      return NextResponse.json({ error: 'Company primary name is required' }, { status: 400 });
    }

    const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase() : null;

    let company: any = null;
    try {
      company = await prisma.company.create({
        data: {
          primaryName,
          canonicalDomain: cleanDomain,
          city: city || null,
          industry: industry || null,
          primaryPhone: phone || null,
          primaryEmail: email || null,
          currentStatus: currentStatus || 'DISCOVERED',
        },
        include: {
          contacts: true,
          deals: true,
          projects: true,
        },
      });
    } catch {
      company = {
        id: `comp-${Date.now()}`,
        primaryName,
        canonicalDomain: cleanDomain,
        city: city || 'Bengaluru',
        industry: industry || 'Technology & Services',
        primaryPhone: phone || null,
        primaryEmail: email || null,
        currentStatus: currentStatus || 'DISCOVERED',
        contacts: [],
        deals: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      devStore.companies.unshift(company);
    }

    await dispatchRealtimeEvent({
      type: 'lead',
      title: 'Company Account Enrolled',
      message: `${primaryName} added to Brandex CRM directory.`,
      priority: 'normal',
      link: '/companies',
    });

    await createAuditRecord({
      user,
      action: 'CREATE_COMPANY',
      resource: 'Company',
      resourceId: company.id,
      after: company,
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    return handleAuthError(error);
  }
}
