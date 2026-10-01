import { NextResponse } from 'next/server';
import { realtimeBus } from '@/lib/realtime/event-bus';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, title, message, type, priority, metadata } = body;

    if (action === 'mark_read' && id) {
      realtimeBus.markAsRead(id);
      return NextResponse.json({ success: true, action: 'marked_read' });
    }

    if (action === 'mark_all_read') {
      realtimeBus.markAllAsRead();
      return NextResponse.json({ success: true, action: 'marked_all_read' });
    }

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      );
    }

    const created = realtimeBus.broadcast({
      title,
      message,
      type: type || 'system',
      priority: priority || 'normal',
      metadata,
    });

    return NextResponse.json({ success: true, notification: created });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const history = realtimeBus.getHistory();
  return NextResponse.json({ notifications: history });
}
