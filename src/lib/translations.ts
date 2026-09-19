export type SupportedLanguage = 'en' | 'ur' | 'es' | 'ar' | 'de' | 'ja';

export interface TranslationDictionary {
  brandName: string;
  heroTagline: string;
  heroSubtitle: string;
  startFreeAudit: string;
  launchDeepAudit: string;
  testingSites: string;
  clickCardTip: string;
  dashboard: string;
  addWebsite: string;
  myWebsites: string;
  urlExplorer: string;
  completeReports: string;
  researchCenter: string;
  aiAssistant: string;
  aiDirectives: string;
  exportReports: string;
  profileSettings: string;
  accountSecurity: string;
  crawlerRegion: string;
  targetRegionLabel: string;
  currentAuditSnapshot: string;
  overallScore: string;
  seoScore: string;
  aeoScore: string;
  aioScore: string;
  geoScore: string;
  eeatScore: string;
  recentAudits: string;
  auditedUrlsCount: string;
  viewReportBtn: string;
  startNewAuditTitle: string;
  startNewAuditSub: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    brandName: "AI Visibility Auditor",
    heroTagline: "Next-Gen Autonomous AI Search & Visibility Auditor",
    heroSubtitle: "Analyze any public website URL-by-URL for SEO + AEO + AIO + GEO + E-E-A-T visibility indexations.",
    startFreeAudit: "Start Free Audit",
    launchDeepAudit: "Launch Deep Audit",
    testingSites: "Test Professional Websites",
    clickCardTip: "Click any card to inspect live crawl & scores",
    dashboard: "Dashboard",
    addWebsite: "Add Website",
    myWebsites: "My Websites",
    urlExplorer: "URL Explorer",
    completeReports: "Complete Reports",
    researchCenter: "Research Center",
    aiAssistant: "AI Assistant",
    aiDirectives: "AI Directives",
    exportReports: "Export Reports",
    profileSettings: "Profile Settings",
    accountSecurity: "Account & Security",
    crawlerRegion: "Crawler Node Location",
    targetRegionLabel: "Select target scan server region",
    currentAuditSnapshot: "CURRENT AUDIT SNAPSHOT",
    overallScore: "Overall Score",
    seoScore: "SEO Index",
    aeoScore: "Answer Engine (AEO)",
    aioScore: "AI Overviews (AIO)",
    geoScore: "Generative Engine (GEO)",
    eeatScore: "E-E-A-T Authority",
    recentAudits: "Monitored Websites & Audits",
    auditedUrlsCount: "URLs Crawled",
    viewReportBtn: "View Report",
    startNewAuditTitle: "Start a New Multi-Page Website Audit",
    startNewAuditSub: "Deep crawl discovering all internal URLs, scoring digital parameters independently."
  },
  ur: {
    brandName: "اے آئی ویزیبلٹی آڈیٹر",
    heroTagline: "جدید ترین خودکار آرٹیفیشل انٹیلیجنس سرچ اور آڈیٹر پلیٹ فارم",
    heroSubtitle: "دنیا کی کسی بھی ویب سائٹ کا گہرائی سے تجزیہ کریں: SEO + AEO + AIO + GEO + E-E-A-T کے لیے۔",
    startFreeAudit: "مفت آڈٹ شروع کریں",
    launchDeepAudit: "تفصیلی آڈٹ لانچ کریں",
    testingSites: "پروفیشنل ویب سائٹس ٹیسٹ کریں",
    clickCardTip: "لائیو اسکور اور لنکس دیکھنے کے لیے کسی بھی کارڈ پر کلک کریں",
    dashboard: "کنٹرول پینل",
    addWebsite: "ویب سائٹ شامل کریں",
    myWebsites: "میری ویب سائٹس",
    urlExplorer: "یو آر ایل ایکسپلورر",
    completeReports: "تفصیلی رپورٹس",
    researchCenter: "ریسرچ سینٹر",
    aiAssistant: "اے آئی اسسٹنٹ",
    aiDirectives: "اے آئی ہدایات",
    exportReports: "رپورٹ ایکسپورٹ کریں",
    profileSettings: "پروفائل سیٹنگز",
    accountSecurity: "اکاؤنٹ اور سیکیورٹی",
    crawlerRegion: "کرالر سرور لوکیشن",
    targetRegionLabel: "ٹارگٹ اسکین لوکیشن کا انتخاب کریں",
    currentAuditSnapshot: "موجودہ آڈٹ کی تفصیلات",
    overallScore: "مجموعی اسکور",
    seoScore: "تکنیکی ایس ای او",
    aeoScore: "سرچ انجن جوابات (AEO)",
    aioScore: "اے آئی اوور ویو (AIO)",
    geoScore: "جنریٹو انجن (GEO)",
    eeatScore: "ساکھ اور اعتماد (E-E-A-T)",
    recentAudits: "نگرانی شدہ ویب سائٹس اور آڈٹس",
    auditedUrlsCount: "کراولڈ صفحات",
    viewReportBtn: "رپورٹ دیکھیں",
    startNewAuditTitle: "نیا تفصیلی ویب سائٹ آڈٹ شروع کریں",
    startNewAuditSub: "تمام اندرونی لنکس دریافت کرنے کے لیے گہرائی سے اسکین کریں اور انفرادی طور پر اسکور کریں۔"
  },
  es: {
    brandName: "AI Visibility Auditor",
    heroTagline: "Auditor Autónomo de Búsqueda y Visibilidad de IA de Próxima Generación",
    heroSubtitle: "Analice cualquier sitio web público URL por URL para optimización SEO + AEO + AIO + GEO + E-E-A-T.",
    startFreeAudit: "Iniciar Auditoría Gratis",
    launchDeepAudit: "Lanzar Auditoría Profunda",
    testingSites: "Probar Sitios Web Profesionales",
    clickCardTip: "Haga clic en cualquier tarjeta para inspeccionar rastreos y puntajes en vivo",
    dashboard: "Panel de Control",
    addWebsite: "Agregar Sitio Web",
    myWebsites: "Mis Sitios Web",
    urlExplorer: "Explorador de URL",
    completeReports: "Informes Completos",
    researchCenter: "Centro de Investigación",
    aiAssistant: "Asistente de IA",
    aiDirectives: "Directivas de IA",
    exportReports: "Exportar Informes",
    profileSettings: "Configuración de Perfil",
    accountSecurity: "Cuenta y Seguridad",
    crawlerRegion: "Ubicación del Servidor de Rastreo",
    targetRegionLabel: "Seleccione la región de escaneo de destino",
    currentAuditSnapshot: "RESUMEN DE AUDITORÍA ACTUAL",
    overallScore: "Puntaje General",
    seoScore: "Índice SEO",
    aeoScore: "Motores de Respuestas (AEO)",
    aioScore: "Resúmenes de IA (AIO)",
    geoScore: "Optimización Generativa (GEO)",
    eeatScore: "Autoridad E-E-A-T",
    recentAudits: "Sitios Web Monitoreados y Auditorías",
    auditedUrlsCount: "Páginas Rastreadas",
    viewReportBtn: "Ver Informe",
    startNewAuditTitle: "Iniciar una Nueva Auditoría de Sitio Web",
    startNewAuditSub: "Rastreo profundo que descubre todas las URL internas, calificando parámetros de forma independiente."
  },
  ar: {
    brandName: "مدقق الرؤية بالذكاء الاصطناعي",
    heroTagline: "الجيل القادم من مدققي البحث الذاتي والرؤية بالذكاء الاصطناعي",
    heroSubtitle: "تحليل أي موقع ويب عام صفحة بصفحة لقياس مؤشرات SEO + AEO + AIO + GEO + E-E-A-T.",
    startFreeAudit: "ابدأ فحصاً مجانياً",
    launchDeepAudit: "إطلاق فحص عميق",
    testingSites: "اختبار المواقع المهنية والمؤسسات",
    clickCardTip: "انقر فوق أي بطاقة لعرض نتائج الفحص المباشر والدرجات",
    dashboard: "لوحة التحكم",
    addWebsite: "إضافة موقع إلكتروني",
    myWebsites: "مواقعي الإلكترونية",
    urlExplorer: "مستكشف الروابط",
    completeReports: "التقارير الكاملة",
    researchCenter: "مركز الأبحاث والذكاء",
    aiAssistant: "مساعد الذكاء الاصطناعي",
    aiDirectives: "توجيهات الذكاء الاصطناعي",
    exportReports: "تصدير التقارير",
    profileSettings: "إعدادات الملف الشخصي",
    accountSecurity: "الحساب والأمان",
    crawlerRegion: "موقع خادم الفحص والزحف",
    targetRegionLabel: "اختر منطقة خادم الزحف المستهدفة",
    currentAuditSnapshot: "ملخص الفحص الحالي",
    overallScore: "التقييم الإجمالي",
    seoScore: "مؤشر السيو التقني",
    aeoScore: "محركات الإجابات (AEO)",
    aioScore: "ملخصات الذكاء الاصطناعي (AIO)",
    geoScore: "محركات التوليد الذكي (GEO)",
    eeatScore: "مصداقية الثقة والخبرة (E-E-A-T)",
    recentAudits: "المواقع المراقبة والتحليلات السابقة",
    auditedUrlsCount: "الصفحات المفحوصة",
    viewReportBtn: "عرض التقرير",
    startNewAuditTitle: "بدء فحص جديد متعدد الصفحات للموقع",
    startNewAuditSub: "زحف وفحص عميق يكتشف جميع الروابط الداخلية ويقيم المعايير بشكل مستقل تماماً."
  },
  de: {
    brandName: "AI Visibility Auditor",
    heroTagline: "Autonomer KI-Such- und Sichtbarkeitsprüfer der nächsten Generation",
    heroSubtitle: "Analysieren Sie jede öffentliche Website URL für URL auf SEO + AEO + AIO + GEO + E-E-A-T Optimierung.",
    startFreeAudit: "Kostenlose Analyse starten",
    launchDeepAudit: "Tiefenprüfung starten",
    testingSites: "Professionelle Websites testen",
    clickCardTip: "Klicken Sie auf eine Karte, um Live-Crawl-Daten & Ergebnisse zu sehen",
    dashboard: "Dashboard",
    addWebsite: "Website hinzufügen",
    myWebsites: "Meine Websites",
    urlExplorer: "URL-Explorer",
    completeReports: "Vollständige Berichte",
    researchCenter: "Forschungszentrum",
    aiAssistant: "KI-Assistent",
    aiDirectives: "KI-Direktiven",
    exportReports: "Berichte exportieren",
    profileSettings: "Profil-Einstellungen",
    accountSecurity: "Konto & Sicherheit",
    crawlerRegion: "Crawler-Server-Standort",
    targetRegionLabel: "Wählen Sie die Ziel-Scan-Serverregion aus",
    currentAuditSnapshot: "AKTUELLE ANALYSE-MOMENTAUFNAHME",
    overallScore: "Gesamtbewertung",
    seoScore: "SEO-Index",
    aeoScore: "Antwortmaschinen (AEO)",
    aioScore: "KI-Overviews (AIO)",
    geoScore: "Generative Engines (GEO)",
    eeatScore: "E-E-A-T Autorität",
    recentAudits: "Überwachte Websites & Analysen",
    auditedUrlsCount: "Gecrawlte URLs",
    viewReportBtn: "Bericht anzeigen",
    startNewAuditTitle: "Neue mehrseitige Website-Analyse starten",
    startNewAuditSub: "Tiefencrawl zur Erkennung aller internen URLs mit unabhängiger Bewertung digitaler Parameter."
  },
  ja: {
    brandName: "AI Visibility Auditor",
    heroTagline: "次世代型自律型AI検索＆視認性監査プラットフォーム",
    heroSubtitle: "SEO + AEO + AIO + GEO + E-E-A-T の視認性をURL単位で徹底検証し最適化指示を自動生成します。",
    startFreeAudit: "無料監査を開始",
    launchDeepAudit: "詳細なディープ監査を実行",
    testingSites: "グローバル企業サイトをテスト",
    clickCardTip: "カードをクリックすると、リアルタイムのクロールデータとスコアを確認できます",
    dashboard: "ダッシュボード",
    addWebsite: "ウェブサイトを追加",
    myWebsites: "登録サイト一覧",
    urlExplorer: "URLエクスプローラー",
    completeReports: "総合監査レポート",
    researchCenter: "AIリサーチセンター",
    aiAssistant: "AIアシスタント",
    aiDirectives: "AI最適化指令",
    exportReports: "レポートをエクスポート",
    profileSettings: "プロファイル設定",
    accountSecurity: "アカウント＆セキュリティ",
    crawlerRegion: "クローラーノード位置",
    targetRegionLabel: "スキャン対象のサーバー地域を選択してください",
    currentAuditSnapshot: "最新の監査概要",
    overallScore: "総合評価",
    seoScore: "SEOインデックス",
    aeoScore: "アンサーエンジン最適化 (AEO)",
    aioScore: "AIオーバービュー視認性 (AIO)",
    geoScore: "生成AI検索最適化 (GEO)",
    eeatScore: "E-E-A-T 信頼性・専門性",
    recentAudits: "監視対象ウェブサイト＆監査履歴",
    auditedUrlsCount: "検出ページ数",
    viewReportBtn: "レポートを表示",
    startNewAuditTitle: "新しい複数ページの監査を開始する",
    startNewAuditSub: "すべての内部URLを自動抽出し、生成AI検索への適応度をインテリジェントに測定します。"
  }
};

export const CRAWLER_REGIONS = [
  { id: 'us-east', name: 'United States (New York Edge)', flag: '🇺🇸', ping: '12ms' },
  { id: 'eu-west', name: 'Europe (Frankfurt Cloud)', flag: '🇩🇪', ping: '38ms' },
  { id: 'apac-singapore', name: 'Singapore (Asia Pacific Node)', flag: '🇸🇬', ping: '72ms' },
  { id: 'sa-mumbai', name: 'South Asia (Mumbai Core Server)', flag: '🇮🇳', ping: '110ms' },
  { id: 'me-dubai', name: 'Middle East (Dubai Internet City)', flag: '🇦🇪', ping: '84ms' },
  { id: 'jp-tokyo', name: 'Japan (Tokyo Edge Server)', flag: '🇯🇵', ping: '92ms' }
];
