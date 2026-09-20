import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Shield, 
  Sparkles, 
  Phone, 
  Compass, 
  ShieldCheck, 
  Scale, 
  Train
} from 'lucide-react';
import { motion } from 'framer-motion';
import API_BASE_URL from '../config/api';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your Mumbai Safety Assistant. Ask me about travel routes, suburban train safety (ladies coach / RPF 1512), women's legal rights (Zero FIR, night arrest rules), or 24/7 emergency helplines.",
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
      const res = await fetch(`${API_BASE_URL}/api/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryToSend })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: data.reply, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "Unable to connect to the SafeRoute analytics engine. Please ensure your local Flask server is active on port 5000.", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { label: "Night travel: Dadar to Andheri", icon: Compass },
    { label: "What is my right to Zero FIR?", icon: Scale },
    { label: "2022 vs 2023 Mumbai crime stats", icon: ShieldCheck },
    { label: "Train women's safety & GRP 1512", icon: Train },
    { label: "Emergency helplines (112, 103)", icon: Phone },
  ];

  return (
    <div className="pt-20 px-3 sm:px-4 max-w-3xl mx-auto h-[calc(100dvh-1rem)] flex flex-col pb-3">
      
      {/* 1. COMPACT SINGLE-FRAME CHAT CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Compact Sub-Header */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-800">Safety Intelligence Assistant</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Official Mumbai Dataset 2022–2023</span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-3.5 sm:p-4 space-y-3 overflow-y-auto min-h-0">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-xl space-y-0.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs font-normal'
                      : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
                
                <div className={`text-[9px] text-slate-400 px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5 items-center text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 w-fit"
            >
              <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching Mumbai safety intelligence...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (Horizontal Scrollable) */}
        <div className="px-3 py-2 bg-slate-50/70 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 w-max">
            {samplePrompts.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(null, p.label)}
                  className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Icon className="w-3 h-3 text-slate-400" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar Fixed in Frame */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-slate-100">
          <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask about travel routes, legal rights, crime data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-3.5 pr-11 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex justify-between items-center px-1 pt-1.5 text-[10px] text-slate-400">
            <span>Verified 2022–2023 Mumbai Records</span>
            <span>Helpline: <strong>112</strong> / <strong>103</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
