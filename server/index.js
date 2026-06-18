import dns from "dns"
dns.setServers(["8.8.8.8", "8.8.4.4"])

import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRouter from "./routes/auth.route.js"
dotenv.config()

const app = express()
app.use(express.json())
// app.use(cookieParser())
const PORT= process.env.PORT || 8000

app.use("/api/auth",authRouter)
app.get("/",(req,res)=>{
    return res.json({message : "server has started"})
})


// connectDB()
//   .then(() => {
//     app.listen(port, () => {
//       console.log("server started on port " + PORT);
//     });
//   })
//   .catch((err) => {
//     console.error("Failed to connect to DB", err);
//   });

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
    connectDB()
    
})