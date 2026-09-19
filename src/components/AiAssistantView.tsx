import React, { useEffect, useRef, useState } from 'react';
import { 
  Bot, Send, Sparkles, Copy, Check, Trash2, Plus, 
  MessageSquare, Globe, User, Loader2, Camera,
  X, Maximize2, GraduationCap, Briefcase,
  HeartPulse, Cpu, BookOpen, ShieldAlert, Shield, Store, Zap,
  ArrowRight, Terminal, Code, Server, PenTool, Building2,
  Filter, Layers, BookCheck, Mic, MicOff, Volume2, VolumeX, Activity,
  Play, Pause, RotateCcw, MessageSquareHeart, Smile, Plane, Anchor, Building
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatSession, ProfessionId, WebsiteAudit } from '../types';
import { PROFESSIONS_DATA } from '../data/professions';
import { CameraCaptureModal } from './CameraCaptureModal';

const LANGUAGES = [
  'Auto-Detect',
  'English',
  'Urdu (اردو)',
  'Roman Urdu',
  'Arabic (العربية)',
  'Hindi (हिन्दी)',
  'Spanish (Español)',
  'French (Français)',
  'German (Deutsch)',
  'Chinese (中文)',
  'Japanese (日本語)',
  'Korean (한국어)',
  'Portuguese (Português)',
  'Russian (Русский)',
  'Turkish (Türkçe)',
];

type CategoryFilter = 'all' | 'casual' | 'tech_cs_ai' | 'academics_css' | 'institutions' | 'business_services';

const renderProfessionIcon = (iconName: string, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'MessageSquareHeart': return <MessageSquareHeart className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Terminal': return <Terminal className={className} />;
    case 'Bot': return <Bot className={className} />;
    case 'Code': return <Code className={className} />;
    case 'Server': return <Server className={className} />;
    case 'PenTool': return <PenTool className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'Building': return <Building className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Plane': return <Plane className={className} />;
    case 'Anchor': return <Anchor className={className} />;
    case 'Store': return <Store className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const AiAssistantView: React.FC<{ activeAudit?: WebsiteAudit | null }> = ({ activeAudit }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<ProfessionId>('general_casual');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto-Detect');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Camera & Image State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [viewingImageModal, setViewingImageModal] = useState<string | null>(null);

  // Live Audio Voice State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeakingLive, setIsAiSpeakingLive] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  
  // Refs for callbacks & live streaming voice engine
  const inputMessageRef = useRef<string>('');
  const isVoiceModalOpenRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const streamAudioBufferRef = useRef<string>('');
  const speechQueueRef = useRef<string[]>([]);
  const isProcessingSpeechRef = useRef<boolean>(false);

  // Sync state to refs
  useEffect(() => { inputMessageRef.current = inputMessage; }, [inputMessage]);
  useEffect(() => { isVoiceModalOpenRef.current = isVoiceModalOpen; }, [isVoiceModalOpen]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  // Web Audio Chime Generator
  const playAudioChime = (type: 'mic_start' | 'mic_stop' | 'send' | 'ai_speak') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'mic_start') {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'mic_stop') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'send') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'ai_speak') {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // Helper to clean raw text for TTS
  const cleanTextForSpeech = (raw: string): string => {
    return raw
      .replace(/```[\s\S]*?```/g, ' Code provided. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+\s?/g, '')
      .replace(/\*+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[\n\r]+/g, ' . ')
      .trim();
  };

  // Live Queue-based Speech Engine (Reads sentences out loud as they stream in)
  const processNextSpeechQueueItem = () => {
    if (speechQueueRef.current.length === 0) {
      isProcessingSpeechRef.current = false;
      setIsAiSpeakingLive(false);

      // Continuous Live Voice Loop: If user is in Live Voice Modal, restart listening after AI finishes!
      if (isVoiceModalOpenRef.current && !isLoadingRef.current) {
        setTimeout(() => {
          if (isVoiceModalOpenRef.current) {
            startListening();
          }
        }, 300);
      }
      return;
    }

    if (!('speechSynthesis' in window)) {
      isProcessingSpeechRef.current = false;
      setIsAiSpeakingLive(false);
      return;
    }

    isProcessingSpeechRef.current = true;
    setIsAiSpeakingLive(true);

    const sentence = speechQueueRef.current.shift() || '';
    if (!sentence.trim()) {
      processNextSpeechQueueItem();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    if (/[؀-ۿ]/.test(sentence) || selectedLanguage.includes('Urdu')) {
      utterance.lang = 'ur-PK';
    } else if (/[\u0900-\u097F]/.test(sentence) || selectedLanguage.includes('Hindi')) {
      utterance.lang = 'hi-IN';
    } else if (selectedLanguage.includes('Arabic')) {
      utterance.lang = 'ar-SA';
    } else {
      utterance.lang = 'en-US';
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));
      if (match) utterance.voice = match;
    }

    utterance.onend = () => processNextSpeechQueueItem();
    utterance.onerror = () => processNextSpeechQueueItem();

    window.speechSynthesis.speak(utterance);
  };

  const enqueueSentenceForLiveAudio = (sentence: string) => {
    const cleaned = cleanTextForSpeech(sentence);
    if (!cleaned) return;
    speechQueueRef.current.push(cleaned);
    if (!isProcessingSpeechRef.current) {
      processNextSpeechQueueItem();
    }
  };

  // Process incoming stream chunks and cut completed sentences for immediate TTS
  const feedStreamChunkToVoice = (chunk: string) => {
    streamAudioBufferRef.current += chunk;

    // Check for sentence delimiters
    let delimiterMatch = streamAudioBufferRef.current.search(/[.!?\n۔,]/);
    while (delimiterMatch !== -1) {
      const sentence = streamAudioBufferRef.current.slice(0, delimiterMatch + 1);
      streamAudioBufferRef.current = streamAudioBufferRef.current.slice(delimiterMatch + 1);

      enqueueSentenceForLiveAudio(sentence);
      delimiterMatch = streamAudioBufferRef.current.search(/[.!?\n۔,]/);
    }
  };

  const flushRemainingVoiceBuffer = () => {
    if (streamAudioBufferRef.current.trim()) {
      enqueueSentenceForLiveAudio(streamAudioBufferRef.current);
      streamAudioBufferRef.current = '';
    }
  };

  // Chunked Text-To-Speech Reader for single manual messages
  const speakTextInChunks = (
    text: string,
    msgId?: string,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio reader is not supported in this browser.');
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    if (msgId && speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      if (onEnd) onEnd();
      return;
    }

    const clean = cleanTextForSpeech(text);
    if (!clean) {
      if (onEnd) onEnd();
      return;
    }

    const sentences = clean.match(/[^.!?\n۔,]+[.!?\n۔,]*/g) || [clean];
    let index = 0;

    if (msgId) setSpeakingMsgId(msgId);
    if (onStart) onStart();

    const speakNext = () => {
      if (index >= sentences.length) {
        if (msgId) setSpeakingMsgId(null);
        if (onEnd) onEnd();
        return;
      }

      const sentence = sentences[index].trim();
      index++;
      if (!sentence) {
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      if (/[؀-ۿ]/.test(sentence) || selectedLanguage.includes('Urdu')) {
        utterance.lang = 'ur-PK';
      } else if (/[\u0900-\u097F]/.test(sentence) || selectedLanguage.includes('Hindi')) {
        utterance.lang = 'hi-IN';
      } else if (selectedLanguage.includes('Arabic')) {
        utterance.lang = 'ar-SA';
      } else {
        utterance.lang = 'en-US';
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const match = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));
        if (match) utterance.voice = match;
      }

      utterance.onend = () => speakNext();
      utterance.onerror = () => speakNext();

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  // Stop all active voice/speech playback immediately
  const stopAllSpeechPlayback = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeakingLive(false);
    setSpeakingMsgId(null);
    speechQueueRef.current = [];
    isProcessingSpeechRef.current = false;
  };

  // Live Mic Voice Input (Speech Recognition with Silence Auto-Submit)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported natively in this browser context.');
      setIsListening(false);
      return;
    }

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeakingLive(false);
      speechQueueRef.current = [];
      isProcessingSpeechRef.current = false;

      playAudioChime('mic_start');

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      if (selectedLanguage.includes('Urdu')) {
        recognition.lang = 'ur-PK';
      } else if (selectedLanguage.includes('Hindi')) {
        recognition.lang = 'hi-IN';
      } else if (selectedLanguage.includes('Arabic')) {
        recognition.lang = 'ar-SA';
      } else {
        recognition.lang = 'en-US';
      }

      baseInputRef.current = inputMessageRef.current;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = 0; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += chunk + ' ';
          } else {
            interimStr += chunk;
          }
        }

        const combinedNew = (finalStr + interimStr).trim();
        if (combinedNew) {
          const fullText = baseInputRef.current ? `${baseInputRef.current} ${combinedNew}` : combinedNew;
          setInputMessage(fullText);
          inputMessageRef.current = fullText;

          // Silence Auto-Submit Timer in Live Voice Mode (~1.5s after user stops speaking)
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (isVoiceModalOpenRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (isVoiceModalOpenRef.current && inputMessageRef.current.trim() && !isLoadingRef.current) {
                stopListening();
                handleSendMessage();
              }
            }, 1500);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    playAudioChime('mic_stop');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Toggle single message voice reading
  const handleToggleSpeak = (text: string, msgId: string) => {
    speakTextInChunks(text, msgId);
  };

  // Filtered professions based on active category
  const filteredProfessions = PROFESSIONS_DATA.filter((p) => {
    if (activeCategory === 'casual') {
      return p.id === 'general_casual';
    }
    if (activeCategory === 'tech_cs_ai') {
      return ['cs_student', 'ai_engineer', 'software_engineer', 'it_admin'].includes(p.id);
    }
    if (activeCategory === 'academics_css') {
      return ['css_aspirant', 'student', 'teacher'].includes(p.id);
    }
    if (activeCategory === 'institutions') {
      return ['school_college', 'teacher'].includes(p.id);
    }
    if (activeCategory === 'business_services') {
      return ['business', 'doctor', 'civil_engineer', 'mechanical_engineer', 'police', 'army', 'air_force', 'navy', 'retailer', 'general'].includes(p.id);
    }
    return true;
  });

  // Active profession config
  const currentProfession = PROFESSIONS_DATA.find(p => p.id === selectedProfession) || PROFESSIONS_DATA[0];

  // Load chat sessions from backend
  const loadSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
        if (data.length > 0 && !activeSession) {
          setActiveSession(data[0]);
          if (data[0].professionRole) {
            setSelectedProfession(data[0].professionRole);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load chat sessions', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  const handleCreateNewChat = (professionId: ProfessionId = selectedProfession) => {
    const prof = PROFESSIONS_DATA.find(p => p.id === professionId) || currentProfession;
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: `${prof.title} Session`,
      language: selectedLanguage,
      professionRole: professionId,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `### Welcome to ${prof.title} (${prof.urduTitle}) AI Intelligence Assistant!\n\nI am configured with specialized domain intelligence tailored for **${prof.title}**.\n\n✨ **Key Capabilities for You:**\n${prof.specialBenefits.map(b => `- ${b}`).join('\n')}\n\n📷 **Camera Vision OCR:** ${prof.cameraCapability}\n\n*Ask questions in Urdu (اردو), Roman Urdu, or English, or click the Camera button to scan code, textbooks, essay drafts, or architecture blueprints!*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          professionRole: professionId,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions([newSession, ...sessions]);
    setActiveSession(newSession);
    setSelectedProfession(professionId);
  };

  const handleProfessionChange = (id: ProfessionId) => {
    setSelectedProfession(id);
    if (!activeSession || activeSession.messages.length <= 1) {
      handleCreateNewChat(id);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if ((!textToSend.trim() && !attachedImage) || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentAttachedImage = attachedImage;
    setInputMessage('');
    setAttachedImage(null);
    setIsLoading(true);

    const targetSessionId = activeSession?.id;

    // Build final message text including active audit context if present
    let finalMessageText = textToSend;
    if (activeAudit) {
      const averageScoresText = `SEO: ${activeAudit.averageScores.seo}/100, AEO: ${activeAudit.averageScores.aeo}/100, AIO: ${activeAudit.averageScores.aio}/100, GEO: ${activeAudit.averageScores.geo}/100, EEAT: ${activeAudit.averageScores.eeat}/100, Overall: ${activeAudit.averageScores.overall}/100`;
      const findingsText = activeAudit.topFindings && activeAudit.topFindings.length > 0 
        ? activeAudit.topFindings.map((f: any) => `- [${f.category.toUpperCase()} - Severity: ${f.severity.toUpperCase()}] ${f.title}: ${f.explanation} (Fix: ${f.solution})`).join('\n') 
        : 'No key findings found.';
      const recommendationsText = activeAudit.globalAiRecommendations && activeAudit.globalAiRecommendations.length > 0 
        ? activeAudit.globalAiRecommendations.map((r: string) => `- ${r}`).join('\n') 
        : 'No custom recommendations available.';
      
      finalMessageText = `${textToSend}\n\n[SYSTEM AUDIT CONTEXT - ALWAYS ANSWER USING THIS REAL DATA]\nWebsite Name: ${activeAudit.websiteName}\nDomain: ${activeAudit.domain}\nRoot URL: ${activeAudit.rootUrl}\nAverage Scores: ${averageScoresText}\n\nTop Findings Found:\n${findingsText}\n\nGlobal AI Recommendations:\n${recommendationsText}\n\nPlease analyze this specific website context to give authoritative, highly professional, site-specific recommendations. Maintain the language mirroring directive strictly!`;
    }

    // User message (we store textToSend here so the chat bubble stays beautifully clean)
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user' as const,
      content: textToSend || 'Please analyze this captured image / document for specialized recommendations.',
      imageUrl: currentAttachedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      professionRole: selectedProfession,
    };

    // Placeholders
    const assistantMsgId = `a-${Date.now()}`;
    const initialAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      professionRole: selectedProfession,
    };

    // Update state with user message and empty assistant message
    setActiveSession((prev) => {
      const baseSession = prev || {
        id: `chat-${Date.now()}`,
        title: textToSend ? textToSend.substring(0, 30) : 'Visual Analysis',
        language: selectedLanguage,
        professionRole: selectedProfession,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...baseSession,
        messages: [...baseSession.messages, userMsg, initialAssistantMsg],
      };
    });

    playAudioChime('send');

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: finalMessageText,
          image: currentAttachedImage,
          sessionId: targetSessionId,
          language: selectedLanguage === 'Auto-Detect' ? undefined : selectedLanguage,
          professionRole: selectedProfession,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim();
              if (!jsonStr) continue;
              const data = JSON.parse(jsonStr);

              if (data.type === 'init' && data.session) {
                // Session synchronized
              } else if (data.type === 'chunk' && data.chunk) {
                streamedContent += data.chunk;
                
                // Feed chunk live to speech engine for immediate voice playback
                feedStreamChunkToVoice(data.chunk);

                // Append chunk live to assistant message
                setActiveSession((prev) => {
                  if (!prev) return prev;
                  const updatedMsgs = prev.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: streamedContent } : m
                  );
                  return { ...prev, messages: updatedMsgs };
                });
              } else if (data.type === 'done' && data.session) {
                setActiveSession(data.session);
                setSessions((prev) => [data.session, ...prev.filter((s) => s.id !== data.session.id)]);
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      // Flush remaining speech buffer
      flushRemainingVoiceBuffer();
    } catch (err) {
      console.warn('Falling back to standard REST chat endpoint:', err);
      // Fallback to standard /api/chat if streaming is interrupted
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: finalMessageText,
            image: currentAttachedImage,
            sessionId: targetSessionId,
            language: selectedLanguage === 'Auto-Detect' ? undefined : selectedLanguage,
            professionRole: selectedProfession,
          }),
        });
        const data = await fallbackRes.json();
        if (data && data.session) {
          setActiveSession(data.session);
          setSessions((prev) => [data.session, ...prev.filter((s) => s.id !== data.session.id)]);

          // Read out full message if fallback is triggered
          const lastAssistantMsg = data.session.messages.filter((m: any) => m.role === 'assistant').pop();
          if (lastAssistantMsg && lastAssistantMsg.content) {
            enqueueSentenceForLiveAudio(lastAssistantMsg.content);
          }
        }
      } catch (fallbackErr) {
        console.error('REST chat failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(sessions.find(s => s.id !== id) || null);
      }
    } catch (err) {
      console.error('Delete chat error:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      
      {/* =========================================================================
          1. TOP PROFESSION / CAREER ROLE SELECTOR BAR WITH CATEGORY FILTERS
         ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Profession AI & Education Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-display">
              Tailored Intelligence for Students, IT, CS, AI Engineers & Schools
            </h2>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                activeCategory === 'all' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Roles ({PROFESSIONS_DATA.length})
            </button>
            <button
              onClick={() => {
                setActiveCategory('casual');
                handleProfessionChange('general_casual');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'casual' || selectedProfession === 'general_casual'
                  ? 'bg-gradient-to-r from-rose-500/30 to-purple-500/30 text-rose-300 border border-rose-500/50 shadow-sm ring-1 ring-rose-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-400" />
              <span>Sada Baat Cheet (سادہ بات)</span>
            </button>
            <button
              onClick={() => setActiveCategory('tech_cs_ai')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'tech_cs_ai' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>CS, AI, Dev & IT</span>
            </button>
            <button
              onClick={() => setActiveCategory('academics_css')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'academics_css' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>CSS & Students</span>
            </button>
            <button
              onClick={() => setActiveCategory('institutions')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'institutions' 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Schools & Colleges</span>
            </button>
            <button
              onClick={() => setActiveCategory('business_services')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'business_services' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Business & Trades</span>
            </button>
          </div>
        </div>

        {/* Scrollable / Grid of Profession Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pt-1">
          {filteredProfessions.map((prof) => {
            const isSelected = selectedProfession === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => handleProfessionChange(prof.id)}
                className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-1.5 group ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl transition-colors ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400'
                  }`}>
                    {renderProfessionIcon(prof.iconName, 'w-4 h-4')}
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-200 leading-tight truncate">
                    {prof.title.split('&')[0]}
                  </div>
                  <div className="text-[10px] text-cyan-400/90 font-mono truncate">
                    {prof.urduTitle.split('اور')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. MAIN WORKSPACE (LEFT: SESSIONS + RIGHT: CHAT & ACTIONS)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[640px]">
        
        {/* Left Column: Chat Sessions History & Profile Tools */}
        <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <button
              id="chat-new-conversation-btn"
              onClick={() => handleCreateNewChat(selectedProfession)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New {currentProfession.title.split('&')[0]} Session</span>
            </button>

            {/* Camera Quick Action Button */}
            <button
              id="chat-open-camera-btn-sidebar"
              onClick={() => setIsCameraOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-inner"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Scan Notes / Code / Specs</span>
            </button>

            {/* Language Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">
                Response Language
              </label>
              <div className="relative flex items-center">
                <Globe className="w-3.5 h-3.5 text-cyan-400 absolute left-3" />
                <select
                  id="chat-language-selector"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversation list */}
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono block px-2">
                Consultation History ({sessions.length})
              </span>
              {sessions.length === 0 ? (
                <div className="text-[11px] text-slate-500 px-2 py-4 text-center">
                  No previous sessions yet. Start a new consultation above.
                </div>
              ) : (
                sessions.map((sess) => {
                  const isActive = activeSession?.id === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setActiveSession(sess);
                        if (sess.professionRole) {
                          setSelectedProfession(sess.professionRole);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                        isActive
                          ? 'bg-slate-950 border-indigo-500/60 text-white font-semibold shadow-inner'
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{sess.title}</span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Field Benefits Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono">
              {renderProfessionIcon(currentProfession.iconName, 'w-3.5 h-3.5 text-cyan-400')}
              <span className="truncate">{currentProfession.title}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {currentProfession.description}
            </p>
          </div>
        </div>

        {/* Right 3-Columns: Chat Messages & Custom Suggested Kit */}
        <div className="lg:col-span-3 p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl">
          
          {/* Header Banner for Selected Profession */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400">
                {renderProfessionIcon(currentProfession.iconName, 'w-5 h-5')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">
                    {currentProfession.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${currentProfession.badgeColor}`}>
                    {currentProfession.urduTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {currentProfession.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedProfession !== 'general_casual' ? (
                <button
                  onClick={() => {
                    setActiveCategory('casual');
                    handleProfessionChange('general_casual');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-purple-950/80 hover:from-rose-900 hover:to-purple-900 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Aam aur aasan dostana baatcheet mode par switch karein"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sada Baat Cheet</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveCategory('tech_cs_ai');
                    handleProfessionChange('cs_student');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Specialized professional & career roles mode"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Expert / Career Roles</span>
                </button>
              )}

              <button
                onClick={() => setIsCameraOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera OCR</span>
              </button>

              {(isAiSpeakingLive || speakingMsgId) && (
                <button
                  type="button"
                  id="stop-speech-playback-header-btn"
                  onClick={stopAllSpeechPlayback}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md animate-pulse"
                  title="Stop AI voice/audio playback immediately"
                >
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stop Voice</span>
                </button>
              )}
            </div>
          </div>

          {/* Linked Active Audit Synchronization Control Panel */}
          {activeAudit && (
            <div id="ai-active-audit-sync-banner" className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-950/50 border border-cyan-500/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-1">
                    <span>🔌 Connected Audit Sync</span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1 rounded">Score: {activeAudit.averageScores.overall}/100</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 leading-snug">
                    {activeAudit.websiteName} <span className="text-slate-400 font-mono font-normal">({activeAudit.domain})</span>
                  </h4>
                </div>
              </div>

              {/* Responsive Quick Audit Action Prompts */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  id="ai-quick-btn-findings"
                  onClick={() => handleSendMessage(`Analyze the critical SEO, AEO, and AI visibility issues found on ${activeAudit.websiteName} and list recommendations to fix them.`)}
                  className="px-2 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 text-[10px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  📋 Key Findings
                </button>
                <button
                  type="button"
                  id="ai-quick-btn-recommendations"
                  onClick={() => handleSendMessage(`Provide a customized, step-by-step technical plan to implement the AI visibility recommendations for ${activeAudit.websiteName}.`)}
                  className="px-2 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 text-[10px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  ⚡ Action Plan
                </button>
                <button
                  type="button"
                  id="ai-quick-btn-schema"
                  onClick={() => handleSendMessage(`Generate JSON-LD Schema markup suggestions specifically optimized for ${activeAudit.websiteName} to boost AI Overview (AIO) visibility.`)}
                  className="px-2 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 text-[10px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  🛠️ Write Schema
                </button>
                <button
                  type="button"
                  id="ai-quick-btn-aeo"
                  onClick={() => handleSendMessage(`Explain how ${activeAudit.websiteName} can improve its Answer Engine Optimization (AEO) score for conversational Perplexity and voice search.`)}
                  className="px-2 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 text-[10px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  📈 Boost AEO
                </button>
              </div>
            </div>
          )}

          {/* Messages list */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 pb-2">
            {(!activeSession || activeSession.messages.length === 0) ? (
              <div className="p-6 text-center text-slate-400 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 text-white">
                  {renderProfessionIcon(currentProfession.iconName, 'w-7 h-7')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 font-display">
                    {currentProfession.title} Intelligence Kit
                  </h3>
                  <p className="text-xs max-w-lg mx-auto text-slate-400 mt-1">
                    {currentProfession.cameraCapability}
                  </p>
                </div>

                {/* Specialized Starter Prompts for Active Profession */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto pt-2 text-left">
                  {currentProfession.quickPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(p.text)}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-cyan-400 font-mono font-bold">{p.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <span className="text-xs text-slate-300 group-hover:text-white line-clamp-2 leading-snug">
                        {p.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeSession.messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-slate-950 border border-slate-800/80 text-slate-200 rounded-bl-sm space-y-2'
                      }`}
                    >
                      {/* Render Image Attachment if present */}
                      {msg.imageUrl && (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 relative group bg-black/40 max-w-xs">
                          <img
                            src={msg.imageUrl}
                            alt="Message attachment"
                            className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setViewingImageModal(msg.imageUrl || null)}
                          />
                          <button
                            type="button"
                            onClick={() => setViewingImageModal(msg.imageUrl || null)}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white text-[10px] font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Expand</span>
                          </button>
                        </div>
                      )}

                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div>
                          <div className="markdown-body prose prose-invert max-w-none text-xs sm:text-sm space-y-2">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="font-mono">{msg.timestamp}</span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleSpeak(msg.content, msg.id)}
                                className={`flex items-center gap-1 transition-colors ${
                                  speakingMsgId === msg.id
                                    ? 'text-cyan-400 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title={speakingMsgId === msg.id ? 'Stop reading' : 'Read answer out loud (Text to Speech)'}
                              >
                                {speakingMsgId === msg.id ? (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                    <span className="text-rose-400">Stop Voice</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Listen</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleCopy(msg.content, msg.id)}
                                className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                                title="Copy reply"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Consulting {currentProfession.title} AI intelligence models...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Prompt Chips for Active Profession */}
          <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1 self-center mr-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Quick:
            </span>
            {currentProfession.quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors truncate max-w-xs"
                title={qp.text}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Bottom Input Area with Camera Attachments */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            
            {/* Active Attached Image Badge */}
            {attachedImage && (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-950 border border-cyan-500/40 animate-in fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                    <img src={attachedImage} alt="Attached snapshot" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate text-xs">
                    <span className="font-bold text-cyan-300 font-mono block">Photo / Screenshot Ready</span>
                    <span className="text-[11px] text-slate-400">Ready for {currentProfession.title} multimodal analysis</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-800"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Active Speech Recognition Listening Widget */}
            {isListening && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-rose-500/60 shadow-lg shadow-rose-950/40 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <span className="font-bold text-rose-300 font-mono tracking-wide">
                      Sada Voice Input Active (آواز سے بولیں)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-mono">
                      {selectedLanguage.includes('Urdu') ? 'Urdu (ur-PK)' : 'Auto Language'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        toggleListening();
                        if (inputMessage.trim()) handleSendMessage();
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 shadow transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Question</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700"
                    >
                      Stop
                    </button>
                  </div>
                </div>

                <p className="text-slate-200 italic text-[11px] bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                  {inputMessage || "Bolna shuru karein, aap ki aawaz yahan text mein convert ho rahi hai..."}
                </p>
              </div>
            )}

            {/* Chat Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              {/* Camera Trigger Button */}
              <button
                id="chat-camera-trigger-btn"
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/60 text-cyan-400 font-bold shadow-md transition-all flex-shrink-0"
                title={`Scan photo with camera for ${currentProfession.title}`}
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Live Voice Mic Button */}
              <button
                id="chat-mic-trigger-btn"
                type="button"
                onClick={() => {
                  setIsVoiceModalOpen(true);
                  startListening();
                }}
                className={`p-3.5 rounded-2xl border transition-all flex-shrink-0 font-bold shadow-md flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-rose-500/60 text-rose-400'
                }`}
                title="Sada Voice Input Window (آواز سے سوال پوچھیں)"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-xs font-mono font-bold hidden sm:inline">Voice</span>
              </button>

              {/* Textarea */}
              <div className="relative flex-1">
                <textarea
                  id="chat-message-input"
                  rows={2}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={attachedImage ? `Add instructions for this scanned image or press send for ${currentProfession.title} analysis...` : `Ask any question as a ${currentProfession.title} in English, Urdu (اردو), or Roman Urdu (Enter to send)...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                id="chat-send-btn"
                type="submit"
                disabled={isLoading || (!inputMessage.trim() && !attachedImage)}
                className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Camera Capture Modal */}
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(dataUrl) => {
            setAttachedImage(dataUrl);
            if (!inputMessage.trim()) {
              setInputMessage(`Please analyze this photo/document with specialized ${currentProfession.title} recommendations.`);
            }
          }}
        />

        {/* Lightbox Modal for enlarged image viewing */}
        {viewingImageModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setViewingImageModal(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setViewingImageModal(null)}
                className="absolute top-4 right-4 py-1.5 px-3 rounded-xl bg-slate-900/90 text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xl z-10"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Close (X)</span>
              </button>
              <img
                src={viewingImageModal}
                alt="Enlarged inspection"
                className="w-full h-full max-h-[85vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Dedicated Sada Voice Input Window Modal */}
        {isVoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-400">
                    <Activity className="w-5 h-5 animate-pulse text-rose-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                      <span>Sada Live Voice Mode</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono">
                        Real-time AI Voice
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Real-time voice streaming & continuous conversation (آواز سے براہ راست بات کریں)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceModalOpen(false);
                    stopListening();
                    stopAllSpeechPlayback();
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pulsing Mic / AI Waveform Visualizer */}
              <div className="py-2 flex flex-col items-center justify-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className={`absolute -inset-6 rounded-full bg-rose-500/20 blur-xl transition-all duration-300 ${
                    isListening || isAiSpeakingLive ? 'scale-125 animate-ping' : 'scale-90 opacity-30'
                  }`} />
                  
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all ${
                      isAiSpeakingLive
                        ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 border-cyan-400 text-white shadow-cyan-500/50 scale-105 ring-4 ring-cyan-500/30'
                        : isListening
                        ? 'bg-rose-600 border-rose-400 text-white shadow-rose-600/40 scale-105'
                        : 'bg-slate-950 border-slate-700 text-rose-400 hover:border-rose-500/60'
                    }`}
                    title={isListening ? 'Pause recording' : 'Start microphone'}
                  >
                    {isAiSpeakingLive ? (
                      <Volume2 className="w-9 h-9 animate-bounce text-cyan-300" />
                    ) : isListening ? (
                      <MicOff className="w-8 h-8 animate-pulse text-white" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isAiSpeakingLive
                      ? 'bg-cyan-400 animate-ping'
                      : isListening
                      ? 'bg-emerald-400 animate-ping'
                      : 'bg-slate-600'
                  }`} />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {isAiSpeakingLive
                      ? '🔊 AI is speaking out loud in real-time...'
                      : isListening
                      ? '🎤 Listening to your voice... (Pause ~1.5s to auto-send)'
                      : 'Click Microphone to Start Recording'}
                  </span>
                </div>
              </div>

              {/* Spoken Text Box */}
              <div className="text-left space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Spoken Question / Voice Transcript:</span>
                  <span className="text-cyan-400 font-normal text-[10px]">Auto-Detect Language</span>
                </label>
                <textarea
                  rows={3}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Aap ki aawaz yahan type ho rahi hai... Bolna band karein, question auto-send ho jaye ga!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Sample Voice Prompts */}
              <div className="text-left space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold">Quick Voice Sample Questions:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMessage("Mujhe aasan Urdu mein website SEO ke baare mein samjhao.");
                      inputMessageRef.current = "Mujhe aasan Urdu mein website SEO ke baare mein samjhao.";
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                  >
                    💡 Website SEO Tips
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMessage("AI mera daily kaam kaise aasan kar sakta hai?");
                      inputMessageRef.current = "AI mera daily kaam kaise aasan kar sakta hai?";
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                  >
                    🤖 AI Capabilities
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMessage("Mujhe CSS exam ki preparation ki tips do.");
                      inputMessageRef.current = "Mujhe CSS exam ki preparation ki tips do.";
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                  >
                    📚 Exam Study Guide
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                {(isAiSpeakingLive || speakingMsgId) && (
                  <button
                    type="button"
                    id="stop-voice-playback-modal-btn"
                    onClick={stopAllSpeechPlayback}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse"
                    title="Stop AI voice/audio playback immediately"
                  >
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>Stop Voice</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceModalOpen(false);
                    stopListening();
                    stopAllSpeechPlayback();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    if (inputMessage.trim()) {
                      handleSendMessage();
                    }
                  }}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-600/20 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Live Question</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
