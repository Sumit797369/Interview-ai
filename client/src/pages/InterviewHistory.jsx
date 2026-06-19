import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Trash2,
  Eye,
  PlusCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/interview");
      setInterviews(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this interview record permanently?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/interview/${id}`);
      setInterviews((prev) => prev.filter((item) => item._id !== id));
      toast.success("Interview record deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete interview record");
    }
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-72 bg-white border border-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Interview History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review all your past mock round metrics, score charts, and AI feedback directories.
          </p>
        </div>
        {interviews.length > 0 && (
          <Link
            to="/dashboard/new"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-5 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
          >
            <PlusCircle size={18} /> New Mock Interview
          </Link>
        )}
      </div>

      <AnimatePresence mode="wait">
        {interviews.length === 0 ? (
          // Empty State
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-[350px] bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-6">
              <History size={28} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No interview reports found</h3>
            <p className="text-sm text-slate-505 max-w-sm mt-2 leading-relaxed mb-6">
              You haven't completed any mock interview practice rounds yet. Configure a technical or HR session to begin.
            </p>
            <Link
              to="/dashboard/new"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/15 text-sm"
            >
              Start Practice Session
            </Link>
          </motion.div>
        ) : (
          // Table Layout
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Length</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50 text-slate-700 font-semibold transition"
                    >
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px]">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-slate-500 font-medium">{item.difficulty}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{item.length} Qs</td>
                      <td className="px-6 py-4 text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-slate-400" />
                        <span>{formatDuration(item.duration)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-black font-mono ${getScoreColor(
                            item.report.score
                          )}`}
                        >
                          {item.report.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/dashboard/report/${item._id}`}
                            className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 text-slate-500 p-2 rounded-xl transition shadow-sm"
                            title="View Report"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 text-slate-400 p-2 rounded-xl transition cursor-pointer shadow-sm"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewHistory;
