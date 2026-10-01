import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { devStore } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'leads');

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    let contacts: any[] = [];
    try {
      contacts = await prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, primaryName: true, city: true } },
        },
        take: 100,
      });
    } catch {
      contacts = devStore.contacts.filter((c) => {
        if (search) {
          const q = search.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            (c.role && c.role.toLowerCase().includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q))
          );
        }
        return true;
      });
    }

    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'leads');

    const body = await request.json();
    const { name, role, email, phone, companyId, isPrimary, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let contact: any = null;
    try {
      contact = await prisma.contact.create({
        data: {
          name,
          role,
          email,
          phone,
          companyId: companyId || 'comp-1',
          isPrimary: !!isPrimary,
          confidence: 0.9,
          verified: true,
        },
      });
    } catch {
      contact = {
        id: `cnt-${Date.now()}`,
        name,
        role: role || null,
        email: email || null,
        phone: phone || null,
        isPrimary: !!isPrimary,
        confidence: 0.95,
        company: { id: 'comp-1', primaryName: 'Verified Account', city: 'India' },
        createdAt: new Date().toISOString(),
      };
      devStore.contacts.unshift(contact);
    }

    await createAuditRecord({
      user,
      action: 'CREATE_CONTACT',
      resource: 'Contact',
      resourceId: contact.id,
      after: contact,
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'leads');

    const body = await request.json();
    const { id, name, role, email, phone, isPrimary } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contact id is required' }, { status: 400 });
    }

    let updated: any = null;
    try {
      updated = await prisma.contact.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(role !== undefined && { role }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(isPrimary !== undefined && { isPrimary }),
        },
      });
    } catch {
      const target = devStore.contacts.find((c) => c.id === id);
      if (target) {
        if (name) target.name = name;
        if (role !== undefined) target.role = role;
        if (email !== undefined) target.email = email;
        if (phone !== undefined) target.phone = phone;
        if (isPrimary !== undefined) target.isPrimary = isPrimary;
        updated = target;
      }
    }

    return NextResponse.json({ success: true, contact: updated });
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
      return NextResponse.json({ error: 'Contact id is required' }, { status: 400 });
    }

    try {
      await prisma.contact.delete({ where: { id } });
    } catch {
      devStore.contacts = devStore.contacts.filter((c) => c.id !== id);
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
