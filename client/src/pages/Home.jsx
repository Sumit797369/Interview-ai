import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { LiaRobotSolid, LiaHistorySolid } from "react-icons/lia";
import { FaSignOutAlt, FaBrain, FaCoins, FaPlay, FaUserCircle } from "react-icons/fa";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Prevent flicker before redirect
  }

  const handleLogoutClick = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-[#0f172a] relative overflow-hidden font-sans">
      {/* Background abstract glowing circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-[150px] pointer-events-none" />

      {/* Header/Navbar */}
      <nav className="w-full border-b border-gray-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-md shadow-emerald-500/20">
            <LiaRobotSolid size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            IntervuAI
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Credit balance display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/80 text-emerald-700 font-semibold text-sm">
            <FaCoins className="text-amber-500" />
            <span>{user.credits || 100} Credits</span>
          </div>

          {/* User profile dropdown info */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full ring-2 ring-emerald-500/20 object-cover"
              />
            ) : (
              <div className="text-emerald-600 bg-emerald-100 w-9 h-9 rounded-full flex items-center justify-center font-bold">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-tight text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 leading-none">{user.email}</p>
            </div>

            <button
              onClick={handleLogoutClick}
              className="ml-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 p-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm border border-slate-200/50"
              title="Logout"
            >
              <FaSignOutAlt size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:text-left"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Welcome back, <span className="text-emerald-600">{user.name.split(" ")[0]}</span>!
          </h1>
          <p className="text-lg text-slate-500 mt-3 max-w-2xl leading-relaxed">
            Ready to ace your next job interview? Practice simulated role-play sessions tailored to your target industry and receive detailed, real-time AI feedback.
          </p>
        </motion.div>

        {/* Dashboard Grid Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Card 1: New Mock Interview */}
          <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <FaBrain size={22} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">New Mock Interview</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Start a dynamic conversational interview tailored for Technical, Product Management, or Business roles.
              </p>
            </div>
            <button className="mt-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/20 cursor-pointer">
              <FaPlay size={14} /> Start Interview
            </button>
          </motion.div>

          {/* Card 2: Interview History */}
          <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <LiaHistorySolid size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Interview History</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Review transcript logs, evaluation metrics, and concrete suggestions for answers you gave in previous rounds.
              </p>
            </div>
            <button className="mt-8 w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer">
              View History
            </button>
          </motion.div>

          {/* Card 3: Profile & Credits */}
          <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <FaUserCircle size={22} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Account Profile</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Manage your credentials, view detailed performance over time, and buy or top up your session credits.
              </p>
            </div>
            <button className="mt-8 w-full bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer">
              Manage Profile
            </button>
          </motion.div>
        </div>

        {/* Tip banner */}
        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <span className="bg-emerald-500 text-white text-xs uppercase font-extrabold px-2.5 py-1 rounded-md">
            Tip
          </span>
          <p className="text-sm text-emerald-800 text-center sm:text-left">
            Complete mock interviews to unlock deep performance breakdowns and boost your scores! Get 100 bonus credits for every milestone reached.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
