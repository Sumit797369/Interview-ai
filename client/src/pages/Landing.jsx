import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  ArrowRight,
  Check,
  ChevronDown,
  Bot,
  HelpCircle,
  FileText,
  LineChart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the AI conduct the interviews?",
      answer:
        "Once you upload your resume, our agent extracts your skills, level, and experience. It dynamically drafts custom questions probing your unique background in a conversational chat interface, adjusting to your chosen difficulty.",
    },
    {
      question: "Will I get feedback after the session?",
      answer:
        "Yes, immediately! Our AI evaluator scores your performance out of 100 and breaks down your Communication, Technical Depth, confidence indicators, and problem-solving skills, listing exact suggestions and a customized learning path.",
    },
    {
      question: "Can I try it for free?",
      answer:
        "Every new user receives 5 free credits on registration. 1 credit allows you to conduct 1 complete, tailored mock interview session with comprehensive report analytics.",
    },
    {
      question: "How does Razorpay integration work?",
      answer:
        "You can securely top up your credits using our pricing panel via Razorpay. Credits are instantly credited to your user profile upon successful transaction confirmation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Top Navbar */}
      <nav className="w-full sticky top-0 z-50 border-b border-slate-200/80 bg-[#F8FAFC]/75 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Bot size={22} className="stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            IntervuAI
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 text-sm"
            >
              Go to Dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-slate-500 hover:text-slate-900 transition text-sm font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm shadow-md shadow-emerald-500/10"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center z-10">
        {/* Animated Gradient Glows */}
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-[10%] left-[20%] w-[250px] h-[250px] rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold mb-6 uppercase tracking-wider">
            <Sparkles size={13} className="animate-pulse" /> AI-powered Career Prep
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent leading-[1.15] mb-6">
            Practice Interviews <br className="hidden md:block" />
            With <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">AI Interview Agent</span>
          </h1>

          <p className="text-slate-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your resume and get personalized technical and HR interview sessions powered by Gemini AI. Get real-time analysis, scores, and clear feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/15"
            >
              Start Free Today <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-4 px-8 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <Play size={16} fill="currentColor" /> Watch Demo
            </a>
          </div>
        </motion.div>
      </section>

      {/* Preview Section */}
      <section id="preview" className="px-6 max-w-5xl mx-auto pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-md p-2 shadow-2xl shadow-slate-200"
        >
          {/* Glass Card Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs text-slate-400 font-mono">intervuai.com/session</div>
            <div className="w-12" />
          </div>

          {/* Dummy UI Screenshot / Mock */}
          <div className="bg-slate-50 p-6 text-left font-sans flex flex-col md:flex-row gap-6 min-h-[350px]">
            {/* Sidebar list */}
            <div className="w-full md:w-1/4 border-r border-slate-200 pr-4 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Questions</h4>
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">1</span>
                  Project Architecture
                </div>
                <div className="p-3 bg-white border border-slate-200 text-slate-500 text-xs rounded-lg flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">2</span>
                  Redux State Management
                </div>
                <div className="p-3 bg-white border border-slate-200 text-slate-500 text-xs rounded-lg flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
                  Performance Tuning
                </div>
              </div>
            </div>

            {/* Chat screen */}
            <div className="flex-1 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mb-1">
                    <Bot size={14} /> AI Interviewer
                  </div>
                  <p className="text-sm text-slate-600">
                    "I see on your resume that you architected a micro-frontend structure at your last company. Can you explain the strategies you used to handle routing and shared dependencies?"
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl max-w-xl ml-auto text-right">
                  <div className="text-xs text-slate-500 font-semibold mb-1">You</div>
                  <p className="text-sm text-emerald-700">
                    "We implemented Module Federation inside Webpack to expose entry points. For shared state, we utilized a lightweight custom event bus to exchange core credentials..."
                  </p>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-2 items-center border-t border-slate-100 pt-4">
                <input
                  type="text"
                  placeholder="Type your structured answer here..."
                  disabled
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none text-slate-400"
                />
                <button className="bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 opacity-80 cursor-not-allowed">
                  Send <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-slate-50/50 border-t border-b border-slate-100 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Core Platform Capabilities</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Everything you need to master your technical or soft-skill interviews, all in one premium dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/20 transition-all duration-300 group hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <FileText size={20} />
              </div>
              <h3 className="text-xl font-bold mb-2">Resume Parsing</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Upload your resume PDF. Our parser reads it instantly, creating a customized career profile mapping your exact skills and experience gaps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/20 transition-all duration-300 group hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <Brain size={20} />
              </div>
              <h3 className="text-xl font-bold mb-2">Adaptive Questions</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Get custom-tailored questions covering technical stacks or HR scenarios, mapped exactly to your resume strengths and weaknesses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/20 transition-all duration-300 group hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <LineChart size={20} />
              </div>
              <h3 className="text-xl font-bold mb-2">Deep Score Analysis</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Review overall feedback reports, metrics charts, radar breakdowns, and recommended learning directions immediately on finishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Get from upload to deep analytics feedback in three simple steps.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          <div className="flex-1 p-8 rounded-3xl border border-slate-200 bg-white relative shadow-sm">
            <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 select-none">01</span>
            <h4 className="text-lg font-bold mb-2 text-emerald-600">Upload PDF Resume</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Drag and drop your PDF resume file. Our engine parses the text and builds your core strengths profile.
            </p>
          </div>

          <div className="flex-1 p-8 rounded-3xl border border-slate-200 bg-white relative shadow-sm">
            <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 select-none">02</span>
            <h4 className="text-lg font-bold mb-2 text-emerald-600">Conduct Mock Session</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Choose difficulty and category (Technical, HR, or Mixed) and start an interactive chat interview with our AI.
            </p>
          </div>

          <div className="flex-1 p-8 rounded-3xl border border-slate-200 bg-white relative shadow-sm">
            <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 select-none">03</span>
            <h4 className="text-lg font-bold mb-2 text-emerald-600">Review Analytics Report</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Get an overall score out of 100 with radar breakdowns, suggested answers, and a curated study path.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Get instant access to top-up interview credits. Unlock your career potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Starter</h3>
                <div className="text-3xl font-extrabold mb-4 text-slate-800">
                  ₹99 <span className="text-sm font-normal text-slate-400">/ one-time</span>
                </div>
                <p className="text-slate-500 text-sm mb-6">Great for quick brush-ups before a short call.</p>
                <div className="h-px bg-slate-100 mb-6" />
                <ul className="space-y-3 text-sm text-slate-500 mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> 10 Interview Credits
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Resume parsing & analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Basic PDF score reports
                  </li>
                </ul>
              </div>
              <Link
                to={user ? "/dashboard/pricing" : "/auth"}
                className="w-full bg-slate-900 hover:bg-slate-800 text-center text-white py-3 rounded-xl font-semibold transition"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/10 flex flex-col justify-between relative">
              <span className="absolute top-4 right-6 bg-emerald-500 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-md">
                Popular
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Pro</h3>
                <div className="text-3xl font-extrabold mb-4 text-emerald-600">
                  ₹299 <span className="text-sm font-normal text-slate-400">/ one-time</span>
                </div>
                <p className="text-slate-500 text-sm mb-6">Best for active job hunters applying for developer roles.</p>
                <div className="h-px bg-slate-100 mb-6" />
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> 50 Interview Credits
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Personalized questions list
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Full evaluation summaries
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Customized learning paths
                  </li>
                </ul>
              </div>
              <Link
                to={user ? "/dashboard/pricing" : "/auth"}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-center text-white py-3 rounded-xl font-bold transition shadow-md shadow-emerald-500/20"
              >
                Go Pro
              </Link>
            </div>

            {/* Unlimited Plan */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Unlimited</h3>
                <div className="text-3xl font-extrabold mb-4 text-slate-800">
                  ₹999 <span className="text-sm font-normal text-slate-400">/ one-time</span>
                </div>
                <p className="text-slate-500 text-sm mb-6">Designed for career transitions and bootcamps.</p>
                <div className="h-px bg-slate-100 mb-6" />
                <ul className="space-y-3 text-sm text-slate-500 mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> 200 Interview Credits
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Priority question generation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Advanced score analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> 24/7 Premium AI response
                  </li>
                </ul>
              </div>
              <Link
                to={user ? "/dashboard/pricing" : "/auth"}
                className="w-full bg-slate-900 hover:bg-slate-800 text-center text-white py-3 rounded-xl font-semibold transition"
              >
                Unlock Unlimited
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 shadow-sm"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-slate-700 hover:text-slate-900 transition"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform duration-300 ${
                    activeFaq === index ? "rotate-180 text-emerald-500" : ""
                  }`}
                />
              </button>

              {activeFaq === index && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-28 pt-10 text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-12 rounded-[40px] shadow-2xl shadow-slate-200/50">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-800">
            Ready to ace your next round?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            Register in seconds and unlock 5 free interview sessions to start sharpening your skills under real-world interview conditions.
          </p>
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition duration-200 shadow-md shadow-emerald-500/10"
          >
            Start Free Practice <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 px-6 py-10 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">IntervuAI</span>
            <span>&bull;</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="#" className="hover:text-slate-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
