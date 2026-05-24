/**
 * View model for a primary offer package.
 */
export interface OfferPackage {
  id: string;
  title: string;
  duration: string;
  scope: string[];
  rate: string;
  typicalFit: string[];
  minimumTerm?: string;
}

/**
 * View model for an add-on service.
 */
export interface AddOnService {
  name: string;
  description: string;
  rate: string;
}

/**
 * Root content model for the offer page.
 */
export interface OfferPageContent {
  purpose: string;
  pricingNotes: string[];
  offers: OfferPackage[];
  addOns: AddOnService[];
  discounts: string[];
  commercialTerms: string[];
  guardrails: string[];
}

export const OFFER_PAGE_CONTENT: OfferPageContent = {
  purpose: 'Baseline pricing guidance for Vorba core offer packages to support sales qualification, proposal drafting, and deal scoping.',
  pricingNotes: [
    'Currency: USD',
    'Rates are guidance, not fixed quotes.',
    'Final pricing depends on scope, timeline, data access, and stakeholder availability.',
    'Travel, specialized tooling, and partner costs are billed separately when applicable.'
  ],
  offers: [
    {
      id: 'discovery-sprint',
      title: 'Discovery Sprint',
      duration: '2-week engagement',
      scope: [
        'Current-state snapshot',
        'Constraint map',
        'Priority opportunities list',
        'Recommended 30-day plan'
      ],
      rate: '$8,500 - $15,000 flat fee',
      typicalFit: [
        'Teams needing fast clarity before a larger systems engagement',
        'Leaders who need a practical execution plan, not a long strategy cycle'
      ]
    },
    {
      id: 'systems-assessment',
      title: 'Systems Assessment',
      duration: '4-6 week engagement',
      scope: [
        'High-level and low-level systems assessment',
        'Bottleneck and risk analysis',
        'Handoff and process improvement recommendations',
        'Prioritized implementation roadmap'
      ],
      rate: '$22,000 - $48,000 flat fee',
      typicalFit: [
        'Teams under growth pressure with recurring operational friction',
        'Organizations with cross-functional misalignment and unclear ownership'
      ]
    },
    {
      id: 'evaluation-optimization-retainer',
      title: 'Evaluation and Optimization Retainer',
      duration: 'Monthly advisory and operating support',
      scope: [
        'KPI and workflow health review',
        'Issue triage and prioritization',
        'Ongoing operating-system refinements'
      ],
      rate: '$6,500 - $18,000 per month',
      minimumTerm: 'Suggested minimum term: 3 months',
      typicalFit: [
        'Teams that need recurring guidance as execution evolves',
        'Leaders who want ongoing accountability and iteration support'
      ]
    }
  ],
  addOns: [
    {
      name: 'Workshop Facilitation',
      description: 'Leadership or cross-functional alignment workshops.',
      rate: '$2,000 - $5,000 per workshop'
    },
    {
      name: 'Process Mapping Deep Dive',
      description: 'Detailed mapping of selected workflow and handoff areas.',
      rate: '$3,500 - $9,000 per module'
    },
    {
      name: 'KPI and Operating Cadence Design',
      description: 'KPI framework and review cadence setup.',
      rate: '$4,000 - $12,000 one-time'
    }
  ],
  discounts: [
    'Discovery Sprint + Systems Assessment bundle: up to 10% discount',
    'Retainer attached to completed Systems Assessment: up to 15% onboarding discount',
    'Nonprofit and mission-led discount: case-by-case'
  ],
  commercialTerms: [
    '50% upfront and 50% at milestone completion for fixed-fee projects',
    'Monthly retainers invoiced in advance',
    'Change requests managed through written scope updates',
    'Payment terms: Net 15 unless otherwise agreed'
  ],
  guardrails: [
    'Avoid discounting below floor without strategic reason and explicit approval.',
    'Protect implementation quality by avoiding over-compressed timelines.',
    'Do not over-scope Discovery Sprint deliverables.'
  ],
};
