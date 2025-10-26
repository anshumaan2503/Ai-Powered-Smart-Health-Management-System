'use client'

import { motion } from 'framer-motion'

interface PricingToggleProps {
  isAnnual: boolean
  setIsAnnual: (value: boolean) => void
}

export default function PricingToggle({ isAnnual, setIsAnnual }: PricingToggleProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center justify-center space-x-4 mb-12"
    >
      <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
        Monthly
      </span>
      
      <button
        onClick={() => setIsAnnual(!isAnnual)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isAnnual ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <motion.span
          layout
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          animate={{
            x: isAnnual ? 24 : 4
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </button>
      
      <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
        Annual
      </span>
      
      {isAnnual && (
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm"
        >
          Save 20%
        </motion.span>
      )}
    </motion.div>
  )
}