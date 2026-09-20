import React, { useState } from 'react';
import { AlertTriangle, MapPin, LightbulbOff, Users, ShieldAlert, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const INITIAL_HAZARDS = [
  {
    id: 'haz-1',
    category: 'streetlight',
    title: 'Dim / Broken Streetlights along Link Road junction',
    area: 'Andheri West',
    coordinates: [19.1360, 72.8280],
    reportedAt: '1 hour ago',
    severity: 'medium',
    votes: 8
  },
  {
    id: 'haz-2',
    category: 'isolated',
    title: 'Poorly patrolled service lane behind railway tracks',
    area: 'Bandra East',
    coordinates: [19.0620, 72.8460],
    reportedAt: '3 hours ago',
    severity: 'high',
    votes: 14
  },
  {
    id: 'haz-3',
    category: 'checkpoint',
    title: 'Mumbai Police Nirbhaya Van Active Checkpost',
    area: 'Dadar Station West',
    coordinates: [19.0185, 72.8420],
    reportedAt: '30 mins ago',
    severity: 'safe',
    votes: 21
  }
];

export default function CommunityReportModal({ isOpen, onClose, onAddHazard, currentCoords }) {
  const [category, setCategory] = useState('streetlight');
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('Bandra West');
  const [severity, setSeverity] = useState('medium');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: 'streetlight', label: 'Broken / Dim Streetlight', icon: LightbulbOff, color: 'text-amber-500' },
    { id: 'isolated', label: 'Isolated / Poorly Lit Alley', icon: AlertTriangle, color: 'text-rose-500' },
    { id: 'loitering', label: 'Harassment / Loitering Point', icon: Users, color: 'text-orange-500' },
    { id: 'checkpoint', label: 'Active Police Checkpoint', icon: ShieldAlert, color: 'text-blue-500' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const lat = currentCoords?.lat || 19.0760 + (Math.random() - 0.5) * 0.05;
    const lng = currentCoords?.lng || 72.8777 + (Math.random() - 0.5) * 0.05;

    const newReport = {
      id: `haz-${Date.now()}`,
      category,
      title,
      area,
      coordinates: [lat, lng],
      reportedAt: 'Just now',
      severity,
      votes: 1
    };

    onAddHazard(newReport);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Citizen Safety Network
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">Report Street Safety Hazard</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pin unlit alleys, harassment hotspots, or active police checkpoints to alert other commuters.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 text-sm">✕</button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-slate-900">Hazard Reported to Live Safety Map!</h4>
            <p className="text-xs text-slate-500">Thank you for making Mumbai safer for fellow travelers.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hazard Type:</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSel = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition text-xs font-semibold ${
                        isSel 
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${c.color}`} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Short Description:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Streetlights off near station subway exit"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mumbai Neighborhood / Area:</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Andheri West, Lokhandwala"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Publish Safety Pin to Live Map
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
