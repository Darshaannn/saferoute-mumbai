import React, { useState } from 'react';
import { Train, Scale, Shield, Phone, AlertCircle, FileText, CheckCircle2, Hospital, Compass, HeartHandshake } from 'lucide-react';
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('transit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
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
              
              {/* Emergency railway numbers banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Railway Police Helpline</span>
                    <span className="text-base font-black text-amber-950">Dial 1512</span>
                  </div>
                  <a href="tel:1512" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">RPF Security Helpline</span>
                    <span className="text-base font-black text-blue-950">Dial 139</span>
                  </div>
                  <a href="tel:139" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Call
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
                    <span><strong>Ladies Coach Positioning:</strong> Marked with distinctive green & yellow diagonal stripes. Located at the <em>Engine end</em>, <em>Middle</em>, and <em>Rear end</em> of 12-car and 15-car rakes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Night RPF Escort (9:00 PM – 6:00 AM):</strong> Uniformed female/male RPF and GRP personnel are officially deployed inside ladies compartments during night suburban services.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Emergency Talk-Back Unit:</strong> Look for the red emergency lever and audio talk-back intercom inside local train ladies coaches to communicate directly with the motorman and guard.</span>
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
                    <span><strong>Dedicated Women Coach:</strong> First coach in the direction of travel is reserved exclusively for women passengers with dedicated platform standing bays.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Passenger Emergency Intercom (PEI):</strong> Located near every train doorway to initiate instant two-way audio-video with the train operator.</span>
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
                  Mumbai Police operates 91 dedicated Nirbhaya patrol vehicles and foot squads stationed near railway stations, colleges, transit hubs, and commercial zones to prevent eve-teasing and ensure rapid 5-minute response.
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
                  1. Zero FIR (Right to Register FIR Anywhere)
                </div>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  Under the Supreme Court and Ministry of Home Affairs guidelines, a victim of crime can file an FIR at <strong>ANY police station</strong> in Mumbai or India, regardless of where the incident took place. The police station cannot refuse registration citing territorial jurisdiction; they must register a "Zero FIR" and transfer it to the relevant station.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <Shield className="w-4 h-4 text-blue-600" />
                  2. Arrest and Detention Safeguards
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  As per Section 46(4) of the Code of Criminal Procedure, women <strong>cannot be arrested after sunset and before sunrise</strong> except in extraordinary circumstances with prior written permission of a Judicial Magistrate. All bodily searches and interrogations must be conducted strictly by female police officers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  3. Right to Privacy & In-Camera Recording
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Statements relating to assault or harassment must be recorded in absolute privacy at the survivor&apos;s home or a comfortable venue in the presence of a female police officer or lady magistrate (Section 164 CrPC/BNSS). The identity of the victim is strictly confidential under Indian law.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  4. Right to Free Legal Aid
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Every woman is entitled to free legal counsel under the Legal Services Authorities Act (DLSA Mumbai) at the time of police statement recording and during judicial proceedings.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: SAKHI ONE STOP CENTRES */}
          {activeTab === 'sakhi' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                <strong>Sakhi One-Stop Centres (OSC)</strong> provide comprehensive, integrated 24/7 emergency support under one roof — including medical treatment, immediate police assistance, legal counselling, psycho-social support, and temporary shelter.
              </p>

              <div className="space-y-3">
                {[
                  {
                    name: 'Sakhi Centre - K.E.M. Hospital (Mumbai City)',
                    location: 'Parel, Mumbai',
                    desc: '24/7 Trauma Care, Legal Cell & Crisis Ward',
                    phone: '022-24107000'
                  },
                  {
                    name: 'Sakhi Centre - Lokmanya Tilak Municipal General Hospital (Sion)',
                    location: 'Sion West, Mumbai',
                    desc: 'Emergency Medical, Psychological & Police Assistance',
                    phone: '022-24076381'
                  },
                  {
                    name: 'Sakhi Centre - Rajawadi Municipal Hospital',
                    location: 'Ghatkopar East, Mumbai',
                    desc: 'Eastern Suburbs 24/7 Emergency Support Wing',
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
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Verified Government & Legal Resources</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            Close Guide
          </button>
        </div>

      </motion.div>
    </div>
  );
}
