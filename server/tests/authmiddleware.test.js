import { describe, it, expect, vi, beforeEach } from "vitest"
import { isAuth } from "../middleware/authmiddleware.js"
import jwt from "jsonwebtoken"

vi.mock("jsonwebtoken")

describe("isAuth Middleware", () => {
  let req, res, next

  beforeEach(() => {
    req = {
      cookies: {}
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  it("should return 401 if token is not present in cookies", () => {
    isAuth(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" })
    expect(next).not.toHaveBeenCalled()
  })

  it("should call next() and set req.userId if token is valid", () => {
    req.cookies.token = "valid_token"
    jwt.verify.mockReturnValue({ id: "user123" })

    isAuth(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith("valid_token", undefined)
    expect(req.userId).toBe("user123")
    expect(next).toHaveBeenCalled()
  })

  it("should return 401 if token validation throws an error", () => {
    req.cookies.token = "invalid_token"
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid signature")
    })

    isAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" })
    expect(next).not.toHaveBeenCalled()
  })
})
