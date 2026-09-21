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
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Journey', path: '/journey', icon: NavIcon },
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Safety Guide', path: '/assistant', icon: Bot },
  ];

  return (
    <>
      {/* ─────────────────────────────────────────
          DESKTOP NAVIGATION
          ───────────────────────────────────────── */}
      <header
        className="hidden md:block fixed top-0 left-0 right-0 z-50"
        style={{
          height: '74px',
          background: 'rgba(244, 240, 232, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          className="mx-auto h-full px-6 lg:px-12 flex items-center justify-between"
          style={{ maxWidth: '1440px' }}
        >

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-75 group"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: '30px',
                height: '30px',
                background: 'var(--color-primary)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-display tracking-wide"
                style={{ fontSize: '20px', color: 'var(--color-primary)', lineHeight: 1 }}
              >
                SafeRoute
              </span>
              <span
                className="font-body"
                style={{ fontSize: '12px', color: 'var(--color-muted)', fontStyle: 'italic' }}
              >
                Mumbai
              </span>
            </div>
          </Link>

          {/* Centre navigation links */}
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative transition-colors"
                  style={{
                    padding: '6px 14px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '17px',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    fontWeight: isActive ? '600' : '400',
                    textDecoration: 'none',
                    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-muted)';
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTransitGuide(true)}
              className="font-body transition-colors cursor-pointer"
              style={{
                padding: '7px 12px',
                fontSize: '15px',
                color: 'var(--color-muted)',
                background: 'transparent',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--color-primary)';
                e.currentTarget.style.background = 'rgba(18,59,58,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--color-muted)';
                e.currentTarget.style.background = 'transparent';
              }}
              title="Transit Safety & Zero FIR Rights"
            >
              Rights
            </button>

            <button
              onClick={() => setShowFakeCall(true)}
              className="flex items-center gap-1.5 font-body transition-colors cursor-pointer"
              style={{
                padding: '7px 12px',
                fontSize: '15px',
                color: 'var(--color-accent)',
                background: 'transparent',
                border: 'none',
                borderRadius: '10px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(30,103,97,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Trigger Fake Call (Discreet Escape)"
            >
              <PhoneForwarded className="w-3.5 h-3.5" />
              <span>Fake Call</span>
            </button>

            <a
              href="tel:112"
              className="flex items-center gap-1.5 font-body font-semibold text-white transition-colors"
              style={{
                padding: '8px 14px',
                fontSize: '15px',
                background: 'var(--color-danger)',
                borderRadius: 'var(--radius-btn)',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(216,76,69,0.25)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#C0403A'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-danger)'}
              title="National Emergency Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS 112</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────
          MOBILE TOP HEADER
          ───────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          height: '56px',
          background: 'rgba(244, 240, 232, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div
            className="flex items-center justify-center rounded-md"
            style={{ width: '26px', height: '26px', background: 'var(--color-primary)', color: '#fff' }}
          >
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-display" style={{ fontSize: '18px', color: 'var(--color-primary)', lineHeight: 1 }}>
            SafeRoute{' '}
            <span className="font-body" style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
              Mumbai
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFakeCall(true)}
            className="flex items-center justify-center rounded-lg cursor-pointer"
            style={{
              width: '32px', height: '32px',
              background: 'rgba(30,103,97,0.1)',
              border: 'none',
              color: 'var(--color-accent)',
            }}
            title="Fake Call"
          >
            <PhoneForwarded className="w-3.5 h-3.5" />
          </button>
          <a
            href="tel:112"
            className="flex items-center gap-1 font-body font-semibold text-white"
            style={{
              padding: '6px 10px',
              fontSize: '13px',
              background: 'var(--color-danger)',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            <PhoneCall className="w-3 h-3" />
            <span>112</span>
          </a>
        </div>
      </header>

      {/* ─────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION
          ───────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all shadow-[0_-4px_20px_rgba(18,59,58,0.08)]"
        style={{
          background: 'rgba(244, 240, 232, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '8px',
          paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
          paddingLeft: '10px',
          paddingRight: '10px',
        }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link
            to="/"
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95"
            style={{
              textDecoration: 'none',
              color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--color-muted)',
              background: location.pathname === '/' ? 'rgba(18,59,58,0.08)' : 'transparent',
              fontFamily: 'var(--font-body)',
              minWidth: '52px',
            }}
          >
            <Shield className="w-4 h-4" />
            <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: location.pathname === '/' ? '700' : '500' }}>
              Home
            </span>
          </Link>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95"
                style={{
                  textDecoration: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                  background: isActive ? 'rgba(18,59,58,0.08)' : 'transparent',
                  fontFamily: 'var(--font-body)',
                  minWidth: '52px',
                }}
              >
                <Icon className="w-4 h-4" />
                <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: isActive ? '700' : '500' }}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <FakeCallModal isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
      <TransitAndRightsModal isOpen={showTransitGuide} onClose={() => setShowTransitGuide(false)} />
    </>
  );
}
