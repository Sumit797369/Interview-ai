import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  Brain,
  PlusCircle,
  HelpCircle,
  FileUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";

const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchLatestResume = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/resume/latest");
      setResume(response.data);
    } catch (error) {
      // 404 is fine, it means they just haven't uploaded a resume yet
      if (error.response?.status !== 404) {
        toast.error("Failed to load resume details");
      }
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size limit is 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("resume", file);

      const response = await axios.post("http://localhost:8000/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResume(response.data);
      toast.success("Resume parsed and analyzed successfully!");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to analyze resume";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setResume(null);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-[250px] bg-white border border-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Resume Profile Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload your resume PDF. Gemini AI will automatically index your skill stack, strengths, and weakness profile.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!resume ? (
          // Upload dropzone mode
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {uploading ? (
              // Uploading loader screen
              <div className="w-full min-h-[350px] bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-xl">
                <div className="relative w-16 h-16 mb-6">
                  {/* Rotating loader ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-2 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Brain size={24} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Gemini is analyzing your resume</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                  We are parsing the text document, mapping your technical capabilities, and preparing candidate profiles. This usually takes around 5 seconds.
                </p>
              </div>
            ) : (
              // Drag and drop zone
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full min-h-[350px] rounded-[32px] border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden group shadow-xl ${
                  dragActive
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {/* Visual grid indicator */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all duration-300">
                  <UploadCloud size={28} className="text-slate-400 group-hover:text-emerald-600 transition" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">Drag and drop your PDF resume here</h3>
                <p className="text-sm text-slate-500 mb-6">Support PDF file up to 5MB max.</p>

                <label className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-500/15">
                  Browse File
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileInput}
                  />
                </label>
              </div>
            )}
          </motion.div>
        ) : (
          // Analysis displays mode
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Resume Overview Widget */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-3.5 rounded-2xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{resume.fileName}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                      Parsed
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Experience level: <strong className="text-slate-700 font-semibold">{resume.analysis.experienceLevel}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold py-3 px-5 rounded-2xl transition text-sm cursor-pointer"
                >
                  Upload Another
                </button>
                <button
                  onClick={() => navigate("/dashboard/new", { state: { resumeId: resume._id } })}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 px-5 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 text-sm cursor-pointer"
                >
                  Configure Practice <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Profile Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills card */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 mb-4 tracking-wide uppercase">Identified Skill Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.analysis.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths card */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 mb-4 tracking-wide uppercase">Core Strengths</h4>
                <ul className="space-y-3">
                  {resume.analysis.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                      <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses card */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 mb-4 tracking-wide uppercase">Identified Gaps / Weaknesses</h4>
                <ul className="space-y-3">
                  {resume.analysis.weaknesses.map((weak, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                      <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Questions */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 mb-4 tracking-wide uppercase flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-500" /> Probable AI Questions
                </h4>
                <ul className="space-y-3">
                  {resume.analysis.suggestedQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-600 leading-normal">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeAnalysis;
