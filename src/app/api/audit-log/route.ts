import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, handleAuthError } from '@/lib/auth/server-auth';
import { devStore } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'audit_logs');

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const resource = searchParams.get('resource');

    let logs: any[] = [];
    try {
      const where: any = {};
      if (resource && resource !== 'ALL') where.resource = resource;
      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { resource: { contains: search, mode: 'insensitive' } },
        ];
      }

      logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    } catch {
      logs = devStore.auditLogs.filter((log) => {
        if (resource && resource !== 'ALL' && log.resource !== resource) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            log.action.toLowerCase().includes(q) ||
            log.resource.toLowerCase().includes(q) ||
            (log.details && log.details.toLowerCase().includes(q))
          );
        }
        return true;
      });
    }

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return handleAuthError(error);
  }
}
