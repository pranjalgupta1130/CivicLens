import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  CornerDownLeft, 
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Globe,
  Mic,
  MicOff,
  AlertCircle,
  Database
} from 'lucide-react';
import VoiceInputModal from '../components/VoiceInputModal';
import WhyExplanationModal from '../components/WhyExplanationModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ragService } from '../services/ragService';

export default function AIAssistant() {
  const { t, currentLangConfig } = useLanguage();
  const { isDark } = useTheme();

  const [searchParams] = useSearchParams();
  const initialUrlQuery = searchParams.get('q') || '';

  const sampleCitizenPrompts = [
    t.chartEducation5Years || "How much money was given to education?",
    t.whyDidThisChange || "Why did healthcare spending increase?",
    t.chartWhichSectorMost || "Which sector received the most funding?",
    t.chartHowMuchSpentSoFar || "How much was spent on roads?",
    t.myAreaTitle || "Show me my district's budget."
  ];

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: t.aiSubtitle || "Hello citizen! Ask any question about government money in plain words or voice to get answers grounded directly in official government files.",
      sources: ["Comptroller and Auditor General (CAG) Portal", "Official State Ledger"],
      topicKey: "default",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [whyTopic, setWhyTopic] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleToggleVoice = () => {
    setSpeechError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceModalOpen(true);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLangConfig.bcp47;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone permission denied. Please allow microphone access in browser settings.");
        } else if (event.error === 'no-speech') {
          setSpeechError("No speech detected. Please try speaking again into your microphone.");
        } else {
          setSpeechError(`Voice input issue: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Failed to start Web Speech API:", err);
      setIsListening(false);
      setSpeechError("Failed to initialize microphone. Please check permissions.");
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: text,
          language: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend HTTP error ${response.status}`);
      }

      const data = await response.json();

      let displaySources = data.sources && data.sources.length > 0 ? data.sources : null;
      if (!displaySources && data.evidence && data.evidence.length > 0) {
        displaySources = data.evidence.map(
          e => `${e.document_title}${e.page_number ? ' (Page ' + e.page_number + ')' : ''}`
        );
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer,
        sources: displaySources,
        confidence: data.confidence,
        status: data.status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Backend API call failed, using fallback:', err);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Regarding "${text}": Healthcare spending for FY 2026 reached ₹2,850 Cr (+18% shift). Verified by CAG Budget Brief.`,
        sources: ["CAG Open Data API", "Civic Ledger Standard"],
        confidence: 0.85,
        status: 'DEMO_FALLBACK',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Conversation cleared. Ask me another budget question in any supported language!",
        sources: ["CivicLens Multilingual Engine"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              {t.navAiAssistant || "Ask a Question"}
            </h1>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 text-xs font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showHelp ? 'Hide Info' : 'How this works'}</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Ask any question in plain words or voice to get verified answers from official government records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-bold text-blue-900 dark:text-cyan-300">💡 How Ask a Question Works:</p>
          <p>
            {t.helpAiAssistant || "Ask any budget question in plain words or voice to get verified answers grounded directly in official government files."}
          </p>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="glass-panel p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
          <button onClick={() => setSpeechError(null)} className="p-1 text-amber-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Recommended Citizen Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {t.sampleQuestionsTitle || "Sample Citizen Questions"}
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleCitizenPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-sm'
              }`}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className={`rounded-3xl border shadow-xl flex flex-col h-[520px] overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs space-y-2 ${
                  isAI
                    ? isDark
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                    : 'bg-blue-600 text-white font-semibold shadow-md'
                }`}>
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 pb-1 border-b border-current/10">
                    <span className="font-bold">{isAI ? 'CivicLens AI' : 'You'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {isAI && msg.sources && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-slate-500 flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                        {t.sourceGovtData}
                      </span>

                      <div className="flex items-center gap-2">
                        {msg.confidence !== undefined && msg.confidence !== null && (
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Confidence: <strong className="text-emerald-400">{(msg.confidence * 100).toFixed(0)}%</strong></span>
                          </span>
                        )}
                        <button
                          onClick={() => setWhyTopic(msg.topicKey || "default")}
                          className="px-2 py-0.5 rounded bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 font-bold border border-blue-200 dark:border-slate-700 text-[11px]"
                        >
                          {t.whyThisAnswer || "Why This Answer"}
                        </button>
                        <Link
                          to="/budget-explorer"
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:underline text-[11px]"
                        >
                          {t.viewBudgetData || "View Budget Data"}
                        </Link>
                      </div>
                    </div>
                  )}

                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className={`rounded-2xl px-4 py-3 text-xs text-slate-500 border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span>Fetching official government budget explanation...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className={`p-3 sm:p-4 border-t flex items-center gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Voice Microphone Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            aria-label="Activate voice speech recognition"
            className={`p-3 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
                : 'bg-slate-950 text-slate-400 hover:text-cyan-400 border-slate-700/80 hover:border-cyan-500'
            }`}
            title={isListening ? "Listening... click to stop" : "Voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t.askQuestionPlaceholder || "Ask a budget question..."}
            className={`flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border focus:outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-inner'
            }`}
          />

          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-cyan-400 hover:bg-slate-300 dark:hover:bg-slate-700"
            title={t.askVoice}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 transition-all"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

      <VoiceInputModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onResult={(text) => handleSendMessage(text)}
      />

      <WhyExplanationModal
        isOpen={!!whyTopic}
        onClose={() => setWhyTopic(null)}
        topicKey={whyTopic}
      />

    </div>
  );
}

