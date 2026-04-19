import React, { useState, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell,
} from "recharts";
import {
  TrendingUp, Users, Zap, BarChart2, Activity,
  RefreshCw, AlertTriangle, ChevronRight, Info,
} from "lucide-react";
import axios from "axios";

// ── Constants ─────────────────────────────────────────────────────────────────
const FACTOR_ICONS = {
  "Incumbency Effect": "⚖",
  "Party Strength":    "🏛",
  "Past Work Record":  "📋",
  "Personal Base":     "👤",
  "Demographic Base":  "📊",
  "Digital Sentiment": "📡",
};

const ROLE_BADGE = {
  Incumbent:   { bg: "bg-cyan-950",   text: "text-cyan-400",   border: "border-cyan-700"   },
  Challenger:  { bg: "bg-violet-950", text: "text-violet-400", border: "border-violet-700" },
  Independent: { bg: "bg-amber-950",  text: "text-amber-400",  border: "border-amber-700"  },
};

// ── Animated Number ───────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "", decimals = 1 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let current = 0;
    const end       = parseFloat(value);
    const stepMs    = 16;
    const increment = (end / 1200) * stepMs;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(parseFloat(current.toFixed(decimals)));
    }, stepMs);
    return () => clearInterval(timer);
  }, [value, decimals]);
  return <>{display}{suffix}</>;
}

// ── Candidate Card ────────────────────────────────────────────────────────────
function CandidateCard({ candidate, rank }) {
  const badge = ROLE_BADGE[candidate.role] || ROLE_BADGE.Independent;
  return (
    <div
      className="rounded-lg border bg-navy-800/60 overflow-hidden"
      style={{ borderColor: `${candidate.color}44` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: `${candidate.color}12`, borderBottom: `1px solid ${candidate.color}33` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm flex-shrink-0"
            style={{ background: `${candidate.color}22`, border: `2px solid ${candidate.color}`, color: candidate.color }}
          >
            {candidate.avatar}
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{candidate.name}</p>
            <p className="font-mono text-[10px] tracking-wider mt-0.5" style={{ color: candidate.color }}>
              {candidate.party}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-bold tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}>
            {candidate.role.toUpperCase()}
          </span>
          <span className="font-mono text-[10px] text-slate-500">#{rank}</span>
        </div>
      </div>

      {/* PoW Gauge */}
      <div className="px-4 py-3 border-b border-navy-700/40">
        <div className="flex items-end justify-between mb-2">
          <span className="font-mono text-[10px] text-slate-500 tracking-wider">PROBABILITY OF WIN</span>
          <span className="font-mono font-bold text-2xl" style={{ color: candidate.color }}>
            <AnimatedNumber value={candidate.probabilityOfWin} suffix="%" />
          </span>
        </div>
        <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${candidate.probabilityOfWin}%`,
              background: `linear-gradient(90deg, ${candidate.color}99, ${candidate.color})`,
              boxShadow: `0 0 8px ${candidate.color}88`,
            }}
          />
        </div>
      </div>

      {/* Score Grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-2">
        {Object.entries(candidate.scores).map(([key, score]) => {
          const scoreColor = score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: scoreColor }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-slate-500 truncate">
                    {key.replace(/([A-Z])/g, " $1").trim().toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] font-bold" style={{ color: scoreColor }}>{score}</span>
                </div>
                <div className="w-full h-0.5 bg-navy-950 rounded mt-0.5">
                  <div className="h-full rounded" style={{ width: `${score}%`, background: scoreColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Footer */}
      <div className="px-4 py-2.5 bg-navy-950/40 grid grid-cols-2 gap-x-4 gap-y-1">
        {[
          ["Age",     candidate.profile.age],
          ["Terms",   candidate.profile.termsServed],
          ["Project", candidate.profile.keyProject],
          ["Handle",  candidate.profile.socialMedia],
        ].map(([k, v]) => (
          <div key={k} className="truncate">
            <span className="font-mono text-[9px] text-slate-600">{k}: </span>
            <span className="font-mono text-[9px] text-slate-400">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Custom Tooltips ───────────────────────────────────────────────────────────
function RadarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-900 border border-cyan-900/50 rounded-lg px-3 py-2 shadow-xl">
      <p className="font-mono text-xs text-slate-400 mb-2 border-b border-slate-700 pb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="font-mono text-xs text-slate-300">{p.name}:</span>
          <span className="font-mono text-xs font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-navy-900 border border-slate-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="font-mono text-xs text-slate-400 mb-1">{d?.name} ({d?.party})</p>
      <p className="font-mono text-xs text-slate-500 mb-2">{d?.role}</p>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold" style={{ color: payload[0].fill }}>
          {payload[0].value}%
        </span>
        <span className="font-mono text-xs text-slate-500">PoW</span>
      </div>
    </div>
  );
}

// ── Simulator Slider Row ──────────────────────────────────────────────────────
function SimulatorRow({ label, value, candidateColor, onChange }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="font-mono text-[10px] text-slate-400 w-28 flex-shrink-0 truncate">{label}</span>
      <input
        type="range" min="0" max="100" value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="flex-1 cursor-pointer"
        style={{ accentColor: candidateColor }}
      />
      <span className="font-mono text-xs font-bold w-8 text-right" style={{ color: candidateColor }}>
        {value}
      </span>
    </div>
  );
}

// ── Shared Layout Helpers ─────────────────────────────────────────────────────
function SectionLabel({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-violet-500">{icon}</span>
      <span className="font-mono text-[10px] text-slate-500 tracking-widest">{text}</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-navy-800/30 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800/60">
        <p className="font-mono text-xs font-bold text-slate-200 tracking-wider">{title}</p>
        {subtitle && <p className="font-mono text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ElectoralDashboard() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState("matrix");
  const [simScores,  setSimScores]  = useState(null);
  const [simResult,  setSimResult]  = useState(null);
  const [simRunning, setSimRunning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/elections");
      setData(res.data);
      setSimScores(res.data.candidates.map((c) => ({ ...c.scores })));
      setError(null);
    } catch {
      setError("Cannot reach backend — ensure the server is running on port 5001.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const runSimulation = useCallback(async () => {
    if (!simScores || !data) return;
    setSimRunning(true);
    try {
      const params = {};
      simScores.forEach((scores, idx) => {
        Object.entries(scores).forEach(([factor, val]) => {
          params[`${factor}_${idx}`] = val;
        });
      });
      const res = await axios.get("/api/elections/simulate", { params });
      setSimResult(res.data);
    } catch (e) {
      console.error("Simulation error:", e);
    } finally {
      setSimRunning(false);
    }
  }, [simScores, data]);

  const updateSimScore = (candidateIdx, factor, value) => {
    setSimScores((prev) =>
      prev.map((s, i) => i === candidateIdx ? { ...s, [factor]: value } : s)
    );
    setSimResult(null);
  };

  const rankedCandidates = data?.candidates
    ? [...data.candidates].sort((a, b) => b.probabilityOfWin - a.probabilityOfWin)
    : [];
  const winner = rankedCandidates[0];

  // ── Loading State ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-navy-950">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-violet-400 tracking-widest text-sm">COMPUTING ELECTORAL MATRIX...</p>
      </div>
    </div>
  );

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex-1 flex items-center justify-center bg-navy-950">
      <div className="text-center bg-red-950/50 border border-red-800 rounded-xl p-8 max-w-md">
        <AlertTriangle className="text-red-400 mx-auto mb-3" size={32} />
        <p className="font-mono text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={loadData}
          className="font-mono text-xs px-4 py-2 border border-red-700 text-red-400 rounded hover:bg-red-900/30 transition-colors"
        >
          ↺ RETRY
        </button>
      </div>
    </div>
  );

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-navy-950">

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-navy-900 border-b border-violet-900/40 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="font-mono font-bold text-violet-400 tracking-widest text-sm">
              CYBERJOAR — ELECTORAL ANALYTICS MODULE
            </span>
          </div>
          <p className="font-mono text-xs text-slate-500">
            {data?.constituency?.name} · {data?.constituency?.state}
            &nbsp;|&nbsp;{data?.constituency?.classification}
            &nbsp;|&nbsp;{data?.constituency?.totalVoters?.toLocaleString()} Voters
            &nbsp;|&nbsp;Avg Turnout: {data?.constituency?.historicalTurnout}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {winner && (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-xs"
              style={{ borderColor: `${winner.color}55`, background: `${winner.color}11`, color: winner.color }}
            >
              <TrendingUp size={12} />
              <span>PROJECTED: {winner.name.split(" ")[0].toUpperCase()} ({winner.probabilityOfWin}%)</span>
            </div>
          )}
          <button
            onClick={loadData}
            className="p-1.5 rounded border border-slate-700 hover:border-violet-600 text-slate-400 hover:text-violet-400 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-navy-900 flex-shrink-0 px-6">
        {[
          { id: "matrix",   label: "MATRIX ANALYSIS",    icon: <BarChart2 size={12} /> },
          { id: "simulate", label: "SCENARIO SIMULATOR", icon: <Zap size={12} />       },
          { id: "weights",  label: "WEIGHT CONFIG",      icon: <Activity size={12} />  },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 font-mono text-xs tracking-wider px-4 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ══════════════════ TAB: MATRIX ANALYSIS ══════════════════ */}
        {activeTab === "matrix" && (
          <>
            {/* Candidate Cards */}
            <div>
              <SectionLabel icon={<Users size={12} />} text="HEAD-TO-HEAD CANDIDATE COMPARISON" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                {rankedCandidates.map((c, idx) => (
                  <CandidateCard key={c.id} candidate={c} rank={idx + 1} />
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Radar Chart */}
              <ChartCard title="MULTI-FACTOR RADAR MATRIX" subtitle="All 6 matrix factors · 100-point scale">
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={data.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#1e3a5f" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="factor"
                      tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Courier Prime, monospace" }}
                    />
                    <PolarRadiusAxis
                      angle={30} domain={[0, 100]} tickCount={4}
                      tick={{ fill: "#374151", fontSize: 9 }} axisLine={false}
                    />
                    {data.candidates.map((c) => (
                      <Radar
                        key={c.id} name={c.name} dataKey={c.name}
                        stroke={c.color} fill={c.color} fillOpacity={0.10}
                        strokeWidth={2} dot={{ fill: c.color, r: 3 }}
                      />
                    ))}
                    <Tooltip content={<RadarTooltip />} />
                    <Legend
                      formatter={(v) => (
                        <span style={{ fontFamily: "Courier Prime, monospace", fontSize: "11px", color: "#94a3b8" }}>
                          {v}
                        </span>
                      )}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Bar Chart */}
              <ChartCard title="PROBABILITY OF WIN (PoW)" subtitle="Softmax-normalised weighted scoring · Σ = 100%">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.barData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }} barCategoryGap="30%">
                    <CartesianGrid stroke="#1e2d40" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Courier Prime, monospace" }}
                      axisLine={{ stroke: "#1e3a5f" }} tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]} tickFormatter={(v) => `${v}%`}
                      tick={{ fill: "#475569", fontSize: 10, fontFamily: "Courier Prime, monospace" }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="probabilityOfWin" radius={[4, 4, 0, 0]}>
                      {data.barData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* PoW Summary Row */}
                <div className="flex gap-3 mt-2 border-t border-slate-800 pt-3">
                  {data.candidates.map((c) => (
                    <div key={c.id} className="flex-1 text-center">
                      <div className="font-mono text-xl font-bold" style={{ color: c.color }}>
                        {c.probabilityOfWin}%
                      </div>
                      <div className="font-mono text-[9px] text-slate-500 mt-0.5 truncate">
                        {c.name.split(" ")[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Strategic Gap Table */}
            <div>
              <SectionLabel icon={<Info size={12} />} text="STRATEGIC GAP ANALYSIS" />
              <div className="mt-3 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-navy-800/60">
                      <th className="font-mono text-[10px] text-slate-500 text-left px-4 py-2.5 tracking-wider">
                        FACTOR (WEIGHT)
                      </th>
                      {data.candidates.map((c) => (
                        <th key={c.id} className="font-mono text-[10px] text-center px-4 py-2.5 tracking-wider" style={{ color: c.color }}>
                          {c.name.split(" ")[0].toUpperCase()} ({c.partyShort})
                        </th>
                      ))}
                      <th className="font-mono text-[10px] text-slate-500 text-left px-4 py-2.5 tracking-wider hidden lg:table-cell">
                        LEADER
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.factorMeta).map(([factor, meta], idx) => {
                      const scores   = data.candidates.map((c) => c.scores[factor]);
                      const maxScore = Math.max(...scores);
                      const leader   = data.candidates.find((c) => c.scores[factor] === maxScore);
                      return (
                        <tr
                          key={factor}
                          className={`border-t border-slate-800 hover:bg-navy-800/30 transition-colors ${idx % 2 === 0 ? "bg-navy-900/20" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{FACTOR_ICONS[meta.label] || "◈"}</span>
                              <div>
                                <p className="font-mono text-xs text-slate-300">{meta.label}</p>
                                <p className="font-mono text-[9px] text-slate-600">
                                  Weight: {(meta.weight * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          </td>
                          {data.candidates.map((c) => {
                            const score = c.scores[factor];
                            const isMax = score === maxScore;
                            const color = score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
                            return (
                              <td key={c.id} className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className="font-mono text-sm font-bold"
                                    style={{ color: isMax ? c.color : color }}
                                  >
                                    {score}{isMax && <span className="ml-1 text-[10px]">▲</span>}
                                  </span>
                                  <div className="w-12 h-1 bg-navy-950 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${score}%`, background: isMax ? c.color : color }} />
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ background: leader?.color }} />
                              <span className="font-mono text-xs" style={{ color: leader?.color }}>
                                {leader?.name.split(" ")[0]}
                              </span>
                              <ChevronRight size={10} className="text-slate-600" />
                              <span className="font-mono text-[10px] text-slate-500">{maxScore}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ TAB: SCENARIO SIMULATOR ══════════════════ */}
        {activeTab === "simulate" && simScores && (
          <div className="space-y-6">
            <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg px-4 py-3 flex items-start gap-3">
              <Zap size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="font-mono text-xs text-amber-300 leading-relaxed">
                Adjust any score below to model what-if scenarios — e.g. a corruption scandal drops an
                incumbent's Digital Sentiment, or a ground-campaign surge lifts a challenger's Personal
                Base. Hit <strong>RUN SIMULATION</strong> to recompute PoW live via the API.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {data.candidates.map((c, idx) => (
                <div
                  key={c.id}
                  className="rounded-lg border bg-navy-800/40 overflow-hidden"
                  style={{ borderColor: `${c.color}44` }}
                >
                  {/* Card header */}
                  <div
                    className="px-4 py-2.5 border-b flex items-center gap-2"
                    style={{ background: `${c.color}12`, borderColor: `${c.color}33` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs"
                      style={{ background: `${c.color}22`, border: `1px solid ${c.color}`, color: c.color }}
                    >
                      {c.avatar}
                    </div>
                    <span className="font-mono text-xs font-bold" style={{ color: c.color }}>{c.name}</span>
                  </div>

                  {/* Sliders */}
                  <div className="px-4 py-3">
                    {Object.keys(c.scores).map((factor) => (
                      <SimulatorRow
                        key={factor}
                        label={factor.replace(/([A-Z])/g, " $1").trim()}
                        value={simScores[idx][factor]}
                        candidateColor={c.color}
                        onChange={(v) => updateSimScore(idx, factor, v)}
                      />
                    ))}
                  </div>

                  {/* Simulated PoW result */}
                  {simResult && (
                    <div
                      className="px-4 py-2.5 border-t text-center"
                      style={{ borderColor: `${c.color}33`, background: `${c.color}08` }}
                    >
                      <span className="font-mono text-[10px] text-slate-500">SIMULATED PoW: </span>
                      <span className="font-mono text-lg font-bold" style={{ color: c.color }}>
                        {simResult.candidates.find((s) => s.id === c.id)?.probabilityOfWin}%
                      </span>
                      <span className="font-mono text-[10px] text-slate-600 ml-1">
                        {(() => {
                          const sim   = simResult.candidates.find((s) => s.id === c.id)?.probabilityOfWin ?? 0;
                          const base  = c.probabilityOfWin;
                          const delta = (sim - base).toFixed(2);
                          return `(${delta > 0 ? "+" : ""}${delta}%)`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={runSimulation}
                disabled={simRunning}
                className="flex items-center gap-2 px-6 py-2.5 rounded border border-violet-600 text-violet-400 font-mono text-xs tracking-wider hover:bg-violet-900/30 transition-colors disabled:opacity-50"
              >
                {simRunning
                  ? <><RefreshCw size={12} className="animate-spin" /> COMPUTING...</>
                  : <><Zap size={12} /> RUN SIMULATION</>
                }
              </button>
              <button
                onClick={() => { setSimScores(data.candidates.map((c) => ({ ...c.scores }))); setSimResult(null); }}
                className="px-4 py-2.5 rounded border border-slate-700 text-slate-400 font-mono text-xs tracking-wider hover:bg-slate-800 transition-colors"
              >
                RESET
              </button>
            </div>

            {/* Simulated Radar (shown after RUN) */}
            {simResult && (
              <ChartCard title="SIMULATED RADAR MATRIX" subtitle="Live what-if projection">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={simResult.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#1e3a5f" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="factor"
                      tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Courier Prime, monospace" }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={4} tick={{ fill: "#374151", fontSize: 9 }} axisLine={false} />
                    {data.candidates.map((c) => (
                      <Radar key={c.id} name={c.name} dataKey={c.name} stroke={c.color} fill={c.color} fillOpacity={0.10} strokeWidth={2} />
                    ))}
                    <Tooltip content={<RadarTooltip />} />
                    <Legend
                      formatter={(v) => (
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{v}</span>
                      )}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        )}

        {/* ══════════════════ TAB: WEIGHT CONFIG ══════════════════ */}
        {activeTab === "weights" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-navy-800/40 border border-slate-700 rounded-lg p-4">
              <SectionLabel icon={<Activity size={12} />} text="CONSTITUENCY-TUNED WEIGHT CONFIGURATION" />
              <p className="font-mono text-xs text-slate-500 mt-2 leading-relaxed">
                Weights pre-calibrated for Chandigarh Central — a semi-urban constituency with high
                digital literacy and a 2-term incumbent. A rural seat with low internet penetration
                would reduce Digital Sentiment to ~5% and raise Demographic Base to ~25%.
              </p>
            </div>

            {Object.entries(data.factorMeta).map(([factor, meta]) => (
              <div key={factor} className="rounded-lg border border-slate-800 bg-navy-800/30 px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{FACTOR_ICONS[meta.label] || "◈"}</span>
                    <div>
                      <p className="font-mono text-sm text-slate-200 font-bold">{meta.label}</p>
                      <p className="font-mono text-[10px] text-slate-500 mt-0.5">{meta.description}</p>
                    </div>
                  </div>
                  <span className="font-mono text-2xl font-bold text-violet-400">
                    {(meta.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${meta.weight * 100}%`,
                      background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                      boxShadow: "0 0 6px rgba(167,139,250,0.6)",
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Sum verification */}
            <div className="flex items-center justify-between font-mono text-sm px-5 py-3 rounded-lg border border-green-800 bg-green-950/30">
              <span className="text-slate-400">Total Weight Sum</span>
              <span className="text-green-400 font-bold">
                {(Object.values(data.weights).reduce((a, b) => a + b, 0) * 100).toFixed(0)}% ✓
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
