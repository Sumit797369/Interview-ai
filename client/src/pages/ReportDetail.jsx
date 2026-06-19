import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Printer,
  Sparkles,
  BookOpen,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Brain,
} from "lucide-react";
import { toast } from "react-toastify";

// Custom SVG Radar Chart component
const SVGRadarChart = ({ scores }) => {
  const width = 300;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const r = 100;

  const labels = [
    { name: "Communication", score: scores.communication },
    { name: "Technical Depth", score: scores.technical },
    { name: "Confidence", score: scores.confidence },
    { name: "Problem Solving", score: scores.problemSolving },
    { name: "Overall", score: scores.overall },
  ];

  const pointsCount = labels.length;

  // Function to calculate vertex coordinates
  const getCoordinates = (index, value) => {
    const angle = (index * 2 * Math.PI) / pointsCount - Math.PI / 2;
    const distance = (value / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  // Outer web grids (pentagons at 20%, 40%, 60%, 80%, 100% radius)
  const gridRadii = [20, 40, 60, 80, 100];
  const webPaths = gridRadii.map((radius) => {
    const points = [];
    for (let i = 0; i < pointsCount; i++) {
      const angle = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
      const x = cx + (radius / 100) * r * Math.cos(angle);
      const y = cy + (radius / 100) * r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(" L ")} Z`;
  });

  // Calculate coordinates for the actual candidate scores
  const scorePoints = labels.map((lbl, idx) => getCoordinates(idx, lbl.score));
  const scorePath = `M ${scorePoints.map((p) => `${p.x},${p.y}`).join(" L ")} Z`;

  return (
    <div className="w-full flex justify-center items-center py-4 bg-gray-950/20 border border-gray-900 rounded-3xl p-6">
      <svg width={width} height={height} className="overflow-visible">
        {/* Draw outer grid lines */}
        {webPaths.map((path, idx) => (
          <path
            key={idx}
            d={path}
            fill="none"
            stroke="#1f2937"
            strokeWidth="0.5"
            strokeDasharray={idx === 4 ? "0" : "3"}
          />
        ))}

        {/* Draw web axis lines (spokes) */}
        {labels.map((_, idx) => {
          const outerPoint = getCoordinates(idx, 100);
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="#1f2937"
              strokeWidth="0.75"
            />
          );
        })}

        {/* Draw candidate polygon area */}
        <path
          d={scorePath}
          fill="#10b981"
          fillOpacity="0.25"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Draw dots and text labels */}
        {labels.map((lbl, idx) => {
          const pt = getCoordinates(idx, lbl.score);
          const outerPt = getCoordinates(idx, 115); // Place label slightly outside the polygon

          return (
            <g key={idx}>
              {/* Score dot */}
              <circle cx={pt.x} cy={pt.y} r="4" fill="#090d16" stroke="#10b981" strokeWidth="2" />

              {/* Label */}
              <text
                x={outerPt.x}
                y={outerPt.y + 4}
                fill="#9ca3af"
                fontSize="9"
                fontWeight="650"
                textAnchor="middle"
                className="select-none"
              >
                {lbl.name} ({lbl.score})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/interview/${id}`);
        setInterview(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load interview report");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-900 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-gray-950/60 rounded-3xl md:col-span-1" />
          <div className="h-44 bg-gray-950/60 rounded-3xl md:col-span-2" />
        </div>
        <div className="h-72 bg-gray-950/60 rounded-3xl" />
      </div>
    );
  }

  if (!interview || !interview.report) {
    return (
      <div className="text-center py-20 bg-gray-950/20 border border-gray-900 rounded-3xl p-8">
        <AlertTriangle className="text-amber-400 mx-auto mb-4" size={36} />
        <p className="text-gray-300 font-semibold mb-2">Evaluation details not compiled yet</p>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
          This interview has not been evaluated by the AI agent yet. Please complete the interview first.
        </p>
        <Link to="/dashboard" className="text-emerald-400 font-bold hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { report, type, difficulty, questions, duration, createdAt } = interview;

  // Convert raw category feedbacks to scores to feed the radar chart
  const calculateTextRating = (feedbackText) => {
    const text = (feedbackText || "").toLowerCase();
    if (text.includes("exceptional") || text.includes("excellent") || text.includes("expert") || text.includes("high score") || text.includes("flawless")) return 90;
    if (text.includes("good") || text.includes("strong") || text.includes("fluent") || text.includes("solid")) return 75;
    if (text.includes("moderate") || text.includes("average") || text.includes("fair") || text.includes("satisfactory")) return 60;
    return 45; // basic / improvement required
  };

  const radarScores = {
    communication: calculateTextRating(report.communication),
    technical: calculateTextRating(report.technicalKnowledge),
    confidence: calculateTextRating(report.confidence),
    problemSolving: calculateTextRating(report.problemSolving),
    overall: report.score,
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="space-y-8 print:bg-white print:text-black print:p-0">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/history"
            className="text-gray-500 hover:text-white p-2 rounded-xl bg-gray-950/45 border border-gray-900"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Evaluation Report</h1>
            <p className="text-xs text-gray-500 mt-1">
              Category: <strong className="text-gray-300 capitalize">{type}</strong> &bull;
              Difficulty: <strong className="text-gray-300 capitalize">{difficulty}</strong> &bull;
              Date: <strong className="text-gray-300">{new Date(createdAt).toLocaleDateString()}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto bg-gray-950/60 hover:bg-gray-900 border border-gray-800 text-gray-300 font-semibold py-3 px-5 rounded-2xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Printable Title Block */}
      <div className="hidden print:block mb-8 text-black border-b pb-6">
        <h1 className="text-3xl font-bold">IntervuAI Mock Interview Evaluation Report</h1>
        <p className="text-sm text-gray-600 mt-2">
          Candidate Mock Round: <span className="font-semibold capitalize">{type} ({difficulty})</span> |
          Date: <span className="font-semibold">{new Date(createdAt).toLocaleDateString()}</span> |
          Duration: <span className="font-semibold">{formatDuration(duration)}</span>
        </p>
      </div>

      {/* Main Score Breakdown Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Score Gauge Card */}
        <div className="bg-gray-950/45 border border-gray-900 rounded-[32px] p-6 shadow-xl flex flex-col items-center justify-center text-center print:border print:bg-white print:text-black">
          <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-6">Overall Score</h4>

          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG radial ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer background circle */}
              <circle cx="50" cy="50" r="42" stroke="#1f2937" strokeWidth="6" fill="transparent" className="print:stroke-gray-200" />
              {/* Dynamic progress circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#10b981"
                strokeWidth="6.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - report.score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${getScoreColor(report.score)} print:text-black`}>
                {report.score}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Out of 100</span>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 print:text-black print:border-black">
              {report.score >= 80 ? "EXCELLENT PERFORMER" : report.score >= 60 ? "SOLID / READY" : "IMPROVEMENT NEEDED"}
            </span>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="bg-gray-950/45 border border-gray-900 rounded-[32px] p-6 shadow-xl flex flex-col justify-between print:border print:bg-white print:text-black">
          <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Metrics Web</h4>
          <SVGRadarChart scores={radarScores} />
        </div>

        {/* Executive summary card */}
        <div className="bg-gray-950/45 border border-gray-900 rounded-[32px] p-6 shadow-xl flex flex-col justify-between print:border print:bg-white print:text-black">
          <div>
            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">Executive Performance Summary</h4>
            <p className="text-xs text-gray-400 leading-relaxed print:text-black">{report.overallPerformance}</p>
          </div>
          <div className="h-px bg-gray-900 my-4 print:bg-gray-200" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Interview Duration:</span>
            <span className="font-bold text-gray-300 print:text-black">{formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Category Breakdown Cards */}
      <div className="bg-gray-950/25 border border-gray-900 rounded-[32px] p-6 shadow-xl space-y-6 print:border print:bg-white print:text-black">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-900 pb-4 print:text-black print:border-gray-200">
          <MessageSquare size={18} className="text-emerald-400" /> Category Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-400 print:text-black">Communication Flow</h4>
            <p className="text-xs text-gray-500 leading-relaxed print:text-black">{report.communication}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-400 print:text-black">Technical Depth & Accuracy</h4>
            <p className="text-xs text-gray-500 leading-relaxed print:text-black">{report.technicalKnowledge}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-400 print:text-black">Confidence Indicators</h4>
            <p className="text-xs text-gray-500 leading-relaxed print:text-black">{report.confidence}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-400 print:text-black">Problem Solving & Logic</h4>
            <p className="text-xs text-gray-500 leading-relaxed print:text-black">{report.problemSolving}</p>
          </div>
        </div>
      </div>

      {/* Action Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <div className="bg-gray-950/25 border border-gray-900 rounded-[32px] p-6 shadow-xl space-y-5 print:border print:bg-white print:text-black">
          <h4 className="text-sm font-bold text-white border-b border-gray-900 pb-3 flex items-center gap-2 print:text-black print:border-gray-200">
            <ThumbsUp size={16} className="text-emerald-400" /> Core Feedback Areas
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Strengths</p>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed print:text-black">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Improvement Areas</p>
              <ul className="space-y-2">
                {report.weakAreas.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed print:text-black">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Suggestions & Learning Path */}
        <div className="bg-gray-950/25 border border-gray-900 rounded-[32px] p-6 shadow-xl space-y-5 print:border print:bg-white print:text-black">
          <h4 className="text-sm font-bold text-white border-b border-gray-900 pb-3 flex items-center gap-2 print:text-black print:border-gray-200">
            <BookOpen size={16} className="text-emerald-400" /> Actionable Study Roadmap
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Specific Suggestions</p>
              <ul className="space-y-2">
                {report.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400 leading-relaxed print:text-black">
                    <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Recommended Learning Path</p>
              <ul className="space-y-2">
                {report.recommendedLearningPath.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400 leading-normal print:text-black">
                    <span className="w-4 h-4 rounded-full bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 print:text-black print:border-gray-300">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Review Q&A Accordion */}
      <div className="bg-gray-950/25 border border-gray-900 rounded-[32px] p-6 shadow-xl space-y-6 print:border print:bg-white print:text-black">
        <h3 className="text-base font-bold text-white border-b border-gray-900 pb-4 flex items-center gap-2 print:text-black print:border-gray-200">
          <Brain size={18} className="text-emerald-400" /> Interview Transcript Review
        </h3>

        <div className="space-y-3 print:space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.questionId}
              className="border border-gray-900 rounded-2xl bg-gray-950/20 overflow-hidden transition-all duration-200 print:border-0 print:border-b print:pb-4"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-gray-300 hover:text-white transition cursor-pointer print:cursor-default print:hover:text-black print:text-black print:p-0"
              >
                <div className="flex items-start gap-3 text-xs leading-normal pr-4">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-900/30 text-emerald-400 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5 print:text-black print:border-gray-300">
                    {idx + 1}
                  </span>
                  <span>{q.questionText}</span>
                </div>
              </button>

              <div
                className={`px-5 pb-5 pt-1 text-xs leading-relaxed border-t border-gray-900 space-y-3 print:block print:border-t-0 print:p-0 print:pt-2 ${
                  expandedIndex === idx || window.matchMedia("print").matches ? "block" : "hidden"
                }`}
              >
                <div>
                  <span className="text-[10px] text-gray-600 uppercase font-black print:text-gray-400">Your Answer:</span>
                  <p className="text-gray-400 mt-1 pl-2 border-l border-emerald-500/20 print:text-black print:border-gray-300">
                    {q.userAnswer || "[No response was provided for this question]"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
