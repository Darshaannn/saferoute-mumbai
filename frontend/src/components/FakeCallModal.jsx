import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Shield, Clock, BellRing, Sparkles, Play, Square, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';

const CALLER_PRESETS = [
  {
    id: 'mom',
    name: 'Mom',
    number: '+91 98201 12044',
    subtitle: 'Home / Family',
    avatar: '👩',
    gender: 'female',
    scripts: {
      'en-IN': "Beta, where are you right now? I'm waiting near the gate. I called because it's getting late. Don't worry, tell the driver I am standing right outside for you.",
      'hi-IN': "बेटा, कहाँ पहुँची? मैं बाहर ही खड़ी हूँ। जल्दी आ जाओ, कोई दिक्कत तो नहीं है?"
    },
    dialogueHint: "“Yes Mom, I see you standing near the gate. I'm stepping out right now.”",
    voiceRate: 0.92,
    voicePitch: 1.08
  },
  {
    id: 'dad',
    name: 'Dad',
    number: '+91 98200 45892',
    subtitle: 'Mobile / Family',
    avatar: '👨',
    gender: 'male',
    scripts: {
      'en-IN': "Beta, I have reached the corner junction in the car. I'm parked right next to the traffic booth. Come straight out, I'm watching the road.",
      'hi-IN': "हाँ बेटा, मैं सिग्नल के पास खड़ा हूँ। गाड़ी का नंबर देख के सीधे बाहर आ जाओ, मैं यहीं हूँ।"
    },
    dialogueHint: "“Yes Papa, I see the car right across the road. Stepping out in ten seconds.”",
    voiceRate: 0.90,
    voicePitch: 0.92
  },
  {
    id: 'inspector',
    name: 'Inspector V. Sharma',
    number: 'Mumbai Police Control',
    subtitle: 'Nirbhaya Escort Cell',
    avatar: '👮‍♂️',
    gender: 'male',
    scripts: {
      'en-IN': "Hello, this is Inspector Sharma from Mumbai Police Nirbhaya Cell. We are monitoring your route corridor on the dispatch grid. Confirm if you have arrived safely.",
      'hi-IN': "नमस्ते, मुंबई पुलिस निर्भया सेल से इंस्पेक्टर शर्मा। हम आपके रूट कॉरिडोर को ट्रैक कर रहे हैं। क्या आप सुरक्षित हैं?"
    },
    dialogueHint: "“Yes Inspector, I am at the drop point now. All clear, thank you for tracking.”",
    voiceRate: 0.95,
    voicePitch: 0.95
  },
  {
    id: 'support',
    name: 'Cab Safety Assist',
    number: '+91 22 6600 4000',
    subtitle: 'Trip Support Desk',
    avatar: '🚕',
    gender: 'female',
    scripts: {
      'en-IN': "Namaste, this is SafeRoute Trip Support. We have your live route on our monitor. Please confirm if you need us to hold the line until your drop point.",
      'hi-IN': "नमस्ते, सेफरूट ट्रिप सपोर्ट डेस्क। आपकी यात्रा मॉनिटर हो रही है। क्या आपको किसी सहायता की आवश्यकता है?"
    },
    dialogueHint: "“I am on the call with safety support now. Dropping off right here.”",
    voiceRate: 0.96,
    voicePitch: 1.02
  }
];

export default function FakeCallModal({ isOpen, onClose }) {
  const [step, setStep] = useState('config'); // 'config' | 'countdown' | 'ringing' | 'connected'
  const [selectedCaller, setSelectedCaller] = useState(CALLER_PRESETS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN'); // 'en-IN' | 'hi-IN'
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const audioPlayerRef = useRef(null);
  const activeVoiceAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const vibrateIntervalRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  // Pre-load available Web Speech API voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Pre-instantiate ringtone audio element
  useEffect(() => {
    const audio = new Audio('/audio/ringtone.mp4');
    audio.loop = true;
    audio.preload = 'auto';
    audioPlayerRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      if (vibrateIntervalRef.current) clearInterval(vibrateIntervalRef.current);
      stopAnyVoicePlayback();
    };
  }, []);

  const stopAnyVoicePlayback = () => {
    if (activeVoiceAudioRef.current) {
      activeVoiceAudioRef.current.pause();
      activeVoiceAudioRef.current.currentTime = 0;
      activeVoiceAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
    setIsPreviewPlaying(false);
  };

  // Web Audio chime fallback if media cannot autoplay
  const startSynthChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const playChime = () => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(853, ctx.currentTime);
        osc2.frequency.setValueAtTime(960, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);
      };

      playChime();
      ringIntervalRef.current = setInterval(playChime, 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Play realistic ringtone audio file (with vibration & fallback)
  const startRingtone = () => {
    stopRingtone();

    // Trigger mobile vibration pattern if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([600, 300, 600, 300, 1000]);
        vibrateIntervalRef.current = setInterval(() => {
          navigator.vibrate([600, 300, 600, 300, 1000]);
        }, 2800);
      } catch (e) {
        // ignore
      }
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
      const playPromise = audioPlayerRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio element playback blocked or failed, using synth fallback:', err);
          startSynthChime();
        });
      }
    } else {
      startSynthChime();
    }
  };

  const stopRingtone = () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch (e) {
        console.error(e);
      }
    }
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch (e) {
        // ignore
      }
    }
  };

  // Cleanup on modal close
  useEffect(() => {
    if (!isOpen) {
      stopRingtone();
      stopAnyVoicePlayback();
      setStep('config');
    }
  }, [isOpen]);

  // Find the most suitable Indian locale browser voice
  const getBestIndianVoice = (caller, langCode) => {
    if (!availableVoices || availableVoices.length === 0) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) setAvailableVoices(v);
      }
    }

    const voices = availableVoices || [];
    const isFemale = caller.gender === 'female';

    // 1. Language matching filter
    const langMatches = voices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      if (langCode === 'hi-IN') {
        return vLang.startsWith('hi') || v.name.toLowerCase().includes('hindi');
      }
      return vLang === 'en-in' || vLang.startsWith('en-in') || v.name.toLowerCase().includes('india');
    });

    if (langMatches.length > 0) {
      // Prioritize by gender heuristic
      if (isFemale) {
        const femaleMatch = langMatches.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('female') || n.includes('neerja') || n.includes('swara') || n.includes('heera') || n.includes('sangeeta') || n.includes('zira') || n.includes('google');
        });
        if (femaleMatch) return femaleMatch;
      } else {
        const maleMatch = langMatches.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('male') || n.includes('rishi') || n.includes('madhur') || n.includes('ravi') || n.includes('david') || n.includes('george');
        });
        if (maleMatch) return maleMatch;
      }
      return langMatches[0];
    }

    // 2. Fallback to any Indian voice regardless of exact language
    const anyIndian = voices.find(v => (v.lang || '').toLowerCase().includes('in'));
    if (anyIndian) return anyIndian;

    // 3. Fallback to generic natural English voices
    if (isFemale) {
      const genericFemale = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'));
      if (genericFemale) return genericFemale;
    }

    return voices[0] || null;
  };

  // Play realistic voice with backend ElevenLabs TTS proxy + browser SpeechSynthesis fallback
  const playVoiceAudio = async (caller, langCode, isPreview = false) => {
    stopAnyVoicePlayback();
    if (isPreview) setIsPreviewPlaying(true);

    const scriptText = caller.scripts[langCode] || caller.scripts['en-IN'];

    // 1. Attempt server-side high-quality TTS proxy
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: scriptText,
          persona: caller.id,
          language: langCode
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('audio/')) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const ttsAudio = new Audio(audioUrl);
        activeVoiceAudioRef.current = ttsAudio;

        ttsAudio.onended = () => {
          setIsPreviewPlaying(false);
          URL.revokeObjectURL(audioUrl);
          activeVoiceAudioRef.current = null;
        };

        ttsAudio.onerror = () => {
          setIsPreviewPlaying(false);
          URL.revokeObjectURL(audioUrl);
          activeVoiceAudioRef.current = null;
          fallbackBrowserSpeech(caller, scriptText, langCode, isPreview);
        };

        await ttsAudio.play();
        return;
      }
    } catch (e) {
      // Backend TTS proxy offline or unconfigured -> proceed to browser SpeechSynthesis
    }

    // 2. Native Browser SpeechSynthesis with authentic Indian accent calibration
    fallbackBrowserSpeech(caller, scriptText, langCode, isPreview);
  };

  const fallbackBrowserSpeech = (caller, text, langCode, isPreview) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPreviewPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const matchedVoice = getBestIndianVoice(caller, langCode);

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.rate = caller.voiceRate || 0.92;
    utterance.pitch = caller.voicePitch || 1.0;

    utterance.onend = () => {
      setIsPreviewPlaying(false);
    };

    utterance.onerror = () => {
      setIsPreviewPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play simulated speech on answered call
  const playSimulatedVoice = () => {
    playVoiceAudio(selectedCaller, selectedLanguage, false);
  };

  const handleTogglePreview = () => {
    if (isPreviewPlaying) {
      stopAnyVoicePlayback();
    } else {
      playVoiceAudio(selectedCaller, selectedLanguage, true);
    }
  };

  // Countdown effect
  useEffect(() => {
    let timer;
    if (step === 'countdown' && countdownRemaining > 0) {
      timer = setTimeout(() => setCountdownRemaining(c => c - 1), 1000);
    } else if (step === 'countdown' && countdownRemaining === 0) {
      setStep('ringing');
      startRingtone();
    }
    return () => clearTimeout(timer);
  }, [step, countdownRemaining]);

  // Connected call duration timer
  useEffect(() => {
    let timer;
    if (step === 'connected') {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const handleStartTimer = (secs) => {
    stopAnyVoicePlayback();
    if (secs === 0) {
      setStep('ringing');
      startRingtone();
    } else {
      setDelaySeconds(secs);
      setCountdownRemaining(secs);
      setStep('countdown');
    }
  };

  const handleAnswer = () => {
    stopRingtone();
    setStep('connected');
    setCallDuration(0);
    playSimulatedVoice();
  };

  const handleDecline = () => {
    stopRingtone();
    stopAnyVoicePlayback();
    setStep('config');
    onClose();
  };

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        
        {/* ================= 1. CONFIGURATION SCREEN ================= */}
        {step === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Discreet Escape Protocol
                </span>
                <h3 className="text-xl font-black text-white mt-1">Simulate Incoming Call</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Triggers an authentic phone call simulation with realistic Indian voices to help you excuse yourself safely.
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer">✕</button>
            </div>

            {/* Caller Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Choose Caller Identity:</label>
              <div className="grid grid-cols-2 gap-2">
                {CALLER_PRESETS.map((caller) => (
                  <button
                    key={caller.name}
                    onClick={() => {
                      setSelectedCaller(caller);
                      if (isPreviewPlaying) stopAnyVoicePlayback();
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      selectedCaller.name === caller.name
                        ? 'bg-[#1E6761]/30 border-[#1E6761] text-white shadow-sm ring-1 ring-[#1E6761]'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{caller.avatar}</span>
                    <div className="truncate">
                      <div className="font-bold text-xs truncate">{caller.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{caller.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Voice Preview Strip */}
            <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-emerald-400" /> Voice Accent & Language:
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs">
                  <button
                    onClick={() => {
                      setSelectedLanguage('en-IN');
                      if (isPreviewPlaying) stopAnyVoicePlayback();
                    }}
                    className={`px-2 py-1 rounded-md font-medium text-[11px] transition cursor-pointer ${
                      selectedLanguage === 'en-IN'
                        ? 'bg-[#1E6761] text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🇮🇳 Indian English
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLanguage('hi-IN');
                      if (isPreviewPlaying) stopAnyVoicePlayback();
                    }}
                    className={`px-2 py-1 rounded-md font-medium text-[11px] transition cursor-pointer ${
                      selectedLanguage === 'hi-IN'
                        ? 'bg-[#1E6761] text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🇮🇳 Hindi (हिंदी)
                  </button>
                </div>
              </div>

              {/* Script Sample & Preview Button */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/50">
                <p className="text-[11px] text-slate-300 italic truncate flex-1">
                  &ldquo;{selectedCaller.scripts[selectedLanguage] || selectedCaller.scripts['en-IN']}&rdquo;
                </p>
                <button
                  onClick={handleTogglePreview}
                  className={`px-2.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                    isPreviewPlaying
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  }`}
                  title={isPreviewPlaying ? "Stop voice sample" : "Listen to sample voice"}
                >
                  {isPreviewPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isPreviewPlaying ? 'Playing' : 'Preview Voice'}</span>
                </button>
              </div>
            </div>

            {/* Trigger Options */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Trigger Ringtone After:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Instant', sec: 0 },
                  { label: '5s', sec: 5 },
                  { label: '15s', sec: 15 },
                  { label: '30s', sec: 30 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleStartTimer(item.sec)}
                    className="py-2.5 px-2 bg-gradient-to-tr from-[#1E6761] to-teal-600 hover:from-[#123B3A] hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 text-center cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 2. COUNTDOWN ACTIVE SCREEN ================= */}
        {step === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-[#1E6761]/20 text-[#1E6761] border border-[#1E6761]/30 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="font-bold text-lg">Call Trigger Armed</h4>
            <p className="text-xs text-slate-400">
              Incoming call from <strong className="text-white">{selectedCaller.name}</strong> will ring in:
            </p>
            <div className="text-4xl font-black text-emerald-400 tracking-wider font-mono">
              {countdownRemaining}s
            </div>
            <button
              onClick={handleDecline}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancel Call Trigger
            </button>
          </motion.div>
        )}

        {/* ================= 3. INCOMING RINGING SCREEN ================= */}
        {step === 'ringing' && (
          <motion.div
            key="ringing"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[5000] bg-slate-950 text-white flex flex-col justify-between py-16 px-8 max-w-md mx-auto"
          >
            {/* Caller Info */}
            <div className="text-center pt-8 space-y-3">
              <div className="w-28 h-28 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto text-5xl shadow-2xl">
                {selectedCaller.avatar}
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">{selectedCaller.name}</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">{selectedCaller.number}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-emerald-400 text-xs font-semibold mt-3 animate-pulse">
                  <BellRing className="w-3.5 h-3.5" /> Incoming Call...
                </div>
              </div>
            </div>

            {/* Answer / Decline Controls */}
            <div className="flex justify-around items-center pb-8 px-4">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleDecline}
                  className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 active:scale-95 transition cursor-pointer"
                  aria-label="Decline Call"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
                <span className="text-xs text-slate-400 font-medium">Decline</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleAnswer}
                  className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 transition animate-bounce cursor-pointer"
                  aria-label="Accept Call"
                >
                  <Phone className="w-8 h-8" />
                </button>
                <span className="text-xs text-emerald-400 font-semibold">Accept</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 4. CONNECTED ACTIVE CALL SCREEN ================= */}
        {step === 'connected' && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-slate-950 text-white flex flex-col justify-between py-14 px-8 max-w-md mx-auto"
          >
            {/* Header & Duration */}
            <div className="text-center pt-6 space-y-2">
              <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-4xl shadow-xl">
                {selectedCaller.avatar}
              </div>
              <h2 className="text-2xl font-bold">{selectedCaller.name}</h2>
              <div className="text-sm font-mono text-emerald-400 font-semibold">{formatTime(callDuration)}</div>
            </div>

            {/* Dialogue Prompt Helper */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px]">
                <Shield className="w-3.5 h-3.5" /> Suggested Escape Script:
              </div>
              <p className="italic text-slate-200">
                {selectedCaller.dialogueHint}
              </p>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                Playing: <span className="text-emerald-400 font-medium">{selectedLanguage === 'hi-IN' ? 'Hindi Voice' : 'Indian English Voice'}</span>
              </div>
            </div>

            {/* Phone In-Call Actions */}
            <div className="space-y-6 pb-6">
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    isMuted ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  <span className="text-[10px]">{isMuted ? 'Muted' : 'Mute'}</span>
                </button>
                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    isSpeaker ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="text-[10px]">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
                </button>
                <button
                  onClick={() => playSimulatedVoice()}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                  title="Replay Voice Prompt"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px]">Replay Voice</span>
                </button>
              </div>

              {/* End Call Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleDecline}
                  className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 active:scale-95 transition cursor-pointer"
                  aria-label="End Call"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

