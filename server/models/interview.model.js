import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    default: "",
  },
  feedback: {
    type: String,
    default: "",
  },
  score: {
    type: Number,
    default: 0,
  },
});

const reportSchema = new mongoose.Schema({
  score: {
    type: Number,
    default: 0,
  },
  communication: {
    type: String,
    default: "",
  },
  technicalKnowledge: {
    type: String,
    default: "",
  },
  confidence: {
    type: String,
    default: "",
  },
  problemSolving: {
    type: String,
    default: "",
  },
  overallPerformance: {
    type: String,
    default: "",
  },
  strengths: {
    type: [String],
    default: [],
  },
  weakAreas: {
    type: [String],
    default: [],
  },
  suggestions: {
    type: [String],
    default: [],
  },
  recommendedLearningPath: {
    type: [String],
    default: [],
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    type: {
      type: String,
      enum: ["technical", "hr", "mixed"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    report: {
      type: reportSchema,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // in seconds
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
