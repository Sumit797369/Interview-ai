import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileText,
  Award,
  Coins,
  TrendingUp,
  Brain,
  ArrowRight,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

// Custom Area Chart Component using pure SVG
const SVGAreaChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] w-full flex flex-col items-center justify-center border border-dashed border-gray-800 rounded-3xl p-6 bg-gray-950/20 text-center">
        <HelpCircle size={28} className="text-gray-600 mb-2" />
        <p className="text-xs font-semibold text-gray-500">No performance records found</p>
        <p className="text-[10px] text-gray-600 max-w-[220px] mt-1 leading-normal">
          Completed interview reports will automatically populate this performance history.
        </p>
      </div>
    );
  }

  const width = 600;
  const height = 250;
  const paddingX = 40;
  const paddingY = 30;

  // Compute boundaries
  const maxVal = 100;
  const minVal = 0;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // If 1 point, double it to render a line
  const points = data.length === 1 ? [data[0], data[0]] : data;

  // Map data coordinates
  const coords = points.map((item, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * chartWidth;
    // Invert Y axis for screen space
    const y = paddingY + chartHeight - (item.score / maxVal) * chartHeight;
    return { x, y, score: item.score, date: item.date, type: item.type };
  });

  // Build SVG path
  const linePath = coords.reduce(
    (path, point, idx) => (idx === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`),
    ""
  );

  // Build gradient fill path
  const fillPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${
    height - paddingY
  } Z`;

  return (
    <div className="relative w-full h-[250px] bg-gray-950/40 border border-gray-900 rounded-3xl p-4 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
        <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
        <line x1={paddingX} y1={paddingY + chartHeight} x2={width - paddingX} y2={paddingY + chartHeight} stroke="#1f2937" strokeWidth="0.5" />

        {/* Y-Axis Labels */}
        <text x={paddingX - 10} y={paddingY + 4} fill="#6b7280" fontSize="9" textAnchor="end" fontFamily="monospace">100</text>
        <text x={paddingX - 10} y={paddingY + chartHeight / 2 + 3} fill="#6b7280" fontSize="9" textAnchor="end" fontFamily="monospace">50</text>
        <text x={paddingX - 10} y={paddingY + chartHeight + 3} fill="#6b7280" fontSize="9" textAnchor="end" fontFamily="monospace">0</text>

        {/* Gradient fill */}
        {coords.length > 0 && <path d={fillPath} fill="url(#chartGradient)" />}

        {/* Area Line */}
        {coords.length > 0 && (
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Draw Points */}
        {coords.map((point, idx) => (
          <g key={idx}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4.5"
              fill="#090d16"
              stroke="#10b981"
              strokeWidth="2"
              className="cursor-pointer transition-all hover:scale-125"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}

        {/* X-Axis Labels */}
        {coords.map((point, idx) => {
          // Render label only for key points to avoid clutter
          if (coords.length > 6 && idx % Math.round(coords.length / 4) !== 0) return null;
          return (
            <text
              key={idx}
              x={point.x}
              y={height - 10}
              fill="#6b7280"
              fontSize="9"
              textAnchor="middle"
              className="select-none"
            >
              {point.date}
            </text>
          );
        })}
      </svg>

      {/* Dynamic Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-10 bg-gray-950/90 border border-gray-800 p-2.5 rounded-xl text-left shadow-lg backdrop-blur-sm pointer-events-none"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 32}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-[10px] text-gray-500 font-semibold leading-none">{hoveredPoint.date}</p>
          <p className="text-xs font-bold text-white mt-1 leading-none">
            Score: <span className="text-emerald-400">{hoveredPoint.score}%</span>
          </p>
          <p className="text-[9px] text-gray-500 uppercase mt-0.5 tracking-wider">{hoveredPoint.type}</p>
        </div>
      )}
    </div>
  );
};

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/api/user/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Fetch Stats error:", err);
        setError("Failed to fetch dashboard metrics. Please reload the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-900 rounded-lg" />
            <div className="h-4 w-72 bg-gray-900 rounded-lg mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-900 rounded-lg" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-950/60 border border-gray-900 rounded-3xl p-6" />
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-[250px] bg-gray-950/60 border border-gray-900 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-gray-950/20 border border-gray-900 rounded-3xl p-8">
        <p className="text-red-400 font-semibold mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-emerald-400 font-bold hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your preparation statistics, evaluate progress, and manage interview credits.
          </p>
        </div>

        <Link
          to="/dashboard/new"
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-5 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
        >
          <PlusCircle size={18} /> New Mock Interview
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-gray-950/45 border border-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Interviews</span>
            <div className="w-8 h-8 rounded-lg bg-gray-900/60 text-gray-400 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{stats.totalInterviews}</p>
          <p className="text-[10px] text-gray-500 mt-1 leading-none">Completed mock sessions</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-gray-950/45 border border-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/35 text-emerald-400 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <p className="text-3xl font-extrabold text-white leading-none">{stats.averageScore}%</p>
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-none">Cumulative performance rate</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-gray-950/45 border border-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining Credits</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/35 text-amber-400 flex items-center justify-center">
              <Coins size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-3xl font-extrabold text-white leading-none">{stats.creditsRemaining}</p>
            <Link
              to="/dashboard/pricing"
              className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-0.5 leading-none"
            >
              Get more <ArrowRight size={10} />
            </Link>
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-none">1 credit per mock interview</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-gray-950/45 border border-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Improvement Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/35 text-blue-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p
            className={`text-3xl font-extrabold mt-4 leading-none ${
              stats.improvementRate > 0 ? "text-emerald-400" : "text-gray-300"
            }`}
          >
            {stats.improvementRate > 0 ? "+" : ""}
            {stats.improvementRate}%
          </p>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-none">Difference (latest - first rounds)</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gray-950/20 border border-gray-900 rounded-[32px] p-6 shadow-xl relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white leading-none">Performance Growth</h3>
            <p className="text-xs text-gray-500 mt-1 leading-none">Your evaluation scores plotted chronologically.</p>
          </div>
        </div>

        <SVGAreaChart data={stats.scoreHistory} />
      </div>

      {/* Quick Launch banner */}
      {stats.totalInterviews === 0 && (
        <div className="bg-gradient-to-r from-emerald-950/20 to-gray-950 border border-emerald-900/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl shrink-0">
              <Brain size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">Ready to launch your first session?</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                Upload your PDF resume to parse your skills, set options, and get dynamic questions probing your exact technology stacks or soft-skills.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/resume"
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-6 py-3 rounded-2xl transition text-center shrink-0 shadow-lg shadow-emerald-500/10 text-sm"
          >
            Upload Resume
          </Link>
        </div>
      )}
    </div>
  );
};

export default Overview;
