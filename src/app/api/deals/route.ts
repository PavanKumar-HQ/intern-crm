import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore, DevDeal } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'deals');

    const searchParams = request.nextUrl.searchParams;
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');

    const where: any = {};
    if (stage && stage !== 'ALL') where.stage = stage;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { primaryName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    let deals: any[] = [];
    try {
      deals = await prisma.deal.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          company: { select: { id: true, primaryName: true, city: true } },
          contact: { select: { id: true, name: true, email: true, phone: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      });
    } catch {
      deals = devStore.deals.filter((d) => {
        if (stage && stage !== 'ALL' && d.stage !== stage) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            d.title.toLowerCase().includes(q) ||
            d.companyName.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }

    return NextResponse.json({ success: true, deals });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'deals');

    const body = await request.json();
    const { title, amount, currency, stage, probability, expectedClose, companyId, contactId, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!title || amount === undefined) {
      return NextResponse.json({ error: 'Title and amount are required' }, { status: 400 });
    }

    let deal: any = null;
    try {
      deal = await prisma.deal.create({
        data: {
          title,
          amount: parseFloat(amount),
          currency: currency || 'INR',
          stage: stage || 'NEW',
          probability: probability ? parseInt(probability, 10) : 20,
          expectedClose: expectedClose ? new Date(expectedClose) : null,
          companyId,
          contactId,
          ownerId: user.userId,
          organizationId: user.organizationId,
        },
        include: {
          company: true,
          contact: true,
          owner: { select: { name: true } },
        },
      });
    } catch {
      deal = {
        id: `dl-${Date.now()}`,
        title,
        amount: parseFloat(amount),
        currency: currency || 'INR',
        stage: stage || 'NEW',
        probability: probability ? parseInt(probability, 10) : 20,
        expectedClose: expectedClose || null,
        companyName: 'Singhania Logistics & Supply',
        ownerName: user.name,
        createdAt: new Date().toISOString(),
      };
      devStore.deals.unshift(deal);
    }

    await dispatchRealtimeEvent({
      type: 'lead',
      title: 'New Deal Ingested into Pipeline',
      message: `${deal.title} (₹${Number(deal.amount).toLocaleString('en-IN')}) added by ${user.name}.`,
      priority: 'high',
      link: '/prospects',
    });

    await createAuditRecord({
      user,
      action: 'CREATE_DEAL',
      resource: 'Deal',
      resourceId: deal.id,
      after: deal,
    });

    return NextResponse.json({ success: true, deal });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'deals');

    const body = await request.json();
    const { id, stage, amount, probability, expectedClose, winReason, lostReason } = body;

    if (!id) {
      return NextResponse.json({ error: 'Deal id is required' }, { status: 400 });
    }

    let updated: any = null;
    try {
      updated = await prisma.deal.update({
        where: { id },
        data: {
          ...(stage && { stage }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(probability !== undefined && { probability: parseInt(probability, 10) }),
          ...(expectedClose !== undefined && { expectedClose: expectedClose ? new Date(expectedClose) : null }),
          ...(winReason && { winReason }),
          ...(lostReason && { lostReason }),
        },
        include: { company: true, contact: true },
      });
    } catch {
      const target = devStore.deals.find((d) => d.id === id);
      if (target) {
        if (stage) target.stage = stage;
        if (amount !== undefined) target.amount = parseFloat(amount);
        if (probability !== undefined) target.probability = parseInt(probability, 10);
        updated = target;
      }
    }

    await dispatchRealtimeEvent({
      type: 'lead',
      title: `Deal Stage Transition: ${stage || 'Updated'}`,
      message: `${updated?.title || 'Deal'} moved to ${stage || 'new stage'}.`,
      priority: stage === 'WON' ? 'urgent' : 'normal',
      link: '/prospects',
    });

    await createAuditRecord({
      user,
      action: 'UPDATE_DEAL_STAGE',
      resource: 'Deal',
      resourceId: id,
      after: { stage, winReason, lostReason },
    });

    return NextResponse.json({ success: true, deal: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'delete', 'deals');

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Deal id is required' }, { status: 400 });
    }

    try {
      await prisma.deal.delete({ where: { id } });
    } catch {
      devStore.deals = devStore.deals.filter((d) => d.id !== id);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
