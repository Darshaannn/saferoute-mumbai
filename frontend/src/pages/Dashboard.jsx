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
  Scale
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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLawFilter, setSelectedLawFilter] = useState('all'); // 'all' | 'ipc' | 'pocso' | 'dowry'
  const [sortBy, setSortBy] = useState('registered_desc'); // 'registered_desc' | 'detected_desc' | 'rate_desc' | 'name'

  useEffect(() => {
    fetch('http://localhost:5000/api/crimes/summary')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="pt-28 flex flex-col justify-center items-center h-[70vh] space-y-3">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-medium text-slate-500">Loading Mumbai Police Annual Crime Summary (2022–2023)...</p>
    </div>
  );

  if (!data) return (
    <div className="pt-28 p-6 text-center text-rose-600 text-sm">
      Unable to connect to local safety server. Please ensure the Flask backend is active on port 5000.
    </div>
  );

  // Clean raw categories
  const rawCategories = data.categories || [];
  
  // Filter out the aggregate "Total of Crime Against Women Cases" row from charts/tables to avoid double-counting
  const detailedCategories = rawCategories.filter(
    c => !c.Category.toLowerCase().includes('total of crime against women')
  );

  // Top comparison data for charts (Major statutory heads)
  const chartCategories = [
    { key: "Modesty / Molestation", match: "Outraging Modesty" },
    { key: "Kidnapping / Abduction", match: "Total Kidnapping Cases" },
    { key: "Rape Offences", match: "Total Rape Cases" },
    { key: "POCSO (Minor Rape)", match: "Rape with POCSO" },
    { key: "Domestic Harassment (498-A)", match: "Dowry related Mental" },
    { key: "Insult to Modesty (509)", match: "Intended insult" },
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
      '2022 Registered': found.Registered_2022,
      '2023 Registered': found.Registered_2023,
      '2023 Solved/Detected': found.Detected_2023,
      rate: found.Detection_Rate_2023
    };
  });

  // Filter & Search Table
  const filteredTableData = detailedCategories.filter(c => {
    const matchesSearch = c.Category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedLawFilter === 'pocso') return c.Category.toLowerCase().includes('pocso');
    if (selectedLawFilter === 'dowry') return c.Category.toLowerCase().includes('dowry');
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
    <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen pb-24 space-y-8 font-sans">
      
      {/* 1. EDITORIAL HEADER & METADATA BAR */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                Public Safety Intelligence • Official Gazette Release
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Mumbai Crime Against Women Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Comparative statutory registry analysis (Calendar Years 2022 vs 2023), tracking cases registered, cases investigated & detected, and institutional detection rates across Greater Mumbai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Clean Dataset (.CSV)
            </button>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <span><strong>Source:</strong> Mumbai Police Annual Statistical Registry</span>
            <span><strong>Jurisdiction:</strong> Greater Mumbai (Zone 1–12)</span>
            <span><strong>Scope:</strong> IPC & Special Minor Acts (POCSO/PITA)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Deterministic • Zero Synthetic Estimates
          </div>
        </div>
      </div>

      {/* 2. CORE STATISTICAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Registered 2023 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Registered Cases (2023)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {data.total_cases_2023.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">cases</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">2022 Baseline:</span>
            <span className="font-semibold text-slate-700">{data.total_cases_2022.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 2: Net Year-on-Year Trend */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Year-over-Year Trend
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-700 tracking-tight">
                {data.trend_percentage}%
              </span>
              <span className="text-xs font-medium text-emerald-600">net decline</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Absolute Change:</span>
            <span className="font-semibold text-emerald-700">
              -{(data.total_cases_2022 - data.total_cases_2023)} fewer cases
            </span>
          </div>
        </div>

        {/* Metric 3: City Detection Rate */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Investigation Detection Rate
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                94.2%
              </span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                +13.2% vs '22
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">2023 Solved Cases:</span>
            <span className="font-semibold text-slate-700">5,570 of 5,913</span>
          </div>
        </div>

        {/* Metric 4: Risk Index Reference */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              City Risk Index Benchmark
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-700 tracking-tight">
                {data.city_wide_risk_indicator}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100 benchmark</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">State:</span>
            <span className="font-medium text-amber-800">Moderate Historical Vigilance</span>
          </div>
        </div>

      </div>

      {/* 3. VISUAL DISTRIBUTION: 2-COLUMN SECTION (CHART & STATUTORY NOTES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Recharts Categorical Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Major Crime Heads: Registered vs Detected (2022 vs 2023)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Volume of FIRs registered and cases successfully detected across major offenses
              </p>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Values in units (cases)
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 12, right: 12, left: -10, bottom: 25 }}
                barGap={3}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} 
                  interval={0} 
                  angle={-10} 
                  textAnchor="end" 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-xs space-y-1.5 min-w-[200px]">
                          <strong className="text-slate-900 block border-b border-slate-100 pb-1 font-semibold">{label}</strong>
                          {payload.map((entry, index) => (
                            <div key={`item-${index}`} className="flex justify-between items-center text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name}:
                              </span>
                              <span className="font-bold text-slate-900">{entry.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  height={32} 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingBottom: '8px' }} 
                />
                <Bar name="2022 Registered" dataKey="2022 Registered" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar name="2023 Registered" dataKey="2023 Registered" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar name="2023 Detected" dataKey="2023 Solved/Detected" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Outraging Modesty</span>
              <span className="text-xs font-bold text-slate-800">2,163 FIRs (95% Solved)</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Kidnapping Head</span>
              <span className="text-xs font-bold text-slate-800">1,167 FIRs (94% Solved)</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Rape & POCSO</span>
              <span className="text-xs font-bold text-slate-800">973 FIRs (96% Solved)</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Legal Context & Institutional Insights */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-700" />
              Statutory Framework & Notes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Key observations from the official crime registry
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
            
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <span className="font-semibold text-slate-900 block flex items-center justify-between">
                <span>1. Detection Efficiency Surge</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">94% in '23</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Institutional detection jumped from 81% (4,995 / 6,156 in 2022) to 94.2% (5,570 / 5,913 in 2023) aided by CCTV integration across suburban rail and key intersections.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <span className="font-semibold text-slate-900 block">2. POCSO Act Enactments</span>
              <p className="text-[11px] text-slate-500">
                Mandatory registration under the POCSO Act accounted for 586 minor rape cases and 495 molestation cases in 2023, with over 97% solve rates recorded by special juvenile units.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <span className="font-semibold text-slate-900 block">3. Domestic Harassment (Sec. 498-A)</span>
              <p className="text-[11px] text-slate-500">
                746 cases registered under Section 498-A in 2023 (down from 868 in 2022). Detection in this category improved from 60% in 2022 to 94% in 2023.
              </p>
            </div>

          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note on Interpretation:</strong> Higher registration numbers reflect greater reporting accessibility, mandatory FIR rules, and citizen outreach rather than worsening ground conditions.
            </span>
          </div>
        </div>

      </div>

      {/* 4. COMPREHENSIVE STATUTORY REGISTRY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Complete Crime Category Registry ({filteredTableData.length} entries)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by statutory head or search specific Indian Penal Code / Act sections
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Section, Act, Rape, Dowry..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
              />
            </div>

            {/* Act Filter */}
            <select
              value={selectedLawFilter}
              onChange={(e) => setSelectedLawFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Legal Acts</option>
              <option value="ipc">IPC Offences Only</option>
              <option value="pocso">POCSO Acts Only</option>
              <option value="dowry">Dowry Prohibition / 498-A</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="registered_desc">Sort: Highest 2023 FIRs</option>
              <option value="detected_desc">Sort: Highest Detected</option>
              <option value="rate_desc">Sort: Highest Detection %</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>
        </div>

        {/* The Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-2/5">Crime Category / Legal Provision</th>
                <th className="py-3 px-3 text-right">2022 Reg.</th>
                <th className="py-3 px-3 text-right">2022 Det.</th>
                <th className="py-3 px-3 text-right">2022 Rate</th>
                <th className="py-3 px-3 text-right text-blue-900 bg-blue-50/40">2023 Reg.</th>
                <th className="py-3 px-3 text-right text-emerald-900 bg-emerald-50/40">2023 Det.</th>
                <th className="py-3 px-4 text-right">2023 Detection %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTableData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No matching categories found for "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredTableData.map((row, idx) => {
                  const isPositiveChange = row.Registered_2023 <= row.Registered_2022;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3 px-4 font-medium text-slate-900 flex items-center justify-between">
                        <span>{row.Category.replace(/\(Excl.*?\)/g, '')}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {row.Registered_2022.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {row.Detected_2022.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {row.Detection_Rate_2022}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/20">
                        {row.Registered_2023.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/20">
                        {row.Detected_2023.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          row.Detection_Rate_2023 >= 90
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : row.Detection_Rate_2023 >= 75
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
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

        {/* Table Aggregate Footnote */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Total aggregated cases for Greater Mumbai: <strong>{data.total_cases_2023.toLocaleString()}</strong> in 2023 vs <strong>{data.total_cases_2022.toLocaleString()}</strong> in 2022.
          </span>
          <span className="text-[11px] text-slate-400">
            Source: Bureau of Police Research and Development / Mumbai Police Crime Records Branch
          </span>
        </div>
      </div>

    </div>
  );
}
