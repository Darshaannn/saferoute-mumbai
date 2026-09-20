import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Map, Activity, PhoneCall, CheckCircle2, Bot, Compass, ShieldCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="pt-20 md:pt-28 min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      
      {/* Hero Section */}
      <section className="px-6 max-w-6xl mx-auto text-center pt-8 pb-16 md:pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            CODEX 2026 • Mumbai Women's Safety Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Navigate Mumbai with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              verified safety intelligence
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Understand historical crime patterns, explore color-coded recorded risk indicators, and access emergency resources before and during your journey.
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link 
              to="/map" 
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Map className="w-4 h-4" />
              Explore Safety Map
            </Link>
            <Link 
              to="/journey" 
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow hover:scale-105 active:scale-95"
            >
              Start Safe Journey
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        </motion.div>

        {/* Live Intelligence Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 text-left"
        >
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-extrabold text-blue-600 mb-1">118</div>
            <div className="text-xs font-semibold text-slate-800">Police Stations</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Mapped across all Mumbai wards</div>
          </div>
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 mb-1">94%</div>
            <div className="text-xs font-semibold text-slate-800">Detection Rate</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recorded in official 2023 data</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 mb-1">-3.95%</div>
            <div className="text-xs font-semibold text-slate-800">YoY Case Trend</div>
            <div className="text-[10px] text-slate-400 mt-0.5">5,913 cases (2023) vs 6,156 (2022)</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-extrabold text-rose-600 mb-1">24 / 7</div>
            <div className="text-xs font-semibold text-slate-800">112 / 103 Helplines</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct 1-tap emergency support</div>
          </div>
        </motion.div>
      </section>

      {/* 5-Tier Color Scale Visual Section */}
      <section className="px-6 py-14 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Transparent 5-Tier Recorded Risk Indicator</h2>
            <p className="text-xs sm:text-sm text-slate-500">Standardized 0–100 visualization scale applied across Mumbai wards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 space-y-1">
              <span className="inline-block w-3 h-3 rounded-full bg-[#22C55E] shadow-sm"></span>
              <div className="text-base font-black text-[#15803d]">0 – 20</div>
              <div className="text-xs font-bold text-slate-800">Lower Risk</div>
              <div className="text-[10px] text-slate-500 font-mono">#22C55E</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#84CC16]/10 border border-[#84CC16]/30 space-y-1">
              <span className="inline-block w-3 h-3 rounded-full bg-[#84CC16] shadow-sm"></span>
              <div className="text-base font-black text-[#4d7c0f]">21 – 40</div>
              <div className="text-xs font-bold text-slate-800">Moderate-Low</div>
              <div className="text-[10px] text-slate-500 font-mono">#84CC16</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FACC15]/20 border border-[#FACC15]/40 space-y-1">
              <span className="inline-block w-3 h-3 rounded-full bg-[#FACC15] shadow-sm"></span>
              <div className="text-base font-black text-[#a16207]">41 – 60</div>
              <div className="text-xs font-bold text-slate-800">Moderate</div>
              <div className="text-[10px] text-slate-500 font-mono">#FACC15</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F97316]/15 border border-[#F97316]/30 space-y-1">
              <span className="inline-block w-3 h-3 rounded-full bg-[#F97316] shadow-sm"></span>
              <div className="text-base font-black text-[#c2410c]">61 – 80</div>
              <div className="text-xs font-bold text-slate-800">Elevated</div>
              <div className="text-[10px] text-slate-500 font-mono">#F97316</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 space-y-1">
              <span className="inline-block w-3 h-3 rounded-full bg-[#EF4444] shadow-sm"></span>
              <div className="text-base font-black text-[#b91c1c]">81 – 100</div>
              <div className="text-xs font-bold text-slate-800">Higher Risk</div>
              <div className="text-[10px] text-slate-500 font-mono">#EF4444</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Map}
            badge="Interactive Map"
            title="Choropleth Safety Zones"
            description="Explore neighborhood boundaries across Mumbai color-coded by historical recorded crime indicators with police stations."
            linkTo="/map"
            linkText="Open Safety Map"
          />
          <FeatureCard 
            icon={Compass}
            badge="Road Routing"
            title="Safe Journey Planner"
            description="Calculate optimal turn-by-turn road routes across Mumbai, inspect safety corridors, and share live trips."
            linkTo="/journey"
            linkText="Plan a Safe Journey"
          />
          <FeatureCard 
            icon={Bot}
            badge="AI Intelligence"
            title="Safety Assistant"
            description="Ask questions grounded in official Mumbai crime records and get immediate guidance for late-night transit."
            linkTo="/assistant"
            linkText="Chat with Assistant"
          />
        </div>
      </section>

      {/* Emergency Helpline Banner */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xl shadow-rose-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold">24/7 Emergency Helplines Mumbai</h3>
            <p className="text-xs text-rose-100">Direct one-tap links to official emergency support services.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <a href="tel:112" className="px-4 py-2 bg-white text-rose-600 rounded-xl font-extrabold text-xs shadow hover:bg-rose-50 transition flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> Call 112
            </a>
            <a href="tel:103" className="px-4 py-2 bg-rose-800 text-white rounded-xl font-extrabold text-xs hover:bg-rose-900 transition flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Women 103
            </a>
            <a href="tel:1512" className="px-4 py-2 bg-rose-800 text-white rounded-xl font-extrabold text-xs hover:bg-rose-900 transition flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> Railway 1512
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <footer className="px-6 py-12 max-w-4xl mx-auto text-center border-t border-slate-200 mt-8">
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
          <strong>Data Disclaimer:</strong> Historical crime statistics are retrospective indicators derived from official records (2022–2023). 
          They provide situational context and should never be interpreted as absolute guarantees of personal safety.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, badge, title, description, linkTo, linkText }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            {badge}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">{description}</p>
      </div>
      <Link 
        to={linkTo} 
        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
      >
        <span>{linkText}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
      </Link>
    </motion.div>
  );
}
