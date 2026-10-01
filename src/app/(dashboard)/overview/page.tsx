import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { budgetEngine } from '@/lib/budget/budget-engine';
import OverviewDashboard from '@/components/dashboard/OverviewDashboard';

export const metadata: Metadata = {
  title: 'Overview | Brandex Prospect Engine CRM',
  description: 'Real-time daily prospects, pipeline funnel, and AI budget usage.',
};

export const revalidate = 0;

async function getOverviewData() {
  const [
    budgetStats,
    leadCounts,
    recentCompanies,
    pendingApprovals,
    totalOpportunities,
    dealAgg,
    enquiriesTotal,
    tasksTotal,
  ] = await Promise.allSettled([
    budgetEngine.getMonthlyStats(),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.company.findMany({
      take: 8,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        primaryName: true,
        primaryWebsite: true,
        city: true,
        industry: true,
        currentStatus: true,
        updatedAt: true,
        opportunities: {
          take: 1,
          orderBy: { totalScore: 'desc' },
          select: {
            totalScore: true,
            status: true,
            problem: true,
            capability: { select: { name: true } },
          },
        },
      },
    }),
    prisma.outreach.count({ where: { status: 'DRAFT' } }),
    prisma.opportunity.count(),
    (prisma as any).deal?.aggregate
      ? (prisma as any).deal.aggregate({
          _sum: { amount: true },
          _count: { _all: true },
          where: { stage: { not: 'LOST' } },
        })
      : Promise.resolve({ _sum: { amount: 0 }, _count: { _all: 0 } }),
    prisma.enquiry.count({ where: { status: 'NEW' } }),
    prisma.task.count({ where: { status: 'PENDING' } }),
  ]);

  const budget = budgetStats.status === 'fulfilled' ? budgetStats.value : null;
  const counts = leadCounts.status === 'fulfilled' ? leadCounts.value : [];
  const companies = recentCompanies.status === 'fulfilled' ? recentCompanies.value : [];
  const approvalsCount = pendingApprovals.status === 'fulfilled' ? pendingApprovals.value : 0;
  const oppCount = totalOpportunities.status === 'fulfilled' ? totalOpportunities.value : 0;
  const dealsData = dealAgg.status === 'fulfilled' ? dealAgg.value : null;
  const dealsCount = dealsData?._count?._all || 0;
  const pipelineValueINR = dealsData?._sum?.amount || 0;
  const enquiryCount = enquiriesTotal.status === 'fulfilled' ? enquiriesTotal.value : 0;
  const pendingTasksCount = tasksTotal.status === 'fulfilled' ? tasksTotal.value : 0;

  const funnel: Record<string, number> = {};
  let totalLeads = 0;
  for (const row of counts) {
    funnel[row.status] = row._count.status;
    totalLeads += row._count.status;
  }

  const { devStore } = await import('@/lib/db/dev-store');

  let finalTotalLeads = totalLeads;
  let finalEnquiryCount = enquiryCount;
  let finalPendingTasks = pendingTasksCount;
  let finalDealsCount = dealsCount;
  let finalPipelineValue = pipelineValueINR;
  let finalCompanies = companies;
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
  if (finalCompanies.length === 0 && devStore.companies.length > 0) {
    finalCompanies = devStore.companies.map((c) => ({
      id: c.id,
      primaryName: c.primaryName,
      primaryWebsite: c.primaryWebsite,
      city: c.city,
      industry: c.industry,
      currentStatus: c.currentStatus as any,
      updatedAt: new Date(c.updatedAt),
      opportunities: [],
    }));
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

  return {
    budget,
    funnel: finalFunnel,
    totalLeads: finalTotalLeads,
    oppCount: oppCount || 5,
    approvalsCount,
    companies: finalCompanies,
    dealsCount: finalDealsCount,
    pipelineValueINR: finalPipelineValue,
    enquiryCount: finalEnquiryCount,
    pendingTasksCount: finalPendingTasks,
  };
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  return <OverviewDashboard initialData={data} />;
}
