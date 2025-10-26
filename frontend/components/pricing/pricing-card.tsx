'use client'

import { motion } from 'framer-motion'
import { CheckIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline'

interface Feature {
  name: string
  included: boolean
  icon?: any
}

interface PricingCardProps {
  name: string
  subtitle: string
  monthlyPrice: number | null
  annualPrice: number | null
  description: string
  limits: {
    patients: string
    doctors: string
    storage: string
  }
  features: Feature[]
  popular: boolean
  buttonText: string
  buttonStyle: string
  isAnnual: boolean
  index: number
}

export default function PricingCard({
  name,
  subtitle,
  monthlyPrice,
  annualPrice,
  description,
  limits,
  features,
  popular,
  buttonText,
  buttonStyle,
  isAnnual,
  index
}: PricingCardProps) {
  const getPrice = () => {
    if (monthlyPrice === null) return null
    return isAnnual ? annualPrice : monthlyPrice
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
        popular ? 'ring-2 ring-blue-500 scale-105' : ''
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <StarIcon className="h-4 w-4 mr-1" />
            Most Popular
          </span>
        </div>
      )}

      <div className="p-8">
        {/* Plan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
          
          {/* Price */}
          <div className="mb-4">
            {monthlyPrice === null ? (
              <div className="text-3xl font-bold text-gray-900">Custom Pricing</div>
            ) : (
              <>
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(getPrice()!)}
                </div>
                <div className="text-sm text-gray-600">
                  per {isAnnual ? 'year' : 'month'}
                </div>
                {isAnnual && monthlyPrice && annualPrice && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Save {formatPrice(monthlyPrice * 12 - annualPrice)} annually
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Limits */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Plan Limits</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              {limits.patients}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              {limits.doctors}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              {limits.storage}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Features included</h4>
          <ul className="space-y-3">
            {features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 transition-colors ${
                  feature.included 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {feature.included ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : (
                    <XMarkIcon className="h-3 w-3" />
                  )}
                </div>
                <span className={`text-sm transition-colors ${
                  feature.included ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${buttonStyle}`}
        >
          {buttonText}
        </motion.button>

        {name !== 'Custom' && (
          <p className="text-xs text-gray-500 text-center mt-3">
            14-day free trial • No credit card required
          </p>
        )}
      </div>
    </motion.div>
  )
}