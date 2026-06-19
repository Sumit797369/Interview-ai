import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Shield, Coins, Camera, Save, Bot } from "lucide-react";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [updating, setUpdating] = useState(false);

  // Mapped mock premium avatar list
  const avatarsList = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setUpdating(true);
      const response = await axios.put("http://localhost:8000/api/user/profile", {
        name,
        avatar,
      });

      setUser(response.data.user);
      toast.success("Profile details updated successfully!");

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your dashboard display name, select avatars, and view account attributes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Select Widget */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Profile Avatar</label>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Current Avatar display */}
            <div className="relative group shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-3xl shadow-lg ring-4 ring-emerald-500/10">
                  {name ? name[0].toUpperCase() : "U"}
                </div>
              )}
            </div>

            {/* Quick avatar click grid */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {avatarsList.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatar(url)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                    avatar === url ? "border-emerald-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 text-xs border border-slate-200 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Mapped Fields Widget */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Account Profile Fields</h4>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 pl-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3 pl-11 outline-none text-sm font-semibold text-slate-800"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 pl-1">Email Address (Read-only)</label>
            <div className="relative">
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-11 outline-none text-sm font-semibold text-slate-400 cursor-not-allowed"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          {/* Provider (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 pl-1">Login Provider</label>
            <div className="relative">
              <input
                type="text"
                value={user.provider === "google" ? "Google Authentication (Firebase)" : "Local Email / Password"}
                readOnly
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-11 outline-none text-sm font-semibold text-slate-400 cursor-not-allowed capitalize"
              />
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={updating}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 rounded-2xl transition disabled:opacity-50 text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 cursor-pointer"
        >
          <Save size={14} /> {updating ? "Saving Profile..." : "Save Profile Details"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
