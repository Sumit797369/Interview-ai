import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Resume from "./models/resume.model.js";

dotenv.config();

const seed = async () => {
  try {
    console.log("Connecting to DB:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.");

    const email = "john.doe.test@example.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found. Register them first.`);
      process.exit(1);
    }

    // Check if they already have a resume
    const existing = await Resume.findOne({ userId: user._id });
    if (existing) {
      console.log("User already has a seeded resume. Bypassing.");
    } else {
      await Resume.create({
        userId: user._id,
        fileName: "john_doe_resume.pdf",
        extractedText: "John Doe. Senior Software Engineer. Experience in React, Node.js, and MongoDB.",
        analysis: {
          skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "REST APIs"],
          experienceLevel: "Senior",
          strengths: [
            "Strong understanding of full-stack JavaScript architectures.",
            "Proven experience in developing robust web APIs.",
            "Solid knowledge of database schema designing."
          ],
          weaknesses: [
            "Could improve knowledge of distributed systems.",
            "Limited experience with native mobile environments."
          ],
          suggestedQuestions: [
            "Explain the key architectural advantages of using Node.js event-driven loops.",
            "How do you design a secure schema in MongoDB for many-to-many relationships?",
            "Detail a performance optimization technique you implemented in a React dashboard.",
            "How do you manage sessions securely in an Express API using JWT?",
            "Explain your experience with Micro-frontend Webpack Module Federation."
          ]
        }
      });
      console.log("Successfully seeded mock analyzed resume.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
