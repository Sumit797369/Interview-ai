import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

vi.mock("../models/user.model.js")
vi.mock("bcryptjs")
vi.mock("jsonwebtoken")

describe("Auth Routes Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = "test_secret"
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      User.findOne.mockResolvedValue(null)
      bcrypt.hash.mockResolvedValue("hashed_password")
      User.create.mockResolvedValue({
        _id: "user123",
        name: "Test User",
        email: "test@example.com",
        password: "hashed_password"
      })

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", email: "test@example.com", password: "password123" })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe("User registered successfully")
      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" })
      expect(User.create).toHaveBeenCalled()
    })

    it("should return 400 if user already exists", async () => {
      User.findOne.mockResolvedValue({ email: "test@example.com" })

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", email: "test@example.com", password: "password123" })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe("User already exists")
      expect(User.create).not.toHaveBeenCalled()
    })
  })

  describe("POST /api/auth/login", () => {
    it("should log in successfully and set httpOnly cookie", async () => {
      const mockUser = {
        _id: "user123",
        name: "Test User",
        email: "test@example.com",
        password: "hashed_password",
        provider: "local"
      }
      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue("mock_token")

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: "user123",
        name: "Test User",
        email: "test@example.com"
      })
      // Verify cookie is set
      const cookies = res.headers["set-cookie"]
      expect(cookies).toBeDefined()
      expect(cookies[0]).toContain("token=mock_token")
      expect(cookies[0]).toContain("HttpOnly")
    })

    it("should return 400 if user does not exist", async () => {
      User.findOne.mockResolvedValue(null)

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe("User not found")
    })

    it("should return 400 if password does not match", async () => {
      User.findOne.mockResolvedValue({
        _id: "user123",
        email: "test@example.com",
        password: "hashed_password",
        provider: "local"
      })
      bcrypt.compare.mockResolvedValue(false)

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe("Invalid credentials")
    })
  })

  describe("GET /api/auth/logout", () => {
    it("should clear cookie and log out successfully", async () => {
      const res = await request(app).get("/api/auth/logout")

      expect(res.status).toBe(200)
      expect(res.body.message).toBe("Logged out successfully")
      
      const cookies = res.headers["set-cookie"]
      expect(cookies).toBeDefined()
      expect(cookies[0]).toContain("token=;")
    })
  })
})
