import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerUser, authorizeAction, createAuditRecord, handleAuthError, checkOrgAccess } from '@/lib/auth/server-auth';
import { dispatchRealtimeEvent } from '@/lib/realtime/broadcast';
import { devStore } from '@/lib/db/dev-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'invoices');

    let invoices: any[] = [];
    try {
      invoices = await prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, primaryName: true } },
          payments: {
            include: { recordedBy: { select: { name: true } } },
          },
        },
      });
    } catch {
      invoices = devStore.invoices;
    }

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'create', 'invoices');

    const body = await request.json();
    const { invoiceNumber, amount, tax, companyId, dueDate, notes, organizationId } = body;

    checkOrgAccess(user, organizationId);

    if (!amount) {
      return NextResponse.json({ error: 'Invoice amount is required' }, { status: 400 });
    }

    const subtotal = parseFloat(amount);
    const taxAmt = tax !== undefined ? parseFloat(tax) : subtotal * 0.18;
    const total = subtotal + taxAmt;
    const invNum = invoiceNumber || `BX-INV-${Date.now().toString().slice(-6)}`;

    let invoice: any = null;
    try {
      invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: invNum,
          status: 'ISSUED',
          amount: subtotal,
          tax: taxAmt,
          total,
          paidAmount: 0,
          dueDate: dueDate ? new Date(dueDate) : null,
          notes,
          companyId,
          organizationId: user.organizationId,
        },
      });
    } catch {
      invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invNum,
        status: 'ISSUED',
        amount: subtotal,
        tax: taxAmt,
        total,
        paidAmount: 0,
        companyName: 'Client Account',
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
      };
      devStore.invoices.unshift(invoice);
    }

    await dispatchRealtimeEvent({
      type: 'system',
      title: 'Invoice Issued',
      message: `Invoice #${invNum} (₹${total.toLocaleString('en-IN')}) issued to client.`,
      priority: 'high',
      link: '/billing',
    });

    await createAuditRecord({
      user,
      action: 'ISSUE_INVOICE',
      resource: 'Invoice',
      resourceId: invoice.id,
      after: invoice,
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    return handleAuthError(error);
  }
}

// Record manual payment against invoice
export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'update', 'invoices');

    const body = await request.json();
    const { invoiceId, paymentAmount, paymentMethod, referenceNo, notes } = body;

    if (!invoiceId || !paymentAmount) {
      return NextResponse.json({ error: 'Invoice ID and payment amount are required' }, { status: 400 });
    }

    const payAmt = parseFloat(paymentAmount);

    let payment: any = null;
    let updatedInvoice: any = null;

    try {
      payment = await prisma.paymentRecord.create({
        data: {
          amount: payAmt,
          paymentMethod: paymentMethod || 'MANUAL_TRANSFER',
          referenceNo,
          notes: notes || 'Manually recorded by finance administrator',
          invoiceId,
          recordedById: user.userId,
        },
      });

      const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (inv) {
        const newPaid = inv.paidAmount + payAmt;
        const newStatus = newPaid >= inv.total ? 'PAID' : 'PARTIAL';
        updatedInvoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaid,
            status: newStatus,
          },
        });
      }
    } catch {
      const inv = devStore.invoices.find((i) => i.id === invoiceId);
      if (inv) {
        inv.paidAmount += payAmt;
        inv.status = inv.paidAmount >= inv.total ? 'PAID' : 'PARTIAL';
        updatedInvoice = inv;
      }
    }

    await dispatchRealtimeEvent({
      type: 'system',
      title: 'Payment Manually Recorded',
      message: `₹${payAmt.toLocaleString('en-IN')} recorded via ${paymentMethod || 'manual transfer'}.`,
      priority: 'urgent',
      link: '/billing',
    });

    await createAuditRecord({
      user,
      action: 'RECORD_PAYMENT',
      resource: 'PaymentRecord',
      resourceId: invoiceId,
      after: { paymentAmount: payAmt, paymentMethod, referenceNo },
    });

    return NextResponse.json({ success: true, payment, invoice: updatedInvoice });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'delete', 'invoices');

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Invoice id is required' }, { status: 400 });
    }

    try {
      await prisma.invoice.delete({ where: { id } });
    } catch {
      devStore.invoices = devStore.invoices.filter((i) => i.id !== id);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return handleAuthError(error);
  }
}
