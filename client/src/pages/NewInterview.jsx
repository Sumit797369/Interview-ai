import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sliders,
  ChevronRight,
  Sparkles,
  FileWarning,
  Coins,
  Bot,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const NewInterview = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [resume, setResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);

  // Form selections
  const [type, setType] = useState("technical");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [length, setLength] = useState(5);

  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingResume(true);
        const response = await axios.get("http://localhost:8000/api/resume/latest");
        setResume(response.data);
      } catch (error) {
        setResume(null);
      } finally {
        setLoadingResume(false);
      }
    };
    fetchLatest();
  }, []);

  const handleStart = async () => {
    if (!resume) {
      toast.error("Please upload your resume first!");
      return;
    }

    if (user.credits < 1) {
      toast.error("Insufficient credits. Please top up!");
      navigate("/dashboard/pricing");
      return;
    }

    try {
      setGenerating(true);
      const response = await axios.post("http://localhost:8000/api/interview/generate", {
        resumeId: resume._id,
        type,
        difficulty,
        length,
      });

      // Deduct credit in current user state locally
      setUser((prev) => ({
        ...prev,
        credits: response.data.creditsRemaining,
      }));

      toast.success("Interview session created! Good luck!");
      navigate(`/interview/${response.data.interviewId}`);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to start interview";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  if (loadingResume) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-[300px] bg-white border border-slate-200 rounded-3xl" />
      </div>
    );
  }

  // Guard: No Resume uploaded yet
  if (!resume) {
    return (
      <div className="w-full min-h-[400px] bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-650 flex items-center justify-center mb-6">
          <FileWarning size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No resume profile found</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed mb-6">
          We generate custom interview questions based on your resume. Please upload your resume PDF to map your background first.
        </p>
        <Link
          to="/dashboard/resume"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/15 text-sm"
        >
          Go to Upload Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {generating && (
          // Fullscreen loader overlay
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F8FAFC]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-3 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <Bot size={32} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Drafting Mock Interview</h3>
            <p className="text-sm text-gray-500 max-w-md mt-2 leading-relaxed">
              Gemini AI is reading your resume skills (<span className="text-emerald-600">{resume.analysis.skills.slice(0, 3).join(", ")}</span>) and compiling technical challenges matching your experience.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">New Practice Session</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select your settings. 1 credit will be deducted from your account.
        </p>
      </div>

      {/* Active Resume Context Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-2.5 rounded-xl">
            <Sliders size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Active Resume Source</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{resume.fileName}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-3 py-1 rounded-xl">
          {resume.analysis.experienceLevel} Level
        </span>
      </div>

      {/* Selector Grid */}
      <div className="space-y-6">
        {/* Row 1: Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-400 tracking-wide uppercase">Select Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tech */}
            <button
              onClick={() => setType("technical")}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                type === "technical"
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Technical</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Coding, architectural strategies, system design, and tech stacks.
              </p>
            </button>

            {/* HR */}
            <button
              onClick={() => setType("hr")}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                type === "hr"
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-855"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Behavioral / HR</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Situational queries, situational management, and alignment answers.
              </p>
            </button>

            {/* Mixed */}
            <button
              onClick={() => setType("mixed")}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                type === "mixed"
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Mixed Round</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                A combination of both engineering skills and cultural fit.
              </p>
            </button>
          </div>
        </div>

        {/* Row 2: Difficulty */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-400 tracking-wide uppercase">Select Difficulty</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Beginner */}
            <button
              onClick={() => setDifficulty("beginner")}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                difficulty === "beginner"
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Beginner</h4>
              <p className="text-xs text-slate-400 mt-1">Core fundamentals, terms, and basic syntax details.</p>
            </button>

            {/* Intermediate */}
            <button
              onClick={() => setDifficulty("intermediate")}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                difficulty === "intermediate"
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Intermediate</h4>
              <p className="text-xs text-slate-400 mt-1">Component architecture, API setups, and problem handling.</p>
            </button>

            {/* Advanced */}
            <button
              onClick={() => setDifficulty("advanced")}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                difficulty === "advanced"
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Advanced</h4>
              <p className="text-xs text-slate-400 mt-1">System bottlenecks, caching scaling, and design patterns.</p>
            </button>
          </div>
        </div>

        {/* Row 3: Length */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-400 tracking-wide uppercase">Select Interview Length</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 5 Questions */}
            <button
              onClick={() => setLength(5)}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                length === 5
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Quick (5 Questions)</h4>
              <p className="text-xs text-slate-400 mt-1">Estimated duration: ~10 minutes. Fast practice.</p>
            </button>

            {/* 10 Questions */}
            <button
              onClick={() => setLength(10)}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                length === 10
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Standard (10 Questions)</h4>
              <p className="text-xs text-slate-400 mt-1">Estimated duration: ~20 minutes. Regular round.</p>
            </button>

            {/* 20 Questions */}
            <button
              onClick={() => setLength(20)}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                length === 20
                  ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              <h4 className="text-base font-bold leading-tight">Deep Dive (20 Questions)</h4>
              <p className="text-xs text-slate-400 mt-1">Estimated duration: ~40 minutes. Full grilling.</p>
            </button>
          </div>
        </div>
      </div>

      {/* Credit check and launch banner */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="bg-amber-50 border border-amber-100 text-amber-600 p-3 rounded-2xl">
            <Coins size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Cost: 1 Credit</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Balance: <strong className="text-emerald-600">{user.credits} Credits</strong>
            </p>
          </div>
        </div>

        {user.credits < 1 ? (
          <Link
            to="/dashboard/pricing"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-3.5 rounded-2xl transition text-center shadow-lg shadow-amber-500/15 text-sm"
          >
            Upgrade Plan
          </Link>
        ) : (
          <button
            onClick={handleStart}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 text-sm cursor-pointer"
          >
            Deduct 1 Credit & Start <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewInterview;
