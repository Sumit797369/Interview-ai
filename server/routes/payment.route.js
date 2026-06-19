import express from "express";
import { isAuth } from "../middleware/authmiddleware.js";
import { createOrder, verifyPayment, getTransactions } from "../controller/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/order", isAuth, createOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);
paymentRouter.get("/history", isAuth, getTransactions);

export default paymentRouter;
