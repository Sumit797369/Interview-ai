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
    if (score >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/10";
    if (score >= 60) return "bg-amber-500/10 text-amber-400 border-amber-500/10";
    return "bg-red-500/10 text-red-400 border-red-500/10";
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-900 rounded-lg" />
        <div className="h-72 bg-gray-950/60 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interview History</h1>
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
            className="w-full min-h-[350px] bg-gray-950/20 border border-gray-900 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-center mb-6">
              <History size={28} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white">No interview reports found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2 leading-relaxed mb-6">
              You haven't completed any mock interview practice rounds yet. Configure a technical or HR session to begin.
            </p>
            <Link
              to="/dashboard/new"
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/15 text-sm"
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
            className="bg-gray-950/45 border border-gray-900 rounded-[32px] overflow-hidden shadow-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-900/10 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Length</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60">
                  {interviews.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-900/20 text-gray-300 font-semibold transition"
                    >
                      <td className="px-6 py-4 text-gray-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2.5 py-0.5 rounded-md bg-gray-900 border border-gray-800 text-[10px]">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-400 font-medium">{item.difficulty}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{item.length} Qs</td>
                      <td className="px-6 py-4 text-gray-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-gray-500" />
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
                            className="bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 hover:text-white text-gray-400 p-2 rounded-xl transition"
                            title="View Report"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-gray-900 border border-gray-800 hover:border-red-950/40 hover:bg-red-950/20 hover:text-red-400 text-gray-500 p-2 rounded-xl transition cursor-pointer"
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
