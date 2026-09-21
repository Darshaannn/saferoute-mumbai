import { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  BarChart3,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { apiRequest } from '../services/apiClient';
import fallbackCrimeStats from '../data/crimeStats.json';

export default function Dashboard() {
  const [data, setData] = useState(fallbackCrimeStats || null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLawFilter, setSelectedLawFilter] = useState('all'); // 'all' | 'ipc' | 'pocso' | 'dowry'
  const [sortBy, setSortBy] = useState('registered_desc'); // 'registered_desc' | 'detected_desc' | 'rate_desc' | 'name'
  const [mobileTab, setMobileTab] = useState('cards'); // 'cards' | 'table'

  useEffect(() => {
    apiRequest('/api/crimes/summary')
      .then(statsData => {
        if (statsData && statsData.total_cases_2023) {
          setData(statsData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using fallback crime statistics:", err);
        setData(fallbackCrimeStats);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="pt-24 flex flex-col justify-center items-center h-[70vh] space-y-3 font-body">
      <div className="sr-spinner"></div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
        Loading Mumbai Police Annual Crime Summary (2022–2023)…
      </p>
    </div>
  );

  if (!data) return (
    <div className="pt-24 p-6 text-center text-sm font-body" style={{ color: 'var(--color-danger)' }}>
      Unable to load safety data. Please try again.
    </div>
  );

  // Clean raw categories
  const rawCategories = data.categories || [];
  
  // Filter out the aggregate "Total of Crime Against Women Cases" row to avoid double-counting
  const detailedCategories = rawCategories.filter(
    c => !c.Category.toLowerCase().includes('total of crime against women')
  );

  // Top comparison data for charts (Major statutory heads)
  const chartCategories = [
    { key: "Modesty / Molestation", short: "Modesty", match: "Outraging Modesty" },
    { key: "Kidnapping / Abduction", short: "Kidnap", match: "Total Kidnapping Cases" },
    { key: "Rape Offences", short: "Rape", match: "Total Rape Cases" },
    { key: "POCSO (Minor Rape)", short: "POCSO", match: "Rape with POCSO" },
    { key: "Domestic Harassment (498-A)", short: "498-A", match: "Dowry related Mental" },
    { key: "Insult to Modesty (509)", short: "Insult", match: "Intended insult" },
  ];

  const chartData = chartCategories.map(item => {
    const found = detailedCategories.find(c => c.Category.includes(item.match)) || {
      Registered_2022: 0,
      Registered_2023: 0,
      Detected_2023: 0,
      Detection_Rate_2023: 0
    };
    return {
      name: item.key,
      shortName: item.short,
      '2022 Reg.': found.Registered_2022,
      '2023 Reg.': found.Registered_2023,
      '2023 Det.': found.Detected_2023,
      rate: found.Detection_Rate_2023
    };
  });

  // Filter & Search Table
  const filteredTableData = detailedCategories.filter(c => {
    const matchesSearch = c.Category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedLawFilter === 'pocso') return c.Category.toLowerCase().includes('pocso');
    if (selectedLawFilter === 'dowry') return c.Category.toLowerCase().includes('dowry') || c.Category.toLowerCase().includes('498');
    if (selectedLawFilter === 'ipc') return c.Category.toLowerCase().includes('ipc') && !c.Category.toLowerCase().includes('pocso');
    return true;
  }).sort((a, b) => {
    if (sortBy === 'registered_desc') return b.Registered_2023 - a.Registered_2023;
    if (sortBy === 'detected_desc') return b.Detected_2023 - a.Detected_2023;
    if (sortBy === 'rate_desc') return b.Detection_Rate_2023 - a.Detection_Rate_2023;
    if (sortBy === 'name') return a.Category.localeCompare(b.Category);
    return 0;
  });

  // Export CSV Helper
  const handleExportCSV = () => {
    const headers = ["Crime Category / IPC Section", "2022 Registered", "2022 Detected", "2022 Detection %", "2023 Registered", "2023 Detected", "2023 Detection %"];
    const rows = detailedCategories.map(c => [
      `"${c.Category.replace(/"/g, '""')}"`,
      c.Registered_2022,
      c.Detected_2022,
      `${c.Detection_Rate_2022}%`,
      c.Registered_2023,
      c.Detected_2023,
      `${c.Detection_Rate_2023}%`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mumbai_crime_against_women_2022_2023.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-20 md:pt-24 px-3 sm:px-6 max-w-7xl mx-auto min-h-screen pb-24 space-y-5 sm:space-y-7 font-body" style={{ color: 'var(--color-ink)' }}>
      
      {/* ─────────────────────────────────────────────────────────────
          1. EDITORIAL HEADER & METADATA BAR
          ───────────────────────────────────────────────────────────── */}
      <div 
        className="p-4 sm:p-6 space-y-3 sm:space-y-4 transition-all"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
              <span className="text-[12px] italic tracking-wide" style={{ color: 'var(--color-muted)' }}>
                Mumbai · Public Safety Intelligence · Official Gazette Data
              </span>
            </div>
            <h1 
              className="font-display text-[32px] sm:text-[42px] leading-[0.96]"
              style={{ color: 'var(--color-primary)' }}
            >
              Crime Records &amp; Detection Analytics
            </h1>
            <p className="text-[14px] sm:text-[16px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Comparative statutory registry analysis (2022 vs 2023), tracking cases registered, cases investigated &amp; detected, and institutional detection rates across Greater Mumbai.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              style={{
                background: 'var(--color-primary)',
                boxShadow: '0 2px 10px rgba(18,59,58,0.15)'
              }}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Provenance Badge Row */}
        <div 
          className="pt-2.5 flex flex-wrap items-center justify-between text-[11px] sm:text-[12px] gap-2"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span><strong>Source:</strong> Mumbai Police Annual Statistical Registry</span>
            <span className="hidden sm:inline">·</span>
            <span><strong>Jurisdiction:</strong> Greater Mumbai (Zone 1–12)</span>
          </div>
          <div 
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-medium"
            style={{ background: 'var(--color-teal-soft)', color: 'var(--color-accent)' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Deterministic Official Data</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CORE STATISTICAL SUMMARY (Responsive 2x2 Grid on Mobile)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Metric 1: Total Registered 2023 */}
        <div 
          className="p-3.5 sm:p-5 flex flex-col justify-between"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--color-muted)' }}>
              Registered (2023)
            </span>
            <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[26px] sm:text-[34px] leading-tight" style={{ color: 'var(--color-primary)' }}>
                {data.total_cases_2023.toLocaleString()}
              </span>
              <span className="text-[11px] sm:text-xs" style={{ color: 'var(--color-muted)' }}>FIRs</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 flex items-center justify-between text-[11px] sm:text-xs" style={{ borderTop: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>2022:</span>
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{data.total_cases_2022.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 2: Net YoY Change */}
        <div 
          className="p-3.5 sm:p-5 flex flex-col justify-between"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--color-muted)' }}>
              YoY Trend
            </span>
            <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[26px] sm:text-[34px] leading-tight" style={{ color: '#16a34a' }}>
                {data.trend_percentage}%
              </span>
              <span className="text-[11px] sm:text-xs font-medium" style={{ color: '#16a34a' }}>decrease</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 flex items-center justify-between text-[11px] sm:text-xs" style={{ borderTop: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>Delta:</span>
            <span className="font-semibold" style={{ color: '#16a34a' }}>
              -{(data.total_cases_2022 - data.total_cases_2023).toLocaleString()} cases
            </span>
          </div>
        </div>

        {/* Metric 3: City Detection Rate 2023 */}
        <div 
          className="p-3.5 sm:p-5 flex flex-col justify-between"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--color-muted)' }}>
              2023 Detection
            </span>
            <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[26px] sm:text-[34px] leading-tight" style={{ color: 'var(--color-accent)' }}>
                {data.detection_rate_2023 || 94.2}%
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold px-1 py-0.5 rounded" style={{ background: 'var(--color-teal-soft)', color: 'var(--color-accent)' }}>
                +13% YoY
              </span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 flex items-center justify-between text-[11px] sm:text-xs" style={{ borderTop: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>2022 Rate:</span>
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{data.detection_rate_2022 || 81.1}%</span>
          </div>
        </div>

        {/* Metric 4: Total Detected Cases 2023 */}
        <div 
          className="p-3.5 sm:p-5 flex flex-col justify-between"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--color-muted)' }}>
              Detected Cases
            </span>
            <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[26px] sm:text-[34px] leading-tight" style={{ color: 'var(--color-primary)' }}>
                {(data.total_detected_2023 || 5570).toLocaleString()}
              </span>
              <span className="text-[11px] sm:text-xs" style={{ color: 'var(--color-muted)' }}>solved</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 flex items-center justify-between text-[11px] sm:text-xs" style={{ borderTop: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>Solved:</span>
            <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>
              {((data.total_detected_2023 || 5570) / (data.total_cases_2023 || 5913) * 100).toFixed(1)}% of total
            </span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. VISUAL BREAKDOWN: CHART & SUMMARY CARDS
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Left 8 Cols: Recharts Categorical Breakdown */}
        <div 
          className="lg:col-span-8 p-4 sm:p-6 space-y-3 sm:space-y-4"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h3 className="font-display text-[20px] sm:text-[22px] leading-tight" style={{ color: 'var(--color-primary)' }}>
                Major Statutory Crime Heads
              </h3>
              <p className="text-[12px] sm:text-[13px]" style={{ color: 'var(--color-muted)' }}>
                Registered FIR volume vs cases detected across key statutory offenses
              </p>
            </div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>
              Values in units (cases)
            </div>
          </div>

          <div className="h-64 sm:h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 8, right: 8, left: -20, bottom: 20 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E6EFEB" />
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fontSize: 11, fill: '#6E7772' }} 
                  interval={0} 
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#6E7772' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(30,103,97,0.06)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const fullItem = chartData.find(d => d.shortName === label) || {};
                      return (
                        <div 
                          className="p-3 text-xs space-y-1.5 min-w-[190px]"
                          style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #D8D3C9',
                            boxShadow: '0 8px 24px rgba(18,59,58,0.12)'
                          }}
                        >
                          <strong className="block pb-1 font-semibold text-[13px]" style={{ color: 'var(--color-primary)', borderBottom: '1px solid #D8D3C9' }}>
                            {fullItem.name || label}
                          </strong>
                          {payload.map((entry, index) => (
                            <div key={`item-${index}`} className="flex justify-between items-center text-[12px]" style={{ color: 'var(--color-ink)' }}>
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-bold">{entry.value.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="pt-1 text-[11px] font-semibold text-emerald-700 flex justify-between border-t border-slate-100">
                            <span>Detection Rate:</span>
                            <span>{fullItem.rate}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  height={28} 
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '4px' }} 
                />
                <Bar name="2022 Reg." dataKey="2022 Reg." fill="#A8C2B6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar name="2023 Reg." dataKey="2023 Reg." fill="#123B3A" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar name="2023 Det." dataKey="2023 Det." fill="#1E6761" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Quick 3 Stat Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="p-2 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <span className="text-[10px] block uppercase" style={{ color: 'var(--color-muted)' }}>Modesty (354)</span>
              <span className="text-[12px] sm:text-xs font-bold" style={{ color: 'var(--color-primary)' }}>2,163 (95% Det.)</span>
            </div>
            <div className="p-2 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <span className="text-[10px] block uppercase" style={{ color: 'var(--color-muted)' }}>Kidnapping</span>
              <span className="text-[12px] sm:text-xs font-bold" style={{ color: 'var(--color-primary)' }}>1,167 (94% Det.)</span>
            </div>
            <div className="p-2 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <span className="text-[10px] block uppercase" style={{ color: 'var(--color-muted)' }}>Rape Offences</span>
              <span className="text-[12px] sm:text-xs font-bold" style={{ color: 'var(--color-primary)' }}>973 (96% Det.)</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Legal Context & Institutional Observations */}
        <div 
          className="lg:col-span-4 p-4 sm:p-6 space-y-3.5"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="pb-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="font-display text-[20px] sm:text-[22px] flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
              <Scale className="w-4 h-4 text-[#1E6761]" />
              Statutory Notes &amp; Scope
            </h3>
            <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>
              Institutional insights from Mumbai Police crime registry
            </p>
          </div>

          <div className="space-y-2.5 text-[13px]" style={{ color: 'var(--color-ink)' }}>
            
            <div className="p-3 rounded-xl space-y-1" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px]" style={{ color: 'var(--color-primary)' }}>1. High Detection Rate</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--color-teal-soft)', color: 'var(--color-accent)' }}>
                  94.2% in '23
                </span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Detection increased significantly from 81.1% (4,995/6,156 in 2022) to 94.2% (5,570/5,913 in 2023) across recorded offenses.
              </p>
            </div>

            <div className="p-3 rounded-xl space-y-1" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <span className="font-semibold text-[13px] block" style={{ color: 'var(--color-primary)' }}>
                2. POCSO Act Enactments
              </span>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                586 minor rape cases and 495 molestation cases recorded under POCSO in 2023, with institutional detection exceeding 97%.
              </p>
            </div>

            <div className="p-3 rounded-xl space-y-1" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <span className="font-semibold text-[13px] block" style={{ color: 'var(--color-primary)' }}>
                3. Section 498-A Harassment
              </span>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                746 cases recorded in 2023 (down from 868 in 2022), with detection rate rising to 94% (up from 60% in 2022).
              </p>
            </div>

            <div 
              className="p-3 rounded-xl text-[11px] sm:text-[12px] flex items-start gap-2"
              style={{ background: 'var(--color-teal-soft)', border: '1px solid rgba(30,103,97,0.2)', color: 'var(--color-primary)' }}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#1E6761]" />
              <span>
                <strong>Interpretation Guidance:</strong> Registered crime statistics reflect reported FIRs and administrative filings. Variations reflect reporting patterns and civic actions.
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. COMPREHENSIVE STATUTORY REGISTRY (Responsive Cards & Table)
          ───────────────────────────────────────────────────────────── */}
      <div 
        className="space-y-4"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        
        {/* Table / Cards Controls Header */}
        <div className="p-4 sm:p-5 space-y-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-[22px] sm:text-[24px] leading-tight" style={{ color: 'var(--color-primary)' }}>
                Crime Category Registry ({filteredTableData.length})
              </h3>
              <p className="text-[12px] sm:text-[13px]" style={{ color: 'var(--color-muted)' }}>
                Explore official IPC provisions and Special Acts in Greater Mumbai
              </p>
            </div>

            {/* Mobile View Toggle */}
            <div className="sm:hidden flex items-center gap-1 bg-[#E6EFEB] p-1 rounded-xl self-start">
              <button
                onClick={() => setMobileTab('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mobileTab === 'cards' ? 'bg-[#123B3A] text-white shadow-xs' : 'text-[#6E7772]'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setMobileTab('table')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mobileTab === 'table' ? 'bg-[#123B3A] text-white shadow-xs' : 'text-[#6E7772]'
                }`}
              >
                Full Table
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#6E7772] absolute left-3 top-3 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Section, Act, Molestation, POCSO..."
                className="w-full pl-9 pr-7 py-2 text-[13px] bg-white rounded-xl border border-[#D8D3C9] focus:outline-none focus:border-[#1E6761] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills (Scrollable on mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              {[
                { key: 'all', label: 'All Acts' },
                { key: 'ipc', label: 'IPC Only' },
                { key: 'pocso', label: 'POCSO' },
                { key: 'dowry', label: '498-A' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSelectedLawFilter(f.key)}
                  className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer text-[12px] ${
                    selectedLawFilter === f.key
                      ? 'bg-[#123B3A] text-white shadow-xs'
                      : 'bg-white text-[#6E7772] border border-[#D8D3C9]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto py-2 px-3 text-[12px] bg-white border border-[#D8D3C9] rounded-xl text-[#17201F] focus:outline-none cursor-pointer"
              >
                <option value="registered_desc">Sort: Most 2023 FIRs</option>
                <option value="detected_desc">Sort: Most Detected</option>
                <option value="rate_desc">Sort: Highest Detection %</option>
                <option value="name">Sort: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── MOBILE SCANNABLE CARDS VIEW (Clean & Minimal for Mobile) ── */}
        <div className={`p-3 space-y-2.5 ${mobileTab === 'cards' ? 'block sm:hidden' : 'hidden'}`}>
          {filteredTableData.length === 0 ? (
            <div className="py-8 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
              No matching crime categories found for "{searchQuery}".
            </div>
          ) : (
            filteredTableData.map((row, idx) => {
              const detectionTierColor = row.Detection_Rate_2023 >= 90 
                ? '#16a34a' 
                : row.Detection_Rate_2023 >= 75 
                  ? '#1E6761' 
                  : '#d97706';
              
              return (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#D8D3C9] bg-white space-y-2.5 transition"
                  style={{ boxShadow: '0 2px 8px rgba(18,59,58,0.04)' }}
                >
                  {/* Category Title & Detection Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[14px] leading-snug" style={{ color: 'var(--color-ink)' }}>
                      {row.Category.replace(/\(Excl.*?\)/g, '')}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0"
                      style={{
                        background: `${detectionTierColor}15`,
                        color: detectionTierColor,
                        border: `1px solid ${detectionTierColor}40`
                      }}
                    >
                      {row.Detection_Rate_2023}% Det.
                    </span>
                  </div>

                  {/* 2023 vs 2022 Numbers Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[12px] bg-[#F4F0E8]/60 p-2 rounded-lg border border-[#D8D3C9]/60">
                    <div>
                      <span className="text-[10px] block" style={{ color: 'var(--color-muted)' }}>2023 REGISTERED</span>
                      <strong className="text-[13px]" style={{ color: 'var(--color-primary)' }}>{row.Registered_2023.toLocaleString()} cases</strong>
                      <span className="text-[10px] block text-emerald-700">({row.Detected_2023.toLocaleString()} detected)</span>
                    </div>
                    <div>
                      <span className="text-[10px] block" style={{ color: 'var(--color-muted)' }}>2022 BASELINE</span>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--color-ink)' }}>{row.Registered_2022.toLocaleString()} cases</span>
                      <span className="text-[10px] block" style={{ color: 'var(--color-muted)' }}>({row.Detection_Rate_2022}% rate)</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── DESKTOP & FULL DATA TABLE ── */}
        <div className={`overflow-x-auto ${mobileTab === 'table' ? 'block' : 'hidden sm:block'}`}>
          <table className="w-full text-left border-collapse text-xs font-body">
            <thead>
              <tr className="bg-[#F4F0E8] border-b border-[#D8D3C9] font-semibold" style={{ color: 'var(--color-primary)' }}>
                <th className="py-3 px-4 w-2/5">Crime Category / Legal Provision</th>
                <th className="py-3 px-3 text-right">2022 Reg.</th>
                <th className="py-3 px-3 text-right">2022 Det.</th>
                <th className="py-3 px-3 text-right">2022 %</th>
                <th className="py-3 px-3 text-right font-bold" style={{ background: 'rgba(18,59,58,0.06)', color: 'var(--color-primary)' }}>2023 Reg.</th>
                <th className="py-3 px-3 text-right font-bold" style={{ background: 'rgba(30,103,97,0.08)', color: 'var(--color-accent)' }}>2023 Det.</th>
                <th className="py-3 px-4 text-right">2023 Detection %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D3C9]/60 text-[13px]">
              {filteredTableData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                    No matching categories found for "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredTableData.map((row, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-[#E6EFEB]/40 transition">
                      <td className="py-3 px-4 font-medium text-[13px]" style={{ color: 'var(--color-ink)' }}>
                        {row.Category.replace(/\(Excl.*?\)/g, '')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono" style={{ color: 'var(--color-muted)' }}>
                        {row.Registered_2022.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono" style={{ color: 'var(--color-muted)' }}>
                        {row.Detected_2022.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono" style={{ color: 'var(--color-muted)' }}>
                        {row.Detection_Rate_2022}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold" style={{ background: 'rgba(18,59,58,0.03)', color: 'var(--color-primary)' }}>
                        {row.Registered_2023.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold" style={{ background: 'rgba(30,103,97,0.04)', color: 'var(--color-accent)' }}>
                        {row.Detected_2023.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          row.Detection_Rate_2023 >= 90
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.Detection_Rate_2023 >= 75
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {row.Detection_Rate_2023}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footnote */}
        <div 
          className="p-3.5 sm:p-4 bg-[#F4F0E8]/70 border-t border-[#D8D3C9] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5"
          style={{ color: 'var(--color-muted)' }}
        >
          <span>
            Total aggregated cases for Greater Mumbai: <strong>{data.total_cases_2023.toLocaleString()}</strong> (2023) vs <strong>{data.total_cases_2022.toLocaleString()}</strong> (2022).
          </span>
          <span className="text-[11px]">
            Source: Bureau of Police Research and Development / Mumbai Police Crime Records Branch
          </span>
        </div>
      </div>

    </div>
  );
}
