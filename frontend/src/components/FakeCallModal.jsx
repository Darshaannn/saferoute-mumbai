import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Shield, User, Clock, BellRing, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CALLER_PRESETS = [
  { name: 'Dad', number: '+91 98200 45892', subtitle: 'Mobile', avatar: '👨' },
  { name: 'Mom', number: '+91 98201 12044', subtitle: 'Home', avatar: '👩' },
  { name: 'Inspector V. Sharma', number: 'Mumbai Police Control', subtitle: 'Nirbhaya Escort Cell', avatar: '👮‍♂️' },
  { name: 'Cab Safety Assist', number: '+91 22 6600 4000', subtitle: 'Trip Support Desk', avatar: '🚕' },
];

export default function FakeCallModal({ isOpen, onClose }) {
  const [step, setStep] = useState('config'); // 'config' | 'countdown' | 'ringing' | 'connected'
  const [selectedCaller, setSelectedCaller] = useState(CALLER_PRESETS[0]);
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);

  // Play realistic synthesized ringtone
  const startRingtone = () => {
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

  const stopRingtone = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  };

  // Play simulated speech on answered call
  const playSimulatedVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        `Hey, where are you right now? I have reached the main junction and I am parked right outside waiting for you. Let me know the moment you get out of the car.`
      );
      msg.rate = 0.95;
      msg.pitch = 1.0;
      window.speechSynthesis.speak(msg);
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
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Discreet Escape Protocol
                </span>
                <h3 className="text-xl font-black text-white mt-1">Simulate Incoming Call</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Triggers an authentic phone call simulation to help you excuse yourself from uncomfortable cabs or situations.
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-sm">✕</button>
            </div>

            {/* Caller Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Choose Caller Identity:</label>
              <div className="grid grid-cols-2 gap-2">
                {CALLER_PRESETS.map((caller) => (
                  <button
                    key={caller.name}
                    onClick={() => setSelectedCaller(caller)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      selectedCaller.name === caller.name
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
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

            {/* Trigger Options */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
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
                    className="py-2.5 px-2 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 text-center"
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
            <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
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
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
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
                  className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 active:scale-95 transition"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
                <span className="text-xs text-slate-400 font-medium">Decline</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleAnswer}
                  className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 transition animate-bounce"
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
              <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[10px]">
                <Shield className="w-3.5 h-3.5" /> Suggested Escape Script:
              </div>
              <p className="italic text-slate-200">
                &ldquo;Yes, I see your car at the corner. I'm stepping out right now, please stay on the call.&rdquo;
              </p>
            </div>

            {/* Phone In-Call Actions */}
            <div className="space-y-6 pb-6">
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition ${
                    isMuted ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  <span className="text-[10px]">{isMuted ? 'Muted' : 'Mute'}</span>
                </button>
                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition ${
                    isSpeaker ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="text-[10px]">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
                </button>
                <button
                  onClick={() => playSimulatedVoice()}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white flex flex-col items-center justify-center gap-1 transition"
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
                  className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 active:scale-95 transition"
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
