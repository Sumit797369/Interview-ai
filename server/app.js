import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import resumeRouter from "./routes/resume.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import userRouter from "./routes/user.route.js"

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/resume", resumeRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/user", userRouter)

app.get("/", (req, res) => {
  return res.json({ message: "server has started" })
})

export default app
