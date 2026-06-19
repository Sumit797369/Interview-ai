import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Coins,
  ShieldCheck,
  CreditCard,
  Zap,
  HelpCircle,
  X,
  Bot,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Pricing = () => {
  const { user, setUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null); // 'starter', 'pro', 'unlimited' or null

  // Mock checkout modal details
  const [mockCheckout, setMockCheckout] = useState(null); // { orderId, plan, amount } or null
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Dynamic loading script helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (plan) => {
    try {
      setLoadingPlan(plan);
      const response = await axios.post("http://localhost:8000/api/payment/order", { plan });
      const orderData = response.data;

      if (orderData.isMock) {
        // Show developer checkout simulation modal
        setMockCheckout({
          orderId: orderData.orderId,
          plan: orderData.plan,
          amount: orderData.amount,
        });
      } else {
        // Real Razorpay setup
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Razorpay SDK failed to load. Are you offline?");
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "IntervuAI",
          description: `Top-up credits: ${plan} plan`,
          order_id: orderData.orderId,
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#10b981", // emerald-500
          },
          handler: async function (res) {
            try {
              setVerifyingPayment(true);
              const verifyRes = await axios.post("http://localhost:8000/api/payment/verify", {
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
              });

              setUser((prev) => ({
                ...prev,
                credits: verifyRes.data.creditsRemaining,
              }));

              toast.success(`Success! Added credits to your account.`);
            } catch (err) {
              console.error(err);
              toast.error(err.response?.data?.message || "Payment verification failed");
            } finally {
              setVerifyingPayment(false);
            }
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to initialize checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  // Mock Success Action Handler
  const handleMockSuccess = async () => {
    if (!mockCheckout) return;

    try {
      setVerifyingPayment(true);
      const response = await axios.post("http://localhost:8000/api/payment/verify", {
        razorpay_order_id: mockCheckout.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: "mock_signature_verified",
      });

      setUser((prev) => ({
        ...prev,
        credits: response.data.creditsRemaining,
      }));

      toast.success("Mock payment successful! Credits added.");
      setMockCheckout(null);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Mock verification failed");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const PLANS_LIST = [
    {
      id: "starter",
      name: "Starter Package",
      price: "₹99",
      credits: 10,
      badge: "One-time",
      desc: "For candidates looking for a quick mock test run before a job interview call.",
      features: [
        "10 Mock Interview Credits",
        "Full resume parsing details",
        "Communication feedback logs",
        "Auto-saved question histories",
      ],
      color: "border-slate-200 bg-white shadow-sm",
      btnText: "Purchase Starter",
    },
    {
      id: "pro",
      name: "Professional Hunt",
      price: "₹299",
      credits: 50,
      badge: "Popular / Best Value",
      desc: "Best for active software engineers applying and interviewing for engineering positions.",
      features: [
        "50 Mock Interview Credits",
        "Resume gaps mapping dashboard",
        "Technical & HR mock categories",
        "Detailed Gemini performance reports",
        "Actionable improvement suggestions",
        "Curated learning roadmaps",
      ],
      color: "border-emerald-500/50 bg-white shadow-lg shadow-emerald-500/10",
      btnText: "Get Pro Access",
    },
    {
      id: "unlimited",
      name: "Unlimited Mastery",
      price: "₹999",
      credits: 200,
      badge: "Bulk Prep",
      desc: "Designed for intensive bootcamp preps, career transitions, and deep engineering runs.",
      features: [
        "200 Mock Interview Credits",
        "All resume parsing and analyses",
        "Priority question generation queue",
        "Advanced score radars & progress charts",
        "PDF download report directories",
      ],
      color: "border-slate-200 bg-white shadow-sm",
      btnText: "Unlock Unlimited",
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Mock payment modal overlay */}
      <AnimatePresence>
        {mockCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white border border-slate-200 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl"
            >
              <button
                onClick={() => setMockCheckout(null)}
                className="absolute top-5 right-5 text-slate-500 hover:text-slate-800"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6">
                <CreditCard size={22} />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Developer Payment Simulator</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                You are purchasing the <strong className="text-emerald-600 capitalize">{mockCheckout.plan}</strong> plan for <strong>{PLANS_LIST.find(p => p.id === mockCheckout.plan).price}</strong>.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleMockSuccess}
                  disabled={verifyingPayment}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 rounded-2xl transition disabled:opacity-50 text-xs cursor-pointer shadow-md"
                >
                  {verifyingPayment ? "Processing Verification..." : "Simulate Successful Payment"}
                </button>
                <button
                  onClick={() => {
                    toast.error("Payment cancelled by simulated user");
                    setMockCheckout(null);
                  }}
                  disabled={verifyingPayment}
                  className="w-full bg-white border border-slate-200 hover:border-red-500 hover:text-red-500 text-slate-500 font-semibold py-3.5 rounded-2xl transition text-xs cursor-pointer shadow-sm"
                >
                  Simulate Cancellation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verifying overlay (For Real Payments) */}
      <AnimatePresence>
        {verifyingPayment && !mockCheckout && (
          <div className="fixed inset-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-800">Verifying transaction signature...</p>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pricing Top-up plans</h1>
          <p className="text-sm text-slate-500 mt-1">
            Top up your account balance instantly. Unlock detailed Gemini reports.
          </p>
        </div>

        {/* Mapped stats */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold shadow-sm">
          <Coins size={16} className="text-amber-500" />
          <span>Active: {user.credits} Credits</span>
        </div>
      </div>

      {/* Plans Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {PLANS_LIST.map((plan) => {
          const isPro = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`p-8 rounded-[36px] border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${plan.color}`}
            >
              {isPro && (
                <span className="absolute top-4 right-6 bg-emerald-500 text-white text-[9px] uppercase font-black px-2.5 py-1 rounded-md tracking-wider">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-none">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className={`text-4xl font-black ${isPro ? "text-emerald-600" : "text-slate-800"}`}>
                    {plan.price}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">one-time</span>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed mt-4 mb-6">{plan.desc}</p>
                <div className="h-px bg-slate-100 mb-6" />

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                  isPro
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/15"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <Zap size={13} fill="currentColor" />
                {loadingPlan === plan.id ? "Initializing Checkout..." : plan.btnText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Transaction Security badges */}
      <div className="w-full border border-slate-200 bg-white p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={20} className="text-emerald-500" />
          <p className="text-xs text-slate-500 leading-normal">
            Transactions are secured and verified with <strong>Razorpay Payment Gateway</strong> cryptographic signatures.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span>Secure SSL</span>
          <span>&bull;</span>
          <span>Instant Crediting</span>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
