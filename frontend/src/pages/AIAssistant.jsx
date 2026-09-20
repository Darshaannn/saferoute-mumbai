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
  Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiRequest } from '../services/apiClient';

// Renders bot markdown with controlled styles — no raw asterisks shown to user
function BotMessage({ text }) {
  return (
    <ReactMarkdown
      components={{
        // Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        // Italic
        em: ({ children }) => (
          <em className="italic text-slate-600">{children}</em>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        // Unordered lists
        ul: ({ children }) => (
          <ul className="mb-2 space-y-1 pl-4">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="flex gap-2 text-slate-700">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
            <span>{children}</span>
          </li>
        ),
        // Ordered lists
        ol: ({ children }) => (
          <ol className="mb-2 space-y-1 pl-4 list-decimal list-inside">{children}</ol>
        ),
        // Horizontal rule
        hr: () => (
          <hr className="my-3 border-slate-200" />
        ),
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1.5 bg-slate-100 border border-slate-200 font-semibold text-left text-slate-700">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1.5 border border-slate-200 text-slate-700">{children}</td>
        ),
        // Headings inside bot message
        h1: ({ children }) => (
          <h3 className="font-bold text-sm text-slate-900 mb-1.5 mt-1">{children}</h3>
        ),
        h2: ({ children }) => (
          <h3 className="font-bold text-sm text-slate-900 mb-1.5 mt-1">{children}</h3>
        ),
        h3: ({ children }) => (
          <h3 className="font-semibold text-sm text-slate-800 mb-1 mt-1">{children}</h3>
        ),
        // Inline code
        code: ({ children }) => (
          <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[11px] font-mono">
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
        "I can help you with:\n" +
        "- **Emergency contacts** (112, 103, 139)\n" +
        "- **Your legal rights** (Zero FIR, night arrest protection)\n" +
        "- **Mumbai crime statistics** (official 2022–2023 data)\n" +
        "- **Safe travel tips** for Mumbai's roads, trains, and metro\n" +
        "- **What to do** if you feel unsafe right now\n\n" +
        "*Ask me anything in these areas.*"
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
  }, [messages]);

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
          ? "The safety data service is starting up. Please send your question again in a moment."
          : "Unable to reach the safety guide right now. Please try again.",
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
    <div className="pt-[74px] px-3 sm:px-4 max-w-3xl mx-auto flex flex-col pb-3"
      style={{ height: '100dvh' }}>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-900">Mumbai Safety Guide</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                Verified data · Rule-based · Not AI-generated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="tel:112"
              className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
              aria-label="Call 112 emergency"
            >
              <Phone className="w-3 h-3" />
              112
            </a>
            <a
              href="tel:103"
              className="text-[10px] font-bold bg-slate-900 hover:bg-black text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
              aria-label="Call 103 women helpline"
            >
              <Phone className="w-3 h-3" />
              103
            </a>
          </div>
        </div>

        {/* Safety Notice Banner */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-start gap-2 flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-700 leading-relaxed">
            <strong>In immediate danger? Call 112 now.</strong>{' '}
            This guide provides safety information only — it is not a live emergency service.
          </p>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-xl space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`px-4 py-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-2xl rounded-br-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  ) : (
                    <BotMessage text={m.text} />
                  )}
                </div>

                <div className={`text-[9px] text-slate-400 px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 pt-2.5 pb-1.5 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Quick questions
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {samplePrompts.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(null, p.label)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    p.urgent
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${p.urgent ? 'text-red-500' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
          <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
            <input
              type="text"
              id="safety-guide-input"
              placeholder="Ask about travel routes, legal rights, crime data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-4 pr-12 py-3 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white transition cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex justify-between items-center px-1 pt-1.5 text-[10px] text-slate-400">
            <span>Responses use predefined rules and verified Mumbai public safety datasets.</span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <MapPin className="w-2.5 h-2.5" />
              Mumbai only
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
