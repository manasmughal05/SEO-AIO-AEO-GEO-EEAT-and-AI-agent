export interface AuditScoreBreakdown {
  seo: number;
  aeo: number;
  aio: number;
  geo: number;
  eeat: number;
  overall: number;
}

export type FindingCategory = 'seo' | 'aeo' | 'aio' | 'geo' | 'eeat';
export type FindingSeverity = 'critical' | 'warning' | 'good' | 'info';

export interface AuditFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  evidence: string;
  explanation: string;
  solution: string;
  codeSnippet?: string;
}

export interface HeadingsMap {
  h1: string[];
  h2: string[];
  h3: string[];
}

export interface UrlReport {
  id: string;
  url: string;
  path: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: string;
  statusCode: number;
  responseTimeMs: number;
  wordCount: number;
  readingTimeMinutes: number;
  internalLinksCount: number;
  externalLinksCount: number;
  imagesCount: number;
  imagesWithoutAlt: number;
  headings: HeadingsMap;
  schemaTypes: string[];
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  scores: AuditScoreBreakdown;
  findings: AuditFinding[];
  aiRecommendations: string[];
  crawledAt: string;
  serverHeaders?: Record<string, string>;
  sslStatus?: {
    valid: boolean;
    issuer: string;
    validTo: string;
    protocol: string;
  };
  dnsRecords?: {
    type: string;
    value: string;
  }[];
}

export interface WebsiteAudit {
  id: string;
  websiteName: string;
  domain: string;
  rootUrl: string;
  status: 'queued' | 'crawling' | 'analyzing' | 'completed' | 'failed';
  totalUrlsDiscovered: number;
  analyzedUrlsCount: number;
  averageScores: AuditScoreBreakdown;
  urlReports: UrlReport[];
  topFindings: AuditFinding[];
  globalAiRecommendations: string[];
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  accountType: 'Scholar' | 'Professional' | 'Creator' | 'Public';
  subscription: 'Free Open Access' | 'Academic & Pro' | 'Free Starter';
  memberSince: string;
  company?: string;
  role?: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  domain?: string;
}

export interface ResearchItem {
  id: string;
  query: string;
  type: 'question' | 'topic' | 'keyword' | 'website' | 'competitor' | 'industry';
  summary: string;
  keyFindings: string[];
  sources: ResearchSource[];
  relatedTopics: string[];
  recommendations: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
  imageUrl?: string;
  professionRole?: string;
}

export type ProfessionId = 
  | 'general_casual'
  | 'cs_student'
  | 'ai_engineer'
  | 'software_engineer'
  | 'it_admin'
  | 'css_aspirant'
  | 'school_college'
  | 'student' 
  | 'teacher' 
  | 'business' 
  | 'doctor' 
  | 'civil_engineer' 
  | 'mechanical_engineer' 
  | 'police' 
  | 'army' 
  | 'air_force' 
  | 'navy' 
  | 'retailer' 
  | 'general';

export interface ProfessionConfig {
  id: ProfessionId;
  title: string;
  urduTitle: string;
  subtitle: string;
  iconName: string;
  badgeColor: string;
  accentGradient: string;
  description: string;
  quickPrompts: { label: string; text: string; icon?: string }[];
  cameraCapability: string;
  specialBenefits: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  language: string;
  professionRole?: ProfessionId;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginSession {
  id: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}
