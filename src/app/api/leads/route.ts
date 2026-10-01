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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const assignedToId = searchParams.get('assignedToId');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { normalizedDomain: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    let leads: any[] = [];
    try {
      leads = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        take: 100,
      });
    } catch {
      leads = devStore.leads.filter((l) => {
        if (status && status !== 'ALL' && l.status !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            l.companyName.toLowerCase().includes(q) ||
            (l.email && l.email.toLowerCase().includes(q)) ||
            (l.normalizedDomain && l.normalizedDomain.toLowerCase().includes(q))
          );
        }
        return true;
      });
    }

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'leads');

    const body = await request.json();
    const { companyName, website, phone, email, city, state, industry, source, assignedToId, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const domain = website ? website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase() : null;

    let lead: any = null;
    try {
      lead = await prisma.lead.create({
        data: {
          companyName,
          website,
          phone,
          email,
          city,
          state,
          industry,
          source: source || 'Manual Entry',
          normalizedDomain: domain,
          normalizedPhone: phone ? phone.replace(/\D/g, '') : null,
          normalizedEmail: email ? email.toLowerCase() : null,
          isDuplicate: false,
          assignedToId,
          status: 'DISCOVERED',
        },
      });
    } catch {
      lead = {
        id: `ld-${Date.now()}`,
        companyName,
        website,
        phone,
        email,
        city: city || 'India',
        state,
        industry: industry || 'Technology',
        source: source || 'Manual Ingestion',
        normalizedDomain: domain,
        isDuplicate: false,
        status: 'DISCOVERED',
        createdAt: new Date().toISOString(),
      };
      devStore.leads.unshift(lead);
    }

    await dispatchRealtimeEvent({
      type: 'lead',
      title: 'New Lead Added to Database',
      message: `${companyName} added and normalized.`,
      priority: 'normal',
      link: '/leads',
    });

    await createAuditRecord({
      user,
      action: 'CREATE_LEAD',
      resource: 'Lead',
      resourceId: lead.id,
      after: lead,
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'leads');

    const body = await request.json();
    const { id, status, assignedToId, opportunityScore, qualificationReason } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead id is required' }, { status: 400 });
    }

    let updated: any = null;
    try {
      updated = await prisma.lead.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(assignedToId !== undefined && { assignedToId }),
          ...(opportunityScore !== undefined && { opportunityScore }),
          ...(qualificationReason && { qualificationReason }),
        },
      });
    } catch {
      const target = devStore.leads.find((l) => l.id === id);
      if (target) {
        if (status) target.status = status;
        updated = target;
      }
    }

    await dispatchRealtimeEvent({
      type: 'lead',
      title: 'Lead Status Updated',
      message: `${updated?.companyName || 'Lead'} transitioned to: ${updated?.status || status}.`,
      priority: 'normal',
      link: '/leads',
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'delete', 'leads');

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Lead id is required' }, { status: 400 });
    }

    try {
      await prisma.lead.delete({ where: { id } });
    } catch {
      devStore.leads = devStore.leads.filter((l) => l.id !== id);
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
