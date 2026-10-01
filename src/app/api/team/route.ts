import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'users');

    const users = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        phone: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
            assignedEnquiries: true,
          },
        },
      },
    }).catch(() => []);

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'users');

    const body = await request.json();
    const { name, email, role, phone, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        role: (role || 'SDR').toUpperCase(),
        phone,
        passwordHash: 'dev-hash-placeholder', // In production, an invite link is emailed
        organizationId: user.organizationId,
      },
    });

    await createAuditRecord({
      user,
      action: 'INVITE_TEAM_MEMBER',
      resource: 'User',
      resourceId: created.id,
      after: { email, role },
    });

    return NextResponse.json({ success: true, user: created });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'users');

    const body = await request.json();
    const { id, role, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    // Role changes require Admin privilege
    if (role && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Only administrators can modify user roles' }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role: role.toUpperCase() }),
        ...(active !== undefined && { active }),
      },
    });

    await createAuditRecord({
      user,
      action: 'UPDATE_USER_ROLE',
      resource: 'User',
      resourceId: id,
      after: { role, active },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}
