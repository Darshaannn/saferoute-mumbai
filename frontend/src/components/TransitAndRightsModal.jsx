import React, { useState } from 'react';
import { Train, Scale, Shield, Phone, AlertCircle, FileText, CheckCircle2, Hospital, Compass, HeartHandshake, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransitAndRightsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('transit'); // 'transit' | 'rights' | 'sakhi'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Mumbai Women Safety Reference
            </span>
            <h2 className="text-xl font-black mt-0.5">Transit Safety & Legal Rights Hub</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('transit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 cursor-pointer ${
              activeTab === 'transit'
                ? 'bg-white text-blue-600 border-blue-600 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Train className="w-4 h-4" />
            Local Train & Metro Safety
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 cursor-pointer ${
              activeTab === 'rights'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            Legal Rights & Zero FIR
          </button>
          <button
            onClick={() => setActiveTab('sakhi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 cursor-pointer ${
              activeTab === 'sakhi'
                ? 'bg-white text-rose-600 border-rose-600 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Sakhi One-Stop Centres
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs md:text-sm">
          
          {/* TAB 1: TRANSIT SAFETY */}
          {activeTab === 'transit' && (
            <div className="space-y-5">
              
              {/* Emergency railway & women helpline numbers banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">Mumbai Police Women Helpline</span>
                    <span className="text-base font-black text-rose-950">Dial 103</span>
                  </div>
                  <a href="tel:103" className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer">
                    <Phone className="w-3 h-3" /> Call 103
                  </a>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">RailMadad Security & Assistance</span>
                    <span className="text-base font-black text-blue-950">Dial 139</span>
                  </div>
                  <a href="tel:139" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer">
                    <Phone className="w-3 h-3" /> Call 139
                  </a>
                </div>
              </div>

              {/* Local Train Coaches Guidelines */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Train className="w-4 h-4 text-blue-600" />
                  Mumbai Suburban Railway (Western, Central & Harbour Lines)
                </h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Ladies Coach Positioning:</strong> Marked with distinctive green & yellow diagonal stripes. Located at the <em>Engine end</em>, <em>Middle</em>, and <em>Rear end</em> of 12-car and 15-car suburban rakes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Night Security Escorts (9:00 PM – 6:00 AM):</strong> Armed RPF (Railway Protection Force) and GRP personnel are officially assigned onboard ladies compartments during night suburban services.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Emergency Talk-Back Unit:</strong> Look for the red emergency lever and audio talk-back intercom inside local train ladies coaches to communicate directly with the motorman and train guard.</span>
                  </li>
                </ul>
              </div>

              {/* Mumbai Metro Safety */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  Mumbai Metro Lines (1, 2A, 7 & 3)
                </h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Dedicated Women Coach:</strong> First coach in the direction of travel is reserved exclusively for women passengers with designated platform queue bays.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Passenger Emergency Intercom (PEI):</strong> Located near train doorways to initiate instant two-way audio communication with the train operator.</span>
                  </li>
                </ul>
              </div>

              {/* Nirbhaya Squad */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Mumbai Police Nirbhaya Squad Patrols
                </h4>
                <p className="text-indigo-900 text-xs">
                  Mumbai Police operates dedicated Nirbhaya mobile patrol vans and foot squads stationed near railway stations, colleges, transit hubs, and commercial zones for deterrence and rapid response.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: LEGAL RIGHTS & ZERO FIR */}
          {activeTab === 'rights' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  1. Zero FIR & e-FIR (BNSS Section 173)
                </div>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  Under <strong>Section 173(1) of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023</strong> (previously under CrPC Sec. 154 / MHA guidelines), information relating to a cognizable offence against a woman can be registered at <strong>ANY police station</strong>, irrespective of the area where the crime was committed. The police officer cannot refuse registration for lack of territorial jurisdiction; they must register a "Zero FIR" and transfer it to the jurisdictional station. Electronic registration (e-FIR) is also recognized under Section 173(1).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <Shield className="w-4 h-4 text-blue-600" />
                  2. Arrest and Detention Safeguards (BNSS Section 43(5))
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Under <strong>Section 43(5) of the BNSS, 2023</strong> (previously CrPC Sec. 46(4)), as a statutory rule, <strong>no woman shall be arrested after sunset and before sunrise</strong>. Where exceptional circumstances exist, the arrest must be carried out by a woman police officer with prior written permission of the Judicial Magistrate of the First Class. Furthermore, under Section 43(2) and Section 47(2), search or physical arrest of a woman must strictly be conducted by a female officer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  3. Examination at Residence & In-Camera Recording (BNSS Sec. 179 & 183)
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Under <strong>Section 179(1) Proviso of the BNSS, 2023</strong> (previously CrPC Sec. 160), no woman shall be required to attend any place other than the place in which she resides for witness examination. Under <strong>Section 176(1) and Section 183</strong> (previously CrPC Sec. 164), statements of women relating to sexual assault must be recorded by a woman police officer or judicial magistrate, with option for audio-video recording, preserving absolute victim confidentiality.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  4. Free Legal Aid & Representation
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Under <strong>Section 12 of the Legal Services Authorities Act, 1987</strong> and <strong>Article 39A of the Constitution of India</strong> (along with BNSS Section 340), every woman is entitled to free legal aid and counsel irrespective of income or financial status through the District Legal Services Authority (DLSA Mumbai / MSLSA).
                </p>
              </div>

              {/* Legal Disclaimer & Source Metadata */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>General Legal Information Disclaimer</span>
                </div>
                <p className="leading-snug">
                  General legal information only — not legal advice. In case of emergency or legal proceedings, please contact official emergency authorities (112 / 103) or the District Legal Services Authority (DLSA).
                </p>
                <div className="pt-1 text-[10px] text-amber-800/80 font-medium">
                  Source: Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 & Legal Services Authorities Act, 1987 (India Code). Last verified: 2026.
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SAKHI ONE STOP CENTRES */}
          {activeTab === 'sakhi' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                <strong>Sakhi One-Stop Centres (OSC)</strong> are established under the Ministry of Women & Child Development (MWCD) to provide integrated emergency support — including medical aid, police assistance, legal counselling, psycho-social support, and temporary shelter.
              </p>

              <div className="space-y-3">
                {[
                  {
                    name: 'Sakhi Centre - K.E.M. Hospital (Mumbai City)',
                    location: 'Parel, Mumbai',
                    desc: 'Medical Support, Legal Cell & Crisis Ward',
                    phone: '022-24107000'
                  },
                  {
                    name: 'Sakhi Centre - Lokmanya Tilak Municipal General Hospital (Sion)',
                    location: 'Sion West, Mumbai',
                    desc: 'Medical, Psychological & Police Assistance',
                    phone: '022-24076381'
                  },
                  {
                    name: 'Sakhi Centre - Rajawadi Municipal Hospital',
                    location: 'Ghatkopar East, Mumbai',
                    desc: 'Eastern Suburbs Emergency Support Wing',
                    phone: '022-25115066'
                  },
                  {
                    name: 'Sakhi Centre - Dr. R.N. Cooper Hospital',
                    location: 'Juhu / Vile Parle West, Mumbai',
                    desc: 'Western Suburbs Emergency Support Wing',
                    phone: '022-26207254'
                  }
                ].map((item) => (
                  <div key={item.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs md:text-sm">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">{item.location} • {item.desc}</p>
                    </div>
                    <a
                      href={`tel:${item.phone}`}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-1">
                Source: Ministry of Women & Child Development, Government of India. Last verified: 2026.
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Official Legal & Emergency Infrastructure Reference (2026)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </motion.div>
    </div>
  );
}
