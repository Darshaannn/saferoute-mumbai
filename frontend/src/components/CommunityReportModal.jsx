import React, { useState, useEffect } from 'react';
import { AlertTriangle, LightbulbOff, Users, ShieldAlert, CheckCircle2, Plus, Info, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const INITIAL_HAZARDS = [];

export function formatRelativeTime(isoString) {
  if (!isoString) return 'Recently';
  try {
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
}

export default function CommunityReportModal({ isOpen, onClose, onAddHazard, currentCoords }) {
  const [category, setCategory] = useState('streetlight');
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentCoords?.name) {
      setArea(currentCoords.name);
    }
    setError('');
  }, [currentCoords, isOpen]);

  if (!isOpen) return null;

  const categories = [
    { id: 'streetlight', label: 'Broken / Dim Streetlight', icon: LightbulbOff, color: 'text-amber-500' },
    { id: 'isolated', label: 'Isolated / Poorly Lit Alley', icon: AlertTriangle, color: 'text-rose-500' },
    { id: 'loitering', label: 'Harassment / Loitering Point', icon: Users, color: 'text-orange-500' },
    { id: 'checkpoint', label: 'Active Police Checkpoint', icon: ShieldAlert, color: 'text-blue-500' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a description for the note.');
      return;
    }

    if (!currentCoords || isNaN(currentCoords.lat) || isNaN(currentCoords.lng)) {
      setError('Select a map location or enable location before adding a note.');
      return;
    }

    const newNote = {
      id: `note-${Date.now()}`,
      category,
      title: title.trim(),
      area: area.trim() || 'Custom Location',
      coordinates: [Number(currentCoords.lat), Number(currentCoords.lng)],
      createdAt: new Date().toISOString(),
      severity
    };

    onAddHazard(newNote);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setError('');
      onClose();
    }, 1000);
  };

  const hasValidLocation = Boolean(currentCoords && !isNaN(currentCoords.lat) && !isNaN(currentCoords.lng));

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
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" /> Personal Safety Note
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">Add Local Hazard Note</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved only on this device. Not reviewed or shared with other SafeRoute users.
            </p>
          </div>
          <button 
            onClick={() => {
              setError('');
              onClose();
            }} 
            className="text-slate-400 hover:text-slate-600 p-1 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-slate-900">Safety Note Saved Locally</h4>
            <p className="text-xs text-slate-500">Stored on this browser for your reference.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location indicator */}
            <div className="p-2.5 rounded-xl border text-xs flex items-center gap-2 bg-slate-50 border-slate-200">
              <MapPin className={`w-4 h-4 shrink-0 ${hasValidLocation ? 'text-emerald-600' : 'text-amber-500'}`} />
              <div className="truncate">
                {hasValidLocation ? (
                  <span className="text-slate-700">
                    Target: <strong className="text-slate-900">{currentCoords.name || `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}`}</strong>
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Select a map location or enable location before adding a note.
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-1.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

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
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition text-xs font-semibold cursor-pointer ${
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
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
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!hasValidLocation}
              className={`w-full py-3 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 ${
                hasValidLocation
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Save Note on This Device
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
