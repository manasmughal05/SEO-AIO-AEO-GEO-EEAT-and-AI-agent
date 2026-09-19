import { ChatSession, LoginSession, ResearchItem, UserProfile, WebsiteAudit } from '../src/types';
import { SEED_PROFESSIONAL_AUDITS } from './seedAudits';

// In-memory + file/state database structure for full-stack SaaS data persistence
export interface DatabaseState {
  users: Array<UserProfile & { passwordHash: string }>;
  websites: WebsiteAudit[];
  researches: ResearchItem[];
  chatSessions: ChatSession[];
  loginSessions: Record<string, LoginSession[]>;
}

// Pre-seeded professional default user
const defaultUser: UserProfile & { passwordHash: string } = {
  id: 'usr-default-01',
  name: 'Manas Mughal',
  email: 'manasmughal05@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  accountType: 'Professional',
  subscription: 'Free Open Access',
  memberSince: 'January 2025',
  company: 'Global Search Intelligence Labs',
  role: 'Chief AI Visibility Officer',
  passwordHash: 'argon2_hashed_secure_token_demo_9824',
};

const initialLoginSessions: LoginSession[] = [
  {
    id: 'sess-01',
    ip: '192.168.1.104 (Current)',
    device: 'MacBook Pro 16" (Apple Silicon)',
    browser: 'Chrome 124.0.0.0 (macOS)',
    location: 'Singapore, SG',
    lastActive: 'Just now',
    isCurrent: true,
  },
  {
    id: 'sess-02',
    ip: '103.255.4.12',
    device: 'iPhone 15 Pro Max',
    browser: 'Mobile Safari 17.4',
    location: 'Tokyo, Japan',
    lastActive: '3 hours ago',
    isCurrent: false,
  },
  {
    id: 'sess-03',
    ip: '142.250.190.46',
    device: 'Windows Workstation',
    browser: 'Microsoft Edge 122.0',
    location: 'London, UK',
    lastActive: '2 days ago',
    isCurrent: false,
  },
];

// In-memory singleton database
class Database {
  private users: Array<UserProfile & { passwordHash: string }> = [defaultUser];
  private websites: WebsiteAudit[] = [];
  private researches: ResearchItem[] = [];
  private chatSessions: ChatSession[] = [];
  private tokens: Record<string, string> = {
    'demo_token_default_manas': defaultUser.id,
  };
  private loginSessions: Record<string, LoginSession[]> = {
    [defaultUser.id]: initialLoginSessions,
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial professional website audits
    this.websites = [...SEED_PROFESSIONAL_AUDITS];

    // Seed initial research items
    this.researches = [
      {
        id: 'res-seed-01',
        query: 'Answer Engine Optimization (AEO) vs Traditional SEO 2026',
        type: 'topic',
        summary: 'Answer Engine Optimization (AEO) focuses on structuring data for direct conversational retrieval by generative engines such as Perplexity, Google AI Overviews, and SearchGPT, whereas traditional SEO prioritized rank position #1 on SERP blue links.',
        keyFindings: [
          'AEO requires direct, 40-word concise definitions directly beneath H2 question headers.',
          'Schema.org FAQPage and HowTo markups increase inclusion odds by 340%.',
          'AI search models evaluate quotation readiness and semantic density.',
          'Brand entity graph associations in Wikidata and Google Knowledge Graph are critical for citation confidence.',
        ],
        sources: [
          { title: 'Search Engine Journal AEO Report', url: 'https://searchenginejournal.com', snippet: 'Modern generative engine optimization patterns.', domain: 'searchenginejournal.com' },
          { title: 'Google Search Central Documentation', url: 'https://developers.google.com/search', snippet: 'Guidelines on structured data and entity parsing.', domain: 'developers.google.com' },
        ],
        relatedTopics: ['GEO Strategies', 'Entity Graph Modeling', 'E-E-A-T Signal Reinforcement', 'Conversational Schema'],
        recommendations: [
          'Add question-based headings on all top 20 traffic landing pages.',
          'Include verifiable numeric benchmarks in the opening paragraph of case studies.',
          'Implement full JSON-LD Breadcrumbs and Organization schema.',
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    // Seed initial chat session
    this.chatSessions = [
      {
        id: 'chat-seed-01',
        title: 'Optimizing E-E-A-T and AEO Signals',
        language: 'English',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'How do I ensure my website is cited by Perplexity and Google AI Overviews?',
            timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: `To maximize your citations in Answer Engines (Perplexity, Google AI Overviews, and ChatGPT), implement these core pillars:\n\n1. **Direct Answer Paragraphs**: Place a concise 40–60 word answer directly beneath every question-based H2/H3 heading.\n2. **Entity-Rich Schema Markup**: Embed \`FAQPage\`, \`Article\`, and \`Person\` schemas in JSON-LD.\n3. **Verifiable Primary Data**: Include quantitative statistics, original research percentages, and quotation markers.\n4. **Robust E-E-A-T**: Feature explicit author bylines with links to verifiable professional credentials (e.g., LinkedIn, industry publications).`,
            timestamp: new Date(Date.now() - 3600000 * 3.9).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 3.9).toISOString(),
      },
    ];
  }

  // User methods
  public getUserById(id: string): UserProfile | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...profile } = user;
    return profile;
  }

  public getUserByEmail(email: string) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return this.users.find(u => u.email.trim().toLowerCase() === normalized) || null;
  }

  public createSessionToken(userId: string): string {
    const token = `tok_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.tokens[token] = userId;
    return token;
  }

  public getUserByToken(token: string): UserProfile | null {
    if (!token) return null;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    if (cleanToken === 'demo_token_default_manas') {
      return this.getUserById(defaultUser.id);
    }
    const userId = this.tokens[cleanToken];
    if (userId) {
      return this.getUserById(userId);
    }
    // Also support token format prefixing userId
    if (cleanToken.startsWith('tok_usr-')) {
      const parts = cleanToken.split('_');
      if (parts[1]) {
        const user = this.getUserById(parts[1]);
        if (user) return user;
      }
    }
    return null;
  }

  public removeToken(token: string): void {
    if (!token) return;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    delete this.tokens[cleanToken];
  }

  public createUser(name: string, email: string, passwordHash: string) {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: UserProfile & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || cleanEmail.split('@')[0] || 'Member',
      email: cleanEmail,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`,
      accountType: 'Professional',
      subscription: 'Free Starter',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      company: 'Search & Visibility Enterprise',
      role: 'Growth & Optimization Specialist',
      passwordHash: passwordHash || 'hashed_pwd_default',
    };
    this.users.push(newUser);
    this.loginSessions[newUser.id] = [
      {
        id: `sess-${Date.now()}`,
        ip: '127.0.0.1 (Current Session)',
        device: 'Web Client',
        browser: 'Browser Session',
        location: 'Verified Location',
        lastActive: 'Just now',
        isCurrent: true,
      },
    ];
    const { passwordHash: _, ...profile } = newUser;
    return profile;
  }

  public updateProfile(id: string, updates: Partial<UserProfile>) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    const { passwordHash, ...profile } = this.users[userIndex];
    return profile;
  }

  public updatePassword(id: string, newHash: string) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    this.users[userIndex].passwordHash = newHash;
    return true;
  }

  public getSessions(userId: string): LoginSession[] {
    return this.loginSessions[userId] || [];
  }

  // Website Audits
  public getAllAudits(): WebsiteAudit[] {
    return this.websites;
  }

  public getAuditById(id: string): WebsiteAudit | null {
    return this.websites.find(w => w.id === id) || null;
  }

  public saveAudit(audit: WebsiteAudit): WebsiteAudit {
    const existingIndex = this.websites.findIndex(w => w.id === audit.id);
    if (existingIndex >= 0) {
      this.websites[existingIndex] = audit;
    } else {
      this.websites.unshift(audit);
    }
    return audit;
  }

  public deleteAudit(id: string): boolean {
    const initialLen = this.websites.length;
    this.websites = this.websites.filter(w => w.id !== id);
    return this.websites.length < initialLen;
  }

  // Research
  public getAllResearches(): ResearchItem[] {
    return this.researches;
  }

  public saveResearch(item: ResearchItem): ResearchItem {
    this.researches.unshift(item);
    return item;
  }

  public deleteResearch(id: string): boolean {
    const initialLen = this.researches.length;
    this.researches = this.researches.filter(r => r.id !== id);
    return this.researches.length < initialLen;
  }

  // Chat
  public getChatSessions(): ChatSession[] {
    return this.chatSessions;
  }

  public getChatSessionById(id: string): ChatSession | null {
    return this.chatSessions.find(c => c.id === id) || null;
  }

  public saveChatSession(session: ChatSession): ChatSession {
    const idx = this.chatSessions.findIndex(c => c.id === session.id);
    if (idx >= 0) {
      this.chatSessions[idx] = session;
    } else {
      this.chatSessions.unshift(session);
    }
    return session;
  }

  public deleteChatSession(id: string): boolean {
    const initLen = this.chatSessions.length;
    this.chatSessions = this.chatSessions.filter(c => c.id !== id);
    return this.chatSessions.length < initLen;
  }
}

export const db = new Database();
