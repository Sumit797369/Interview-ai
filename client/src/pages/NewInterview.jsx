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
  const [interviewerGender, setInterviewerGender] = useState("female");

  const [generating, setGenerating] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

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
        interviewerGender,
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative"
    >
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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">New Practice Session</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select your settings. 1 credit will be deducted from your account.
        </p>
      </motion.div>

      {/* Active Resume Context Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4"
      >
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
      </motion.div>

      {/* Selector Grid */}
      <motion.div variants={itemVariants} className="space-y-8">
        {/* Row 1: Category */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Select Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tech */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setType("technical")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between h-full ${
                type === "technical"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-800"
              }`}
            >
              {type === "technical" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Technical</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Coding, architectural strategies, system design, and tech stacks.
              </p>
            </motion.button>

            {/* HR */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setType("hr")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between h-full ${
                type === "hr"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-800"
              }`}
            >
              {type === "hr" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Behavioral / HR</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Situational queries, situational management, and alignment answers.
              </p>
            </motion.button>

            {/* Mixed */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setType("mixed")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between h-full ${
                type === "mixed"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-355 hover:text-slate-800"
              }`}
            >
              {type === "mixed" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Mixed Round</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                A combination of both engineering skills and cultural fit.
              </p>
            </motion.button>
          </div>
        </div>

        {/* Row 2: Difficulty */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Select Difficulty</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Beginner */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDifficulty("beginner")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer flex flex-col justify-between h-full ${
                difficulty === "beginner"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {difficulty === "beginner" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Beginner</h4>
              <p className="text-xs text-slate-400 mt-2">Core fundamentals, terms, and basic syntax details.</p>
            </motion.button>

            {/* Intermediate */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDifficulty("intermediate")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer flex flex-col justify-between h-full ${
                difficulty === "intermediate"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-855 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {difficulty === "intermediate" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Intermediate</h4>
              <p className="text-xs text-slate-400 mt-2">Component architecture, API setups, and problem handling.</p>
            </motion.button>

            {/* Advanced */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDifficulty("advanced")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer flex flex-col justify-between h-full ${
                difficulty === "advanced"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {difficulty === "advanced" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Advanced</h4>
              <p className="text-xs text-slate-400 mt-2">System bottlenecks, caching scaling, and design patterns.</p>
            </motion.button>
          </div>
        </div>

        {/* Row 3: AI Interviewer */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Select AI Interviewer</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Female AI (Sophia) */}
            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setInterviewerGender("female")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                interviewerGender === "female"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {interviewerGender === "female" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${interviewerGender === "female" ? "bg-emerald-500 text-white shadow-md shadow-emerald-550/20" : "bg-slate-100 text-slate-550"}`}>
                  <Bot size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold leading-tight text-slate-800">Sophia (Female AI)</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Professional, highly engaging, and clear. Best for general communication, technical basics, and behavioral response reviews.
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Male AI (David) */}
            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setInterviewerGender("male")}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                interviewerGender === "male"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {interviewerGender === "male" && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${interviewerGender === "male" ? "bg-emerald-500 text-white shadow-md shadow-emerald-550/20" : "bg-slate-100 text-slate-550"}`}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold leading-tight text-slate-800">David (Male AI)</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Structured, analytical, and precise. Best for digging deep into system architectures, syntax logic, and engineering trade-offs.
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Row 4: Length */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Select Interview Length</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 5 Questions */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLength(5)}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer flex flex-col justify-between h-full ${
                length === 5
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {length === 5 && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Quick (5 Questions)</h4>
              <p className="text-xs text-slate-400 mt-2">Estimated duration: ~10 minutes. Fast practice.</p>
            </motion.button>

            {/* 10 Questions */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLength(10)}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer flex flex-col justify-between h-full ${
                length === 10
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              {length === 10 && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Standard (10 Questions)</h4>
              <p className="text-xs text-slate-400 mt-2">Estimated duration: ~20 minutes. Regular round.</p>
            </motion.button>

            {/* 20 Questions */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLength(20)}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer flex flex-col justify-between h-full ${
                length === 20
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/20 border-emerald-500 text-slate-850 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-850"
              }`}
            >
              {length === 20 && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <h4 className="text-base font-bold leading-tight text-slate-800">Deep Dive (20 Questions)</h4>
              <p className="text-xs text-slate-400 mt-2">Estimated duration: ~40 minutes. Full grilling.</p>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Credit check and launch banner */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-3.5">
          <div className="bg-amber-50 border border-amber-100 text-amber-650 p-3 rounded-2xl">
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
          <motion.button
            whileHover={{ scale: 1.03, shadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 text-sm cursor-pointer"
          >
            Deduct 1 Credit & Start <ChevronRight size={16} />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default NewInterview;
