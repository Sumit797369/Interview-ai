import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

// Plans configuration
const PLANS = {
  starter: { price: 99, credits: 10 },
  pro: { price: 299, credits: 50 },
  unlimited: { price: 999, credits: 200 },
};

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const { price, credits } = PLANS[plan];
    const amount = price * 100; // in paise

    const razorpay = getRazorpayInstance();

    let orderId;
    let isMock = false;

    if (razorpay) {
      const options = {
        amount,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    } else {
      console.warn("Razorpay credentials missing. Using mock payment workflow.");
      orderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      isMock = true;
    }

    // Save pending payment record in DB
    const newPayment = await Payment.create({
      userId: req.userId,
      plan,
      amount: price,
      credits,
      status: "pending",
      razorpayOrderId: orderId,
    });

    return res.status(201).json({
      message: "Order initialized",
      orderId,
      amount,
      currency: "INR",
      plan,
      isMock,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKeyId123",
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ message: error.message || "Failed to create payment order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, userId: req.userId });
    if (!payment) {
      return res.status(404).json({ message: "Payment order record not found" });
    }

    if (payment.status === "completed") {
      return res.status(400).json({ message: "Payment has already been processed" });
    }

    const razorpay = getRazorpayInstance();

    // Verification step
    if (razorpay_order_id.startsWith("order_mock_")) {
      // Simulate mock payment success
      payment.status = "completed";
      payment.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
    } else {
      if (!razorpay) {
        return res.status(500).json({ message: "Payment gateway is not configured" });
      }

      // Verify cryptographic signature
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpay_signature) {
        payment.status = "failed";
        await payment.save();
        return res.status(400).json({ message: "Payment verification failed: Signature mismatch" });
      }

      payment.status = "completed";
      payment.razorpayPaymentId = razorpay_payment_id;
    }

    await payment.save();

    // Add credits to user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.credits += payment.credits;
    await user.save();

    return res.status(200).json({
      message: "Payment verified successfully. Credits updated.",
      creditsRemaining: user.credits,
      payment,
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ message: error.message || "Failed to verify payment" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Payment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
