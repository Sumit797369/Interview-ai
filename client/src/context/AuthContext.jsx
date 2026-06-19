import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios default for credentials (cookies)
  axios.defaults.withCredentials = true;

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`);
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      setUser(response.data);
      toast.success(`Welcome back ${response.data.name || response.data.email}!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to log in";
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });
      toast.success("Account created successfully! Please login.");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to register";
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/logout`);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to log out";
      toast.error(message);
    }
  };

  const googleLogin = async (firebaseUser) => {
    try {
      const response = await axios.post(`${API_URL}/google`, {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL,
      });
      setUser(response.data);
      toast.success(`Welcome ${response.data.name}!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Google auth failed";
      toast.error(message);
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        googleLogin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
