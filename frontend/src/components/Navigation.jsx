import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Map, Activity, Navigation as NavIcon, Bot, PhoneCall, PhoneForwarded, Scale } from 'lucide-react';
import FakeCallModal from './FakeCallModal';
import TransitAndRightsModal from './TransitAndRightsModal';

export default function Navigation() {
  const location = useLocation();
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [showTransitGuide, setShowTransitGuide] = useState(false);

  const links = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Safety Map', path: '/map', icon: Map },
    { name: 'Safe Journey', path: '/journey', icon: NavIcon },
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
  ];

  return (
    <>
      {/* Desktop Floating Navigation */}
      <header className="hidden md:flex fixed top-0 w-full z-50 px-6 py-3 justify-between items-center pointer-events-none">
        {/* Brand */}
        <Link 
          to="/" 
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs tracking-tight text-slate-900">
              SafeRoute <span className="text-blue-600 font-semibold">Mumbai</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Fake Call discreet button */}
          <button
            onClick={() => setShowFakeCall(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-medium shadow-xs transition cursor-pointer"
            title="Trigger Fake Call (Discreet Escape)"
          >
            <PhoneForwarded className="w-3.5 h-3.5 text-emerald-600" />
            Fake Call
          </button>

          {/* Legal / Transit Guide button */}
          <button
            onClick={() => setShowTransitGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-medium shadow-xs transition cursor-pointer"
            title="Transit Safety & Zero FIR Rights"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Rights & Transit
          </button>

          {/* Emergency Quick Action */}
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs hover:shadow transition active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            SOS 112
          </a>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-3 py-2">
        <div className="flex justify-around items-center">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                  isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">{link.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowFakeCall(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-emerald-600 font-bold"
          >
            <PhoneForwarded className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Fake Call</span>
          </button>
          <a
            href="tel:112"
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-rose-600 font-bold bg-rose-50"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] mt-0.5">SOS</span>
          </a>
        </div>
      </nav>

      {/* Modals */}
      <FakeCallModal isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
      <TransitAndRightsModal isOpen={showTransitGuide} onClose={() => setShowTransitGuide(false)} />
    </>
  );
}
