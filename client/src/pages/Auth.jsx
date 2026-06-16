import React, { useState } from 'react'
import { LiaRobotSolid } from "react-icons/lia";
import { IoSparklesSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { motion } from "motion/react";
import { toast } from 'react-toastify';
import { auth, provider } from '../../firebase';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';

const Auth = () => {
    const [errorMsg, setErrorMsg] = useState("");

    const handleGoogleAuth = async () => {
    try {
      setErrorMsg("");

      const result = await signInWithPopup(auth, provider);
console.log(result);

    //   await axios.post(
    //     `${serverUrl}/api/auth/google`,
    //     {
    //       name: result.user.displayName,
    //       email: result.user.email,
    //       avatar: result.user.photoURL,
    //     },
    //     {
    //       withCredentials: true,
    //     },
    //   );

      toast.success("Logged in with Google!");
    //   window.location.reload();
    //   onclose();
    } catch (error) {
        console.log(error);
        
    //   if (error.code !== "auth/popup-closed-by-user") {
    //     handleFirebaseError(error);

    //     toast.error(error.message || "Google auth failed");
    //   }
    }
  };
  return (
    <div className='w-full min-h-screen bg-[#f3f3f3] flex items-cneter justify-center px-6 py-20'>
        <motion.div 
        initial={{opacity:0, y:-40 }} animate={{opacity:1 , y:0}} transition={{duration:1.01}}
        className='w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-gray-200'>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-green-500 text-white p-2 rounded-lg'>
                <LiaRobotSolid size={18}/>
                </div>
                <h2 className='font-semibold text-lg'>IntervuAI</h2>
            </div>
                <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug md-4'>
                    Continue With
                    <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                    <IoSparklesSharp size={1}/>
                    AI Smart Interview
                    </span>
                </h1>
                <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                    SignIn to start AI-Powered mock interviews,track your progress, and unlock detailed performance insights.
                </p>

                <motion.button onClick={handleGoogleAuth}
                whileHover={{opacity:0.9 , scale:1.03}} whileTap={{opacity:1 , scale:.98}}
                className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md'>
                <FcGoogle size={20}/>
                Continue with Google
                </motion.button>
        </motion.div>
      
    </div>
  )
}

export default Auth
