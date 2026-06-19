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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "react-toastify";
import femaleVideo from "../assets/Videos/female-ai.mp4";
import maleVideo from "../assets/Videos/male-ai.mp4";

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // mapped by questionId: answerText
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

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

  // AI Speech Synthesis
  const speakQuestion = (text) => {
    if (!("speechSynthesis" in window)) return;
    
    // Cancel active speech
    window.speechSynthesis.cancel();

    if (!isSpeechEnabled || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Asynchronously retrieve voices and assign
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredGender = interview?.interviewerGender === "male" ? "male" : "female";
      const matchingVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes(preferredGender) ||
          (preferredGender === "female" && (name.includes("zira") || name.includes("samantha") || name.includes("hazel") || name.includes("microsoft google"))) ||
          (preferredGender === "male" && (name.includes("david") || name.includes("mark")))
        );
      });
      if (matchingVoice) utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech synthesis on question load
  useEffect(() => {
    if (interview && interview.questions && interview.questions[activeIndex]) {
      const timer = setTimeout(() => {
        speakQuestion(interview.questions[activeIndex].questionText);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, interview, isSpeechEnabled]);

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      toast.info("Microphone active. Start speaking…", { autoClose: 2000 });
    };

    rec.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (transcript.trim() && interview && interview.questions) {
        const activeQuestion = interview.questions[activeIndex];
        setAnswers((prev) => {
          const currentVal = prev[activeQuestion.questionId] || "";
          const newVal = currentVal ? `${currentVal.trim()} ${transcript.trim()}` : transcript.trim();
          return {
            ...prev,
            [activeQuestion.questionId]: newVal,
          };
        });
      }
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permissions in your browser.");
      } else {
        toast.error(`Voice input error: ${event.error}`);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [interview, activeIndex]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.warn("Speech recognition is not supported in your browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 text-slate-800">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-500 animate-pulse">Loading mock interview room...</p>
      </div>
    );
  }

  const currentQ = interview.questions[activeIndex];
  const currentAnswer = answers[currentQ.questionId] || "";
  const progressPercent = Math.round(((activeIndex + 1) / interview.questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-800">
      <AnimatePresence>
        {evaluating && (
          // Fullscreen loader overlay on evaluate
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F8FAFC]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-3 bg-emerald-50/50 rounded-full flex items-center justify-center text-emerald-600">
                <Bot size={32} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Evaluating Performance</h3>
            <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
              Gemini AI is analyzing your answers against the resume criteria. Checking communication, confidence, technical keywords, and overall score...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Header */}
      <header className="w-full border-b border-slate-200 bg-white/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            onClick={(e) => {
              if (!window.confirm("Leave interview? Your progress is autosaved, but the session timer will pause.")) {
                e.preventDefault();
              }
            }}
            className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Mock Interview Room</span>
              <span className="text-[9px] font-bold uppercase bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md">
                {interview.type}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Difficulty: {interview.difficulty}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-sm font-mono text-emerald-600 shadow-sm">
          <Clock size={15} />
          <span>{formatTime(secondsElapsed)}</span>
        </div>
      </header>

      {/* Body Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-8 items-stretch h-[calc(100vh-140px)] overflow-hidden">
        {/* Left column: questions progress tracker */}
        <aside className="w-full md:w-1/4 flex flex-col gap-4 overflow-y-auto pr-2 shrink-0 h-full">
          <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase px-1">Questions Timeline</h4>
          <div className="flex flex-col gap-2">
            {interview.questions.map((q, idx) => {
              const isCompleted = (answers[q.questionId] || "").trim().length > 0;
              const isActive = idx === activeIndex;

              return (
                <motion.button
                  key={q.questionId}
                  onClick={() => handleNavigate(idx)}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3 cursor-pointer relative overflow-hidden"
                  style={{
                    backgroundColor: isActive ? "transparent" : "#fff",
                    borderColor: isActive ? "transparent" : "#e2e8f0",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTimelineBg"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-50/90 to-teal-50/20 border-2 border-emerald-500 rounded-2xl -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 25 }}
                    />
                  )}
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold transition-colors duration-200 ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : isCompleted
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted && !isActive ? <Check size={10} className="stroke-[3]" /> : idx + 1}
                  </span>
                  <span className={`text-xs leading-normal truncate ${isActive ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                    {q.questionText}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </aside>

        {/* Center column: active question input */}
        <main className="flex-1 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 flex flex-col justify-between h-full overflow-y-auto relative shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Question Card & Video Avatar Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 border border-slate-100 p-6 rounded-3xl relative overflow-hidden">
                  {/* Video Avatar Section */}
                  <div className="lg:col-span-4 relative rounded-2xl overflow-hidden bg-slate-900 aspect-video lg:aspect-[4/3] flex items-center justify-center border border-slate-200 shadow-inner group">
                    <video
                      key={interview.interviewerGender} // Force re-render if gender updates
                      src={interview.interviewerGender === "male" ? maleVideo : femaleVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Glowing Live Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-100 uppercase tracking-widest leading-none">
                        {interview.interviewerGender === "male" ? "David (AI)" : "Sophia (AI)"}
                      </span>
                    </div>

                    {/* Simulated voice/equalizer status footer overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/50">
                      <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500/80" />
                        <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                        <span className="w-2 h-2 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold font-mono text-emerald-400 tracking-wider uppercase mr-1">voice feed</span>
                        <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: "0.1s" }} />
                          <div className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: "0.3s" }} />
                          <div className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: "0.5s" }} />
                          <div className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Text Section */}
                  <div className="lg:col-span-8 flex flex-col justify-center gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                        Question {activeIndex + 1} of {interview.questions.length}
                      </span>
                      
                      {/* Audio Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSpeechEnabled
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                              : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                          }`}
                          title={isSpeechEnabled ? "Mute AI speech" : "Unmute AI speech"}
                          aria-label={isSpeechEnabled ? "Mute AI speech" : "Unmute AI speech"}
                        >
                          {isSpeechEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                        </button>
                        <button
                          onClick={() => speakQuestion(currentQ.questionText)}
                          className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
                          title="Replay question audio"
                          aria-label="Replay question audio"
                        >
                          <Play size={13} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 leading-relaxed text-wrap-balance">
                      {currentQ.questionText}
                    </h2>
                  </div>
                </div>

                {/* Answer Input */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Your Response</label>
                  <div className="relative">
                    <textarea
                      value={currentAnswer}
                      onChange={handleTextChange}
                      placeholder="Type your response here… e.g. In my last project, we optimized database load by implementing a Redis cache layer which reduced latency by 40%…"
                      className="w-full min-h-[220px] bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white rounded-3xl p-6 pr-16 text-sm outline-none transition-all duration-300 text-slate-800 leading-relaxed resize-none shadow-inner"
                    />

                    {/* Mic floating button */}
                    <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
                      <AnimatePresence>
                        {isListening && (
                          <motion.span
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 5 }}
                            className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full shadow-sm"
                          >
                            Listening…
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleListening}
                        type="button"
                        className={`p-3 rounded-full border-2 transition-all cursor-pointer shadow-md ${
                          isListening
                            ? "bg-red-500 border-red-600 text-white shadow-red-500/20"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-850"
                        }`}
                        title={isListening ? "Stop voice answer" : "Speak your answer"}
                        aria-label={isListening ? "Stop voice answer" : "Speak your answer"}
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </motion.button>
                    </div>
                  </div>

                  {/* Status Indicators footer */}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currentAnswer.length} characters
                    </span>
                    <AnimatePresence>
                      {saving && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1"
                        >
                          <Save size={10} className="animate-pulse" /> Saving…
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
            <motion.button
              whileHover={{ scale: 1.03, x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft size={14} /> Previous
            </motion.button>

            {activeIndex === interview.questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.03, shadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEndInterview}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 text-xs cursor-pointer"
              >
                Submit & End Interview <Send size={13} />
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(activeIndex + 1)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition text-xs font-semibold cursor-pointer"
                >
                  Skip Question
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(activeIndex + 1)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-5 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 text-xs cursor-pointer"
                >
                  Next Question <ArrowRight size={14} />
                </motion.button>
              </div>
            )}
          </div>
        </main>

        {/* Right column: Stats summary cards */}
        <aside className="w-full md:w-1/5 flex flex-col gap-6 shrink-0 h-full justify-start">
          <div className="bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm space-y-5">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase leading-none">Session Status</h4>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Details details */}
            <div className="h-px bg-slate-100" />

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 leading-none">Category</p>
                <p className="text-xs font-bold text-slate-700 capitalize mt-1 leading-none">{interview.type} Round</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 leading-none">Difficulty</p>
                <p className="text-xs font-bold text-slate-700 capitalize mt-1 leading-none">{interview.difficulty}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 leading-none">Target questions</p>
                <p className="text-xs font-bold text-slate-700 mt-1 leading-none">{interview.questions.length} Questions</p>
              </div>
            </div>
          </div>

          {/* Guidelines Tips banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-5">
            <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles size={12} /> Pro Tip
            </h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
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
