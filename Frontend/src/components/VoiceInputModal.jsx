import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function VoiceInputModal({ isOpen, onClose, onResult }) {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'unsupported' | 'error'
  const [transcriptText, setTranscriptText] = useState('');
  const [recognition, setRecognition] = useState(null);

  // Requirement 6: Strict Voice Speech Recognition Language Codes
  const langCodeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    ta: 'ta-IN',
    bn: 'bn-IN',
    te: 'te-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN'
  };

  const langDisplayMap = {
    en: 'English (India)',
    hi: 'हिंदी (Hindi)',
    mr: 'मराठी (Marathi)',
    ta: 'தமிழ் (Tamil)',
    bn: 'বাংলা (Bengali)',
    te: 'తెలుగు (Telugu)',
    gu: 'ગુજરાતી (Gujarati)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ml: 'മലയാളം (Malayalam)',
    pa: 'ਪੰਜਾਬੀ (Punjabi)'
  };

  useEffect(() => {
    if (isOpen) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatus('unsupported');
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = langCodeMap[lang] || 'en-IN';

      rec.onstart = () => {
        setStatus('listening');
        setTranscriptText('');
      };

      rec.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscriptText(current);
      };

      rec.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          setStatus('error');
        }
      };

      rec.onend = () => {
        setStatus('processing');
        setTimeout(() => {
          setStatus('idle');
        }, 500);
      };

      setRecognition(rec);
      setStatus('idle');
    } else {
      if (recognition) {
        try { recognition.abort(); } catch (e) {}
      }
    }
  }, [isOpen, lang]);

  const handleStartListening = () => {
    if (!recognition) return;
    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition already started", e);
    }
  };

  const handleStopListening = () => {
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (e) {}
  };

  const handleConfirm = () => {
    if (transcriptText.trim()) {
      onResult(transcriptText);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all animate-in fade-in zoom-in-95 ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <h3 className="font-bold text-base font-display">{t.askVoice}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Body */}
        <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
          
          {status === 'unsupported' ? (
            <div className="space-y-3 px-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400">Voice Recognition Unavailable</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your browser does not support speech recognition. Please use Google Chrome, Edge, or type your query in the search bar.
              </p>
            </div>
          ) : (
            <>
              {/* Mic Indicator Button */}
              <button
                onClick={status === 'listening' ? handleStopListening : handleStartListening}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  status === 'listening'
                    ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/40 animate-pulse scale-110'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 hover:scale-105'
                }`}
              >
                {status === 'listening' ? (
                  <Mic className="w-10 h-10 animate-bounce" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>

              {/* Status Labels */}
              <div className="space-y-2 max-w-xs">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                  {langDisplayMap[lang] || 'English (India)'} • [{langCodeMap[lang] || 'en-IN'}]
                </span>

                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {status === 'listening'
                    ? '🎙 Listening...'
                    : status === 'processing'
                    ? 'Processing...'
                    : '🎤 Click mic to start speaking'}
                </p>

                {transcriptText ? (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-blue-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">
                    "{transcriptText}"
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Speak your budget question in {langDisplayMap[lang] || 'your language'}...
                  </p>
                )}
              </div>
            </>
          )}

        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {t.closeBtn}
          </button>

          {transcriptText && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5"
            >
              <span>Submit Question</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
