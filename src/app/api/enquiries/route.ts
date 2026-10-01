import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore, DevEnquiry } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'leads');

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { contactName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    let enquiries: any[] = [];
    try {
      enquiries = await prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          convertedLead: { select: { id: true, companyName: true, status: true } },
        },
        take: 100,
      });
    } catch {
      // Graceful offline fallback
      enquiries = devStore.enquiries.filter((e) => {
        if (status && status !== 'ALL' && e.status !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            e.contactName.toLowerCase().includes(q) ||
            (e.companyName && e.companyName.toLowerCase().includes(q)) ||
            (e.email && e.email.toLowerCase().includes(q)) ||
            e.title.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }

    return NextResponse.json({ success: true, enquiries });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'leads');

    const body = await request.json();
    const { contactName, email, phone, companyName, message, title, source, priority, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!contactName || !title) {
      return NextResponse.json(
        { error: 'Contact name and enquiry title are required' },
        { status: 400 }
      );
    }

    let enquiry: any = null;
    try {
      enquiry = await prisma.enquiry.create({
        data: {
          title,
          contactName,
          email,
          phone,
          companyName,
          message,
          source: source || 'Website Form',
          priority: priority || 'MEDIUM',
          status: 'NEW',
          organizationId: user.organizationId,
        },
      });
    } catch {
      enquiry = {
        id: `enq-${Date.now()}`,
        title,
        source: source || 'Website Form',
        contactName,
        email: email || null,
        phone: phone || null,
        companyName: companyName || null,
        message: message || null,
        status: 'NEW',
        priority: priority || 'MEDIUM',
        createdAt: new Date().toISOString(),
      };
      devStore.enquiries.unshift(enquiry);
    }

    // Realtime notification broadcast
    await dispatchRealtimeEvent({
      type: 'enquiry',
      title: 'New Inbound Enquiry Received',
      message: `${contactName} (${companyName || 'Private'}) submitted "${title}".`,
      priority: priority === 'HIGH' || priority === 'URGENT' ? 'urgent' : 'normal',
      link: '/enquiries',
    });

    await createAuditRecord({
      user,
      action: 'CREATE_ENQUIRY',
      resource: 'Enquiry',
      resourceId: enquiry.id,
      after: enquiry,
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'leads');

    const body = await request.json();
    const { id, status, assignedToId, convertToLead } = body;

    if (!id) {
      return NextResponse.json({ error: 'Enquiry id is required' }, { status: 400 });
    }

    let updated: any = null;
    let createdLead: any = null;

    try {
      if (convertToLead) {
        const existing = await prisma.enquiry.findUnique({ where: { id } });
        if (existing) {
          createdLead = await prisma.lead.create({
            data: {
              companyName: existing.companyName || existing.contactName + ' Company',
              email: existing.email,
              phone: existing.phone,
              source: 'Inbound Enquiry: ' + existing.source,
              status: 'DISCOVERED',
            },
          });

          updated = await prisma.enquiry.update({
            where: { id },
            data: {
              status: 'CONVERTED',
              convertedLeadId: createdLead.id,
            },
          });
        }
      } else {
        updated = await prisma.enquiry.update({
          where: { id },
          data: {
            ...(status && { status }),
            ...(assignedToId !== undefined && { assignedToId }),
          },
        });
      }
    } catch {
      // Fallback
      const target = devStore.enquiries.find((e) => e.id === id);
      if (target) {
        if (convertToLead) {
          target.status = 'CONVERTED';
          createdLead = {
            id: `ld-${Date.now()}`,
            companyName: target.companyName || target.contactName + ' Company',
            status: 'DISCOVERED',
          };
          target.convertedLead = createdLead;
        } else {
          if (status) target.status = status;
        }
        updated = target;
      }
    }

    await dispatchRealtimeEvent({
      type: 'lead',
      title: 'Enquiry Converted to Qualified Lead',
      message: `Enquiry #${id.slice(-6)} converted to official lead record.`,
      priority: 'high',
      link: '/leads',
    });

    return NextResponse.json({ success: true, enquiry: updated, lead: createdLead });
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
      return NextResponse.json({ error: 'Enquiry id is required' }, { status: 400 });
    }

    try {
      await prisma.enquiry.delete({ where: { id } });
    } catch {
      devStore.enquiries = devStore.enquiries.filter((e) => e.id !== id);
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
