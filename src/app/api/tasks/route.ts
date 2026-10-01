import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore, DevTask } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'leads');

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;

    let tasks: any[] = [];
    try {
      tasks = await prisma.task.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          lead: { select: { id: true, companyName: true } },
          company: { select: { id: true, primaryName: true } },
        },
        take: 100,
      });
    } catch {
      tasks = devStore.tasks.filter((t) => {
        if (status && status !== 'ALL' && t.status !== status) return false;
        if (priority && priority !== 'ALL' && t.priority !== priority) return false;
        return true;
      });
    }

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'leads');

    const body = await request.json();
    const { title, description, dueDate, priority, category, leadId, companyId, assignedToId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    let task: any = null;
    try {
      task = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority: priority || 'MEDIUM',
          category: category || 'FOLLOW_UP',
          status: 'PENDING',
          leadId,
          companyId,
          assignedToId,
          creatorId: user.userId,
          organizationId: user.organizationId,
        },
      });
    } catch {
      task = {
        id: `tsk-${Date.now()}`,
        title,
        description: description || null,
        dueDate: dueDate || null,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        category: category || 'FOLLOW_UP',
        assignedTo: { id: user.userId, name: user.name },
        createdAt: new Date().toISOString(),
      };
      devStore.tasks.unshift(task);
    }

    await dispatchRealtimeEvent({
      type: 'task',
      title: 'New Follow-Up Task Created',
      message: `Task "${title}" created (Priority: ${priority || 'MEDIUM'}).`,
      priority: priority === 'HIGH' || priority === 'URGENT' ? 'high' : 'normal',
      link: '/tasks',
    });

    await createAuditRecord({
      user,
      action: 'CREATE_TASK',
      resource: 'Task',
      resourceId: task.id,
      after: task,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'leads');

    const body = await request.json();
    const { id, status, assignedToId, title, description, dueDate, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    const isCompleted = status === 'COMPLETED';
    let updated: any = null;

    try {
      updated = await prisma.task.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(isCompleted && { completedAt: new Date() }),
          ...(!isCompleted && status && { completedAt: null }),
          ...(assignedToId !== undefined && { assignedToId }),
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(priority && { priority }),
        },
      });
    } catch {
      const target = devStore.tasks.find((t) => t.id === id);
      if (target) {
        if (status) target.status = status;
        if (title) target.title = title;
        if (priority) target.priority = priority;
        updated = target;
      }
    }

    if (isCompleted) {
      await dispatchRealtimeEvent({
        type: 'task',
        title: 'Task Marked Completed',
        message: `Task marked completed.`,
        priority: 'normal',
        link: '/tasks',
      });
    }

    return NextResponse.json({ success: true, task: updated });
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
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    try {
      await prisma.task.delete({ where: { id } });
    } catch {
      devStore.tasks = devStore.tasks.filter((t) => t.id !== id);
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
