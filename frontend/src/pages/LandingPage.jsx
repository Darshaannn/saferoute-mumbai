import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  PhoneCall,
  PhoneForwarded,
  Scale,
  ExternalLink,
} from 'lucide-react';
import HeroJourneyPreview from '../components/home/HeroJourneyPreview';
import FakeCallModal from '../components/FakeCallModal';
import TransitAndRightsModal from '../components/TransitAndRightsModal';

export default function LandingPage() {
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [showTransitGuide, setShowTransitGuide] = useState(false);

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--color-bg)', color: 'var(--color-ink)' }}>

      {/* ================================================================ */}
      {/* HERO SECTION */}
      {/* ================================================================ */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: 'calc(100vh - 74px)',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '80px',
          paddingBottom: '64px',
        }}
      >
        {/* Subtle Civic Teal glow hint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 75% 45%, rgba(30,103,97,0.05) 0%, transparent 60%),' +
              'radial-gradient(circle at 15% 85%, rgba(18,59,58,0.03) 0%, transparent 50%)',
          }}
        />

        <div className="relative w-full max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* LEFT COLUMN: 46-48% width (5.5 cols on 12-grid) */}
            <div className="lg:col-span-6 flex flex-col gap-6">

              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <div
                  className="rounded-full"
                  style={{ width: '7px', height: '7px', background: '#1E6761', flexShrink: 0 }}
                />
                <span
                  className="font-body"
                  style={{
                    fontSize: '13px',
                    fontStyle: 'italic',
                    color: '#6E7772',
                    letterSpacing: '0.06em',
                  }}
                >
                  Mumbai · Safety &amp; Civic Mobility
                </span>
              </div>

              {/* H1 — Bebas Neue */}
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(54px, 6.5vw, 92px)',
                  lineHeight: '0.94',
                  letterSpacing: '0.01em',
                  color: '#123B3A',
                }}
              >
                Know more<br />
                <span style={{ color: '#123B3A' }}>before you</span><br />
                <span style={{ color: '#1E6761' }}>move.</span>
              </h1>

              {/* Body copy — Instrument Serif */}
              <p
                className="font-body leading-relaxed"
                style={{ fontSize: '19px', maxWidth: '480px', color: '#6E7772' }}
              >
                Compare routes by nearby police and medical resources,
                explore Mumbai&apos;s safety infrastructure, and reach
                emergency support quickly.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/journey"
                  className="group flex items-center justify-center gap-2.5 font-body font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    padding: '14px 30px',
                    borderRadius: '11px',
                    fontSize: '17px',
                    background: '#123B3A',
                    boxShadow: '0 4px 18px rgba(18,59,58,0.16)',
                    textDecoration: 'none',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0E302F'}
                  onMouseLeave={e => e.currentTarget.style.background = '#123B3A'}
                >
                  Plan a journey
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  to="/map"
                  className="flex items-center justify-center gap-2 font-body font-semibold transition-all active:scale-[0.98]"
                  style={{
                    padding: '13px 28px',
                    borderRadius: '11px',
                    fontSize: '17px',
                    background: 'transparent',
                    color: '#123B3A',
                    border: '1px solid #D8D3C9',
                    textDecoration: 'none',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#1E6761';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#D8D3C9';
                  }}
                >
                  Explore the map
                </Link>
              </div>

              {/* Minimal Hero Proof Bar */}
              <div
                className="flex items-center flex-wrap gap-x-8 gap-y-2 pt-6"
                style={{ borderTop: '1px solid #D8D3C9' }}
              >
                <div className="flex flex-col">
                  <span className="font-display" style={{ fontSize: '26px', color: '#123B3A', lineHeight: 1 }}>118</span>
                  <span className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>police stations</span>
                </div>
                <div style={{ width: '1px', height: '28px', background: '#D8D3C9' }} />
                <div className="flex flex-col">
                  <span className="font-display" style={{ fontSize: '26px', color: '#1E6761', lineHeight: 1 }}>58</span>
                  <span className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>civic medical units</span>
                </div>
                <div style={{ width: '1px', height: '28px', background: '#D8D3C9' }} />
                <div className="flex flex-col">
                  <span className="font-display" style={{ fontSize: '26px', color: '#D84C45', lineHeight: 1 }}>112 / 103</span>
                  <span className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>emergency lines</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 52-54% Product Canvas */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <HeroJourneyPreview />
            </div>

          </div>
        </div>
      </section>


      {/* ================================================================ */}
      {/* PRODUCT STATEMENT (Civic Deep Teal Band) */}
      {/* ================================================================ */}
      <section
        className="w-full py-20 md:py-28 px-6 lg:px-12"
        style={{
          background: '#123B3A',
          borderTop: '1px solid rgba(216,211,201,0.2)',
          borderBottom: '1px solid rgba(216,211,201,0.2)',
        }}
      >
        <div className="max-w-[1280px] mx-auto space-y-14">

          <div className="max-w-3xl space-y-4">
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: '1.02',
                color: '#F4F0E8',
                letterSpacing: '0.01em',
              }}
            >
              Safety information should help you make a decision — not make the decision for you.
            </h2>
            <p
              className="font-body leading-relaxed max-w-2xl"
              style={{ fontSize: '18px', color: '#A8C2B6' }}
            >
              SafeRoute combines road-network routing with mapped police and medical infrastructure so you can understand the support available around any Mumbai journey.
            </p>
          </div>

          <div
            className="grid md:grid-cols-3 gap-8 md:gap-12 pt-8"
            style={{ borderTop: '1px solid rgba(244,240,232,0.15)' }}
          >
            {[
              { num: '01', title: 'PLAN', body: 'Evaluate road journeys by proximity to 24/7 emergency infrastructure before departing.' },
              { num: '02', title: 'EXPLORE', body: 'Navigate mapped police stations and municipal medical facilities across Mumbai’s administrative wards.' },
              { num: '03', title: 'RESPOND', body: 'One-tap emergency dialing, live GPS coordinate sharing, and discreet check-in escape tools.' },
            ].map(item => (
              <div key={item.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-display" style={{ fontSize: '18px', color: '#A8C2B6' }}>{item.num}</span>
                  <span className="font-display" style={{ fontSize: '26px', color: '#F4F0E8', letterSpacing: '0.02em' }}>{item.title}</span>
                </div>
                <p className="font-body" style={{ fontSize: '16px', color: 'rgba(244,240,232,0.72)', lineHeight: '1.65' }}>{item.body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ================================================================ */}
      {/* FEATURE SECTION — Asymmetric Editorial Layout (Card Type A) */}
      {/* ================================================================ */}
      <section className="py-24 md:py-32 px-6 lg:px-12 max-w-[1440px] mx-auto">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 space-y-3">
          <div className="font-body" style={{ fontSize: '13px', fontStyle: 'italic', color: '#6E7772' }}>
            System Architecture &amp; Capabilities
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(38px, 4.5vw, 60px)', color: '#123B3A', lineHeight: '1.0' }}>
            CIVIC INTELLIGENCE DESIGNED FOR REAL COMMUTES
          </h2>
        </div>

        {/* Asymmetrical Grid: 1 Large Left + 2 Stacked Right */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

          {/* FEATURE 01 — Large Editorial Anchor (Col 1-7) */}
          <div
            className="lg:col-span-7 flex flex-col justify-between p-7 sm:p-10 transition-transform"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D8D3C9',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(18,59,58,0.04)',
            }}
          >
            <div className="space-y-5">
              <div className="font-display" style={{ fontSize: '46px', color: '#A8C2B6', lineHeight: 1 }}>
                01
              </div>
              <h3 className="font-display" style={{ fontSize: 'clamp(32px, 3.5vw, 44px)', color: '#123B3A', lineHeight: '1.02' }}>
                COMPARE MORE THAN TIME
              </h3>
              <p className="font-body leading-relaxed max-w-lg" style={{ fontSize: '18px', color: '#6E7772' }}>
                See road routes alongside nearby police and medical infrastructure. Understand which corridor offers stronger access to 24/7 civic help.
              </p>

              {/* Embedded Route Mini-Preview */}
              <div
                className="mt-6 p-5 sm:p-6"
                style={{
                  background: '#E6EFEB',
                  border: '1px solid #1E6761',
                  borderRadius: '14px',
                }}
              >
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(30,103,97,0.18)' }}>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full" style={{ width: '8px', height: '8px', background: '#1E6761' }} />
                    <span className="font-display" style={{ fontSize: '18px', color: '#123B3A', letterSpacing: '0.02em' }}>
                      BANDRA WEST → DADAR WEST
                    </span>
                  </div>
                  <span className="font-body" style={{ fontSize: '13px', fontStyle: 'italic', color: '#1E6761' }}>
                    Higher resource coverage
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                  <div>
                    <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Corridor Police</div>
                    <div className="font-display" style={{ fontSize: '20px', color: '#123B3A' }}>4 STATIONS</div>
                  </div>
                  <div>
                    <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Nearest Support</div>
                    <div className="font-display" style={{ fontSize: '20px', color: '#1E6761' }}>0.4 KM AWAY</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Direct Emergency</div>
                    <div className="font-display" style={{ fontSize: '20px', color: '#123B3A' }}>CONNECTED (112)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/journey"
                className="inline-flex items-center gap-2 font-body font-semibold transition-colors"
                style={{ fontSize: '17px', color: '#1E6761', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#123B3A'}
                onMouseLeave={e => e.currentTarget.style.color = '#1E6761'}
              >
                <span>Plan a journey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Two Stacked Editorial Cards (Col 8-12) */}
          <div className="lg:col-span-5 flex flex-col gap-8">

            {/* FEATURE 02 */}
            <div
              className="flex-1 flex flex-col justify-between p-7 sm:p-8"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(18,59,58,0.04)',
              }}
            >
              <div className="space-y-3">
                <div className="font-display" style={{ fontSize: '42px', color: '#A8C2B6', lineHeight: 1 }}>
                  02
                </div>
                <h3 className="font-display" style={{ fontSize: '32px', color: '#123B3A', lineHeight: '1.05' }}>
                  SEE WHAT&apos;S AROUND YOU
                </h3>
                <p className="font-body" style={{ fontSize: '17px', color: '#6E7772', lineHeight: '1.6' }}>
                  Explore mapped police stations and public medical facilities across Mumbai&apos;s administrative divisions in one interactive map.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 font-body font-semibold transition-colors"
                  style={{ fontSize: '17px', color: '#1E6761', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#123B3A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#1E6761'}
                >
                  <span>Explore the map</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* FEATURE 03 */}
            <div
              className="flex-1 flex flex-col justify-between p-7 sm:p-8"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(18,59,58,0.04)',
              }}
            >
              <div className="space-y-3">
                <div className="font-display" style={{ fontSize: '42px', color: '#A8C2B6', lineHeight: 1 }}>
                  03
                </div>
                <h3 className="font-display" style={{ fontSize: '32px', color: '#123B3A', lineHeight: '1.05' }}>
                  HELP, ONE ACTION AWAY
                </h3>
                <p className="font-body" style={{ fontSize: '17px', color: '#6E7772', lineHeight: '1.6' }}>
                  Access verified emergency numbers, zero FIR legal rights (BNSS), and discreet call escape tools instantly without searching.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/journey"
                  className="inline-flex items-center gap-2 font-body font-semibold transition-colors"
                  style={{ fontSize: '17px', color: '#1E6761', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#123B3A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#1E6761'}
                >
                  <span>Emergency tools</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ================================================================ */}
      {/* JOURNEY COMPARISON SHOWCASE */}
      {/* ================================================================ */}
      <section
        className="py-24 md:py-32 px-6 lg:px-12"
        style={{ background: '#FFFFFF', borderTop: '1px solid #D8D3C9', borderBottom: '1px solid #D8D3C9' }}
      >
        <div className="max-w-[1280px] mx-auto space-y-12">

          <div className="max-w-2xl space-y-3">
            <div className="font-body" style={{ fontSize: '13px', fontStyle: 'italic', color: '#6E7772' }}>
              Corridor Comparison
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', color: '#123B3A', lineHeight: '1.0' }}>
              ONE DESTINATION. MORE CONTEXT.
            </h2>
            <p className="font-body leading-relaxed" style={{ fontSize: '18px', color: '#6E7772' }}>
              Travel time is not the only metric that matters when navigating unfamiliar roads.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Route A — Higher Resource Coverage */}
            <div
              className="p-7 sm:p-9 space-y-6"
              style={{
                background: '#E6EFEB',
                border: '1.5px solid #1E6761',
                borderRadius: '18px',
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-display"
                  style={{
                    fontSize: '14px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#1E6761',
                    color: '#FFFFFF',
                    letterSpacing: '0.04em',
                  }}
                >
                  HIGHER RESOURCE COVERAGE
                </span>
                <span className="font-body font-semibold" style={{ fontSize: '14px', color: '#123B3A' }}>
                  Index: 85 / 100
                </span>
              </div>

              <div>
                <div className="font-display" style={{ fontSize: '30px', color: '#123B3A', lineHeight: 1.0 }}>
                  ROUTE A · HIGHWAY CORRIDOR
                </div>
                <div className="font-body" style={{ fontSize: '14px', color: '#6E7772', marginTop: '4px' }}>
                  Via Western Express Highway &amp; Senapati Bapat Marg
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid rgba(30,103,97,0.2)' }}>
                <div>
                  <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Travel Time</div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#123B3A', lineHeight: 1.1 }}>28 MIN</div>
                </div>
                <div>
                  <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Police Along Path</div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#123B3A', lineHeight: 1.1 }}>4 STATIONS</div>
                </div>
                <div>
                  <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Medical Nearby</div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#1E6761', lineHeight: 1.1 }}>2 FACILITIES</div>
                </div>
              </div>
            </div>

            {/* Route B — Alternate Route */}
            <div
              className="p-7 sm:p-9 space-y-6"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: '18px',
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-display"
                  style={{
                    fontSize: '14px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#F4F0E8',
                    color: '#6E7772',
                    letterSpacing: '0.04em',
                  }}
                >
                  DIRECT ALTERNATE
                </span>
                <span className="font-body" style={{ fontSize: '14px', color: '#6E7772' }}>
                  Index: 52 / 100
                </span>
              </div>

              <div>
                <div className="font-display" style={{ fontSize: '30px', color: '#123B3A', lineHeight: 1.0 }}>
                  ROUTE B · COASTAL ALTERNATE
                </div>
                <div className="font-body" style={{ fontSize: '14px', color: '#6E7772', marginTop: '4px' }}>
                  Via Inner Links &amp; Waterfront By-lanes
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid #D8D3C9' }}>
                <div>
                  <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Travel Time</div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#123B3A', lineHeight: 1.1 }}>24 MIN</div>
                </div>
                <div>
                  <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Police Along Path</div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#123B3A', lineHeight: 1.1 }}>2 STATIONS</div>
                </div>
                <div>
                  <div className="font-body" style={{ fontSize: '12px', color: '#6E7772' }}>Medical Nearby</div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#6E7772', lineHeight: 1.1 }}>1 FACILITY</div>
                </div>
              </div>
            </div>

          </div>

          <div
            className="p-5 font-body"
            style={{
              background: '#F4F0E8',
              border: '1px solid #D8D3C9',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#6E7772',
              lineHeight: '1.6',
            }}
          >
            <strong style={{ color: '#17201F' }}>Methodological Note:</strong> Resource coverage measures physical proximity and density of mapped civic emergency infrastructure (police stations and municipal hospitals). It does not predict subjective crime probability or guarantee safety.
          </div>

        </div>
      </section>


      {/* ================================================================ */}
      {/* CARD TYPE C — FUNCTION-FIRST EMERGENCY ACTION PANEL */}
      {/* ================================================================ */}
      <section
        className="w-full py-24 md:py-32 px-6 lg:px-12"
        style={{ background: '#123B3A' }}
      >
        <div className="max-w-[1280px] mx-auto space-y-12">

          <div className="max-w-xl space-y-3">
            <div
              className="font-body"
              style={{ fontSize: '13px', color: '#D84C45', fontStyle: 'italic', letterSpacing: '0.08em' }}
            >
              Emergency Protocol &amp; Direct Actions
            </div>
            <h2
              className="font-display"
              style={{ fontSize: 'clamp(38px, 4.8vw, 60px)', color: '#F4F0E8', lineHeight: '1.0' }}
            >
              WHEN EVERY SECOND MATTERS
            </h2>
            <p
              className="font-body leading-relaxed"
              style={{ fontSize: '18px', color: '#A8C2B6' }}
            >
              Function-first emergency tools. Directly call official helplines, locate nearest police facilities, or initiate discreet checks.
            </p>
          </div>

          {/* Action Cards Grid: Type C — Function-First */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Action 1: Call 112 */}
            <a
              href="tel:112"
              className="p-5 flex items-center justify-between transition-transform active:scale-[0.98] group"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: '14px',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center gap-3.5">
                <PhoneCall className="w-5 h-5 flex-shrink-0" style={{ color: '#D84C45' }} />
                <div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#123B3A', lineHeight: 1 }}>112</div>
                  <div className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>Emergency Response</div>
                </div>
              </div>
              <span className="font-display text-sm group-hover:translate-x-0.5 transition-transform" style={{ color: '#D84C45' }}>
                CALL →
              </span>
            </a>

            {/* Action 2: Women Helpline 103 */}
            <a
              href="tel:103"
              className="p-5 flex items-center justify-between transition-transform active:scale-[0.98] group"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: '14px',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center gap-3.5">
                <PhoneCall className="w-5 h-5 flex-shrink-0" style={{ color: '#D84C45' }} />
                <div>
                  <div className="font-display" style={{ fontSize: '24px', color: '#123B3A', lineHeight: 1 }}>103</div>
                  <div className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>Women Helpline</div>
                </div>
              </div>
              <span className="font-display text-sm group-hover:translate-x-0.5 transition-transform" style={{ color: '#D84C45' }}>
                CALL →
              </span>
            </a>

            {/* Action 3: Location / Map Navigation */}
            <Link
              to="/map"
              className="p-5 flex items-center justify-between transition-transform active:scale-[0.98] group"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: '14px',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center gap-3.5">
                <Shield className="w-5 h-5 flex-shrink-0" style={{ color: '#123B3A' }} />
                <div>
                  <div className="font-display" style={{ fontSize: '22px', color: '#123B3A', lineHeight: 1 }}>NEARBY POLICE</div>
                  <div className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>Direct route directions</div>
                </div>
              </div>
              <span className="font-display text-sm group-hover:translate-x-0.5 transition-transform" style={{ color: '#1E6761' }}>
                VIEW →
              </span>
            </Link>

            {/* Action 4: Zero FIR / Legal Rights */}
            <button
              onClick={() => setShowTransitGuide(true)}
              className="p-5 flex items-center justify-between transition-transform active:scale-[0.98] group text-left cursor-pointer"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: '14px',
              }}
            >
              <div className="flex items-center gap-3.5">
                <Scale className="w-5 h-5 flex-shrink-0" style={{ color: '#1E6761' }} />
                <div>
                  <div className="font-display" style={{ fontSize: '22px', color: '#123B3A', lineHeight: 1 }}>ZERO FIR GUIDE</div>
                  <div className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>BNSS Legal reference</div>
                </div>
              </div>
              <span className="font-display text-sm group-hover:translate-x-0.5 transition-transform" style={{ color: '#1E6761' }}>
                OPEN →
              </span>
            </button>

          </div>

          {/* Escape tool link */}
          <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(244,240,232,0.12)' }}>
            <span className="font-body" style={{ fontSize: '14px', color: 'rgba(244,240,232,0.7)' }}>
              Uncomfortable social situation?
            </span>
            <button
              onClick={() => setShowFakeCall(true)}
              className="inline-flex items-center gap-1.5 font-body font-semibold cursor-pointer"
              style={{ fontSize: '14px', color: '#A8C2B6', background: 'none', border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              <PhoneForwarded className="w-3.5 h-3.5" />
              <span>Simulate incoming escape call</span>
            </button>
          </div>

        </div>
      </section>


      {/* ================================================================ */}
      {/* DATA PROOF — TYPE B PROOF SECTION WITH VERTICAL DIVIDERS */}
      {/* ================================================================ */}
      <section className="py-24 md:py-32 px-6 lg:px-12 max-w-[1440px] mx-auto space-y-12">

        <div className="max-w-xl space-y-3">
          <div className="font-body" style={{ fontSize: '13px', fontStyle: 'italic', color: '#6E7772' }}>
            Verified Civic Records
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', color: '#123B3A', lineHeight: '1.0' }}>
            BUILT ON REAL MUMBAI DATA
          </h2>
        </div>

        {/* Minimal Proof Metrics with Thin Vertical Lines */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8"
          style={{ borderTop: '1px solid #D8D3C9', borderBottom: '1px solid #D8D3C9' }}
        >
          {/* Metric 1 */}
          <div className="space-y-1 pr-4">
            <div className="font-display" style={{ fontSize: 'clamp(52px, 5.5vw, 68px)', color: '#123B3A', lineHeight: 1 }}>
              118
            </div>
            <div className="font-body font-semibold" style={{ fontSize: '18px', color: '#17201F' }}>
              Police Stations
            </div>
            <div className="font-body" style={{ fontSize: '15px', color: '#6E7772' }}>
              Mapped across Mumbai
            </div>
          </div>

          {/* Metric 2 */}
          <div className="space-y-1 pr-4 lg:border-l lg:border-[#D8D3C9] lg:pl-8">
            <div className="font-display" style={{ fontSize: 'clamp(52px, 5.5vw, 68px)', color: '#1E6761', lineHeight: 1 }}>
              31
            </div>
            <div className="font-body font-semibold" style={{ fontSize: '18px', color: '#17201F' }}>
              Hospitals
            </div>
            <div className="font-body" style={{ fontSize: '15px', color: '#6E7772' }}>
              Major municipal medical centers
            </div>
          </div>

          {/* Metric 3 */}
          <div className="space-y-1 pr-4 lg:border-l lg:border-[#D8D3C9] lg:pl-8">
            <div className="font-display" style={{ fontSize: 'clamp(52px, 5.5vw, 68px)', color: '#123B3A', lineHeight: 1 }}>
              27
            </div>
            <div className="font-body font-semibold" style={{ fontSize: '18px', color: '#17201F' }}>
              Maternity Facilities
            </div>
            <div className="font-body" style={{ fontSize: '15px', color: '#6E7772' }}>
              Specialized civic units
            </div>
          </div>

          {/* Metric 4 */}
          <div className="space-y-1 lg:border-l lg:border-[#D8D3C9] lg:pl-8">
            <div className="font-display" style={{ fontSize: 'clamp(52px, 5.5vw, 68px)', color: '#123B3A', lineHeight: 1 }}>
              5,913
            </div>
            <div className="font-body font-semibold" style={{ fontSize: '18px', color: '#17201F' }}>
              Recorded Cases
            </div>
            <div className="font-body" style={{ fontSize: '15px', color: '#6E7772' }}>
              Official source data (2023)
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="font-body max-w-2xl leading-relaxed" style={{ fontSize: '14px', color: '#6E7772' }}>
            Historical crime statistics provide retrospective city-wide context. They are not neighborhood safety predictions.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 font-body font-semibold whitespace-nowrap transition-colors"
            style={{ fontSize: '14px', color: '#1E6761', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#123B3A'}
            onMouseLeave={e => e.currentTarget.style.color = '#1E6761'}
          >
            <span>View crime analytics dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>


      {/* ================================================================ */}
      {/* METHODOLOGY — ONE REFINED PANEL (Replacing 4 separated cards) */}
      {/* ================================================================ */}
      <section
        className="py-24 md:py-32 px-6 lg:px-12"
        style={{ background: '#FFFFFF', borderTop: '1px solid #D8D3C9', borderBottom: '1px solid #D8D3C9' }}
      >
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Copy */}
          <div className="lg:col-span-5 space-y-4">
            <div className="font-body" style={{ fontSize: '13px', fontStyle: 'italic', color: '#6E7772' }}>
              Methodological Framework
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', color: '#123B3A', lineHeight: '1.0' }}>
              NO MYSTERY SCORE
            </h2>
            <p className="font-body leading-relaxed" style={{ fontSize: '18px', color: '#6E7772' }}>
              SafeRoute&apos;s Resource Coverage index evaluates physical proximity and density of verified emergency resources along a travel corridor. It does not estimate personal crime probability.
            </p>
            <div className="font-body" style={{ fontSize: '14px', color: '#6E7772', paddingTop: '4px' }}>
              Index Maximum: <strong style={{ color: '#17201F' }}>100 Points</strong>
            </div>
          </div>

          {/* Right: One Refined Methodology Panel with Horizontal Bars */}
          <div
            className="lg:col-span-7 p-7 sm:p-9 space-y-6"
            style={{
              background: '#F4F0E8',
              border: '1px solid #D8D3C9',
              borderRadius: '20px',
            }}
          >
            {[
              { label: 'POLICE PROXIMITY', pts: '40%', pct: 40, desc: 'Distance to closest police station along the route' },
              { label: 'POLICE CORRIDOR', pts: '25%', pct: 25, desc: 'Mapped stations within 3.5 km travel corridor' },
              { label: 'MEDICAL PROXIMITY', pts: '20%', pct: 20, desc: 'Distance to nearest municipal hospital facility' },
              { label: 'MEDICAL CORRIDOR', pts: '15%', pct: 15, desc: 'Civic medical units within 4.0 km travel corridor' },
            ].map((item, idx) => (
              <div key={item.label} className="space-y-1.5" style={{ paddingTop: idx !== 0 ? '12px' : '0' }}>
                <div className="flex justify-between items-baseline">
                  <span className="font-display" style={{ fontSize: '18px', color: '#123B3A', letterSpacing: '0.03em' }}>
                    {item.label}
                  </span>
                  <span className="font-display" style={{ fontSize: '22px', color: '#1E6761' }}>
                    {item.pts}
                  </span>
                </div>
                {/* Horizontal Bar Track */}
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: '8px', background: '#E6EFEB' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct * 2.5}%`, background: '#1E6761' }}
                  />
                </div>
                <div className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ================================================================ */}
      {/* FINAL CTA */}
      {/* ================================================================ */}
      <section className="py-24 md:py-32 px-6 lg:px-12 max-w-[1200px] mx-auto text-center space-y-8">

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-display" style={{ fontSize: 'clamp(44px, 5.5vw, 68px)', color: '#123B3A', lineHeight: '0.98' }}>
            KNOW THE ROUTE.<br />
            KNOW THE RESOURCES.
          </h2>
          <p className="font-body max-w-xl mx-auto" style={{ fontSize: '19px', color: '#6E7772' }}>
            Plan your next Mumbai journey with full civic context.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            to="/journey"
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-body font-semibold text-white transition-all active:scale-[0.98]"
            style={{
              padding: '14px 34px',
              borderRadius: '11px',
              background: '#123B3A',
              fontSize: '17px',
              textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(18,59,58,0.16)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0E302F'}
            onMouseLeave={e => e.currentTarget.style.background = '#123B3A'}
          >
            Plan a journey
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/map"
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-body font-semibold transition-all active:scale-[0.98]"
            style={{
              padding: '13px 32px',
              borderRadius: '11px',
              background: 'transparent',
              color: '#123B3A',
              border: '1px solid #D8D3C9',
              fontSize: '17px',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#1E6761';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#D8D3C9';
            }}
          >
            Explore the map
          </Link>
        </div>

        <div className="pt-4 font-body" style={{ fontSize: '14px', color: '#6E7772' }}>
          Emergency? Dial{' '}
          <a href="tel:112" className="font-semibold" style={{ color: '#D84C45', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
            112
          </a>
          {' '}or Mumbai Women&apos;s Helpline{' '}
          <a href="tel:103" className="font-semibold" style={{ color: '#D84C45', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
            103
          </a>
        </div>
      </section>


      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer
        className="py-12 px-6 lg:px-12"
        style={{ background: '#F4F0E8', borderTop: '1px solid #D8D3C9' }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

          <div className="space-y-1">
            <div className="font-display" style={{ fontSize: '20px', color: '#123B3A', lineHeight: 1 }}>
              SafeRoute <span className="font-body" style={{ fontSize: '15px', color: '#6E7772', fontStyle: 'italic' }}>Mumbai</span>
            </div>
            <div className="font-body" style={{ fontSize: '13px', color: '#6E7772' }}>
              Civic mobility &amp; emergency resource infrastructure · CODEX 2026
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {[
              { to: '/journey', label: 'Plan a journey' },
              { to: '/map', label: 'Explore the map' },
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/assistant', label: 'Safety Guide' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body font-medium transition-colors"
                style={{ fontSize: '14px', color: '#17201F', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#1E6761'}
                onMouseLeave={e => e.currentTarget.style.color = '#17201F'}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/Darshaannn/saferoute-mumbai"
              target="_blank"
              rel="noreferrer"
              className="font-body font-medium flex items-center gap-1 transition-colors"
              style={{ fontSize: '14px', color: '#17201F', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1E6761'}
              onMouseLeave={e => e.currentTarget.style.color = '#17201F'}
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        <div
          className="max-w-[1440px] mx-auto mt-8 pt-6 font-body"
          style={{ borderTop: '1px solid #D8D3C9', fontSize: '12px', color: '#6E7772', lineHeight: '1.65' }}
        >
          Historical crime data provides retrospective context and cannot guarantee future personal safety. Emergency infrastructure information is compiled from verified public records.
        </div>
      </footer>

      {/* Action Modals */}
      <FakeCallModal isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
      <TransitAndRightsModal isOpen={showTransitGuide} onClose={() => setShowTransitGuide(false)} />

    </div>
  );
}
