import React from 'react'
import { LiaRobotSolid } from "react-icons/lia";

const Auth = () => {
  return (
    <div className='w-full min-h-screen bg-[#f3f3f3] flex items-cneter justify-center px-6 py-20'>
        <div className='w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-gray-200'>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-green-500 text-white p-2 rounded-lg'>
                <LiaRobotSolid size={18}/>
                </div>
                <h2>InterviewIQ.AI</h2>
            </div>

        </div>
      
    </div>
  )
}

export default Auth
