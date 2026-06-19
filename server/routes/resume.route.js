import express from "express";
import multer from "multer";
import { isAuth } from "../middleware/authmiddleware.js";
import { uploadAndAnalyze, getLatestResume } from "../controller/resume.controller.js";

const resumeRouter = express.Router();

// Configure Multer storage (in-memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Route for resume upload and analysis
resumeRouter.post("/upload", isAuth, (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadAndAnalyze);

// Route to get user's latest analyzed resume
resumeRouter.get("/latest", isAuth, getLatestResume);

export default resumeRouter;
