export interface Industry {
  slug: string
  name: string
  badgeLabel: string
  orgLabel: string
  code: string
  headline: string
}

export function buildTagline(orgLabel: string) {
  return {
    line1: `You get a custom platform for your ${orgLabel}'s needs.`,
    line2: 'Built around how you work and your existing tools.',
  }
}

export const LANDING_BULLETS = [
  'Ready in days, not months',
  'No upfront cost — just a 30-min meeting',
  'You only pay if you decide to use it',
  'Cancel anytime',
]

export const LANDING_SUBLINE = '+100 Delivered in 2025'

export const industries: Industry[] = [
  { slug: 'construction', name: 'Construction', badgeLabel: 'Construction Companies', orgLabel: 'company', code: 'CONSTRUCTION-VIP', headline: 'Projects, crews, budgets, timelines...' },
  { slug: 'insurance', name: 'Insurance', badgeLabel: 'Insurance Agencies', orgLabel: 'agency', code: 'INSURANCE-VIP', headline: 'Policies, claims, agents, renewals...' },
  { slug: 'staffing', name: 'Staffing & Recruiting', badgeLabel: 'Staffing Agencies', orgLabel: 'agency', code: 'STAFFING-VIP', headline: 'Candidates, placements, clients, timesheets...' },
  { slug: 'law', name: 'Law Practice', badgeLabel: 'Law Firms', orgLabel: 'firm', code: 'LAW-VIP', headline: 'Cases, clients, deadlines, billing...' },
  { slug: 'accounting', name: 'Accounting', badgeLabel: 'Accounting Firms', orgLabel: 'practice', code: 'ACCOUNTING-VIP', headline: 'Clients, deadlines, documents, billing...' },
  { slug: 'marketing', name: 'Marketing & Advertising', badgeLabel: 'Marketing Agencies', orgLabel: 'agency', code: 'MARKETING-VIP', headline: 'Campaigns, clients, assets, reporting...' },
  { slug: 'architecture', name: 'Architecture & Planning', badgeLabel: 'Architecture Firms', orgLabel: 'studio', code: 'ARCHITECTURE-VIP', headline: 'Projects, drawings, clients, timelines...' },
  { slug: 'health', name: 'Health, Wellness & Fitness', badgeLabel: 'Wellness Businesses', orgLabel: 'business', code: 'HEALTH-VIP', headline: 'Clients, bookings, programs, payments...' },
  { slug: 'automotive', name: 'Automotive', badgeLabel: 'Automotive Businesses', orgLabel: 'dealership', code: 'AUTOMOTIVE-VIP', headline: 'Inventory, customers, service, sales...' },
  { slug: 'medical', name: 'Medical Practice', badgeLabel: 'Medical Practices', orgLabel: 'practice', code: 'MEDICAL-VIP', headline: 'Appointments, patients, staff, billing...' },
  { slug: 'financial-services', name: 'Financial Services', badgeLabel: 'Financial Services Firms', orgLabel: 'firm', code: 'FINANCE-VIP', headline: 'Clients, portfolios, compliance, reporting...' },
  { slug: 'it', name: 'Information Technology', badgeLabel: 'IT Companies', orgLabel: 'team', code: 'IT-VIP', headline: 'Projects, tickets, clients, SLAs...' },
  { slug: 'consulting', name: 'Management Consulting', badgeLabel: 'Consulting Firms', orgLabel: 'firm', code: 'CONSULTING-VIP', headline: 'Engagements, clients, deliverables, billing...' },
  { slug: 'hospitality', name: 'Hospitality', badgeLabel: 'Hospitality Businesses', orgLabel: 'property', code: 'HOSPITALITY-VIP', headline: 'Reservations, guests, staff, operations...' },
  { slug: 'logistics', name: 'Logistics & Supply Chain', badgeLabel: 'Logistics Companies', orgLabel: 'operation', code: 'LOGISTICS-VIP', headline: 'Routes, drivers, orders, inventory...' },
  { slug: 'environmental', name: 'Environmental Services', badgeLabel: 'Environmental Services Companies', orgLabel: 'company', code: 'ENVIRONMENTAL-VIP', headline: 'Projects, compliance, fieldwork, reporting...' },
  { slug: 'education', name: 'Education Management', badgeLabel: 'Education Institutions', orgLabel: 'institution', code: 'EDUCATION-VIP', headline: 'Students, courses, faculty, enrollment...' },
  { slug: 'telecom', name: 'Telecommunications', badgeLabel: 'Telecom Companies', orgLabel: 'company', code: 'TELECOM-VIP', headline: 'Networks, subscribers, service tickets, billing...' },
  { slug: 'oil-energy', name: 'Oil & Energy', badgeLabel: 'Energy Companies', orgLabel: 'operation', code: 'ENERGY-VIP', headline: 'Wells, pipelines, compliance, production...' },
  { slug: 'retail', name: 'Retail', badgeLabel: 'Retail Businesses', orgLabel: 'business', code: 'RETAIL-VIP', headline: 'Inventory, stores, sales, suppliers...' },
  { slug: 'food-beverages', name: 'Food & Beverages', badgeLabel: 'Food & Beverage Companies', orgLabel: 'business', code: 'FOOD-VIP', headline: 'Orders, suppliers, inventory, distribution...' },
  { slug: 'investment-management', name: 'Investment Management', badgeLabel: 'Investment Firms', orgLabel: 'firm', code: 'INVESTMENT-VIP', headline: 'Portfolios, clients, compliance, reporting...' },
  { slug: 'real-estate', name: 'Real Estate', badgeLabel: 'Real Estate Firms', orgLabel: 'firm', code: 'REALESTATE-VIP', headline: 'Properties, agents, listings, transactions...' },
  { slug: 'transportation', name: 'Transportation & Trucking', badgeLabel: 'Trucking & Transportation Companies', orgLabel: 'operation', code: 'TRANSPORT-VIP', headline: 'Fleet, drivers, routes, dispatch...' },
  { slug: 'venture-capital', name: 'Venture Capital & Private Equity', badgeLabel: 'VC & PE Firms', orgLabel: 'fund', code: 'VC-VIP', headline: 'Deals, portfolios, LPs, due diligence...' },
  { slug: 'civil-engineering', name: 'Civil Engineering', badgeLabel: 'Civil Engineering Firms', orgLabel: 'firm', code: 'CIVILENG-VIP', headline: 'Projects, permits, drawings, inspections...' },
  { slug: 'entertainment', name: 'Entertainment', badgeLabel: 'Entertainment Companies', orgLabel: 'company', code: 'ENTERTAINMENT-VIP', headline: 'Productions, talent, schedules, budgets...' },
  { slug: 'biotechnology', name: 'Biotechnology', badgeLabel: 'Biotech Companies', orgLabel: 'lab', code: 'BIOTECH-VIP', headline: 'Trials, research, compliance, data...' },
  { slug: 'consumer-goods', name: 'Consumer Goods', badgeLabel: 'Consumer Goods Companies', orgLabel: 'company', code: 'CPG-VIP', headline: 'Products, supply chain, distributors, sales...' },
  { slug: 'apparel-fashion', name: 'Apparel & Fashion', badgeLabel: 'Fashion Brands', orgLabel: 'brand', code: 'FASHION-VIP', headline: 'Collections, suppliers, orders, inventory...' },
  { slug: 'nonprofit', name: 'Non-Profit Organization Management', badgeLabel: 'Non-Profit Organizations', orgLabel: 'organization', code: 'NONPROFIT-VIP', headline: 'Donors, programs, grants, volunteers...' },
  { slug: 'medical-devices', name: 'Medical Devices', badgeLabel: 'Medical Device Companies', orgLabel: 'company', code: 'MEDDEVICE-VIP', headline: 'Products, compliance, trials, distribution...' },
  { slug: 'pharmaceuticals', name: 'Pharmaceuticals', badgeLabel: 'Pharmaceutical Companies', orgLabel: 'company', code: 'PHARMA-VIP', headline: 'Trials, compliance, pipeline, distribution...' },
  { slug: 'internet', name: 'Internet', badgeLabel: 'Internet Companies', orgLabel: 'company', code: 'INTERNET-VIP', headline: 'Users, analytics, integrations, growth...' },
  { slug: 'computer-software', name: 'Computer Software', badgeLabel: 'Software Companies', orgLabel: 'company', code: 'SOFTWARE-VIP', headline: 'Releases, customers, support, roadmap...' },
  { slug: 'investment-banking', name: 'Investment Banking', badgeLabel: 'Investment Banks', orgLabel: 'bank', code: 'IB-VIP', headline: 'Deals, clients, models, compliance...' },
]

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug)
}

export function getAllIndustrySlugs(): string[] {
  return industries.map((i) => i.slug)
}
