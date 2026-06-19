import express from "express";
import { isAuth } from "../middleware/authmiddleware.js";
import { updateProfile, getStats, changePassword, deleteAccount } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.put("/profile", isAuth, updateProfile);
userRouter.get("/stats", isAuth, getStats);
userRouter.put("/change-password", isAuth, changePassword);
userRouter.delete("/delete-account", isAuth, deleteAccount);

export default userRouter;
