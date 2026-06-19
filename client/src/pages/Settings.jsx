import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Lock, AlertOctagon, ShieldAlert, Moon, Trash2, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Settings = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Change Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    try {
      setUpdatingPassword(true);
      await axios.put("http://localhost:8000/api/user/change-password", {
        oldPassword,
        newPassword,
      });

      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleConfirm = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account? This will permanently wipe all your resume analysis history, mock interview questions, and credits. This is IRREVERSIBLE."
    );

    if (!doubleConfirm) return;

    const typeConfirm = window.prompt("Type 'DELETE' to confirm account deletion:");
    if (typeConfirm !== "DELETE") {
      toast.info("Account deletion cancelled");
      return;
    }

    try {
      await axios.delete("http://localhost:8000/api/user/delete-account");
      setUser(null);
      toast.success("Your account has been deleted permanently.");
      navigate("/auth");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure security credentials, set UI themes, and manage your account status.
        </p>
      </div>

      {/* Change Password Panel */}
      <div className="bg-gray-950/45 border border-gray-900 rounded-[32px] p-6 shadow-xl space-y-6">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-900 pb-3 leading-none">
          <KeyRound size={16} className="text-emerald-400" /> Update Password
        </h4>

        {user.provider === "google" ? (
          <div className="flex gap-3 bg-blue-950/15 border border-blue-900/30 p-4 rounded-2xl text-xs text-blue-400">
            <Moon size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your account is registered using <strong>Google Sign-In</strong>. Passwords are managed directly by Google security portals.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 pl-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-900 focus:border-emerald-500 rounded-2xl px-4 py-3 outline-none text-sm font-semibold text-gray-200"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 pl-1">New Password (Min 6 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-900 focus:border-emerald-500 rounded-2xl px-4 py-3 outline-none text-sm font-semibold text-gray-200"
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 pl-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-900 focus:border-emerald-500 rounded-2xl px-4 py-3 outline-none text-sm font-semibold text-gray-200"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-6 py-3 rounded-2xl transition disabled:opacity-50 text-xs flex items-center gap-1 cursor-pointer"
            >
              Update Security Password
            </button>
          </form>
        )}
      </div>

      {/* Theme Settings Panel */}
      <div className="bg-gray-950/45 border border-gray-900 rounded-[32px] p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 leading-none">
          <Moon size={16} className="text-emerald-400" /> Theme Preference
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-300">Dark Mode First</p>
            <p className="text-[10px] text-gray-500 mt-1 max-w-[320px]">
              IntervuAI uses a SaaS dark theme design system by default for optimal code-reading ergonomics.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl">
            Active
          </span>
        </div>
      </div>

      {/* Danger Zone Panel */}
      <div className="bg-gray-950/45 border border-red-950/45 rounded-[32px] p-6 shadow-xl space-y-5">
        <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 border-b border-red-950/30 pb-3 leading-none">
          <AlertOctagon size={16} /> Danger Zone
        </h4>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-red-200">Delete Account Permanently</p>
            <p className="text-[10px] text-gray-500 leading-normal max-w-sm">
              Delete your profile and all associated analyzed resumes, credit transactions, mock interview rooms, and feedbacks.
            </p>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto bg-red-950/20 border border-red-900 hover:bg-red-500 hover:text-white text-red-400 font-bold py-3.5 px-6 rounded-2xl text-xs transition cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
