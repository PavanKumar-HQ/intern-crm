import { realtimeBus, PipelineNotification } from '@/lib/realtime/event-bus';
import { getServerUser, ServerUserContext } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

function isEventAuthorizedForUser(notification: PipelineNotification, user: ServerUserContext): boolean {
  // 1. Organization boundary check
  if (notification.organizationId && notification.organizationId !== user.organizationId) {
    return false;
  }
  // 2. Direct user targeting check
  if (notification.targetUserId && notification.targetUserId !== user.userId) {
    return false;
  }
  // 3. Role hierarchy threshold check
  if (notification.minRole) {
    const roleHierarchy = { viewer: 1, sdr: 2, manager: 3, admin: 4 };
    const userLevel = roleHierarchy[user.role] || 1;
    const requiredLevel = roleHierarchy[notification.minRole] || 1;
    if (userLevel < requiredLevel) {
      return false;
    }
  }
  return true;
}

export async function GET(request: Request) {
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required for realtime subscription' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send connection acknowledgement and authorized history immediately
      const history = realtimeBus.getHistory().filter((n) => isEventAuthorizedForUser(n, user));
      const initialPayload = JSON.stringify({
        type: 'sync',
        notifications: history,
        connectedAt: new Date().toISOString(),
        user: { id: user.userId, role: user.role, org: user.organizationId },
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      const onEvent = (notification: PipelineNotification) => {
        // Enforce boundary check on every incoming event
        if (!isEventAuthorizedForUser(notification, user)) {
          return; // Suppressed: recipient is not authorized for this event
        }

        try {
          const payload = JSON.stringify({
            type: 'notification',
            notification,
          });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          // Stream might be closed
        }
      };

      realtimeBus.on('pipeline_event', onEvent);

      // Heartbeat interval to prevent socket timeout
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        realtimeBus.off('pipeline_event', onEvent);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
