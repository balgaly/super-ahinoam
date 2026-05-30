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
    detail: 'High-coordination operational environment requiring accuracy, fast response, and reliable handoffs. First proving ground for the operational discipline that becomes a career signature.',
    tier: 'drive-by'
  },
  imaginarium: {
    id: 'imaginarium',
    company: 'Imaginarium Retail Ltd.',
    role: 'Administrative Manager',
    dates: 'early-career',
    metric: '8-store retail network',
    detail: 'Supported an 8-store network with operational administration, process coordination, and cross-location follow-up. Learning to keep many threads moving without dropping any.',
    tier: 'drive-by'
  },
  iplan: {
    id: 'iplan',
    company: 'iPlan Ltd.',
    role: 'Administrative Manager',
    dates: 'early-career',
    metric: 'Vendors + clients + teams',
    detail: 'Managed administrative operations, vendor and client coordination, internal processes, and execution details across teams. The cross-functional reflex starts forming here.',
    tier: 'drive-by'
  },
  dermador: {
    id: 'dermador',
    company: 'Dermador Ltd.',
    role: 'Bookkeeping & Asst. to VP Finance',
    dates: 'pre-StreamElements',
    metric: '4 countries: US, ZA, ES, IL',
    detail: 'Supported finance and administration across US, South Africa, Spain, and Israel activities. Emphasis on accuracy, documentation, and executive follow-through across timezones.',
    tier: 'drive-by'
  },
  shaldag: {
    id: 'shaldag',
    company: 'Shaldag Group',
    role: 'Head Bookkeeper',
    dates: 'pre-StreamElements',
    metric: 'Owned the books',
    detail: 'Managed financial workflows and cross-functional coordination with internal stakeholders, vendors, and external finance partners. The numbers had to be right or nothing else mattered.',
    tier: 'drive-by'
  },
  levi_trucks: {
    id: 'levi_trucks',
    company: 'Levi Trucks Strauss (1993) Ltd.',
    role: 'Sole Bookkeeper',
    dates: 'pre-StreamElements',
    metric: '100% reporting accuracy',
    detail: 'Owned bookkeeping processes and reporting accuracy end-to-end. The financial discipline forged here later powered campaign reporting, billing logic, and operational analytics at SE.',
    tier: 'drive-by'
  },
  se_ops_clients: {
    id: 'se_ops_clients',
    company: 'StreamElements — Operations',
    role: 'Operations Team Member',
    dates: 'Mar 2021 — Sep 2022',
    metric: '3-6 concurrent clients · $50k-$1M budgets',
    detail: 'Managed creator campaign operations across 3-6 concurrent clients with budgets from ~$50k to $1M, including HelloFresh, Plarium, Scopely, and Lilith Games. Coordinated directly with CS, Creator Managers, and clients on budget progress and operational reporting.',
    tier: 'mid'
  },
  se_ops_reports: {
    id: 'se_ops_reports',
    company: 'StreamElements — Operations',
    role: 'Operations Team Member',
    dates: 'Mar 2021 — Sep 2022',
    metric: '~4 hrs/week saved per client',
    detail: 'Produced client spend reports twice weekly and corrected reporting logic that undercounted billable events. Improved revenue visibility and saved ~4 hrs/week per client through automated reports — the bug that, once fixed, paid for itself every week forever.',
    tier: 'mid'
  },
  se_pm_step_up: {
    id: 'se_pm_step_up',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022',
    metric: 'Stepped up after PM departed',
    detail: 'Took over the fraud investigations product area when the previous PM departed. Partnered with Data and Engineering to refine detection logic, reduce false positives, and improve reviewer efficiency. Earned the role by carrying it before it was given.',
    tier: 'climax'
  },
  se_pm_data_model: {
    id: 'se_pm_data_model',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 — Dec 2025',
    metric: 'Defined fraud schema',
    detail: 'Defined fraud-related data fields, investigation statuses, fraud categories, queues, and prioritization rules across the internal campaign-management system. The shared language reviewers and engineers use every day.',
    tier: 'climax'
  },
  se_pm_tickets: {
    id: 'se_pm_tickets',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 — Dec 2025',
    metric: '~50% fewer fraud support tickets',
    detail: 'Redesigned detection-related flows and reviewer interfaces. Cut fraud-related support ticket volume roughly in half. Fewer escalations, faster reviewer cycles, less customer pain.',
    tier: 'climax'
  },
  se_pm_volume: {
    id: 'se_pm_volume',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 — Dec 2025',
    metric: '~2.5k weekly fraud investigations',
    detail: 'Supported ~500 investigations per person per week (~2.5k team-wide) across ~20 campaigns/month. Reported findings and risk trends to leadership including the CTO — the data shaped strategic risk decisions, not just dashboards.',
    tier: 'climax'
  },
  se_pm_module: {
    id: 'se_pm_module',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 — Dec 2025',
    metric: 'Fake-accounts module shipped',
    detail: 'Built a fake-accounts module that prevents fraudulent accounts from receiving offers. Introduced a yellow-flag process for suspicious-but-unconfirmed cases — capturing the gray zone instead of forcing a binary block/allow.',
    tier: 'climax'
  },
  se_pm_savings: {
    id: 'se_pm_savings',
    company: 'StreamElements — Product',
    role: 'Product Manager — Fraud, Risk & Trust',
    dates: 'Sep 2022 — Dec 2025',
    metric: '~10 hrs/week saved · 7+ trained',
    detail: 'Built dashboards, SQL queries, playbooks, SOPs, and training docs. Saved ~10 hrs/week personally and ~5 hrs/week per team member. Trained 7+ teammates across functions — shipping leverage, not just features.',
    tier: 'climax'
  }
};
