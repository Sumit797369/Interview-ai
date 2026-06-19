import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
name:{
    type: String,
    required:true,
},
email:{
    type: String,
    unique:true,
    required:true,
},
 password: {
    type: String,
    default: null, 
  },

  avatar: {
    type: String,
  },
  provider: {
    type: String,
    enum: ["google", "local"],
    default: "local",
  },
  credits: {
    type: Number,
    default: 5,
  },


}, {timestamps:true})

const User = mongoose.model("User",userSchema)

export default User