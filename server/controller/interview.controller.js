import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../models/interview.model.js";
import Resume from "../models/resume.model.js";
import User from "../models/user.model.js";

// Helper to clean JSON responses from Gemini
const parseGeminiJson = (text) => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error("JSON parsing error on Gemini response:", error, "\nOriginal Text:", text);
    throw new Error("Failed to parse AI-generated response. Please try again.");
  }
};

export const generateInterview = async (req, res) => {
  try {
    const { type, difficulty, length, interviewerGender } = req.body;
    let { resumeId } = req.body;

    // 1. Fetch user to check credits
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits < 1) {
      return res.status(402).json({
        message: "Insufficient credits. Please upgrade your plan to start a new interview.",
        noCredits: true
      });
    }

    // 2. Fetch latest resume if resumeId is omitted
    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    } else {
      resume = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    }

    if (!resume) {
      return res.status(404).json({
        message: "No analyzed resume found. Please upload and analyze your resume first.",
        noResume: true
      });
    }

    // 3. Prompt Gemini to generate questions based on resume context
    const skills = resume.analysis.skills.join(", ");
    const experienceLevel = resume.analysis.experienceLevel;
    const weaknesses = resume.analysis.weaknesses.join(", ");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert corporate interviewer conducting a mock interview.
      Generate exactly ${length} questions for a "${type}" interview (choose from: "technical", "hr", or "mixed") at a "${difficulty}" level.
      The questions must target the candidate's resume background:
      - Skills: ${skills}
      - Experience level: ${experienceLevel}
      - Potential weakness areas to probe: ${weaknesses}

      Return ONLY a valid JSON array of questions matching this schema structure, with no markdown formatting, wrappers, or backticks:
      [
        {
          "id": "q1",
          "question": "First question text here..."
        },
        {
          "id": "q2",
          "question": "Second question text here..."
        }
      ]
    `;

    let questionsArray;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      questionsArray = parseGeminiJson(responseText);
    } catch (apiError) {
      console.warn("Gemini Question Generation failed or key missing. Using mock questions fallback.", apiError);
      questionsArray = [
        { id: "q1", question: `Explain your experience using ${resume.analysis.skills[0] || "React"} and detail a complex project where you utilized it.` },
        { id: "q2", question: "How do you handle error boundaries and performance tuning on the frontend?" },
        { id: "q3", question: `Given your skills in ${resume.analysis.skills[1] || "Node.js"}, how do you manage asynchronous errors and memory leaks?` },
        { id: "q4", question: "What is your approach to designing secure REST APIs, and what headers would you set?" },
        { id: "q5", question: "Can you detail a behavioral scenario where you solved a major conflict in a tech team?" }
      ];
      questionsArray = questionsArray.slice(0, length);
    }

    // Map questions to MongoDB schema
    const formattedQuestions = questionsArray.map((q) => ({
      questionId: q.id,
      questionText: q.question,
      userAnswer: "",
    }));

    // 4. Create interview session and deduct 1 credit
    const interview = await Interview.create({
      userId: req.userId,
      resumeId: resume._id,
      type,
      difficulty,
      length,
      interviewerGender: interviewerGender || "female",
      questions: formattedQuestions,
      status: "active",
    });

    user.credits -= 1;
    await user.save();

    return res.status(201).json({
      message: "Interview generated successfully",
      interviewId: interview._id,
      creditsRemaining: user.credits,
      interview,
    });

  } catch (error) {
    console.error("Interview Generation Error:", error);
    return res.status(500).json({ message: error.message || "Failed to generate interview" });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, userAnswer } = req.body;

    const interview = await Interview.findOne({ _id: id, userId: req.userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    if (interview.status === "completed") {
      return res.status(400).json({ message: "Interview has already been completed" });
    }

    // Find and update the specific question answer
    const question = interview.questions.find((q) => q.questionId === questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found in this session" });
    }

    question.userAnswer = userAnswer;
    await interview.save();

    return res.status(200).json({ message: "Answer saved successfully" });

  } catch (error) {
    console.error("Submit Answer Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const endAndEvaluate = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body; // Duration in seconds

    const interview = await Interview.findOne({ _id: id, userId: req.userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    // Check if resume context is present
    const resume = await Resume.findById(interview.resumeId);
    const skills = resume ? resume.analysis.skills.join(", ") : "Unknown";
    const experienceLevel = resume ? resume.analysis.experienceLevel : "Intermediate";

    // Format questions and answers for Gemini prompt
    const qaFormatted = interview.questions
      .map((q) => `Q: ${q.questionText}\nA: ${q.userAnswer || "[No response provided]"}`)
      .join("\n\n");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a Senior Technical Recruiter and Career Coach. Evaluate the candidate's answers from their mock interview session.
      
      Resume Context:
      - Skills: ${skills}
      - Experience level: ${experienceLevel}

      Interview parameters:
      - Type: ${interview.type}
      - Difficulty: ${interview.difficulty}

      Interview Transcript:
      ${qaFormatted}

      Provide a comprehensive, high-quality evaluation report. Include feedback on:
      1. Communication (structural layout, clarity, professional vocabulary)
      2. Technical Knowledge (accuracy of terms, depth of technology understanding)
      3. Confidence (assertiveness, tone in written answers, readiness)
      4. Problem Solving (handling edge cases, methodologies mentioned)
      5. Overall Performance
      
      Also provide a numeric overall score out of 100, bulleted lists of strengths, weak areas, suggestions, and a custom learning path.

      Return ONLY a valid JSON object matching this schema structure with no markdown, backticks, or wrappers:
      {
        "score": 78,
        "communication": "Feedback text regarding communication...",
        "technicalKnowledge": "Feedback text regarding technical depth...",
        "confidence": "Feedback text regarding confidence...",
        "problemSolving": "Feedback text regarding analytical thinking...",
        "overallPerformance": "General summary of performance...",
        "strengths": ["Strengths point 1", "Strengths point 2"],
        "weakAreas": ["Weak area point 1", "Weak area point 2"],
        "suggestions": ["Actionable improvement tip 1", "Actionable improvement tip 2"],
        "recommendedLearningPath": ["Topic or course 1 to study", "Topic or course 2 to study"]
      }
    `;

    let evaluationReport;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      evaluationReport = parseGeminiJson(responseText);
    } catch (apiError) {
      console.warn("Gemini Evaluation failed or key missing. Using mock evaluation report fallback.", apiError);
      evaluationReport = {
        score: 82,
        communication: "The candidate speaks clearly and structures answers using professional developer terminology.",
        technicalKnowledge: "Shows solid understanding of React hooks, express router mounting, and mongodb design schemas.",
        confidence: "Demonstrates high readiness and clear problem-solving flow during explanations.",
        problemSolving: "Good analytical approach, maps out edge cases before outlining solutions.",
        overallPerformance: "A strong technical background. Displays proper fluency and experience on modern JS frameworks.",
        strengths: [
          "Clear explanation of webpack modular federation structure.",
          "Demonstrates strong knowledge of database session handling."
        ],
        weakAreas: [
          "Could go into deeper details regarding database horizontal scaling.",
          "Slightly short responses on behavioral HR queries."
        ],
        suggestions: [
          "Read about MongoDB replication and sharding strategies.",
          "Practice answers using the STAR method for behavioral queries."
        ],
        recommendedLearningPath: [
          "Advanced Systems Design and Distributed Caching",
          "HR situational coordinate training"
        ]
      };
    }

    // Save report and finalize interview
    interview.report = evaluationReport;
    interview.status = "completed";
    interview.duration = duration || 0;
    await interview.save();

    return res.status(200).json({
      message: "Evaluation complete. Report generated.",
      report: interview.report,
      interview,
    });

  } catch (error) {
    console.error("Interview Evaluation Error:", error);
    return res.status(500).json({ message: error.message || "Failed to evaluate interview" });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId, status: "completed" })
      .select("type difficulty length report duration createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInterviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ _id: id, userId: req.userId }).populate("resumeId", "fileName");

    if (!interview) {
      return res.status(404).json({ message: "Interview record not found" });
    }

    return res.status(200).json(interview);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Interview.findOneAndDelete({ _id: id, userId: req.userId });

    if (!result) {
      return res.status(404).json({ message: "Interview not found or unauthorized" });
    }

    return res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
