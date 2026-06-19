import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import DashboardLayout from './components/DashboardLayout'
import Overview from './pages/Overview'
import ResumeAnalysis from './pages/ResumeAnalysis'
import NewInterview from './pages/NewInterview'
import InterviewSession from './pages/InterviewSession'
import ReportDetail from './pages/ReportDetail'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { Bot } from 'lucide-react'

const App = () => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4 text-white">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-950/40 border-t-emerald-400 animate-spin" />
          <div className="absolute inset-2 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
            <Bot size={22} className="animate-pulse" />
          </div>
        </div>
        <div className="text-sm font-semibold text-gray-500 animate-pulse">
          Loading IntervuAI...
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/auth' element={<Auth />} />
        
        {/* Fullscreen Interview Room */}
        <Route path='/interview/:id' element={<InterviewSession />} />

        {/* Dashboard Layout & Nested Tabs */}
        <Route path='/dashboard' element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path='resume' element={<ResumeAnalysis />} />
          <Route path='new' element={<NewInterview />} />
          <Route path='history' element={<InterviewHistory />} />
          <Route path='report/:id' element={<ReportDetail />} />
          <Route path='pricing' element={<Pricing />} />
          <Route path='profile' element={<Profile />} />
          <Route path='settings' element={<Settings />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </>
  )
}

export default App
