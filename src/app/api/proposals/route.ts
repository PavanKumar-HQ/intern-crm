import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'deals');

    let proposals: any[] = [];
    try {
      proposals = await (prisma as any).proposal.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          deal: { select: { id: true, title: true } },
        },
      });
    } catch {
      proposals = devStore.proposals;
    }

    return NextResponse.json({ success: true, proposals });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'deals');

    const body = await request.json();
    const { title, clientName, value, validUntil } = body;

    if (!title || !value) {
      return NextResponse.json({ error: 'Title and value are required' }, { status: 400 });
    }

    const proposal = {
      id: `prp-${Date.now()}`,
      title,
      clientName: clientName || 'Brandex Client',
      value: parseFloat(value),
      status: 'SENT' as const,
      validUntil: validUntil || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      createdAt: new Date().toISOString(),
    };

    devStore.proposals.unshift(proposal);

    await dispatchRealtimeEvent({
      type: 'system',
      title: 'Proposal Issued to Client',
      message: `Proposal "${title}" (₹${parseFloat(value).toLocaleString('en-IN')}) issued.`,
      priority: 'normal',
      link: '/proposals',
    });

    await createAuditRecord({
      user,
      action: 'ISSUE_PROPOSAL',
      resource: 'Proposal',
      resourceId: proposal.id,
      after: proposal,
    });

    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'deals');

    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Proposal id is required' }, { status: 400 });
    }

    const target = devStore.proposals.find((p) => p.id === id);
    if (target && status) {
      target.status = status;
    }

    await dispatchRealtimeEvent({
      type: 'system',
      title: 'Proposal Status Updated',
      message: `Proposal "${target?.title || id}" transitioned to ${status}.`,
      priority: 'normal',
      link: '/proposals',
    });

    return NextResponse.json({ success: true, proposal: target });
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
      return NextResponse.json({ error: 'Proposal id is required' }, { status: 400 });
    }

    devStore.proposals = devStore.proposals.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
