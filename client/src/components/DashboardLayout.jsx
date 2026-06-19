import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  History,
  CreditCard,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bot,
  PlusCircle,
  Coins,
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Avoid flicker
  }

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "Resume Analysis", path: "/dashboard/resume", icon: FileText },
    { name: "New Interview", path: "/dashboard/new", icon: PlusCircle },
    { name: "Interview History", path: "/dashboard/history", icon: History },
    { name: "Pricing Plans", path: "/dashboard/pricing", icon: CreditCard },
    { name: "My Profile", path: "/dashboard/profile", icon: User },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Mobile Header Bar */}
      <div className="w-full md:hidden bg-[#F8FAFC]/90 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
            <Bot size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            IntervuAI
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-500 hover:text-slate-800 p-1"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile overlay */}
      <aside
        className={`w-64 bg-white/95 backdrop-blur-lg border-r border-slate-200 flex flex-col justify-between p-6 fixed md:sticky top-[61px] md:top-0 h-[calc(100vh-61px)] md:h-screen z-40 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo (Desktop Only) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Bot size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              IntervuAI
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/15"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Stats Card in Sidebar footer */}
        <div className="border-t border-slate-200 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-1.5 rounded-full flex items-center justify-center">
              <Coins size={14} className="text-amber-500 animate-spin-slow" />
            </div>
            <div className="text-xs">
              <p className="text-gray-500 leading-none">Credit Balance</p>
              <p className="text-sm font-extrabold text-emerald-600 mt-0.5">
                {user.credits} Credits
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/10 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
              )}
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 min-h-[calc(100vh-61px)] md:min-h-screen overflow-y-auto z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
