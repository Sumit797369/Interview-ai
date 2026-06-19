import React, { useState, useEffect } from "react";
import { LiaRobotSolid } from "react-icons/lia";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

const Auth = () => {
  const { user, login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMsg("");

      if (isLogin) {
        // Express Backend LOGIN
        await login(formData.email, formData.password);
        navigate("/");
      } else {
        // Express Backend SIGNUP
        await register(formData.username, formData.email, formData.password);

        // Switch to login mode
        setIsLogin(true);
        setFormData({
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      setErrorMsg(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Firebase Popup for OAuth
      const result = await signInWithPopup(auth, provider);

      // Send Google credentials to Express Backend
      await googleLogin(result.user);
      navigate("/");
    } catch (error) {
      console.log(error);
      setErrorMsg(error.message || "Google Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f7fb] flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-8"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-green-500 text-white p-3 rounded-xl">
            <LiaRobotSolid size={24} />
          </div>

          <h2 className="text-2xl font-bold">IntervuAI</h2>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
          </h1>

          <p className="text-gray-500 mt-2">
            {isLogin
              ? "Login to continue your AI interview journey."
              : "Sign up and start practicing AI-powered interviews."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* Username */}
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-500"
            />
          )}

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-green-500"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-green-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>

          {/* Error */}
          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 transition text-white rounded-xl font-semibold disabled:opacity-70"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-gray-300" />

          <span className="text-sm text-gray-400">OR</span>

          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Google Auth */}
        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          <FcGoogle size={22} />

          Continue with Google
        </motion.button>

        {/* Toggle */}
        <p className="text-center text-sm mt-7 text-gray-600">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg("");

              setFormData({
                username: "",
                email: "",
                password: "",
              });
            }}
            className="ml-2 text-green-600 font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;