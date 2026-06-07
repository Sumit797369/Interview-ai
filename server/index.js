import express from "express"
import dotenv from "dotenv"
dotenv.config()

const app = express()

const PORT= process.env.PORT || 8000

app.get("/",(req,res)=>{
    return res.json({message : "server has started"})
})

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
    
})