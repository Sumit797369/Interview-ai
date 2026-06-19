import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import Resume from "../models/resume.model.js";
import Payment from "../models/payment.model.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all completed interviews for the user, sorted chronologically
    const completedInterviews = await Interview.find({
      userId: req.userId,
      status: "completed",
      "report.score": { $exists: true },
    }).sort({ createdAt: 1 });

    const totalInterviews = completedInterviews.length;

    // Calculate Average Score
    let totalScore = 0;
    completedInterviews.forEach((interview) => {
      totalScore += interview.report.score;
    });
    const averageScore = totalInterviews > 0 ? Math.round(totalScore / totalInterviews) : 0;

    // Calculate Improvement Rate
    let improvementRate = 0;
    if (totalInterviews > 1) {
      const firstScore = completedInterviews[0].report.score;
      const latestScore = completedInterviews[totalInterviews - 1].report.score;
      if (firstScore > 0) {
        improvementRate = parseFloat((((latestScore - firstScore) / firstScore) * 100).toFixed(1));
      }
    }

    // Map history to simple dates for the charts page
    const scoreHistory = completedInterviews.map((item) => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      score: item.report.score,
      type: item.type,
    }));

    return res.status(200).json({
      totalInterviews,
      averageScore,
      creditsRemaining: user.credits,
      improvementRate,
      scoreHistory,
    });

  } catch (error) {
    console.error("Get Stats Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.provider === "google") {
      return res.status(400).json({ message: "Google accounts do not have a local password to change." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascading delete user assets
    await Resume.deleteMany({ userId: req.userId });
    await Interview.deleteMany({ userId: req.userId });
    await Payment.deleteMany({ userId: req.userId });
    await User.findByIdAndDelete(req.userId);

    // Clear session cookies
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Account and all associated data deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
