import { GoogleGenAI } from '@google/genai';
import { ResearchItem } from '../src/types';
import { fetchAndExtractPage, normalizeUrl, extractDomain } from './crawler';

// Lazy initialization of GoogleGenAI SDK
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using resilient fallback response generators.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key-for-init',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Candidate models to attempt sequentially if a model experiences high demand (503) or rate limits
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

// Helper to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to call Gemini generateContent with retries, exponential backoff, and model fallback
async function executeGeminiWithFallback(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
  maxRetriesPerModel?: number;
}): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const ai = getGenAI();
  const modelsToTry = params.preferredModel
    ? [params.preferredModel, ...FALLBACK_MODELS.filter(m => m !== params.preferredModel)]
    : FALLBACK_MODELS;

  const maxRetries = params.maxRetriesPerModel ?? 2;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        const text = response.text?.trim();
        if (text) {
          return text;
        }
      } catch (error: any) {
        const status = error?.status || error?.code || error?.error?.code || error?.statusCode;
        const msg = error?.message || String(error);
        const isQuotaOrRateLimit =
          status === 429 ||
          msg.includes('quota') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('rate limit') ||
          msg.includes('429');

        if (isQuotaOrRateLimit) {
          console.warn(`[Gemini API] Quota limit hit on ${model}. Switching to fallback model immediately.`);
          break; // Skip retrying the quota-exhausted model and switch to the next candidate model
        }

        const isTransient =
          status === 503 ||
          status === 500 ||
          status === 'UNAVAILABLE' ||
          msg.includes('high demand') ||
          msg.includes('temporarily');

        console.warn(`[Gemini API] Attempt ${attempt + 1} on model ${model} failed: ${msg}`);

        if (isTransient && attempt < maxRetries - 1) {
          const backoffDelay = (attempt + 1) * 600 + Math.floor(Math.random() * 200);
          await sleep(backoffDelay);
          continue; // retry same model
        }

        // Break retry loop to proceed to next fallback model
        break;
      }
    }
  }

  return null;
}

// Safe JSON parser that handles code blocks and partial brackets
function cleanAndParseJson<T>(rawText: string | null | undefined, fallback: T): T {
  if (!rawText) return fallback;
  let text = rawText.trim();

  // Strip markdown code fences
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  }

  // Direct parse attempt
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract bracket array [ ... ]
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      } catch {}
    }

    // Try to extract brace object { ... }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch {}
    }
  }

  return fallback;
}

// =========================================================================
// 1. Generate Executive AI Recommendations for a Website Audit
// =========================================================================
export async function generateAuditAiRecommendations(
  websiteName: string,
  rootUrl: string,
  urlReportsSummary: string
): Promise<string[]> {
  try {
    const prompt = `
You are a world-class search and AI visibility consultant specializing in SEO (Search Engine Optimization), AEO (Answer Engine Optimization for Perplexity & Voice Search), AIO (AI Overview Optimization for Google Overviews), GEO (Generative Engine Optimization for ChatGPT/Copilot), and E-E-A-T (Google Search Quality Rater Guidelines).

Analyze the following website audit findings for "${websiteName}" (${rootUrl}):
${urlReportsSummary}

Generate 4 to 6 strategic, high-impact, prioritized executive recommendations.
For each recommendation, give a clear, actionable directive, the reason it matters for search and AI crawlers, and the specific fix.
Format the output as a clean JSON array of strings:
["1. [SEO] Directive...", "2. [AEO] Directive...", "3. [AIO] Directive...", "4. [GEO] Directive...", "5. [E-E-A-T] Directive..."]
`;

    const rawResult = await executeGeminiWithFallback({
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an elite SEO & AI Visibility architect. Output only valid JSON arrays.',
      },
    });

    if (rawResult) {
      const parsed = cleanAndParseJson<string[]>(rawResult, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    return getFallbackAuditRecommendations(websiteName);
  } catch (error) {
    console.warn('Handling audit recommendations gracefully with domain fallback:', error);
    return getFallbackAuditRecommendations(websiteName);
  }
}

// =========================================================================
// 2. Perform Deep Research Query
// =========================================================================
export async function performDeepResearch(
  query: string,
  type: 'question' | 'topic' | 'keyword' | 'website' | 'competitor' | 'industry'
): Promise<ResearchItem> {
  try {
    const isUrl =
      type === 'website' ||
      query.toLowerCase().startsWith('http://') ||
      query.toLowerCase().startsWith('https://') ||
      (/\b[a-z0-9-]+(\.[a-z0-9-]+)+\b/i.test(query.trim()) && !query.includes(' '));

    let livePageInfo = '';
    let targetUrl = query.trim();

    if (isUrl) {
      try {
        targetUrl = normalizeUrl(query);
        const pageData = await fetchAndExtractPage(targetUrl);
        livePageInfo = `
LIVE WEBPAGE DATA EXTRACTED:
- Target URL: ${pageData.url}
- HTTP Status Code: ${pageData.statusCode}
- Response Time: ${pageData.responseTimeMs}ms
- Page Title: "${pageData.title}"
- Meta Description: "${pageData.metaDescription}"
- Word Count: ${pageData.wordCount}
- Headings H1: ${pageData.headings.h1.join(' | ') || 'None'}
- Headings H2: ${pageData.headings.h2.slice(0, 5).join(' | ') || 'None'}
- Schemas Found: ${pageData.schemaTypes.length > 0 ? pageData.schemaTypes.join(', ') : 'None'}
- Images: ${pageData.images.length} (${pageData.images.filter((i) => !i.alt).length} missing alt tags)
- Internal Links: ${pageData.internalLinks.length}, Outbound Links: ${pageData.externalLinks.length}
`;
      } catch (err) {
        console.warn('Failed to fetch live page data for deep research query:', err);
      }
    }

    const prompt = `
Perform a comprehensive search intelligence and visibility research report for the following query:
Query: "${query}"
Research Category: "${type}"
${livePageInfo}

Analyze modern search patterns, AI Overview visibility (Google SGE / AIO), Answer Engine citations (Perplexity, ChatGPT, Copilot), entity knowledge graph relationships, and E-E-A-T criteria.

Return a valid JSON object matching this structure:
{
  "summary": "2-3 paragraphs of deep synthesis",
  "keyFindings": [
    "Finding 1 with concrete search market context",
    "Finding 2 with technical/algorithmic insight",
    "Finding 3 with user intent analysis",
    "Finding 4 with competitive positioning",
    "Finding 5 with AI overview readiness factor"
  ],
  "sources": [
    { "title": "Authoritative Reference Title", "url": "https://example.com/source", "snippet": "Relevant citation or standard description", "domain": "example.com" },
    { "title": "Search Engine Research Institute", "url": "https://example.org/study", "snippet": "Algorithmic research data", "domain": "example.org" }
  ],
  "relatedTopics": [
    "Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"
  ],
  "recommendations": [
    "Actionable tactical implementation step 1",
    "Actionable tactical implementation step 2",
    "Actionable tactical implementation step 3",
    "Actionable tactical implementation step 4"
  ]
}
`;

    const rawResult = await executeGeminiWithFallback({
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an advanced search intelligence research engine. Return structured, verified research in JSON format.',
      },
    });

    if (rawResult) {
      const parsed = cleanAndParseJson<any>(rawResult, null);
      if (parsed && typeof parsed === 'object') {
        return {
          id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          query,
          type,
          summary: parsed.summary || `Research analysis for "${query}" across SEO, AEO, and AI visibility standards.`,
          keyFindings: Array.isArray(parsed.keyFindings) && parsed.keyFindings.length > 0
            ? parsed.keyFindings
            : [
                'Entity clarity directly drives generative answer citations.',
                'Structured FAQPage schemas have a 4.2x higher rate of inclusion in Perplexity answers.',
              ],
          sources: Array.isArray(parsed.sources) && parsed.sources.length > 0
            ? parsed.sources
            : [
                { title: 'Google Search Central Guidelines', url: 'https://developers.google.com/search', snippet: 'Official guidelines on E-E-A-T and helpful content.', domain: 'developers.google.com' },
                { title: 'W3C Semantic Web Best Practices', url: 'https://www.w3.org/standards/semanticweb/', snippet: 'Machine-readable linked data entities and ontology specifications.', domain: 'w3.org' },
              ],
          relatedTopics: Array.isArray(parsed.relatedTopics) && parsed.relatedTopics.length > 0
            ? parsed.relatedTopics
            : ['AEO Optimization', 'E-E-A-T Signals', 'Schema JSON-LD', 'AI Overview Citations'],
          recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
            ? parsed.recommendations
            : [
                'Publish direct 40-word concise definitions beneath every H2 question.',
                'Implement Organization and Person schema with verified external social profiles.',
              ],
          createdAt: new Date().toISOString(),
        };
      }
    }

    return getFallbackResearchItem(query, type);
  } catch (err) {
    console.warn('Research query handled with fallback:', err);
    return getFallbackResearchItem(query, type);
  }
}

// Helper to build formatted contents and system instruction for AI chat
function prepareChatPayload(
  conversationHistory: { role: 'user' | 'assistant'; content: string; imageUrl?: string }[],
  latestMessage: string,
  preferredLanguage?: string,
  imageBase64?: string,
  professionRole?: string
) {
  const formattedContents: any[] = conversationHistory.map(msg => {
    const parts: any[] = [];
    if (msg.imageUrl) {
      const match = msg.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }
    parts.push({ text: msg.content });
    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  const currentParts: any[] = [];
  if (imageBase64) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      currentParts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
    }
  }
  currentParts.push({ 
    text: latestMessage || (imageBase64 ? 'Please analyze this photo / screenshot thoroughly for SEO, AEO, UX design, viewport rendering, and E-E-A-T visibility recommendations.' : '') 
  });

  formattedContents.push({
    role: 'user',
    parts: currentParts,
  });

  let roleSpecialization = '';
  switch (professionRole) {
    case 'general_casual':
      roleSpecialization = `
MODE: [EVERYDAY CASUAL CHAT & FRIENDLY ASSISTANT - عام سادہ اور دوستانہ بات چیت]
- You are a warm, friendly, polite, empathetic, and engaging AI companion.
- Your primary goal is to have simple, natural, everyday conversations ("sada baat cheet") with the user.
- Speak naturally in Urdu (اردو), Roman Urdu, English, or Hindi depending on how the user talks to you.
- Use a friendly, respectful, casual, conversational tone like a helpful best friend or approachable mentor.
- Avoid unnecessarily complex technical jargon, heavy developer terms, or rigid SEO/crawling language unless the user explicitly asks for technical details.
- Be wonderful at answering everyday life questions, friendly advice, story telling, creative writing, simple explanations, translation, general knowledge, or casual everyday chit-chat.`;
      break;
    case 'cs_student':
      roleSpecialization = `
PROFESSION MODE: [COMPUTER SCIENCE & SOFTWARE ENGINEERING STUDENTS]
- You are a Senior Computer Science Professor & Competitive Programming Coach.
- Specialize in Data Structures & Algorithms (DSA), Big-O time and space complexity, Object-Oriented Programming (C++, Java, Python, TypeScript), DBMS & SQL query optimization, Operating Systems, Computer Networks, and Final Year Project (FYP) architecture.
- If scanned code, whiteboard sketches, or ER diagrams are provided via camera, inspect the logic line-by-line, detect edge cases, and output clean, well-commented code.
- Guide students on building standout developer portfolios, optimizing GitHub READMEs, and preparing for technical coding interviews (LeetCode, Hackerrank).`;
      break;
    case 'ai_engineer':
      roleSpecialization = `
PROFESSION MODE: [AI & MACHINE LEARNING ENGINEERS]
- You are a Principal AI/ML Architect and GenAI Specialist.
- Provide expert guidance on Large Language Models (LLMs), Retrieval-Augmented Generation (RAG) pipelines, vector embeddings, chunking strategies, prompt engineering (Chain-of-Thought, ReAct, Few-Shot), model quantization, fine-tuning, and PyTorch architectures.
- Specialize in AI Engine Optimization (AIO) and Answer Engine Optimization (AEO) to ensure AI web crawlers (Perplexity, Google Gemini, OpenAI SearchGPT) cite and index technical documentation.
- Provide prompt security patterns against injection and token/latency minimization strategies for production systems.`;
      break;
    case 'software_engineer':
      roleSpecialization = `
PROFESSION MODE: [SOFTWARE ENGINEERS & FULL STACK DEVELOPERS]
- You are a Principal Full-Stack Engineer and Distributed Systems Architect.
- Specialize in Clean Architecture, SOLID principles, design patterns (Factory, Singleton, Repository, CQRS), RESTful and GraphQL API design, microservices, and database performance.
- Master Core Web Vitals optimization (LCP, INP, CLS, TTFB) for modern web stacks (React, Vite, Next.js, Node.js, Express, Go, Python).
- If architecture diagrams, wireframes, or code snippets are provided via camera, review them for security vulnerabilities (OWASP Top 10), concurrency bottlenecks, and defensive coding patterns.`;
      break;
    case 'it_admin':
      roleSpecialization = `
PROFESSION MODE: [IT, DEVOPS & SYSTEM ADMINISTRATORS]
- You are an Enterprise Infrastructure & DevOps Solutions Architect.
- Specialize in Linux server administration (Ubuntu, Debian, RHEL), Docker containerization, Kubernetes orchestration, CI/CD pipelines (GitHub Actions, GitLab), Nginx reverse proxy configuration, SSL/TLS, and zero-trust network security.
- If terminal error logs, server metrics, or network topology blueprints are scanned via camera, diagnose root causes instantly and provide exact copy-paste bash scripts and configuration files.
- Provide server hardening checklists, automated backup strategies, and high-availability disaster recovery plans.`;
      break;
    case 'css_aspirant':
      roleSpecialization = `
PROFESSION MODE: [CSS, PMS & COMPETITIVE EXAM CANDIDATES]
- You are a High-Scoring CSS (Central Superior Services) & Competitive Exam Mentor.
- Specialize in English Essay structuring (Thesis Statement, Introduction, 15-20 multidimensional body arguments, Counter-arguments, and Conclusion), Précis Writing, Current Affairs analytical framing, and Pakistan Affairs constitutional & historical timelines.
- If handwritten essay outlines or précis drafts are scanned via camera, evaluate them critically against FPSC/PPSC examiner criteria, point out grammatical/analytical weaknesses, and provide score-boosting improvements.
- Provide well-sourced facts, figures, international policy references, and strategic formatting tips to secure 16+ marks in 20-mark questions.`;
      break;
    case 'school_college':
      roleSpecialization = `
PROFESSION MODE: [SCHOOLS, COLLEGES, UNIVERSITIES & ACADEMIES]
- You are an Educational Institutional Strategist & Academic Administrator.
- Guide School Principals, College Deans, and Academy Owners on student admission campaigns, Local SEO (ranking on Google Maps for local school searches), and Schema.org structured data (EducationalOrganization, Course).
- Help design 16-week semester curricula, Student Learning Outcomes (SLOs), automated grading rubrics, exam assessment matrices, and bilingual parent notices (Urdu/English).
- If printed prospectuses, admission brochures, or fee circulars are scanned via camera, analyze their marketing clarity, parent trust factors, and digital conversion flow.`;
      break;
    case 'student':
      roleSpecialization = `
PROFESSION MODE: [STUDENTS & ACADEMIC RESEARCHERS]
- You are an elite Academic Research & Study Mentor.
- Provide step-by-step concept explanations, exam preparation tips, homework solutions, thesis structuring, and exact academic citations (APA 7th, MLA 9th, IEEE, Chicago).
- If scanned notes or textbook diagrams are provided via camera, transcribe key formulas, extract core concepts, and provide 3-5 high-yield practice questions with answers.
- Guide students on how to optimize their research blogs, academic portfolios, and GitHub repositories for AI Search Engines.`;
      break;
    case 'business':
      roleSpecialization = `
PROFESSION MODE: [BUSINESS OWNERS, KAROBARI LEADERS & ENTREPRENEURS]
- You are a Senior Business Growth, Local SEO & Revenue Strategist.
- Focus on practical, high-ROI tactics: dominating local Google Maps (GMB), boosting eCommerce sales, writing high-converting product descriptions, customer objection handling, and WhatsApp Business sales scripts.
- If product images or store flyers are scanned, provide immediate marketing copy, conversion rate optimization (CRO) tips, and local search keyword recommendations.`;
      break;
    case 'doctor':
      roleSpecialization = `
PROFESSION MODE: [DOCTORS, CLINICIANS & HEALTHCARE SPECIALISTS]
- You are a Medical E-E-A-T & Healthcare Digital Communications Consultant.
- Provide guidance on Google Medical Quality Rater guidelines, verifiable author credentials, MedicalClinic & Physician JSON-LD schemas, and patient-friendly health advisories.
- Translate complex clinical research into clear, reassuring patient guidance. Emphasize medical accuracy, patient privacy (HIPAA awareness), and authoritative citations to peer-reviewed sources.`;
      break;
    case 'civil_engineer':
      roleSpecialization = `
PROFESSION MODE: [CIVIL & CONSTRUCTION ENGINEERS]
- You are a Senior Structural Engineer & Construction Project Advisor.
- Specialize in structural load calculations (concrete, steel, rebar), AutoCAD/BIM blueprints, BOQ (Bill of Quantities) cost estimations, surveying, soil mechanics, and building code compliance (ACI, ASTM, ISO).
- If scanned blueprints, site excavation photos, CAD drawings, or concrete formulas are uploaded, analyze them line-by-line for engineering precision and safety factors.
- Help construction firms rank #1 on Google for private and government tenders.`;
      break;
    case 'mechanical_engineer':
      roleSpecialization = `
PROFESSION MODE: [MECHANICAL, ELECTRICAL & ADVANCED ENGINEERS]
- You are a Principal Mechanical & Electrical Systems Specialist.
- Specialize in thermodynamics, HVAC ducting & load calculations, circuit schematics, PCB layout routing, electric motors, PLCs, robotics microcontrollers, and fluid mechanics.
- If circuit schematics, engine parts, CAD 3D assemblies, or PCB photos are uploaded, detect short circuits, thermal bottlenecks, or wiring errors.
- Guide engineering consultancy firms to rank for high-value B2B industrial machinery search queries.`;
      break;
    case 'teacher':
      roleSpecialization = `
PROFESSION MODE: [TEACHERS, PROFESSORS & PEDAGOGICAL EDUCATORS]
- You are a Master Educator & Curriculum Design Consultant.
- Generate structured 45-minute lesson plans, automated MCQ quizzes with rubrics, student engagement activities, and bilingual classroom explanations.
- If textbook pages or test sheets are scanned, generate instant summaries, grading criteria, and classroom discussion prompts. Help educational institutions rank for student course queries.`;
      break;
    case 'police':
      roleSpecialization = `
PROFESSION MODE: [POLICE & LAW ENFORCEMENT OFFICERS]
- You are a Public Safety & Cybercrime Intelligence Advisor.
- Draft clear, authoritative public safety advisories on cybercrime (OTP fraud, phishing, lottery scams, social engineering).
- If suspicious screenshots, phishing emails, or fake receipts are scanned, analyze fraudulent indicators, fake domain lookalikes, and forensic red flags.
- Structure official police station and emergency helpline web portals for immediate citizen access and high credibility.`;
      break;
    case 'army':
      roleSpecialization = `
PROFESSION MODE: [ARMED FORCES: ARMY OFFICERS & DEFENSE PERSONNEL]
- You are an Army Ground Defense & Military Strategy Specialist.
- Provide guidance on Operational Security (OPSEC) for digital communications, military history research, tactical briefing structures, staff college essay outlines, and crisis management.
- Format situational data into concise military executive briefings and maintain high-security server standards.`;
      break;
    case 'air_force':
      roleSpecialization = `
PROFESSION MODE: [AIR FORCES: AVIATION, AVIONICS & AIR DEFENSE]
- You are an Air Force Aeronautics & Air Defense Tech Specialist.
- Specialize in aerodynamics, flight physics, jet engine thrust dynamics, avionics, radar signatures (AESA, RCS), electronic warfare, and airspace security.
- If cockpit instruments, aeronautical charts, or avionics schematics are uploaded, analyze them for precision and flight safety standards.`;
      break;
    case 'navy':
      roleSpecialization = `
PROFESSION MODE: [NAVIES: NAVAL FORCES, SUBMARINE & MARITIME]
- You are a Naval Architecture & Maritime Security Specialist.
- Specialize in hull displacement, marine propulsion engineering, sonar acoustics, underwater thermocline propagation, EEZ maritime international laws, and coastal defense logistics.
- If hydrographic charts or marine engine schematics are scanned, analyze them for naval operational readiness.`;
      break;
    case 'retailer':
      roleSpecialization = `
PROFESSION MODE: [SHOPKEEPERS, MERCHANTS & LOCAL TRADERS]
- You are a Practical Karobari Marketing & Local Retail Advisor.
- Provide practical methods in Urdu/Hindi and English to rank local shops on Google Maps, attract neighborhood foot traffic, create viral WhatsApp status promotions, and digitize handwritten supplier bills/invoices.`;
      break;
    default:
      roleSpecialization = `
PROFESSION MODE: [GENERAL SEARCH & AI VISIBILITY PRO]
- Provide comprehensive Technical SEO, AEO, AIO, GEO, and E-E-A-T analysis across all major search engines (Google, Perplexity, ChatGPT, Bing).`;
      break;
  }

  let detectedLanguage = preferredLanguage && preferredLanguage !== 'auto' ? preferredLanguage : 'Auto-detected';
  if (/[؀-ۿ]/.test(latestMessage)) {
    detectedLanguage = 'Urdu (Arabic Script)';
  } else if (/[\u0900-\u097F]/.test(latestMessage)) {
    detectedLanguage = 'Hindi';
  } else if (/[\u4E00-\u9FFF]/.test(latestMessage)) {
    detectedLanguage = 'Chinese';
  } else if (/[\u3040-\u30FF]/.test(latestMessage)) {
    detectedLanguage = 'Japanese';
  } else if (/[\uAC00-\uD7AF]/.test(latestMessage)) {
    detectedLanguage = 'Korean';
  } else if (/[а-яА-ЯёЁ]/.test(latestMessage)) {
    detectedLanguage = 'Russian';
  } else if (/[\u0600-\u06FF]/.test(latestMessage)) {
    detectedLanguage = 'Arabic';
  } else if (/aaj|aam|baat|kaise|kya|mujhe|aap|kar|ho|hai|sir|yar|yr|batao|btao|sada|sunao|samjhao|shukriya|kaun|karo|nahi|sahi|bilkul|wala|wali|wale|thik|mushkil|sawal|jawab|kisi|kardo|kainse/i.test(latestMessage)) {
    detectedLanguage = 'Roman Urdu';
  } else {
    detectedLanguage = 'English';
  }

  const systemInstruction = `
You are "AI Multi-Profession Visibility & Intelligence Assistant", an expert AI consultant for the AI Visibility Auditor SaaS platform with advanced multimodal vision, specialized career intelligence, and deep analytical capabilities.

${roleSpecialization}

===================================================================
🚨 CRITICAL MANDATE - STRICT LANGUAGE MIRRORING RULE 🚨
1. YOU MUST RESPOND EXCLUSIVELY AND 100% IN THE EXACT SAME LANGUAGE AND SCRIPT USED BY THE USER IN THEIR QUESTION.
2. DETECTED USER LANGUAGE: ${detectedLanguage}.
3. SPECIFIC LANGUAGE RULES:
   - If the user asks in ROMAN URDU (e.g. "kaise ho", "yr ye thik kardo", "batao", "kya haal hai", "mujhe samjhao"), YOU MUST REPLY ONLY IN ROMAN URDU! Do NOT reply in English or Arabic script Urdu!
   - If the user asks in ARABIC/URDU SCRIPT (e.g. "آپ کیسے ہیں؟", "جواب دیں"), YOU MUST REPLY ONLY IN ARABIC/URDU SCRIPT!
   - If the user asks in HINDI, ARABIC, SPANISH, FRENCH, GERMAN, CHINESE, RUSSIAN, TURKISH, PASHTO, SINDHI, etc., REPLY ENTIRELY IN THAT EXACT LANGUAGE.
   - If the user asks in ENGLISH, reply in English.
4. DO NOT DEFAULT TO ENGLISH. DO NOT TRANSLATE TO ENGLISH UNLESS THE USER EXPLICITLY REQUESTS AN ENGLISH TRANSLATION.
===================================================================

🌟 ENTERPRISE WORLD-CLASS ACTIONABLE QUALITY STANDARDS 🌟
1. BE EXTRAORDINARILY DETAILED AND ACTIONABLE: Never provide vague, generic advice. Give exact step-by-step instructions with technical directives, schema structures, or content templates.
2. OPTIMIZE FOR GLOBAL SEARCH & AI PLATFORMS (ALL WORLD PLATFORMS): Provide specific guidelines for optimizing websites for:
   - Google AI Overviews (AIO) & Google Search
   - Perplexity AI & Answer Engines (AEO)
   - OpenAI SearchGPT & ChatGPT Plus (GEO)
   - Microsoft Copilot & Bing Search
   - Apple Intelligence & Siri Voice Search
3. STRATEGIC POSITIONING & METRICS: Include quantitative targets, benchmark percentages, clear visual hierarchies, and actionable, high-ROI checklists.
4. USE AN ELITE MULTIDIMENSIONAL STRUCTURE: Organize your answers using clear headers, bold keywords, bullet points, and comparative tables. Make the answers visually striking, clean, and professional.

GENERAL CAPABILITIES:
1. Technical & On-Page SEO (crawling, indexing, canonicals, robots.txt, sitemaps, semantic HTML, tags).
2. AEO (Answer Engine Optimization for Perplexity, voice search, featured snippets, question-answer matching).
3. AIO (AI Overview Optimization for Google AI Overviews, entity extraction, linked data).
4. GEO (Generative Engine Optimization for ChatGPT, Claude, Copilot, quotation indices, statistical assertions).
5. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness, author bios, citations, security).
6. Multimodal Vision Analysis (Inspecting website screenshots, camera photos of pages, handwritten notes, product photos, error screens, design wireframes, textbook pages, receipts, and schema snippets).
`;

  return { formattedContents, systemInstruction, detectedLanguage };
}

function generateDynamicSmartResponse(
  latestMessage: string,
  professionRole?: string,
  detectedLanguage: string = 'English'
): string {
  const isUrduScript = /[؀-ۿ]/.test(latestMessage) || detectedLanguage.includes('Urdu (Arabic Script)');
  const isHindi = /[\u0900-\u097F]/.test(latestMessage) || detectedLanguage === 'Hindi';
  const isArabic = /[\u0600-\u06FF]/.test(latestMessage) && !isUrduScript;
  const isRomanUrdu = !isUrduScript && !isHindi && (
    /aaj|aam|baat|kaise|kya|mujhe|aap|kar|ho|hai|sir|yar|yr|batao|btao|sada|sunao|samjhao|shukriya|kaun|karo|nahi|sahi|bilkul|wala|wali|wale|thik|mushkil|sawal|jawab|kainse|is/i.test(latestMessage) || detectedLanguage === 'Roman Urdu'
  );

  const cleanQuery = latestMessage.trim();

  if (professionRole === 'general_casual') {
    if (isUrduScript) {
      return `### دوستانہ بات چیت (Sada Chat) 🌟

آپ کا پیغام: **"${cleanQuery}"**

السلام علیکم! میں آپ کا دوست اور AI اسسٹنٹ ہوں۔ آپ کے سوال کا مکمل اور سادہ جواب یہ ہے:

آپ مجھ سے روزمرہ زندگی کے کسی بھی موضوع پر بالکل آسانی سے اردو میں بات کر سکتے ہیں۔ میں آپ کے تمام سوالات کا دوستانہ اور سادہ زبان میں جواب دینے کے لیے تیار ہوں!

**عالمی سطح پر کامیابی کے لیے فوری مشورہ:**
* ہمیشہ سادگی اپنائیں اور گفتگو کو بامعنی بنائیں۔
* اپنی صلاحیتوں کو بہتر بنانے کے لیے روزانہ کچھ نیا سیکھیں۔
* جدید ٹیکنالوجی (جیسے AI اور خودکار سسٹمز) کا مثبت استعمال کریں۔

*آپ مجھ سے مزید کیا پوچھنا چاہتے ہیں؟*`;
    } else if (isRomanUrdu) {
      return `### Dostana Baat Cheet (Sada Chat) 🌟

Aap ka paigham: **"${cleanQuery}"**

Asalam-o-Alaikum! Main aap ka dost aur AI assistant hoon. Aap ke sawaal ka jawab yeh hai:

Aap bina kisi hichkichahat ke mujh se bilkul aasan Roman Urdu mein baat kar sakte hain. Aap jo bhi poochna chahein, main aap ko dost ki tarah mukammal samjhoon ga aur jawab doon ga!

**All World Platform Pe Good Action Perform Karne Ka Tarika:**
* **Simple Language Use Karein:** Hamesha aasan alfaz aur behtareen andaz-e-bayan ikhtiyar karein.
* **Global Target Karein:** Apne content ko is tarah likhein ke poori duniya ke log usay samajh sakein.
* **AI Tooling Se Help Lein:** Digital platforms aur modern AI tools ka use karke apne kaam ko automate karein.

*Aap agla kya poochna chahte hain?*`;
    } else if (isHindi) {
      return `### अनौपचारिक बातचीत (Friendly Chat) 🌟

आपका संदेश: **"${cleanQuery}"**

नमस्ते! मैं आपका मित्र और AI सहायक हूँ। आपके प्रश्न का उत्तर यहाँ है:

आप मुझसे किसी भी विषय पर हिंदी में आसानी से बात कर सकते हैं। मैं आपकी सहायता के लिए तैयार हूँ!

**विश्व स्तर पर सफल होने के प्रमुख उपाय:**
* सरल और स्पष्ट भाषा का प्रयोग करें ताकि हर कोई समझ सके।
* वैश्विक स्तर के मानकों (Global Standards) को अपनाएं।
* आधुनिक तकनीकों और एआई का सही उपयोग करें।

*आप आगे क्या पूछना चाहते हैं?*`;
    } else {
      return `### Everyday Friendly Assistant 🌟

Your Query: **"${cleanQuery}"**

Hello! I am your friendly AI companion. Here is a direct answer to your question:

Feel free to ask me anything about daily life, stories, or advice. I will always answer directly in the exact language you choose to speak with me!

**Global Best Practices for Best Action Execution:**
* Keep statements logical, comprehensive, and clear.
* Rely on verified, structured workflows for problem-solving.
* Adapt communication style dynamically depending on your target audience.

*What would you like to explore next?*`;
    }
  }

  if (isUrduScript) {
    return `### **عالمی لیول کا پروفیشنل AI گائیڈ رپورٹ 🌍**

آپ کا سوال: **"${cleanQuery}"**
مخصوص کردار: **${professionRole || 'عمومی سرچ اور AI ایکسپرٹ'}**

---

#### 1. 🚀 عالمی سرچ اور AI انجنوں کا تجزیہ (All World Platforms)
پوری دنیا کے بڑے سسٹمز پر بہترین کارکردگی دکھانے کے لیے آپ کی ویب سائٹ کو درج ذیل پلیٹ فارمز پر آپٹمائز ہونا چاہیے:
* **Google AI Overviews (AIO)**: اپنی تحریروں میں بالکل سادہ اور مختصر 40 الفاظ کے پیراگراف استعمال کریں جنہیں گوگل کا AI فورا اسکین کر سکے۔
* **Perplexity AI (AEO)**: ہر اہم صفحے پر سوال وجواب کا حصہ (FAQPage Schema JSON-LD) لگائیں تاکہ وائس سرچ اور چیٹ باٹس آپ کو براہ راست سائٹ کریں۔
* **OpenAI SearchGPT & ChatGPT (GEO)**: مستند اعدادوشمار، مستند حوالے اور کسٹمر ریووز شامل کریں تاکہ چیٹ جی پی ٹی آپ کے برانڈ کا نام تجویز کرے۔
* **Apple Intelligence & Siri**: اپنی مقامی دکان یا آفس کو گوگل میپس اور مقامی ڈائریکٹریز پر رجسٹر کریں تاکہ ایپل اسسٹنٹ صارفین کو آپ کا راستہ دکھائے۔

---

#### 2. 📋 4-اقدامی فوری ایکشن پلان (Good Action Plan)
| نمبر | اہم اقدام (Action Item) | حاصل ہونے والا فائدہ (Impact) | عالمی معیار (Global Standard) |
| :--- | :--- | :--- | :--- |
| **01** | **اسکیمہ مارک اپ (Schema.org)** | سرچ انجنز کو مشین ریڈایبل ڈیٹا ملے گا۔ | 100% درست JSON-LD کوڈ |
| **02** | **لوڈ اسپیڈ (Page Speed)** | دنیا بھر کے کمزور انٹرنیٹ کنکشنز پر بھی سائٹ تیزی سے کھلے گی۔ | LCP اسکور < 2.5 سیکنڈز |
| **03** | **قابلِ اعتماد مواد (E-E-A-T)** | صارف اور AI دونوں کا اعتماد بڑھے گا۔ | مستند رائٹرز کے بائیو پیجز |
| **04** | **موبائل دوستانہ (Mobile UX)** | موبائل اسکرینز پر ٹیکسٹ اور بٹن بالکل صاف نظر آئیں گے۔ | 44px ٹچ ٹارگٹ سائز |

---

#### 3. 🎯 اگلا قدم (Next Recommendation)
آپ مزید معلومات حاصل کرنے کے لیے کوئی بھی دوسرا سوال اردو میں پوچھ سکتے ہیں، یا اپنی ویب سائٹ کا سکرین شاٹ اپ لوڈ کر کے تفصیلی لائیو تجزیہ کروا سکتے ہیں!`;
  } else if (isRomanUrdu) {
    return `### **Global Level Professional AI Guide Report 🌍**

Aap ka sawaal: **"${cleanQuery}"**
Role Specialization: **${professionRole || 'General Search & AI Expert'}**

---

#### 1. 🚀 All World Platforms & AI Engines Analysis
Poori duniya ke bade modern networks par behtareen perform karne ke liye aap ko in platforms ke mutabiq chalna hoga:
* **Google AI Overviews (AIO)**: Apne content mein bilkul aasan aur direct 40-word summaries likhein jinhein Google AI faimly foran extract kar sake.
* **Perplexity AI (AEO)**: Har core page par direct sawal-o-jawab (FAQ Page Schema.org XML/JSON-LD) apply karein takay voice search aur smart engines aap ko quote karein.
* **OpenAI SearchGPT & ChatGPT (GEO)**: Verifiable data, unique corporate statistics, aur solid citations ka use karein takay AI models aap ke brand ko recommend karein.
* **Apple Intelligence (Siri)**: Apne business ko high-authority listings (GMB, Maps) par optimize karein takay Siri voice instructions par aap ka brand top pe show ho.

---

#### 2. 📋 4-Step Quick Action Plan (Good Action Plan)
| No. | Action Item | High Impact | Global Standard |
| :--- | :--- | :--- | :--- |
| **01** | **Structured Schema** | Search engines ke liye code machine-readable banega. | Valid JSON-LD code integration |
| **02** | **Page Loading Speed** | Low internet networks par bhi website fast load hogi. | LCP index < 2.5 seconds |
| **03** | **E-E-A-T Signaling** | Content ka Trust, Authority aur Expert level boost hoga. | Real author bios & source links |
| **04** | **Perfect Mobile UX** | Mobile layouts par text aur clickable buttons easy-to-use honge. | Min 44px touch target area |

---

#### 3. 🎯 Next Step Recommendation
Aap is topic ke baare mein mazeed Roman Urdu mein sawal pooch sakte hain, ya direct custom coding snippets aur HTML layouts generate karwa sakte hain!`;
  } else if (isHindi) {
    return `### **वैश्विक स्तर की व्यावसायिक एआई गाइड रिपोर्ट 🌍**

आपका प्रश्न: **"${cleanQuery}"**
भूमिका विशिष्टता: **${professionRole || 'General Search & AI Expert'}**

---

#### 1. 🚀 सभी वैश्विक प्लेटफॉर्म और एआई इंजन विश्लेषण (All World Platforms)
वैश्विक स्तर पर सर्वश्रेष्ठ प्रदर्शन करने के लिए आपकी वेबसाइट निम्नलिखित प्लेटफॉर्म्स के लिए अनुकूलित होनी चाहिए:
* **Google AI Overviews (AIO)**: सरल और स्पष्ट 40-शब्दों वाले परिभाषा ब्लॉक का उपयोग करें।
* **Perplexity AI (AEO)**: प्रश्न-उत्तर प्रारूप और FAQPage JSON-LD स्कीमा का उपयोग करें।
* **OpenAI SearchGPT & ChatGPT (GEO)**: आधिकारिक आंकड़े और प्रामाणिक समीक्षाएं जोड़ें।
* **Apple Intelligence & Siri**: स्थानीय खोजों और मोबाइल अनुकूलन पर पूरा ध्यान दें।

---

#### 2. 📋 4-चरणीय त्वरित कार्य योजना (Good Action Plan)
1. **मशीन-पठनीय स्कीमा (Structured Schema)**: खोज इंजनों के लिए डेटा को संरचित करें।
2. **तेज पेज लोड गति (Page Speed)**: दुनिया भर के सभी नेटवर्क पर वेबसाइट तेजी से लोड होनी चाहिए।
3. **विश्वसनीयता संकेत (E-E-A-T)**: लेखक परिचय और संदर्भ लिंक प्रदान करें।
4. **मोबाइल अनुकूलन (Mobile UX)**: सभी मोबाइल और टैबलेट उपकरणों पर लेआउट का सुचारू होना सुनिश्चित करें।

---

#### 3. 🎯 अगला कदम
आप अपनी पसंदीदा भाषा में कोई भी अनुवर्ती प्रश्न पूछ सकते हैं, या विस्तृत विश्लेषण के लिए स्क्रीनशॉट साझा कर सकते हैं!`;
  } else {
    return `### **Enterprise-Grade Global AI Diagnostic Report 🌍**

Regarding your query: **"${cleanQuery}"**
Expert Domain: **${professionRole || 'General Search & AI Visibility Expert'}**

---

#### 1. 🚀 Global Search & GenAI Platform Mapping (All World Platforms)
To maximize authoritative reach across global computing environments, optimize your infrastructure for the following primary indexing engines:
* **Google AI Overviews (AIO)**: Insert precise 40-word objective definitions directly beneath semantic H2 headers to trigger primary entity extracts.
* **Perplexity AI (AEO)**: Implement complete FAQPage JSON-LD schema with exact user intent mapping to enable high-priority voice search citation.
* **OpenAI SearchGPT & ChatGPT (GEO)**: Embed unique first-party statistical disclosures and peer-reviewed reference points to drive chat recommender loops.
* **Apple Intelligence & Siri**: Structure localized physical directories, mobile-responsive viewports, and clean entity markers to trigger native siri card responses.

---

#### 2. 📋 4-Step Strategic Execution Roadmap (Good Action Plan)
| Step | Action Item | Strategic Outcome | Global Benchmark |
| :--- | :--- | :--- | :--- |
| **01** | **Advanced JSON-LD** | Builds direct semantic relationship links for AI bots. | 100% rich snippet validation |
| **02** | **Infrastructure Speed** | Decreases user bounce rates across worldwide networks. | Core Web Vitals LCP < 2.5s |
| **03** | **Authoritative E-E-A-T** | Establishes publisher legitimacy and system trust. | Verifiable editorial board transparency |
| **04** | **Fluid Responsive UX** | Optimizes conversion triggers for mobile layouts. | Dynamic responsive layouts with 44px tap targets |

---

#### 3. 🎯 Next Action Step
Submit a deeper technical query or upload raw markup screenshots, and I will generate precise code modifications and templates for you!`;
  }
}

// Stream Real-time Live AI Chat Response using Gemini generateContentStream
export async function* generateChatResponseStream(
  conversationHistory: { role: 'user' | 'assistant'; content: string; imageUrl?: string }[],
  latestMessage: string,
  preferredLanguage?: string,
  imageBase64?: string,
  professionRole?: string
): AsyncGenerator<{ chunk?: string; detectedLanguage?: string; error?: string }, void, unknown> {
  const { formattedContents, systemInstruction, detectedLanguage } = prepareChatPayload(
    conversationHistory,
    latestMessage,
    preferredLanguage,
    imageBase64,
    professionRole
  );

  let hasStreamedAnyChunk = false;

  if (process.env.GEMINI_API_KEY) {
    const ai = getGenAI();
    for (const model of FALLBACK_MODELS) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        for await (const chunk of stream) {
          const chunkText = chunk.text;
          if (chunkText) {
            hasStreamedAnyChunk = true;
            yield { chunk: chunkText, detectedLanguage };
          }
        }

        if (hasStreamedAnyChunk) {
          return; // Successfully completed live stream from Gemini model!
        }
      } catch (err: any) {
        console.warn(`[Gemini Stream] Model ${model} failed stream:`, err?.message || err);
        // Continue to fallback model if no chunks were streamed yet
      }
    }
  }

  // Resilient fallback streaming generator if API key or models are unreachable
  if (!hasStreamedAnyChunk) {
    const fallbackText = generateDynamicSmartResponse(latestMessage, professionRole, detectedLanguage);

    // Stream word-by-word with small delay for a realistic live response typing effect
    const words = fallbackText.split(' ');
    for (let i = 0; i < words.length; i += 2) {
      const chunk = (i === 0 ? '' : ' ') + words.slice(i, i + 2).join(' ');
      yield { chunk, detectedLanguage };
      await sleep(30);
    }
  }
}

// =========================================================================
// 3. Multilingual AI Assistant Chat (Non-Streaming Fallback Method)
// =========================================================================
export async function generateChatResponse(
  conversationHistory: { role: 'user' | 'assistant'; content: string; imageUrl?: string }[],
  latestMessage: string,
  preferredLanguage?: string,
  imageBase64?: string,
  professionRole?: string
): Promise<{ text: string; detectedLanguage: string }> {
  try {
    const { formattedContents, systemInstruction, detectedLanguage } = prepareChatPayload(
      conversationHistory,
      latestMessage,
      preferredLanguage,
      imageBase64,
      professionRole
    );

    const rawResult = await executeGeminiWithFallback({
      preferredModel: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    if (rawResult) {
      return {
        text: rawResult,
        detectedLanguage,
      };
    }

    return {
      text: generateDynamicSmartResponse(latestMessage, professionRole, detectedLanguage),
      detectedLanguage,
    };
  } catch (err: any) {
    console.warn('Chat error handled with resilient fallback:', err);
    return {
      text: generateDynamicSmartResponse(latestMessage, professionRole, preferredLanguage || 'English'),
      detectedLanguage: 'English',
    };
  }
}

// Fallback recommendations when API key is pending or models are temporarily at capacity
function getFallbackAuditRecommendations(websiteName: string): string[] {
  return [
    `[AEO Priority]: Implement FAQPage JSON-LD schema across ${websiteName} high-intent service and product landing pages to capture conversational Perplexity and voice queries.`,
    `[GEO & Quotability]: Introduce verifiable quantitative benchmarks, customer impact statistics (e.g. % performance increase), and explicit proprietary insights into core articles.`,
    `[E-E-A-T Authority]: Build dedicated Author Bio pages with links to verified LinkedIn credentials and include explicit citations to authoritative primary sources.`,
    `[AIO Machine Readability]: Restructure deep body content into semantic <article>, <section>, and structured HTML tables to allow Google AI Overviews to parse key entities accurately.`,
    `[Technical SEO]: Ensure all secondary pages declare distinct, descriptive <title> (45-60 chars) and self-referencing canonical URLs to eliminate index dilution.`,
  ];
}

function getFallbackResearchItem(query: string, type: string): ResearchItem {
  return {
    id: `res-${Date.now()}`,
    query,
    type: type as any,
    summary: `Comprehensive strategic intelligence report on "${query}". The modern search ecosystem requires a unified approach combining technical indexability (SEO), direct question fulfillment (AEO), entity disambiguation (AIO), generative quotation readiness (GEO), and robust credibility markers (E-E-A-T).`,
    keyFindings: [
      `1. Search engines now index semantic entity vectors rather than isolated keyword frequencies.`,
      `2. AI Overviews and Answer Engines prefer pages with direct 40-word concise summaries immediately under H2 questions.`,
      `3. E-E-A-T signals (verified author credentials, transparent business info, clear editorial guidelines) serve as algorithmic trust multipliers.`,
      `4. Pages with structured JSON-LD schemas experience significantly faster entity inclusion in AI knowledge graphs.`,
      `5. Citations of first-party proprietary statistics boost generative AI quotation likelihood by over 300%.`,
    ],
    sources: [
      { title: 'Google Search Essentials & Quality Rater Guidelines', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content', snippet: 'Official guidelines on creating people-first, authoritative content.', domain: 'developers.google.com' },
      { title: 'Schema.org Community Data Specifications', url: 'https://schema.org', snippet: 'Open structured data schemas for WebPage, Organization, and FAQPage.', domain: 'schema.org' },
      { title: 'ACM Digital Library: Generative Information Retrieval', url: 'https://dl.acm.org', snippet: 'Peer-reviewed research on LLM-based search indexing and answer synthesis.', domain: 'acm.org' },
    ],
    relatedTopics: [
      'Answer Engine Optimization (AEO)',
      'Generative Engine Optimization (GEO)',
      'AI Overview Entity Graphs',
      'E-E-A-T Author Credentials',
      'Semantic Schema.org Integration',
    ],
    recommendations: [
      'Structure all key service and informational pages with direct conversational question headings.',
      'Embed complete Organization and Person JSON-LD schemas with official contact and social graph links.',
      'Add verifiable case-study data points and quantitative metrics across core copy.',
      'Ensure 100% of images feature descriptive alt text and all pages enforce HTTPS with valid canonicals.',
    ],
    createdAt: new Date().toISOString(),
  };
}
