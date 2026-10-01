import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'leads');

    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const companyId = searchParams.get('companyId');

    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (companyId) where.companyId = companyId;

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, role: true } },
        lead: { select: { id: true, companyName: true } },
        company: { select: { id: true, primaryName: true } },
      },
      take: 50,
    }).catch(() => []);

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'leads');

    const body = await request.json();
    const { content, category, leadId, companyId, contactId, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        content,
        category: category || 'GENERAL',
        leadId,
        companyId,
        contactId,
        authorId: user.userId,
        organizationId: user.organizationId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    await dispatchRealtimeEvent({
      type: 'note',
      title: 'Activity Note Added',
      message: `${user.name} added a note: "${content.slice(0, 60)}..."`,
      priority: 'low',
    });

    await createAuditRecord({
      user,
      action: 'ADD_NOTE',
      resource: 'Note',
      resourceId: note.id,
      after: note,
    });

    return NextResponse.json({ success: true, note });
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
      return NextResponse.json({ error: 'Note id is required' }, { status: 400 });
    }

    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
