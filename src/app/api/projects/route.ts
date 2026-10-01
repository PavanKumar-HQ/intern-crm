import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'projects');

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    let projects: any[] = [];
    try {
      projects = await prisma.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          company: { select: { id: true, primaryName: true } },
          manager: { select: { id: true, name: true, email: true } },
          deliverables: true,
        },
      });
    } catch {
      projects = devStore.projects.filter((p) => {
        if (status && status !== 'ALL' && p.status !== status) return false;
        return true;
      });
    }

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'projects');

    const body = await request.json();
    const { name, description, budget, startDate, endDate, companyId, dealId, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    let project: any = null;
    try {
      project = await prisma.project.create({
        data: {
          name,
          description,
          budget: budget ? parseFloat(budget) : 0,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          companyId,
          dealId,
          managerId: user.userId,
          organizationId: user.organizationId,
        },
        include: { company: true },
      });
    } catch {
      project = {
        id: `prj-${Date.now()}`,
        name,
        description,
        status: 'PLANNING',
        health: 'ON_TRACK',
        budget: budget ? parseFloat(budget) : 0,
        companyName: 'Client Account',
        deliverablesCount: 0,
        createdAt: new Date().toISOString(),
      };
      devStore.projects.unshift(project);
    }

    await dispatchRealtimeEvent({
      type: 'system',
      title: 'New Project Provisioned',
      message: `Project "${project.name}" created under Brandex Delivery Operations.`,
      priority: 'normal',
      link: '/projects',
    });

    await createAuditRecord({
      user,
      action: 'CREATE_PROJECT',
      resource: 'Project',
      resourceId: project.id,
      after: project,
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'projects');

    const body = await request.json();
    const { id, status, health, budget } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
    }

    let updated: any = null;
    try {
      updated = await prisma.project.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(health && { health }),
          ...(budget !== undefined && { budget: parseFloat(budget) }),
        },
      });
    } catch {
      const target = devStore.projects.find((p) => p.id === id);
      if (target) {
        if (status) target.status = status;
        if (health) target.health = health;
        updated = target;
      }
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}
