import { realtimeBus } from './event-bus';
import { prisma } from '@/lib/db/prisma';

export interface DispatchParams {
  type: 'enquiry' | 'lead' | 'task' | 'note' | 'approval' | 'system' | 'campaign';
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  userId?: string;
  organizationId?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dispatches an authorized real-time event and persists it to the Notification database table.
 */
export async function dispatchRealtimeEvent(params: DispatchParams) {
  // 1. Broadcast over active SSE sockets to connected clients
  const event = realtimeBus.broadcast({
    title: params.title,
    message: params.message,
    type: params.type === 'enquiry' ? 'lead_discovered' : params.type === 'task' ? 'system' : params.type === 'approval' ? 'approval_needed' : 'system',
    priority: params.priority || 'normal',
    metadata: params.metadata,
  });

  // 2. Persist to Notification database table for permanent history & read status tracking
  try {
    await prisma.notification.create({
      data: {
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority || 'normal',
        read: false,
        link: params.link,
        userId: params.userId,
        organizationId: params.organizationId,
      },
    });
  } catch {
    // If DB is offline, in-memory event bus still delivered event
  }

  return event;
}
