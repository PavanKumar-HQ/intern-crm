import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { budgetEngine } from '@/lib/budget/budget-engine';
import { getServerUser, authorizeAction, handleAuthError } from '@/lib/auth/server-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    authorizeAction(user, 'read', 'leads');

    const [
      budgetStats,
      leadCounts,
      totalLeads,
      enquiryCount,
      pendingTasksCount,
      pendingApprovalsCount,
      oppCount,
      companiesCount,
      recentLeads,
      dealAgg,
    ] = await Promise.all([
      budgetEngine.getMonthlyStats().catch(() => null),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { status: true },
      }).catch(() => []),
      prisma.lead.count().catch(() => 0),
      prisma.enquiry.count({ where: { status: 'NEW' } }).catch(() => 0),
      prisma.task.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.outreach.count({ where: { status: 'PENDING_APPROVAL' } }).catch(() => 0),
      prisma.opportunity.count().catch(() => 0),
      prisma.company.count().catch(() => 0),
      prisma.lead.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { company: true, assignedTo: { select: { name: true } } },
      }).catch(() => []),
      prisma.deal.aggregate({
        _sum: { amount: true },
        _count: { _all: true },
        where: { stage: { not: 'LOST' } },
      }).catch(() => ({ _sum: { amount: 0 }, _count: { _all: 0 } })),
    ]);

    const { devStore } = await import('@/lib/db/dev-store');

    const funnel: Record<string, number> = {};
    for (const row of leadCounts) {
      funnel[row.status] = row._count.status;
    }

    let finalTotalLeads = totalLeads;
    let finalEnquiryCount = enquiryCount;
    let finalPendingTasks = pendingTasksCount;
    let finalDealsCount = (dealAgg as any)?._count?._all || 0;
    let finalPipelineValue = (dealAgg as any)?._sum?.amount || 0;
    let finalFunnel = funnel;

    if (finalTotalLeads === 0 && devStore.leads.length > 0) {
      finalTotalLeads = devStore.leads.length;
      finalFunnel = {
        DISCOVERED: 0,
        VALIDATED: 0,
        RESEARCHING: 0,
        QUALIFIED: 0,
        OUTREACH_READY: 0,
        WON: 0,
      };
      for (const ld of devStore.leads) {
        finalFunnel[ld.status] = (finalFunnel[ld.status] || 0) + 1;
      }
    }
    if (finalEnquiryCount === 0 && devStore.enquiries.length > 0) {
      finalEnquiryCount = devStore.enquiries.filter((e) => e.status === 'NEW').length;
    }
    if (finalPendingTasks === 0 && devStore.tasks.length > 0) {
      finalPendingTasks = devStore.tasks.filter((t) => t.status === 'PENDING').length;
    }
    if (finalDealsCount === 0 && devStore.deals.length > 0) {
      finalDealsCount = devStore.deals.length;
      finalPipelineValue = devStore.deals.reduce((sum, d) => sum + d.amount, 0);
    }

    return NextResponse.json({
      success: true,
      metrics: {
        budget: budgetStats,
        totalLeads: finalTotalLeads,
        enquiryCount: finalEnquiryCount,
        pendingTasksCount: finalPendingTasks,
        pendingApprovalsCount,
        oppCount: oppCount || 5,
        companiesCount: companiesCount || devStore.companies.length,
        funnel: finalFunnel,
        recentLeads,
        dealsCount: finalDealsCount,
        pipelineValueINR: finalPipelineValue,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
