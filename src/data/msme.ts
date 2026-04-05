import { nanoid } from 'nanoid';

// Core entity interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'investor' | 'business' | 'admin';
  createdAt: string;
  kycVerified?: boolean;
}

export interface Business {
  id: string;
  ownerId: string;
  businessName: string;
  category: string;
  location: string;
  description: string;
  createdAt: string;
  pitchDeckUrl?: string;
  financialsUrl?: string;
  videoUrl?: string;
}

export interface Listing {
  id: string;
  businessId: string;
  fundingGoal: number;
  amountRaised: number;
  equityOffered: number;
  investorsCount: number;
  createdAt: string;
  isActive: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  listingId: string;
  amount: number;
  equityReceived: number;
  investedAt: string;
}

export interface Proposal {
  id: string;
  businessId: string;
  title: string;
  description: string;
  options: string[];
  endAt: string;
  status: 'active' | 'passed' | 'rejected';
  totalVotes: number;
  createdAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  optionIndex: number;
  votingPower: number; // Based on equity
  votedAt: string;
}

export interface BusinessUpdate {
  id: string;
  businessId: string;
  title: string;
  content: string;
  date: string;
  type: 'milestone' | 'financial' | 'general';
}

// Mock data for Governance
export const mockProposals: Proposal[] = [
  {
    id: 'prop-1',
    businessId: 'biz-1',
    title: 'Expansion to Delhi Market',
    description: 'We propose to allocate $50,000 from the current round for setting up a satellite office in Delhi to capture North Indian clients. This pivot is expected to increase revenue by 25% within Q3.',
    options: ['Support Expansion', 'Reject Expansion', 'Request More Data'],
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    totalVotes: 12,
    createdAt: '2024-03-20',
  },
  {
    id: 'prop-2',
    businessId: 'biz-1',
    title: 'Annual Dividend Policy',
    description: 'Establish a policy to distribute 10% of net profits to micro-equity stakeholders annually starting from FY 2025.',
    options: ['Approve Policy', 'Disapprove', 'Abstain'],
    endAt: '2024-03-15',
    status: 'passed',
    totalVotes: 45,
    createdAt: '2024-03-01',
  },
];

export const mockBusinessUpdates: BusinessUpdate[] = [
  {
    id: 'upd-1',
    businessId: 'biz-1',
    title: 'Q1 Revenue Targets Surpassed',
    content: 'TechCorp is proud to announce that we have reached 120% of our Q1 revenue target. New partnerships with 5 enterprise clients in Bangalore have been finalized.',
    date: '2024-03-18',
    type: 'financial',
  },
  {
    id: 'upd-2',
    businessId: 'biz-1',
    title: 'AI Model V2.0 Deployment',
    content: 'Our core automation engine has been updated. Processing latency reduced by 30% across all customer workflows.',
    date: '2024-03-10',
    type: 'milestone',
  },
];

// Mock database
export const mockUsers: User[] = [
  { id: 'user-john', name: 'John Investor', email: 'john@example.com', role: 'investor', createdAt: '2024-01-15', kycVerified: true },
  { id: 'user-dhruv', name: 'Dhruv Singh', email: 'dhruv@example.com', role: 'investor', createdAt: '2024-03-01', kycVerified: true },
  { id: 'user-sarah', name: 'Sarah Johnson', email: 'sarah@techcorp.com', role: 'business', createdAt: '2024-01-20' },
  { id: 'user-mike', name: 'Mike Chen', email: 'mike@greenfoods.com', role: 'business', createdAt: '2024-02-01' },
  { id: 'user-emma', name: 'Emma Rodriguez', email: 'emma@urbanfit.com', role: 'business', createdAt: '2024-01-28' },
  { id: 'user-david', name: 'David Kim', email: 'david@craftbrew.com', role: 'business', createdAt: '2024-02-10' },
  { id: 'user-lisa', name: 'Lisa Thompson', email: 'lisa@edutech.com', role: 'business', createdAt: '2024-01-20' },
  { id: 'user-robert', name: 'Robert Wilson', email: 'robert@ecoclean.com', role: 'business', createdAt: '2024-02-05' },
  { id: 'user-alice', name: 'Alice Vance', email: 'alice@solar.com', role: 'business', createdAt: '2024-03-01' },
  { id: 'user-bob', name: 'Bob Miller', email: 'bob@robotics.com', role: 'business', createdAt: '2024-03-05' },
  { id: 'user-charlie', name: 'Charlie Day', email: 'charlie@coffee.com', role: 'business', createdAt: '2024-03-10' },
];

export const mockBusinesses: Business[] = [
  {
    id: 'biz-1',
    ownerId: 'user-sarah',
    businessName: 'TechCorp Solutions',
    category: 'Technology',
    location: 'San Francisco, CA',
    description: 'AI-powered business automation platform helping SMEs cut operational costs by 40%. Our suite includes intelligent workflow management, predictive analytics, and seamless CRM integrations — trusted by 500+ clients across the US.',
    createdAt: '2024-01-20',
    pitchDeckUrl: 'https://example.com/techcorp-pitch.pdf',
    financialsUrl: 'https://example.com/techcorp-financials.csv',
  },
  {
    id: 'biz-2',
    ownerId: 'user-mike',
    businessName: 'Ember Coffee Roasters',
    category: 'Food & Beverage',
    location: 'Portland, OR',
    description: 'Award-winning specialty coffee roastery sourcing single-origin beans from 12 countries. We sell through 3 brick-and-mortar cafes and a growing DTC subscription with over 8,000 active members nationwide.',
    createdAt: '2024-02-01',
  },
  {
    id: 'biz-3',
    ownerId: 'user-emma',
    businessName: 'Apex Performance Labs',
    category: 'Health & Fitness',
    location: 'Austin, TX',
    description: 'Science-backed performance training studio combining biometric tracking, elite coaching, and recovery therapy. With 3 locations in Austin and franchise plans underway, we have trained 2,000+ athletes from weekend warriors to NFL prospects.',
    createdAt: '2024-01-28',
  },
  {
    id: 'biz-4',
    ownerId: 'user-david',
    businessName: 'Vault Brewing Co.',
    category: 'Food & Beverage',
    location: 'Denver, CO',
    description: 'Craft brewery built inside a converted 1920s bank vault. We offer 18 rotating taps, a full kitchen, and a taproom that draws 1,200+ visitors weekly. Distribution now expanding across the Rocky Mountain region.',
    createdAt: '2024-02-10',
  },
  {
    id: 'biz-5',
    ownerId: 'user-lisa',
    businessName: 'Luminary EdTech',
    category: 'Education',
    location: 'Boston, MA',
    description: 'Adaptive learning platform for K-12 STEM education. Our AI tutor personalizes curriculum in real time and has improved student test scores by an average of 28%. Currently deployed in 340 schools across 14 states.',
    createdAt: '2024-01-20',
  },
  {
    id: 'biz-6',
    ownerId: 'user-robert',
    businessName: 'Terra Fresh Farms',
    category: 'AgriTech',
    location: 'Nashville, TN',
    description: 'Vertical indoor farming operation growing pesticide-free leafy greens, herbs, and microgreens year-round. Supplying Whole Foods, Kroger, and 80 independent grocers across the Southeast with same-day harvested produce.',
    createdAt: '2024-02-05',
  },
  {
    id: 'biz-7',
    ownerId: 'user-alice',
    businessName: 'Stitch & Thread',
    category: 'Fashion & Apparel',
    location: 'Los Angeles, CA',
    description: 'Sustainable DTC fashion brand manufacturing 100% from recycled materials. Featured in Vogue, GQ, and Forbes 30 Under 30. $2.4M in revenue last year with zero paid advertising — built entirely on community and product quality.',
    createdAt: '2024-03-01',
  },
  {
    id: 'biz-8',
    ownerId: 'user-bob',
    businessName: 'RevUp Auto',
    category: 'Automotive',
    location: 'Detroit, MI',
    description: 'On-demand mobile auto repair and EV conversion service. Our certified technicians come to you — saving customers an average of $400 vs. dealerships. Servicing 6 metro areas with a waitlist of 3,000+ customers.',
    createdAt: '2024-03-05',
  },
  {
    id: 'biz-9',
    ownerId: 'user-charlie',
    businessName: 'Clarity Health AI',
    category: 'HealthTech',
    location: 'Seattle, WA',
    description: 'Mental wellness platform using conversational AI and licensed therapist oversight to deliver affordable, always-on mental health support. 95,000+ active users, FDA breakthrough device designation pending.',
    createdAt: '2024-01-28',
  },
];

export const mockListings: Listing[] = [
  { id: 'list-1', businessId: 'biz-1', fundingGoal: 500000, amountRaised: 387500, equityOffered: 15, investorsCount: 31, createdAt: '2024-01-25', isActive: true },
  { id: 'list-2', businessId: 'biz-2', fundingGoal: 180000, amountRaised: 126000, equityOffered: 12, investorsCount: 19, createdAt: '2024-02-05', isActive: true },
  { id: 'list-3', businessId: 'biz-3', fundingGoal: 320000, amountRaised: 224000, equityOffered: 18, investorsCount: 27, createdAt: '2024-02-07', isActive: true },
  { id: 'list-4', businessId: 'biz-4', fundingGoal: 240000, amountRaised: 168000, equityOffered: 10, investorsCount: 14, createdAt: '2024-02-14', isActive: true },
  { id: 'list-5', businessId: 'biz-5', fundingGoal: 450000, amountRaised: 360000, equityOffered: 20, investorsCount: 48, createdAt: '2024-01-28', isActive: true },
  { id: 'list-6', businessId: 'biz-6', fundingGoal: 280000, amountRaised: 182000, equityOffered: 14, investorsCount: 22, createdAt: '2024-02-11', isActive: true },
  { id: 'list-7', businessId: 'biz-7', fundingGoal: 150000, amountRaised: 127500, equityOffered: 16, investorsCount: 35, createdAt: '2024-02-16', isActive: true },
  { id: 'list-8', businessId: 'biz-8', fundingGoal: 220000, amountRaised: 110000, equityOffered: 11, investorsCount: 16, createdAt: '2024-02-18', isActive: true },
  { id: 'list-9', businessId: 'biz-9', fundingGoal: 600000, amountRaised: 510000, equityOffered: 22, investorsCount: 64, createdAt: '2024-01-30', isActive: true },
];

export const mockInvestments: Investment[] = [
  { id: 'inv-1', userId: 'user-john', listingId: 'list-1', amount: 25000, equityReceived: 0.75, investedAt: '2024-02-01' },
  { id: 'inv-2', userId: 'user-john', listingId: 'list-5', amount: 30000, equityReceived: 1.33, investedAt: '2024-02-10' },
  { id: 'inv-3', userId: 'user-john', listingId: 'list-9', amount: 50000, equityReceived: 1.83, investedAt: '2024-02-15' },
];

// Calculate equity per dollar for a listing
export const calculateEquityPerDollar = (listing: Listing): number => {
  return listing.equityOffered / listing.fundingGoal;
};

// Alias for backward compatibility with InvestModal
export const calculateEquityPerRupee = calculateEquityPerDollar;

// Calculate equity received for an investment amount
export const calculateEquityReceived = (amount: number, listing: Listing): number => {
  return amount * calculateEquityPerDollar(listing);
};

// Formatter helpers
export const formatEquity = (equity: number): string => {
  if (equity >= 1) {
    return `${equity.toFixed(2)}%`;
  } else if (equity >= 0.01) {
    return `${equity.toFixed(3)}%`;
  } else {
    return `${(equity * 100).toFixed(4)}%`;
  }
};