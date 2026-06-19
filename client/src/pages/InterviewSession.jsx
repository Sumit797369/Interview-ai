import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Play,
  Send,
  Save,
  Check,
  Bot,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // mapped by questionId: answerText
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Time tracker
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);

  // Fetch session details
  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/interview/${id}`);
      const data = response.data;

      if (data.status === "completed") {
        toast.info("This interview session has already been completed.");
        navigate(`/dashboard/report/${id}`);
        return;
      }

      setInterview(data);

      // Initialize answers state from DB
      const loadedAnswers = {};
      data.questions.forEach((q) => {
        loadedAnswers[q.questionId] = q.userAnswer || "";
      });
      setAnswers(loadedAnswers);
      setSecondsElapsed(data.duration || 0);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load interview session details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  // Handle active timer increments
  useEffect(() => {
    if (interview && !evaluating) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interview, evaluating]);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTextChange = (e) => {
    const activeQuestion = interview.questions[activeIndex];
    setAnswers({
      ...answers,
      [activeQuestion.questionId]: e.target.value,
    });
  };

  // Autosave question answer to DB
  const saveAnswer = async (indexToSave) => {
    const q = interview.questions[indexToSave];
    const answerText = answers[q.questionId] || "";

    try {
      setSaving(true);
      await axios.put(`http://localhost:8000/api/interview/${id}/answer`, {
        questionId: q.questionId,
        userAnswer: answerText,
      });

      // Update local interview state
      setInterview((prev) => {
        const updated = { ...prev };
        updated.questions[indexToSave].userAnswer = answerText;
        return updated;
      });

    } catch (error) {
      console.error("Autosave error:", error);
      toast.error("Failed to save progress. Please check connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleNavigate = async (newIndex) => {
    if (newIndex < 0 || newIndex >= interview.questions.length) return;
    // Autosave current index before leaving
    await saveAnswer(activeIndex);
    setActiveIndex(newIndex);
  };

  const handleEndInterview = async () => {
    // Autosave current question before ending
    await saveAnswer(activeIndex);

    const confirmEnd = window.confirm(
      "Are you sure you want to end the interview? Gemini AI will evaluate your answers."
    );

    if (!confirmEnd) return;

    try {
      setEvaluating(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const response = await axios.post(`http://localhost:8000/api/interview/${id}/end`, {
        duration: secondsElapsed,
      });

      toast.success("Interview completed! Mapped reports are ready.");
      navigate(`/dashboard/report/${id}`);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to compile report";
      toast.error(msg);
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-950/40 border-t-emerald-400 animate-spin" />
        <p className="text-sm text-gray-500 animate-pulse">Loading mock interview room...</p>
      </div>
    );
  }

  const currentQ = interview.questions[activeIndex];
  const currentAnswer = answers[currentQ.questionId] || "";
  const progressPercent = Math.round(((activeIndex + 1) / interview.questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f8fafc] flex flex-col justify-between selection:bg-emerald-500/30">
      <AnimatePresence>
        {evaluating && (
          // Fullscreen loader overlay on evaluate
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-950/40 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-3 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                <Bot size={32} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Evaluating Performance</h3>
            <p className="text-sm text-gray-400 max-w-md mt-2 leading-relaxed">
              Gemini AI is analyzing your answers against the resume criteria. Checking communication, confidence, technical keywords, and overall score...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Header */}
      <header className="w-full border-b border-gray-900 bg-gray-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            onClick={(e) => {
              if (!window.confirm("Leave interview? Your progress is autosaved, but the session timer will pause.")) {
                e.preventDefault();
              }
            }}
            className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-900"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Mock Interview Room</span>
              <span className="text-[9px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">
                {interview.type}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Difficulty: {interview.difficulty}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-900 border border-gray-800 text-sm font-mono text-emerald-400">
          <Clock size={15} />
          <span>{formatTime(secondsElapsed)}</span>
        </div>
      </header>

      {/* Body Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-8 items-stretch h-[calc(100vh-140px)] overflow-hidden">
        {/* Left column: questions progress tracker */}
        <aside className="w-full md:w-1/4 flex flex-col gap-4 overflow-y-auto pr-2 shrink-0 h-full">
          <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase px-1">Questions Timeline</h4>
          <div className="flex flex-col gap-2">
            {interview.questions.map((q, idx) => {
              const isCompleted = (answers[q.questionId] || "").trim().length > 0;
              const isActive = idx === activeIndex;

              return (
                <button
                  key={q.questionId}
                  onClick={() => handleNavigate(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? "bg-emerald-500/10 border-emerald-500 text-white font-semibold"
                      : "bg-gray-950/20 border-gray-900 text-gray-400 hover:border-gray-800 hover:text-white"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold ${
                      isActive
                        ? "bg-emerald-500 text-black"
                        : isCompleted
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/30"
                        : "bg-gray-900 text-gray-600"
                    }`}
                  >
                    {isCompleted && !isActive ? <Check size={10} className="stroke-[3]" /> : idx + 1}
                  </span>
                  <span className="text-xs leading-normal truncate">{q.questionText}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center column: active question input */}
        <main className="flex-1 bg-gray-950/20 border border-gray-900 rounded-[32px] p-6 md:p-8 flex flex-col justify-between h-full overflow-y-auto relative">
          <div className="space-y-6">
            {/* Question Card */}
            <div className="bg-gray-900/30 border border-gray-900 p-5 rounded-3xl relative overflow-hidden">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Question {activeIndex + 1} of {interview.questions.length}</span>
              <h2 className="text-lg font-bold text-white mt-2 leading-relaxed">
                {currentQ.questionText}
              </h2>
            </div>

            {/* Answer Input */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">Your Response</label>
              <textarea
                value={currentAnswer}
                onChange={handleTextChange}
                placeholder="Structure your answer clearly. Explain key terms, projects, methodologies, and edge cases where applicable..."
                className="w-full min-h-[180px] bg-gray-950/50 border border-gray-900 rounded-3xl p-5 text-sm outline-none focus:border-emerald-500 text-gray-200 leading-relaxed resize-none"
              />

              {/* Status Indicators footer */}
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] text-gray-600">
                  {currentAnswer.length} characters
                </span>
                <AnimatePresence>
                  {saving && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1"
                    >
                      <Save size={10} className="animate-pulse" /> Progress Saving...
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-gray-900 pt-6 mt-6">
            <button
              onClick={() => handleNavigate(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="px-5 py-3 rounded-2xl border border-gray-900 text-gray-400 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-900 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft size={14} /> Previous
            </button>

            {activeIndex === interview.questions.length - 1 ? (
              <button
                onClick={handleEndInterview}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-6 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 text-xs cursor-pointer"
              >
                Submit & End Interview <Send size={13} />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleNavigate(activeIndex + 1)}
                  className="px-5 py-3 rounded-2xl border border-gray-900 text-gray-500 hover:text-white hover:border-gray-800 transition text-xs font-semibold cursor-pointer"
                >
                  Skip Question
                </button>
                <button
                  onClick={() => handleNavigate(activeIndex + 1)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-5 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 text-xs cursor-pointer"
                >
                  Next Question <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right column: Stats summary cards */}
        <aside className="w-full md:w-1/5 flex flex-col gap-6 shrink-0 h-full justify-start">
          <div className="bg-gray-950/45 border border-gray-900 rounded-[32px] p-5 shadow-xl space-y-5">
            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase leading-none">Session Status</h4>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-900 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Details details */}
            <div className="h-px bg-gray-900" />

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-600 leading-none">Category</p>
                <p className="text-xs font-bold text-gray-300 capitalize mt-1 leading-none">{interview.type} Round</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 leading-none">Difficulty</p>
                <p className="text-xs font-bold text-gray-300 capitalize mt-1 leading-none">{interview.difficulty}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 leading-none">Target questions</p>
                <p className="text-xs font-bold text-gray-300 mt-1 leading-none">{interview.questions.length} Questions</p>
              </div>
            </div>
          </div>

          {/* Guidelines Tips banner */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] p-5">
            <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles size={12} /> Pro Tip
            </h5>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Interviews can be completed any time by clicking "Submit & End Interview". Try to write thorough, structured responses for optimal AI evaluations.
            </p>
          </div>
        </aside>
      </div>

      {/* Spacer footer */}
      <footer className="h-4 w-full" />
    </div>
  );
};

export default InterviewSession;
