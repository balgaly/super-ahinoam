export interface Milestone {
  id: string;
  company: string;
  role: string;
  dates: string;
  metric: string;
  detail: string;
  tier: 'drive-by' | 'mid' | 'climax';
}

export const ALL_MILESTONES: Record<string, Milestone> = {
  flying_carpet: {
    id: 'flying_carpet',
    company: 'Flying Carpet',
    role: 'Flight Operations',
    dates: 'pre-2010',
    metric: 'High-coordination ops',
    detail: 'Accuracy, fast response, reliable handoffs.',
    tier: 'drive-by'
  },
  imaginarium: {
    id: 'imaginarium',
    company: 'Imaginarium Retail',
    role: 'Administrative Manager',
    dates: 'early-career',
    metric: '8-store network',
    detail: 'Cross-location follow-up, retail ops.',
    tier: 'drive-by'
  },
  iplan: {
    id: 'iplan',
    company: 'iPlan Ltd.',
    role: 'Administrative Manager',
    dates: 'early-career',
    metric: 'Vendor + client + team',
    detail: 'Internal processes, cross-team coordination.',
    tier: 'drive-by'
  },
  dermador: {
    id: 'dermador',
    company: 'Dermador Ltd.',
    role: 'Bookkeeping & Asst. to VP Finance',
    dates: 'pre-StreamElements',
    metric: '4 countries',
    detail: 'US, South Africa, Spain, Israel.',
    tier: 'drive-by'
  },
  shaldag: {
    id: 'shaldag',
    company: 'Shaldag Group',
    role: 'Head Bookkeeper',
    dates: 'pre-StreamElements',
    metric: 'Owned the books',
    detail: 'Financial workflows, vendor + partner coordination.',
    tier: 'drive-by'
  },
  levi_trucks: {
    id: 'levi_trucks',
    company: 'Levi Trucks Strauss',
    role: 'Sole Bookkeeper',
    dates: 'pre-StreamElements',
    metric: '100% reporting accuracy',
    detail: 'Bookkeeping discipline that became campaign reporting.',
    tier: 'drive-by'
  },
  se_ops_clients: {
    id: 'se_ops_clients',
    company: 'StreamElements — Operations',
    role: 'Operations Team Member',
    dates: 'Mar 2021 - Sep 2022',
    metric: '3-6 concurrent clients, $50k-$1M budgets',
    detail: 'HelloFresh, Plarium, Scopely, Lilith Games. Twice-weekly spend reports.',
    tier: 'mid'
  },
  se_ops_reports: {
    id: 'se_ops_reports',
    company: 'StreamElements — Operations',
    role: 'Operations Team Member',
    dates: 'Mar 2021 - Sep 2022',
    metric: '~4 hrs/week saved per client',
    detail: 'Corrected reporting logic that undercounted billable events. Revenue visibility unlocked.',
    tier: 'mid'
  },
  se_pm_tickets: {
    id: 'se_pm_tickets',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 - Dec 2025',
    metric: '~50% fewer fraud support tickets',
    detail: 'Redesigned detection-related flows. Fewer escalations, faster reviewer cycles.',
    tier: 'climax'
  },
  se_pm_volume: {
    id: 'se_pm_volume',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 - Dec 2025',
    metric: '~2.5k weekly fraud investigations',
    detail: '~500 per person per week, ~20 campaigns/month. Risk trends reported to CTO.',
    tier: 'climax'
  },
  se_pm_module: {
    id: 'se_pm_module',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 - Dec 2025',
    metric: 'Fake-accounts module shipped',
    detail: 'Prevented fraudulent accounts from receiving offers. Yellow-flag process for unconfirmed cases.',
    tier: 'climax'
  },
  se_pm_savings: {
    id: 'se_pm_savings',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 - Dec 2025',
    metric: '~10 hrs/week saved, 7+ trained',
    detail: 'Dashboards, SQL, playbooks, SOPs, training. Cross-functional ownership.',
    tier: 'climax'
  }
};
