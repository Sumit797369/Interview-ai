import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import Resume from "../models/resume.model.js"
import jwt from "jsonwebtoken"

vi.mock("../models/resume.model.js")
vi.mock("jsonwebtoken")

describe("Resume Routes Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = "test_secret"
  })

  describe("GET /api/resume/latest", () => {
    it("should return 401 if unauthorized (no token)", async () => {
      const res = await request(app).get("/api/resume/latest")
      expect(res.status).toBe(401)
      expect(res.body.message).toBe("Unauthorized")
    })

    it("should return 404 if no resume is found for the user", async () => {
      jwt.verify.mockReturnValue({ id: "user123" })
      
      // Mock the Mongoose chain: Resume.findOne().sort()
      const mockQuery = {
        sort: vi.fn().mockResolvedValue(null)
      }
      Resume.findOne.mockReturnValue(mockQuery)

      const res = await request(app)
        .get("/api/resume/latest")
        .set("Cookie", ["token=valid_token"])

      expect(res.status).toBe(404)
      expect(res.body.message).toBe("No analyzed resume found for this user")
      expect(Resume.findOne).toHaveBeenCalledWith({ userId: "user123" })
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 })
    })

    it("should return 200 and the resume if found", async () => {
      jwt.verify.mockReturnValue({ id: "user123" })
      
      const mockResume = {
        _id: "resume999",
        userId: "user123",
        fileName: "resume.pdf",
        extractedText: "Some resume text",
        analysis: {
          skills: ["React", "Node.js"],
          experienceLevel: "Intermediate",
          strengths: [],
          weaknesses: [],
          suggestedQuestions: []
        }
      }

      const mockQuery = {
        sort: vi.fn().mockResolvedValue(mockResume)
      }
      Resume.findOne.mockReturnValue(mockQuery)

      const res = await request(app)
        .get("/api/resume/latest")
        .set("Cookie", ["token=valid_token"])

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockResume)
    })
  })
})
