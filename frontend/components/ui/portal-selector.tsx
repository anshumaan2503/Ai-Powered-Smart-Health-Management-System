'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BuildingOffice2Icon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export function PortalSelector() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Choose Your Portal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hospital Portal */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/hospital/login"
            className="block p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="text-center">
              <BuildingOffice2Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900 mb-1">Hospital Portal</h4>
              <p className="text-sm text-blue-700 mb-3">
                For hospital staff and administrators
              </p>
              <div className="flex items-center justify-center text-blue-600 text-sm font-medium">
                Login as Hospital
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Patient Portal */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/patient/login"
            className="block p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200"
          >
            <div className="text-center">
              <UserIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900 mb-1">Patient Portal</h4>
              <p className="text-sm text-green-700 mb-3">
                For patients to access their records
              </p>
              <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                Login as Patient
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          New to MediCare Pro?{' '}
          <Link href="/auth" className="font-medium text-blue-600 hover:text-blue-500">
            Learn more about our portals
          </Link>
        </p>
      </div>
    </div>
  )
}