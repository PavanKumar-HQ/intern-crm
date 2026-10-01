import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'meetings');

    let meetings: any[] = [];
    try {
      meetings = await prisma.meeting.findMany({
        orderBy: { startTime: 'asc' },
        include: {
          company: { select: { id: true, primaryName: true } },
          organizer: { select: { id: true, name: true, email: true } },
          lead: { select: { id: true, companyName: true } },
        },
      });
    } catch {
      meetings = devStore.meetings;
    }

    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'meetings');

    const body = await request.json();
    const { title, meetingType, startTime, endTime, agenda, companyId, leadId, locationUrl, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Title, start time, and end time are required' }, { status: 400 });
    }

    let meeting: any = null;
    try {
      meeting = await prisma.meeting.create({
        data: {
          title,
          meetingType: meetingType || 'VIDEO_CALL',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          agenda,
          locationUrl,
          companyId,
          leadId,
          organizerId: user.userId,
          organizationId: user.organizationId,
        },
      });
    } catch {
      meeting = {
        id: `mtg-${Date.now()}`,
        title,
        meetingType: meetingType || 'VIDEO_CALL',
        startTime,
        endTime,
        agenda,
        organizerName: user.name,
      };
      devStore.meetings.unshift(meeting);
    }

    await dispatchRealtimeEvent({
      type: 'system',
      title: 'Meeting Scheduled on Calendar',
      message: `${meeting.title} scheduled for ${new Date(startTime).toLocaleDateString()} at ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      priority: 'normal',
      link: '/calendar',
    });

    await createAuditRecord({
      user,
      action: 'SCHEDULE_MEETING',
      resource: 'Meeting',
      resourceId: meeting.id,
      after: meeting,
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    return handleAuthError(error);
  }
}
