'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden'

    // Control the reveal timing
    const timer = setTimeout(() => {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
    }, 4200)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -100,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden"
        >
          {/* Subtle Light Atmospheric Background */}
          <div className="absolute inset-0">
            <m.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px]" 
            />
            <m.div 
              animate={{ 
                scale: [1.1, 1, 1.1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px]" 
            />
          </div>

          <div className="relative flex flex-col items-center">
            {/* 3D Animated Icon */}
            <m.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: 0,
                opacity: 1,
              }}
              transition={{ 
                duration: 1.5, 
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.2 
              }}
              className="relative mb-8"
            >
              {/* Glow Rings */}
              <m.div
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 border-2 border-blue-500 rounded-2xl"
              />
              <m.div
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 border-2 border-purple-500 rounded-2xl"
              />
              
              {/* Main Icon Container */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center">
                <HeartIcon className="w-12 h-12 text-white" strokeWidth={2.5} />
                
                {/* 3D Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl" />
              </div>
            </m.div>

            {/* Branding Reveal */}
            <div className="overflow-hidden py-2">
              <m.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
                className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 text-center flex items-center"
              >
                <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  MediCare
                </span>
                <m.span 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="ml-3 text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  Pro
                </m.span>
              </m.h1>
            </div>

            {/* Subtext Reveal */}
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 2.2, duration: 1 }}
              className="mt-4 text-slate-500 font-semibold tracking-[0.3em] uppercase text-[10px]"
            >
              Future of Healthcare Excellence
            </m.p>

            {/* Progress Bar */}
            <div className="mt-12 w-48 h-[3px] bg-slate-100 rounded-full overflow-hidden relative">
              <m.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 2.5, 
                  delay: 1.5,
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600 to-transparent"
              />
            </div>
          </div>
          
          {/* Discrete Texture Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:20px_20px]" />
        </m.div>
      )}
    </AnimatePresence>
  )
}
