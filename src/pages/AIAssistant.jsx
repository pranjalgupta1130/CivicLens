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
  HelpCircle
} from 'lucide-react';
import { samplePrompts, detailedBudgets, aiAlertsData, civicKPIs } from '../data/mockData';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your **CivicLens Public Governance AI**. Ask me anything about government sector allocations, scheme ledgers, spending variances, or major policy changes for FY 2026.",
      sources: ["CAG Open Budget Portal", "Ministry Ledgers"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIAnswer = (query) => {
    const q = query.toLowerCase();

    if (q.includes('why has healthcare') || (q.includes('healthcare') && q.includes('increased'))) {
      return {
        text: `Healthcare spending increased by **↑ 18%** (reaching **₹2,850 Cr**) this year due to:\n\n1. **District Hospital Expansion Mission**: ₹2,040 Cr allocated for constructing 12 new district hospitals.\n2. **Medical Supplies Procurement**: Centralized supply chain upgrades for emergency medical supplies.\n3. **Active Alert Flag**: An alert (ALT-9001) is active regarding hospital construction milestone disbursement.`,
        sources: ["GOV-2026-002", "Healthcare Budget Brief FY 2026"]
      };
    } else if (q.includes('allocated to education') || (q.includes('education') && q.includes('how much'))) {
      return {
        text: `**Education** holds the single highest allocation in FY 2026 at **₹3,240 Cr** (26% of the total budget).\n\nKey details:\n- **Growth**: ↑ 12% increase from last year.\n- **Primary Scheme**: PM School Modernization Program (modernizing 250 schools and digital labs).\n- **Spent to Date**: ₹2,680 Cr.`,
        sources: ["GOV-2026-001", "Education Ministry Ledger"]
      };
    } else if (q.includes('highest funding') || q.includes('which sector received')) {
      return {
        text: `**Education** received the highest funding among all sectors in FY 2026:\n\n1. **Education**: ₹3,240 Cr (26%)\n2. **Healthcare**: ₹2,850 Cr (23%)\n3. **Roads & Highways**: ₹2,100 Cr (17%)\n4. **Agriculture**: ₹1,450 Cr (12%)\n5. **Social Welfare**: ₹1,100 Cr (9%)`,
        sources: ["CivicLens Sector Ranking FY 2026"]
      };
    } else if (q.includes('road construction') || q.includes('road')) {
      return {
        text: `A total of **₹2,100 Cr** (17% of total budget) is allocated to **Roads & Highways** in FY 2026.\n\n- **Current Disbursement**: ₹1,890 Cr (90% utilization)\n- **Major Projects**: 84 road projects approved, including the National Highway Development Project (+₹800 Cr surge for new corridors).`,
        sources: ["GOV-2026-003", "PWD Expressways Report"]
      };
    } else if (q.includes('compare agriculture') || (q.includes('agriculture') && (q.includes('2025') || q.includes('2026')))) {
      return {
        text: `**Agriculture Sector Spending Comparison**:\n- **FY 2025**: ₹1,510 Cr\n- **FY 2026**: **₹1,450 Cr** (↓ 4% reduction due to completion of prior storage warehouse projects)\n\nDespite the allocation shift, direct farmer subsidies expanded to **2.3 lakh farmers** via the PM Kisan Samman & Fertilizer Support program.`,
        sources: ["AgriDirect Financial Ledger", "CAG Annual Report"]
      };
    } else if (q.includes('districts') || q.includes('infrastructure investment')) {
      return {
        text: `The largest infrastructure investments in FY 2026 were directed to:\n\n1. **Eastern Corridor Districts**: ₹800 Cr for National Highway Development.\n2. **District 4 & District 7**: ₹2,040 Cr for 12 new district hospitals.\n3. **Rural Belt Districts**: 15% increase in Rural Water Supply Mission projects.`,
        sources: ["State Spatial Budget Mapping", "District Expenditure Portal"]
      };
    } else if (q.includes('major budget changes') || q.includes('changes this year')) {
      return {
        text: `**Major Budget Changes in FY 2026**:\n\n• **Healthcare**: Increased by ↑ 18% (₹2,850 Cr) for 12 new district hospitals.\n• **Education**: Increased by ↑ 12% (₹3,240 Cr) for 250 school modernizations.\n• **Roads & Highways**: Surge of +₹800 Cr for new highway corridors.\n• **Rural Water Supply**: Outlay increased by 15% for rural drinking water grid.\n• **Agriculture**: Adjusted by ↓ 4% (₹1,450 Cr) with subsidy expanded to 2.3L farmers.`,
        sources: ["CAG Policy Brief FY 2026", "Public Governance Summary"]
      };
    } else {
      return {
        text: `I queried the CivicLens public budget repository regarding **"${query}"**.\n\nSummary Findings:\n- Verified total budget allocations stand at **${civicKPIs.totalBudget}** across 8 key sectors.\n- **Disbursed Expenditures**: ${civicKPIs.spentAmount} (78.7% overall utilization rate).\n- You can inspect line items in the **Budget Explorer** tab or audit risk flags in **AI Alerts**.`,
        sources: ["CAG Open Data API", "Civic Ledger Standard v2.4"]
      };
    }
  };

  const handleSendMessage = (textToSend) => {
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

    setTimeout(() => {
      const aiResponse = generateAIAnswer(text);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse.text,
        sources: aiResponse.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
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
        text: "Chat cleared. Ask me another question about government sector ledgers or AI audit flags!",
        sources: ["CivicLens Core Engine"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Civic AI Assistant
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Conversational Governance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Query government budget ledgers, vendor contracts, and audit logs using natural language.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Clear Conversation</span>
        </button>
      </div>

      {/* Recommended Prompt Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Prompts
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
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
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
                <span>Auditing sector ledgers and compiling answer...</span>
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
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask any budget question (e.g. Why has healthcare spending increased?)..."
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
