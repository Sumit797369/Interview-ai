import express from "express";
import { isAuth } from "../middleware/authmiddleware.js";
import {
  generateInterview,
  submitAnswer,
  endAndEvaluate,
  getInterviews,
  getInterviewDetail,
  deleteInterview,
} from "../controller/interview.controller.js";

const interviewRouter = express.Router();

// Define interview routes protected by authorization middleware
interviewRouter.post("/generate", isAuth, generateInterview);
interviewRouter.put("/:id/answer", isAuth, submitAnswer);
interviewRouter.post("/:id/end", isAuth, endAndEvaluate);
interviewRouter.get("/", isAuth, getInterviews);
interviewRouter.get("/:id", isAuth, getInterviewDetail);
interviewRouter.delete("/:id", isAuth, deleteInterview);

export default interviewRouter;
