import React, { useState } from 'react';
import { GisHotspot } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Send,
  Download,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  PieChart as PieIcon,
  Layers,
  Flame,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface DistrictAnalyticsProps {
  hotspots: GisHotspot[];
  onNavigate: (tab: string) => void;
}

export const DistrictAnalytics: React.FC<DistrictAnalyticsProps> = ({
  hotspots,
  onNavigate
}) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '14d' | 'season'>('7d');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 7-day epidemiological spread data
  const outbreakData = [
    { day: 'Day -6', cases: 8, contained: 7, uncontained: 1 },
    { day: 'Day -5', cases: 14, contained: 12, uncontained: 2 },
    { day: 'Day -4', cases: 22, contained: 18, uncontained: 4 },
    { day: 'Day -3', cases: 35, contained: 29, uncontained: 6 },
    { day: 'Day -2', cases: 54, contained: 47, uncontained: 7 },
    { day: 'Day -1', cases: 78, contained: 69, uncontained: 9 },
    { day: 'Today', cases: 111, contained: 104, uncontained: 7 },
  ];

  // Predictive 14-day projection comparison (without AI vs with Digital KrishiVaani Early Biosecurity)
  const projectionData = [
    { day: 'Day 0 (Now)', baselineUncontrolled: 111, proactiveWithAI: 111 },
    { day: 'Day +2', baselineUncontrolled: 145, proactiveWithAI: 118 },
    { day: 'Day +4', baselineUncontrolled: 189, proactiveWithAI: 122 },
    { day: 'Day +6', baselineUncontrolled: 240, proactiveWithAI: 114 },
    { day: 'Day +8', baselineUncontrolled: 298, proactiveWithAI: 95 },
    { day: 'Day +10', baselineUncontrolled: 350, proactiveWithAI: 72 },
    { day: 'Day +12', baselineUncontrolled: 395, proactiveWithAI: 48 },
    { day: 'Day +14', baselineUncontrolled: 420, proactiveWithAI: 31 },
  ];

  // Block vulnerability & caseload metrics
  const blockRankings = [
    { name: 'Sanwer Block', cases: 42, contained: 39, acres: 240, risk: 'high', dominant: 'Cotton Leaf Spot (Cercospora)', trend: '+12% weekly' },
    { name: 'Depalpur Block', cases: 28, contained: 25, acres: 180, risk: 'high', dominant: 'Soybean Aerial Blight (Rhizoctonia)', trend: '+8% weekly' },
    { name: 'Hatod Block', cases: 19, contained: 18, acres: 110, risk: 'moderate', dominant: 'Aphid Complex / Sucking Pest', trend: '-4% weekly' },
    { name: 'Mhow Block', cases: 14, contained: 14, acres: 85, risk: 'moderate', dominant: 'Chilli Thrips & Whitefly', trend: '-2% weekly' },
    { name: 'Indore Rural', cases: 8, contained: 8, acres: 45, risk: 'low', dominant: 'Vegetable Pod Borer', trend: 'Stable' },
  ];

  // Pathogen signature breakdown
  const pathogenBreakdown = [
    { name: 'Cotton Foliar Spot (Cercospora / Alternaria)', percent: 38, count: 42, color: '#f43f5e' },
    { name: 'Soybean Aerial / Web Blight (Rhizoctonia)', percent: 26, count: 28, color: '#f97316' },
    { name: 'Sucking Pest Complex (Aphids, Jassids, Whitefly)', percent: 20, count: 23, color: '#eab308' },
    { name: 'Chilli & Tomato Anthracnose / Early Blight', percent: 16, count: 18, color: '#06b6d4' }
  ];

  const filteredBlocks = selectedBlockFilter === 'all'
    ? blockRankings
    : blockRankings.filter(b => b.name.toLowerCase().includes(selectedBlockFilter.toLowerCase()));

  const handleExportReport = () => {
    // Generate CSV content
    const headers = 'Block,Active Cases,Contained Cases,Vulnerable Acres,Dominant Pathogen,Risk Level,Trend\n';
    const rows = blockRankings
      .map(b => `"${b.name}",${b.cases},${b.contained},${b.acres},"${b.dominant}","${b.risk}","${b.trend}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Indore_District_Agri_Epidemiology_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('✓ Official District Agriculture Epidemiological Report (CSV) exported successfully.');
    setTimeout(() => setExportNotice(null), 4500);
  };

  return (
    <div id="district-analytics-view" className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 pb-16">
      
      {/* Header with District Seal Branding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              District Agriculture Epidemiology & Predictive Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold font-mono">
              Indore Agri Directorate
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time geospatial epidemiology, block-level disease burden, and AI predictive trajectory modeling
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('outbreak-command')}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flame className="w-4 h-4 text-rose-300" />
            <span>Outbreak Defense Command</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('gis-map')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>GIS Disease Map</span>
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Monitored Holdings</span>
          <span className="font-display font-extrabold text-3xl text-slate-900 mt-1 block">111 Fields</span>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">Across 42 Villages & 5 Blocks</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Vulnerable Crop Area</span>
          <span className="font-display font-extrabold text-3xl text-slate-900 mt-1 block">660 Acres</span>
          <span className="text-[11px] text-amber-700 font-bold mt-1 block">420 Acres in High-Risk Buffer</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Early Containment Rate</span>
          <span className="font-display font-extrabold text-3xl text-emerald-700 mt-1 block">94.2%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Treated Prior to Visible Necrosis</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Field Officers</span>
          <span className="font-display font-extrabold text-3xl text-indigo-700 mt-1 block">18 KVK Staff</span>
          <span className="text-[11px] text-slate-500 mt-1 block">34 Geoverified Inspections Done</span>
        </div>
      </div>

      {/* Section 1: 7-Day Outbreak Curve Area Chart & Pathogen Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 7-Day Outbreak Curve (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Epidemiological Spread Dynamics</span>
              <h3 className="font-display font-extrabold text-lg text-slate-900 mt-0.5">
                Cumulative Ingestion vs Pre-Emptive Containment
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                Total Cases
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Contained (Bio-IPM)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outbreakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-950 text-white p-3 rounded-xl text-xs font-sans space-y-1 shadow-lg">
                          <span className="font-bold text-indigo-300 block">{d.day}</span>
                          <div>Total Cases: <strong>{d.cases}</strong></div>
                          <div>Contained: <strong className="text-emerald-400">{d.contained}</strong></div>
                          <div>Under Review: <strong className="text-amber-400">{d.uncontained}</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="cases" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={2} />
                <Area type="monotone" dataKey="contained" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
            <strong>Key Insight:</strong> 93.7% of reported infections were contained within 36 hours through automated bio-agent application, preventing exponential secondary spread across the Indore-Sanwer belt.
          </p>
        </div>

        {/* Pathogen Signature Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pathogen Profiling</span>
            <h3 className="font-display font-extrabold text-lg text-slate-900 mt-0.5">
              District Disease Signature Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dominant biological threats categorized by genomic/phenotypic scans
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {pathogenBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[210px]">{item.name}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {item.percent}% ({item.count})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 mt-4 text-xs text-indigo-900">
            <span className="font-bold block mb-0.5">Agricultural Officer Action Note:</span>
            Foliar fungal pathogens (Cercospora & Rhizoctonia) constitute 64% of active threat load due to high ambient relative humidity (82%). Prioritize *Trichoderma* seed & foliar dip.
          </div>
        </div>

      </div>

      {/* Section 2: 14-Day Predictive Epidemic Trajectory (AI Model vs Uncontrolled) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono uppercase">
                AI Epidemic Forecaster
              </span>
              <span className="text-xs text-slate-400 font-medium">Model Confidence: 92.4%</span>
            </div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 mt-1">
              14-Day Trajectory: Uncontrolled Epidemic vs Digital KrishiVaani Early Bio-Defense
            </h3>
            <p className="text-xs text-slate-500">
              Demonstrates how proactive biological containment flattens the disease surge curve compared to standard delayed chemical intervention.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-1 bg-rose-600 rounded-full" />
              Without AI (Delayed Response)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-1 bg-emerald-600 rounded-full" />
              With Digital KrishiVaani Bio-Defense
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 450]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950 text-white p-3 rounded-xl text-xs font-sans space-y-1.5 shadow-xl">
                        <span className="font-bold text-slate-300 block">{d.day}</span>
                        <div className="text-rose-400">
                          Uncontrolled Forecast: <strong>{d.baselineUncontrolled} Cases</strong>
                        </div>
                        <div className="text-emerald-400">
                          Proactive AI Bio-Defense: <strong>{d.proactiveWithAI} Cases</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Net Prevented Cases: +{d.baselineUncontrolled - d.proactiveWithAI}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="baselineUncontrolled"
                stroke="#e11d48"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#e11d48' }}
              />
              <Line
                type="monotone"
                dataKey="proactiveWithAI"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 3: Sub-Division / Block Vulnerability Ranking Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900">
              Sub-Division / Block Vulnerability Hierarchy & Case Status
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by composite pest pressure, humidity anomaly, and acreage vulnerability
            </p>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Filter by block"
              value={selectedBlockFilter}
              onChange={e => setSelectedBlockFilter(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All District Blocks (5)</option>
              <option value="Sanwer">Sanwer Block</option>
              <option value="Depalpur">Depalpur Block</option>
              <option value="Hatod">Hatod Block</option>
              <option value="Mhow">Mhow Block</option>
              <option value="Indore">Indore Rural</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3">Rank / Block</th>
                <th className="p-3">Active Cases</th>
                <th className="p-3">Contained Rate</th>
                <th className="p-3">Vulnerable Area</th>
                <th className="p-3">Dominant Pathogen Signature</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBlocks.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-mono text-[10px] font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <span>{b.name}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{b.cases} Cases</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">
                    {Math.round((b.contained / b.cases) * 100)}% ({b.contained}/{b.cases})
                  </td>
                  <td className="p-3 font-mono text-slate-600">{b.acres} Acres</td>
                  <td className="p-3 font-medium text-slate-700">{b.dominant}</td>
                  <td className="p-3">
                    <RiskBadge level={b.risk as any} size="sm" />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigate('outbreak-command')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Deploy Defense →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
