'use client'

import { motion } from 'framer-motion'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function FeaturesComparison() {
  const features = [
    {
      category: 'Core Features',
      items: [
        { name: 'Patient Management', basic: true, standard: true, enterprise: true, custom: true },
        { name: 'Appointment Scheduling', basic: true, standard: true, enterprise: true, custom: true },
        { name: 'Basic Billing', basic: true, standard: true, enterprise: true, custom: true },
        { name: 'Medical Records', basic: true, standard: true, enterprise: true, custom: true },
        { name: 'Mobile App Access', basic: true, standard: true, enterprise: true, custom: true }
      ]
    },
    {
      category: 'Advanced Features',
      items: [
        { name: 'Analytics Dashboard', basic: false, standard: true, enterprise: true, custom: true },
        { name: 'WhatsApp Notifications', basic: false, standard: true, enterprise: true, custom: true },
        { name: 'Data Export (PDF/Excel)', basic: false, standard: true, enterprise: true, custom: true },
        { name: 'Inventory Management', basic: false, standard: true, enterprise: true, custom: true },
        { name: 'Patient Portal', basic: false, standard: true, enterprise: true, custom: true }
      ]
    },
    {
      category: 'Enterprise Features',
      items: [
        { name: 'Role-based Access Control', basic: false, standard: false, enterprise: true, custom: true },
        { name: 'Cloud Data Backup', basic: false, standard: false, enterprise: true, custom: true },
        { name: 'API Access', basic: false, standard: false, enterprise: true, custom: true },
        { name: 'Multi-location Support', basic: false, standard: false, enterprise: true, custom: true },
        { name: 'SLA Guarantee', basic: false, standard: false, enterprise: true, custom: true }
      ]
    },
    {
      category: 'Custom Features',
      items: [
        { name: 'White-label Solution', basic: false, standard: false, enterprise: false, custom: true },
        { name: 'On-premise Deployment', basic: false, standard: false, enterprise: false, custom: true },
        { name: 'Custom Integrations', basic: false, standard: false, enterprise: false, custom: true },
        { name: 'Dedicated Infrastructure', basic: false, standard: false, enterprise: false, custom: true },
        { name: 'Migration Assistance', basic: false, standard: false, enterprise: false, custom: true }
      ]
    },
    {
      category: 'Support',
      items: [
        { name: 'Email Support', basic: true, standard: true, enterprise: true, custom: true },
        { name: 'Priority Support', basic: false, standard: true, enterprise: true, custom: true },
        { name: '24/7 Phone Support', basic: false, standard: false, enterprise: true, custom: true },
        { name: 'Dedicated Account Manager', basic: false, standard: false, enterprise: true, custom: true },
        { name: 'Custom Training Program', basic: false, standard: false, enterprise: false, custom: true }
      ]
    }
  ]

  const plans = ['Basic', 'Standard', 'Enterprise', 'Custom']

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare All Features</h2>
        <p className="text-lg text-gray-600">See exactly what's included in each plan</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/3">
                  Features
                </th>
                {plans.map((plan) => (
                  <th key={plan} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    {plan}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {features.map((category, categoryIndex) => (
                <>
                  {/* Category Header */}
                  <tr key={`category-${categoryIndex}`} className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-blue-900">
                      {category.category}
                    </td>
                  </tr>
                  
                  {/* Category Items */}
                  {category.items.map((item, itemIndex) => (
                    <tr key={`${categoryIndex}-${itemIndex}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.basic ? (
                          <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.standard ? (
                          <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.enterprise ? (
                          <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.custom ? (
                          <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}