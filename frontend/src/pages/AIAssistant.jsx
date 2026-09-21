import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Shield,
  Phone,
  Compass,
  ShieldCheck,
  Scale,
  Train,
  AlertTriangle,
  MapPin,
  FileText,
  Lightbulb,
  PhoneCall
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiRequest } from '../services/apiClient';

// Renders bot markdown with controlled styles — unified with Civic Teal theme
function BotMessage({ text }) {
  return (
    <ReactMarkdown
      components={{
        // Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-[#123B3A]">{children}</strong>
        ),
        // Italic
        em: ({ children }) => (
          <em className="italic text-[#6E7772]">{children}</em>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed text-[13px] sm:text-[14px] text-[#17201F]">{children}</p>
        ),
        // Unordered lists
        ul: ({ children }) => (
          <ul className="mb-2 space-y-1.5 pl-3 sm:pl-4">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="flex gap-2 text-[13px] sm:text-[14px] text-[#17201F] leading-snug">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E6761] shrink-0" />
            <span>{children}</span>
          </li>
        ),
        // Ordered lists
        ol: ({ children }) => (
          <ol className="mb-2 space-y-1.5 pl-4 list-decimal list-inside text-[13px] sm:text-[14px] text-[#17201F]">{children}</ol>
        ),
        // Horizontal rule
        hr: () => (
          <hr className="my-2.5 border-[#D8D3C9]" />
        ),
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 rounded-xl border border-[#D8D3C9]">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="px-2.5 py-1.5 bg-[#E6EFEB] border border-[#D8D3C9] font-semibold text-left text-[#123B3A]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-2.5 py-1.5 border border-[#D8D3C9] text-[#17201F]">{children}</td>
        ),
        // Headings inside bot message
        h1: ({ children }) => (
          <h3 className="font-display text-[18px] text-[#123B3A] mb-1.5 mt-2 leading-tight">{children}</h3>
        ),
        h2: ({ children }) => (
          <h3 className="font-display text-[17px] text-[#123B3A] mb-1.5 mt-2 leading-tight">{children}</h3>
        ),
        h3: ({ children }) => (
          <h4 className="font-semibold text-[14px] text-[#123B3A] mb-1 mt-1.5">{children}</h4>
        ),
        // Inline code
        code: ({ children }) => (
          <code className="bg-[#E6EFEB] text-[#123B3A] px-1.5 py-0.5 rounded text-[11px] font-mono">
            {children}
          </code>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: (
        "Namaste. I am the **SafeRoute Mumbai Safety Guide**.\n\n" +
        "I am an intelligent rule-based civic assistant designed to help you navigate Mumbai securely using verified official records.\n\n" +
        "**I can assist you with:**\n" +
        "- **Immediate guidance:** What to do if you feel unsafe right now\n" +
        "- **Emergency helplines:** When and how to call 112, 103, 139\n" +
        "- **Your legal rights:** Zero FIR, night arrest rules, free legal aid\n" +
        "- **Official crime data:** Verified 2022–2023 Mumbai police statistics\n" +
        "- **Transit safety:** Tips for Mumbai local trains, metro, and night cabs\n\n" +
        "*Tap any prompt below or type your question to get started.*"
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const queryToSend = (textOverride || input).trim();
    if (!queryToSend || loading) return;

    setInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: queryToSend, timestamp: timeStr }]);
    setLoading(true);

    try {
      const data = await apiRequest('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryToSend })
      });
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: err.isTimeout
          ? "The safety data service is initializing. Please send your question again in a moment."
          : "Unable to reach the safety guide right now. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { label: "I feel like I'm being followed", icon: AlertTriangle, urgent: true },
    { label: "What is my right to Zero FIR?", icon: Scale },
    { label: "Emergency numbers in Mumbai", icon: Phone },
    { label: "Night travel: Dadar to Andheri", icon: Compass },
    { label: "2022 vs 2023 Mumbai crime stats", icon: ShieldCheck },
    { label: "Train & Metro safety tips", icon: Train },
    { label: "How to report harassment", icon: FileText },
    { label: "Practical safety tips", icon: Lightbulb },
  ];

  return (
    <div 
      className="pt-[58px] md:pt-[82px] pb-[78px] md:pb-4 px-2 sm:px-4 max-w-4xl mx-auto flex flex-col font-body"
      style={{ height: '100dvh' }}
    >

      {/* Main Chat Container */}
      <div 
        className="flex-1 flex flex-col overflow-hidden transition-all"
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px rgba(18,59,58,0.08)'
        }}
      >

        {/* ── CHAT HEADER ── */}
        <div 
          className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#D8D3C9] flex items-center justify-between shrink-0"
          style={{ background: '#F4F0E8' }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs relative"
              style={{ background: 'var(--color-primary)', color: '#ffffff' }}
            >
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-[17px] sm:text-[19px] leading-tight" style={{ color: 'var(--color-primary)' }}>
                  SafeRoute Safety Guide
                </span>
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded font-semibold bg-[#E6EFEB] text-[#1E6761]">
                  Online
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] leading-tight" style={{ color: 'var(--color-muted)' }}>
                Verified Mumbai Civic Intelligence &amp; Legal Reference
              </p>
            </div>
          </div>

          {/* Quick SOS Call Buttons */}
          <div className="flex items-center gap-1.5">
            <a
              href="tel:112"
              className="text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 text-white active:scale-95 shadow-xs"
              style={{ background: 'var(--color-danger)' }}
              title="National Emergency Helpline"
            >
              <PhoneCall className="w-3 h-3" />
              <span>112</span>
            </a>
            <a
              href="tel:103"
              className="text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 active:scale-95 border border-[#D8D3C9]"
              style={{ background: '#FFFFFF', color: 'var(--color-primary)' }}
              title="Mumbai Women Helpline"
            >
              <Phone className="w-3 h-3 text-[#1E6761]" />
              <span>103</span>
            </a>
          </div>
        </div>

        {/* ── SAFETY NOTICE ACCORDION / BANNER ── */}
        <div 
          className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-[#D8D3C9] flex items-center justify-between gap-2 shrink-0"
          style={{ background: 'rgba(216,76,69,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D84C45] shrink-0" />
            <p className="text-[11px] text-[#A83832] leading-tight">
              <strong>In immediate danger?</strong> Dial <strong>112</strong> immediately. This guide is for safety information.
            </p>
          </div>
        </div>

        {/* ── MESSAGES FEED SCROLL AREA ── */}
        <div className="flex-1 p-3 sm:p-5 space-y-4 overflow-y-auto min-h-0 bg-[#F4F0E8]/30">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 sm:gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {m.sender === 'bot' && (
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-[#D8D3C9]"
                  style={{ background: '#FFFFFF', color: 'var(--color-accent)' }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Message Content Bubble */}
              <div className={`max-w-[90%] sm:max-w-xl space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all"
                  style={{
                    borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.sender === 'user' ? 'var(--color-primary)' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : 'var(--color-ink)',
                    border: m.sender === 'user' ? 'none' : '1px solid #D8D3C9',
                    boxShadow: m.sender === 'user' ? '0 3px 12px rgba(18,59,58,0.15)' : '0 2px 8px rgba(18,59,58,0.04)'
                  }}
                >
                  {m.sender === 'user' ? (
                    <span className="text-[13px] sm:text-[14px] leading-relaxed whitespace-pre-wrap">{m.text}</span>
                  ) : (
                    <BotMessage text={m.text} />
                  )}
                </div>

                <div 
                  className={`text-[10px] px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--color-muted)' }}
                >
                  {m.timestamp}
                </div>
              </div>

              {/* User Avatar */}
              {m.sender === 'user' && (
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-white"
                  style={{ background: 'var(--color-accent)' }}
                >
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-2 items-center">
              <div 
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border border-[#D8D3C9]"
                style={{ background: '#FFFFFF', color: 'var(--color-accent)' }}
              >
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div 
                className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 border border-[#D8D3C9] bg-white"
                style={{ boxShadow: '0 2px 8px rgba(18,59,58,0.04)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E6761] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E6761] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E6761] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-[#6E7772] ml-1.5">Checking safety database…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── QUICK SUGGESTION PILLS ── */}
        <div 
          className="px-2.5 sm:px-4 pt-2 pb-1.5 border-t border-[#D8D3C9] shrink-0"
          style={{ background: '#F4F0E8' }}
        >
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6E7772]">
              Suggested Questions
            </span>
            <span className="text-[10px] text-[#6E7772] italic hidden sm:inline">
              Tap to query instantly
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {samplePrompts.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(null, p.label)}
                  className="text-[11px] sm:text-[12px] px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs font-medium"
                  style={{
                    background: p.urgent ? '#FDF2F2' : '#FFFFFF',
                    color: p.urgent ? '#D84C45' : 'var(--color-primary)',
                    borderColor: p.urgent ? 'rgba(216,76,69,0.3)' : '#D8D3C9',
                  }}
                >
                  <Icon className={`w-3 h-3 ${p.urgent ? 'text-[#D84C45]' : 'text-[#1E6761]'}`} />
                  <span className="whitespace-nowrap">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── INPUT BAR ── */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-[#D8D3C9] shrink-0">
          <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
            <input
              type="text"
              id="safety-guide-input"
              placeholder="Ask about travel safety, legal rights, crime data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-3.5 pr-11 py-2.5 sm:py-3 text-[13px] sm:text-[14px] bg-[#F4F0E8]/50 focus:bg-white border border-[#D8D3C9] rounded-xl focus:outline-none focus:border-[#1E6761] focus:ring-1 focus:ring-[#1E6761] transition placeholder:text-[#8E9690] text-[#17201F]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 p-2 rounded-lg text-white transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 shadow-xs"
              style={{ background: 'var(--color-primary)' }}
              aria-label="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sub-footer details */}
          <div className="flex justify-between items-center px-1 pt-1.5 text-[10px]" style={{ color: 'var(--color-muted)' }}>
            <span>Rule-based AI · Verified Mumbai datasets · 24/7 availability</span>
            <span className="flex items-center gap-1 shrink-0 font-medium text-[#1E6761]">
              <MapPin className="w-2.5 h-2.5" />
              Mumbai Jurisdiction
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
