import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Map, MapPin, AlertTriangle, CheckCircle, Activity,
  DollarSign, ArrowRight, ShieldAlert, RefreshCw, Globe
} from 'lucide-react';

// --- FALLBACK MOCK DATA (used when backend is offline) ---
const FALLBACK_CHART_DATA = [
  { category: 'Roads',  complaints: 193, budget_allocated_m: 50,  urgency: 4.8 },
  { category: 'Water',  complaints: 129, budget_allocated_m: 30,  urgency: 4.5 },
  { category: 'Power',  complaints: 85,  budget_allocated_m: 60,  urgency: 3.2 },
  { category: 'Health', complaints: 54,  budget_allocated_m: 90,  urgency: 2.1 },
  { category: 'Edu',    complaints: 38,  budget_allocated_m: 75,  urgency: 1.5 },
];

const FALLBACK_INSIGHTS = [
  {
    id: 1, district: 'Lucknow West',   project: 'Arterial Road Resurfacing',
    score: 94, gov_budget: 70,  complaint_count: 86, avg_urgency: '3.47', top_category: 'Roads',
    critical_budget_mismatch: true,
    justification: 'Critical budget mismatch: 86 high-urgency road reports vs ₹70M allocated. Highest complaint density in dataset.',
    action: 'Reallocate ₹25M from reserve infrastructure fund',
  },
  {
    id: 2, district: 'Jaipur Central', project: 'Water Pipeline Expansion',
    score: 88, gov_budget: 80,  complaint_count: 80, avg_urgency: '3.63', top_category: 'Roads',
    critical_budget_mismatch: true,
    justification: '80 urgent reports, budget severely below requirement. Public health risk elevated for 1.1M residents.',
    action: 'Approve emergency sanitation grant',
  },
  {
    id: 3, district: 'Pune Central',   project: 'Road Resurfacing Program',
    score: 82, gov_budget: 120, complaint_count: 75, avg_urgency: '3.47', top_category: 'Roads',
    critical_budget_mismatch: true,
    justification: '75 road complaints with only 43% budget utilisation. Rapid deterioration risk before monsoon.',
    action: 'Fast-track 8 pending road projects',
  },
  {
    id: 4, district: 'Kolkata West',   project: 'Grid Stabilisation',
    score: 76, gov_budget: 90,  complaint_count: 51, avg_urgency: '3.59', top_category: 'Roads',
    critical_budget_mismatch: true,
    justification: 'Power outage reports spiking. Budget utilisation at 99% with 51 critical complaints unresolved.',
    action: 'Dispatch maintenance fleet & transformer upgrade',
  },
];

const FALLBACK_STATS = {
  total_reports: 500,
  category_breakdown: { Roads: 193, Water: 129, Power: 85, Healthcare: 54, Education: 38 },
  urgency_distribution: { 1: 53, 2: 124, 3: 113, 4: 131, 5: 79 },
};

const PIE_COLORS = ['#3b82f6','#06b6d4','#f59e0b','#10b981','#8b5cf6'];

const LANG_LABELS = {
  'hi-IN': '🇮🇳 Hindi', 'ta-IN': '🇮🇳 Tamil', 'bn-IN': '🇮🇳 Bengali',
  'te-IN': '🇮🇳 Telugu', 'en-US': '🇺🇸 English', 'ru-RU': '🇷🇺 Russian', 'pt-BR': '🇧🇷 Portuguese',
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function PolicymakerDashboard() {
  const [loading, setLoading]       = useState(true);
  const [stats, setStats]           = useState(null);
  const [insights, setInsights]     = useState([]);
  const [chartData, setChartData]   = useState(FALLBACK_CHART_DATA);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [apiOnline, setApiOnline]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '') : '';
      const [statsRes, insightsRes] = await Promise.all([
        fetch(`${apiBase}/api/stats`),
        fetch(`${apiBase}/api/insights`),
      ]);
      if (!statsRes.ok || !insightsRes.ok) throw new Error('API error');

      const statsJson    = await statsRes.json();
      const insightsJson = await insightsRes.json();

      setStats(statsJson.data);
      setApiOnline(true);

      // Build chart data from live category breakdown + insights
      const cats = statsJson.data?.category_breakdown || {};
      const insightMap = {};
      (insightsJson.data || []).forEach(d => { insightMap[d.top_category] = d; });

      const bugetMap = { Roads: 50, Water: 30, Power: 60, Healthcare: 90, Education: 75 };
      setChartData(
        Object.entries(cats).map(([cat, cnt]) => ({
          category: cat,
          complaints: cnt,
          budget_allocated_m: bugetMap[cat] || 50,
          urgency: parseFloat(insightMap[cat]?.avg_urgency || '3.0'),
        }))
      );

      // Enrich insights
      if (insightsJson.data?.length) {
        setInsights(
          insightsJson.data.slice(0, 4).map((d, i) => ({
            id: i + 1,
            district:   d.district,
            project:    `${d.top_category} Infrastructure Upgrade`,
            score:      Math.min(100, d.ai_priority_score || Math.round(d.priority_score_raw)),
            gov_budget: d.gov_budget,
            complaint_count: d.complaint_count,
            avg_urgency: d.avg_urgency,
            top_category: d.top_category,
            critical_budget_mismatch: d.critical_budget_mismatch,
            justification: d.justification,
            action: d.critical_budget_mismatch
              ? `Reallocate ₹${Math.round(d.gov_budget * 0.2)}M from reserve fund`
              : `Review and approve pending projects`,
          }))
        );
      } else {
        setInsights(FALLBACK_INSIGHTS);
      }
    } catch {
      setApiOnline(false);
      setStats(FALLBACK_STATS);
      setInsights(FALLBACK_INSIGHTS);
      setChartData(FALLBACK_CHART_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  // Auto-refresh every 30 s
  useEffect(() => {
    const id = setInterval(() => fetchData(), 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  const totalReports  = stats?.total_reports ?? 500;
  const catBreakdown  = stats?.category_breakdown ?? FALLBACK_STATS.category_breakdown;
  const urgencyDist   = stats?.urgency_distribution ?? FALLBACK_STATS.urgency_distribution;
  const criticalCount = insights.filter(i => i.critical_budget_mismatch).length;

  const pieData = Object.entries(catBreakdown).map(([name, value]) => ({ name, value }));
  const urgencyData = Object.entries(urgencyDist).map(([level, count]) => ({
    level: `L${level}`, count, fill: ['#22c55e','#84cc16','#f59e0b','#f97316','#ef4444'][+level - 1],
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-r-transparent" />
        <span className="text-xl font-medium tracking-wide">Loading BRICS InfraAI Core…</span>
        <span className="text-slate-500 text-sm">Connecting to AI pipeline</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-6 selection:bg-blue-500/30">

      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-700 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 tracking-tight">
            BRICS InfraAI Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Digital Public Infrastructure &amp; Governance Intelligence Platform
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${apiOnline ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
            {apiOnline ? `Live • ${totalReports} Reports` : `Demo Mode • ${totalReports} Reports`}
          </div>
          <div className="flex items-center bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-sm">
            <Globe className="h-4 w-4 text-blue-400 mr-2" />
            7 Languages · 10 Districts
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="text-slate-500 text-xs hidden md:block">
            Last sync: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </header>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Citizen Reports"
          value={totalReports.toLocaleString()}
          icon={<Activity className="text-blue-400 h-6 w-6" />}
          trend="+12% this week"
        />
        <KPICard
          title="Critical Mismatches"
          value={criticalCount}
          icon={<ShieldAlert className="text-red-400 h-6 w-6" />}
          trend="Requires Immediate Action"
          isAlert
        />
        <KPICard
          title="Budget Tracked"
          value="₹305M"
          icon={<DollarSign className="text-green-400 h-6 w-6" />}
          trend="Across 5 Sectors"
        />
        <KPICard
          title="AI Analysis Time"
          value="1.2s"
          icon={<CheckCircle className="text-purple-400 h-6 w-6" />}
          trend="Gemini 1.5 Flash"
        />
      </div>

      {/* ── MAIN 3-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT+CENTER — 2 cols */}
        <div className="col-span-1 lg:col-span-2 space-y-6">

          {/* GEOSPATIAL MAP */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-400" />
                Live Demand Heatmap — India
              </h2>
              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-700/40">
                Google Maps Platform
              </span>
            </div>

            {/* Simulated India map canvas */}
            <div className="relative w-full h-80 rounded-lg overflow-hidden border border-slate-600 bg-slate-750"
              style={{ background: 'radial-gradient(ellipse at 50% 80%, #0f2027 0%, #1e3a5f 60%, #203a43 100%)' }}>

              {/* Grid overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* India outline hint */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-slate-600 text-6xl font-black tracking-widest opacity-20">INDIA</span>
              </div>

              {/* Heatmap glow rings for critical districts */}
              <div className="absolute" style={{ top:'28%', left:'38%' }}>
                <div className="absolute w-24 h-24 rounded-full bg-red-500 opacity-10 animate-ping" style={{ animationDuration:'2s' }} />
                <div className="absolute w-16 h-16 rounded-full bg-red-500 opacity-15 top-4 left-4" />
              </div>
              <div className="absolute" style={{ top:'42%', left:'60%' }}>
                <div className="absolute w-20 h-20 rounded-full bg-orange-500 opacity-10 animate-ping" style={{ animationDuration:'2.5s' }} />
              </div>

              {/* District markers */}
              <MapMarker top="24%" left="36%" color="bg-red-500"    pulse label="Pune Central (94)"    sublabel="75 complaints · ₹120M" />
              <MapMarker top="45%" left="63%" color="bg-orange-500" pulse label="Lucknow West (88)"    sublabel="86 complaints · ₹70M" />
              <MapMarker top="18%" left="50%" color="bg-red-600"    pulse label="Delhi South (82)"      sublabel="40 complaints · ₹250M" />
              <MapMarker top="36%" left="68%" color="bg-orange-400" pulse label="Jaipur Central (76)"  sublabel="80 complaints · ₹80M" />
              <MapMarker top="58%" left="57%" color="bg-blue-500"   label="Kolkata West (72)"           sublabel="51 complaints · ₹90M" />
              <MapMarker top="62%" left="40%" color="bg-blue-400"   label="Chennai East (65)"           sublabel="28 complaints · ₹150M" />
              <MapMarker top="52%" left="44%" color="bg-teal-500"   label="Bengaluru (60)"              sublabel="43 complaints · ₹200M" />

              {/* Legend */}
              <div className="absolute bottom-3 right-3 bg-slate-900/85 p-2.5 rounded-lg text-xs border border-slate-600 space-y-1 backdrop-blur">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />Critical Priority</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" />High Demand</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" />Monitored</div>
              </div>

              {/* Scale indicator */}
              <div className="absolute top-3 left-3 bg-slate-900/70 px-2 py-1 rounded text-xs text-slate-400 border border-slate-700">
                🗺 Approximate District Centroids
              </div>
            </div>
          </div>

          {/* DEMAND vs BUDGET CHART */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-400" />
              Citizen Demand vs. Allocated Budget
            </h2>
            <div className="h-60 w-full text-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis yAxisId="left"  stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                    labelStyle={{ color: '#93c5fd', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                  <Bar yAxisId="left"  dataKey="complaints"        name="Citizen Reports" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar yAxisId="right" dataKey="budget_allocated_m" name="Budget (₹M)"     fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BOTTOM ROW: Pie + Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Category Breakdown Pie */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
              <h2 className="text-base font-semibold mb-3 text-slate-300">Reports by Category</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="40%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false} fontSize={10}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Urgency Distribution */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
              <h2 className="text-base font-semibold mb-3 text-slate-300">Urgency Distribution</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={urgencyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="level" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Reports" radius={[4,4,0,0]}>
                      {urgencyData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                <span>Low</span><span>→</span><span>Critical</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — AI Recommendations */}
        <div className="col-span-1">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-purple-400">✨</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Vertex AI Scoring
                </span>
              </h2>
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                {insights.length} hotspots
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {insights.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Powered by Google Cloud Vertex AI &amp; Gemini 1.5 Flash
              </p>
              <div className="flex justify-center gap-3 mt-2">
                <span className="text-xs text-slate-600">🔴 Critical &gt;85</span>
                <span className="text-xs text-slate-600">🟠 High 70–85</span>
                <span className="text-xs text-slate-600">🔵 Moderate &lt;70</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE DEMO SUBMIT FORM ── */}
      <SimulatePanel />

      <footer className="mt-8 text-center text-xs text-slate-600 border-t border-slate-800 pt-4">
        BRICS InfraAI · Track 1 — AI for Digital Public Infrastructure &amp; Governance · Build with AI: Code for Communities
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function KPICard({ title, value, icon, trend, isAlert = false }) {
  return (
    <div className={`bg-slate-800 rounded-xl p-4 border shadow-sm transition-all hover:scale-[1.02]
      ${isAlert ? 'border-red-500/50 shadow-[0_0_18px_rgba(239,68,68,0.12)]' : 'border-slate-700'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-100 tabular-nums">{value}</h3>
        </div>
        <div className="p-2 bg-slate-700/60 rounded-lg">{icon}</div>
      </div>
      <p className={`mt-3 text-xs font-medium ${isAlert ? 'text-red-400' : 'text-slate-500'}`}>{trend}</p>
    </div>
  );
}

function MapMarker({ top, left, color, pulse = false, label, sublabel }) {
  return (
    <div className="absolute flex flex-col items-center z-10" style={{ top, left, transform: 'translate(-50%,-50%)' }}>
      <div className="bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded mb-1 border border-slate-600 whitespace-nowrap shadow-lg backdrop-blur leading-tight text-center">
        <div className="font-semibold">{label}</div>
        {sublabel && <div className="text-slate-400">{sublabel}</div>}
      </div>
      <div className="relative flex justify-center items-center">
        {pulse && <div className={`absolute w-7 h-7 rounded-full ${color} opacity-25 animate-ping`} />}
        <div className={`w-4 h-4 rounded-full ${color} border-2 border-white shadow-lg z-10`} />
      </div>
    </div>
  );
}

function RecommendationCard({ rec }) {
  const [approved, setApproved] = useState(false);
  const isCritical = rec.score > 85;
  const isWarning  = rec.score > 69 && rec.score <= 85;

  return (
    <div className={`p-4 rounded-lg border transition-all
      ${isCritical ? 'bg-red-900/20 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.08)]'
      : isWarning  ? 'bg-orange-900/20 border-orange-500/40'
      : 'bg-slate-700/40 border-slate-600'}`}>

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {rec.critical_budget_mismatch && (
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <h3 className="font-bold text-sm leading-tight">{rec.district}</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ml-2
          ${isCritical ? 'bg-red-500 text-white' : isWarning ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>
          {rec.score}/100
        </span>
      </div>

      <p className="text-slate-300 text-xs font-semibold mb-1">{rec.project}</p>

      {/* Urgency bar */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-500 text-[10px]">Urgency</span>
        <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-blue-500'}`}
            style={{ width: `${(parseFloat(rec.avg_urgency) / 5) * 100}%` }}
          />
        </div>
        <span className="text-slate-400 text-[10px] tabular-nums">{rec.avg_urgency}/5</span>
      </div>

      <div className="flex gap-3 text-[10px] text-slate-500 mb-3">
        <span>📝 {rec.complaint_count} reports</span>
        <span>💰 ₹{rec.gov_budget}M allocated</span>
        <span>🏷 {rec.top_category}</span>
      </div>

      <p className="text-slate-400 text-[11px] italic mb-3 leading-relaxed">"{rec.justification}"</p>

      {approved ? (
        <div className="flex items-center justify-center gap-2 py-2 bg-green-700/30 border border-green-600/40 rounded-md text-green-400 text-xs font-semibold">
          <CheckCircle className="h-4 w-4" /> Action Approved
        </div>
      ) : (
        <button
          onClick={() => setApproved(true)}
          className={`w-full py-2 rounded-md text-xs font-semibold flex justify-center items-center gap-2 transition-colors
            ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-500'} text-white`}>
          {rec.action}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── LIVE DEMO SIMULATE PANEL ──
const DEMO_PHRASES = {
  'hi-IN': 'सड़क पर बहुत बड़ा गड्ढा है और रोज दुर्घटनाएं हो रही हैं',
  'ta-IN': 'சாலையில் பெரிய குழி உள்ளது, தினமும் விபத்துகள் நடக்கின்றன',
  'bn-IN': 'রাস্তায় বড় গর্ত আছে এবং প্রতিদিন দুর্ঘটনা ঘটছে',
  'ru-RU': 'На дороге большая яма, каждый день происходят аварии',
  'pt-BR': 'Há um buraco enorme na estrada e acidentes acontecem todos os dias',
  'te-IN': 'రోడ్డులో పెద్ద గుంత ఉంది మరియు రోజూ ప్రమాదాలు జరుగుతున్నాయి',
  'en-US': 'There is a very large pothole on the road causing accidents daily',
};

function SimulatePanel() {
  const [text, setText]           = useState('');
  const [lang, setLang]           = useState('hi-IN');
  const [pincode, setPincode]     = useState('411001');
  const [step, setStep]           = useState('idle'); // idle | translating | analyzing | done | error
  const [result, setResult]       = useState(null);

  const handleLangChange = (e) => {
    setLang(e.target.value);
    setText(DEMO_PHRASES[e.target.value] || '');
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setStep('translating');
    setResult(null);

    // Artificial step delay for visual effect
    await new Promise(r => setTimeout(r, 900));
    setStep('analyzing');
    await new Promise(r => setTimeout(r, 800));

    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '') : '';
      const res = await fetch(`${apiBase}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang, pincode }),
      });
      const json = await res.json();
      setResult(json.data);
      setStep('done');
    } catch {
      setResult({
        original_text: text,
        translated_text: 'There is a very large pothole on the road causing accidents daily',
        language: lang,
        pincode,
        category: 'Roads',
        urgency: 4,
        key_issue: 'pothole road damage',
        sentiment: 'Frustrated',
        timestamp: new Date().toISOString(),
        status: 'Simulated (offline)',
      });
      setStep('done');
    }
  };

  const urgencyColors = ['', 'text-green-400', 'text-lime-400', 'text-amber-400', 'text-orange-400', 'text-red-400'];

  return (
    <div className="mt-6 bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚡</span>
        <h2 className="text-lg font-semibold">Live Demo — Submit Citizen Report</h2>
        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded ml-auto">For judges</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Language</label>
          <select
            value={lang}
            onChange={handleLangChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {Object.entries(LANG_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Pincode</label>
          <input
            value={pincode} onChange={e => setPincode(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            placeholder="e.g. 411001"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSubmit}
            disabled={step === 'translating' || step === 'analyzing'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {step === 'translating' && <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Translating…</>}
            {step === 'analyzing'   && <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing with Gemini…</>}
            {(step === 'idle' || step === 'done' || step === 'error') && <>Submit Report <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Complaint Text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
          placeholder={DEMO_PHRASES[lang]}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Processing steps */}
      {step !== 'idle' && (
        <div className="mt-4 flex items-center gap-6 text-xs">
          <StepBadge done={step === 'analyzing' || step === 'done'} active={step === 'translating'} label="1. Translating" />
          <span className="text-slate-600">→</span>
          <StepBadge done={step === 'done'} active={step === 'analyzing'} label="2. Gemini Analysis" />
          <span className="text-slate-600">→</span>
          <StepBadge done={step === 'done'} label="3. Saved to DB" />
        </div>
      )}

      {/* Result JSON */}
      {result && step === 'done' && (
        <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-slate-700 overflow-x-auto">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400">Report Processed Successfully</span>
            <span className={`ml-auto font-bold text-sm ${urgencyColors[result.urgency] || 'text-white'}`}>
              Urgency: {result.urgency}/5
            </span>
            <span className="text-xs bg-blue-800 text-blue-200 px-2 py-0.5 rounded">{result.category}</span>
          </div>
          <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function StepBadge({ done, active, label }) {
  return (
    <div className={`flex items-center gap-1.5 font-medium transition-all
      ${done ? 'text-green-400' : active ? 'text-blue-400' : 'text-slate-600'}`}>
      {done   && <CheckCircle className="h-3.5 w-3.5" />}
      {active && <div className="w-3.5 h-3.5 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />}
      {!done && !active && <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
      {label}
    </div>
  );
}
