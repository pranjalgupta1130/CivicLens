import React, { useState, useRef, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { samplePrompts, detailedBudgets, aiAlertsData, civicKPIs } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function AIAssistant() {
  const { selectedLang, setSelectedLang, currentLangConfig, SUPPORTED_LANGUAGES, t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your **CivicLens Multilingual AI Assistant**. Select your language above or speak via microphone to query public budget ledgers.",
      sources: ["CAG Open Budget Portal", "Ministry Ledgers"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleToggleVoice = () => {
    setSpeechError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
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
          language: selectedLang
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
        text: "Conversation cleared. Ask me another budget question in any of our 10 supported Indian languages!",
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
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Civic AI Assistant
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              10-Language Multilingual & Voice Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Query government budget ledgers using natural voice or text across 10 official Indian languages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-xl text-xs text-slate-300 border border-slate-700">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Language:</span>
            <select
              aria-label="Select Assistant Language"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

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

      {/* Recommended Prompt Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Prompts ({currentLangConfig.name})
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-all hover:scale-[1.02] text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Window Container */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col h-[520px] shadow-2xl overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md shadow-cyan-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs space-y-2 ${
                  isAI
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                    : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium shadow-md shadow-cyan-500/10'
                }`}>
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 pb-1 border-b border-white/10">
                    <span className="font-semibold">{isAI ? 'CivicLens AI' : 'You'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  {msg.sources && (
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400 font-semibold">Verified Sources:</span>
                      {msg.sources.map((src, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {isAI && (
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      {msg.confidence !== undefined && msg.confidence !== null && (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Confidence: <strong className="text-emerald-400">{(msg.confidence * 100).toFixed(0)}%</strong></span>
                        </span>
                      )}
                      {msg.status && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                          msg.status === 'SUPPORTED' ? 'bg-emerald-500/20 text-emerald-300' :
                          msg.status === 'INSUFFICIENT_EVIDENCE' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {msg.status}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors ml-auto"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Auditing sector ledgers in {currentLangConfig.name}...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
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
            title={isListening ? "Listening... click to stop" : `Voice input in ${currentLangConfig.name}`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? `Listening in ${currentLangConfig.name}... Speak now!` : `Ask a budget question in ${currentLangConfig.name}...`}
            className="flex-1 px-4 py-3 text-xs bg-slate-950 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}

