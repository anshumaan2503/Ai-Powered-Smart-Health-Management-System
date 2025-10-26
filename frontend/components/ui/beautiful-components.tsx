'use client'

import { 
  HeartIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

// Beautiful Card Component
export function BeautifulCard({ 
  children, 
  className = "", 
  gradient = "from-blue-400/10 to-purple-600/10" 
}: {
  children: React.ReactNode
  className?: string
  gradient?: string
}) {
  return (
    <div className={`group relative ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        {children}
      </div>
    </div>
  )
}

// Animated Icon Button
export function AnimatedIconButton({ 
  icon: Icon, 
  label, 
  onClick,
  gradient = "from-blue-500 to-blue-600",
  size = "md"
}: {
  icon: any
  label: string
  onClick?: () => void
  gradient?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14", 
    lg: "w-20 h-20"
  }

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10"
  }

  return (
    <div className="text-center group cursor-pointer" onClick={onClick}>
      <div className="relative mb-4">
        <div className={`${sizeClasses[size]} bg-gradient-to-br ${gradient} rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`${iconSizes[size]} text-white`} />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient.replace('to-', 'to-').replace('from-', 'from-')} rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-20`}></div>
      </div>
      <span className="text-gray-700 font-semibold">{label}</span>
    </div>
  )
}

// Gradient Text Component
export function GradientText({ 
  children, 
  gradient = "from-blue-600 to-purple-600",
  className = ""
}: {
  children: React.ReactNode
  gradient?: string
  className?: string
}) {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

// Feature List Component
export function FeatureList({ 
  features, 
  iconColor = "blue-500" 
}: {
  features: string[]
  iconColor?: string
}) {
  return (
    <div className="space-y-5">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-4 group/item">
          <div className={`w-8 h-8 bg-gradient-to-br from-${iconColor} to-${iconColor.replace('500', '600')} rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300`}>
            <CheckIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-gray-700 font-medium">{feature}</span>
        </div>
      ))}
    </div>
  )
}

// Stats Card Component
export function StatsCard({ 
  icon: Icon, 
  value, 
  label, 
  gradient = "from-blue-600 to-blue-700" 
}: {
  icon: any
  value: string
  label: string
  gradient?: string
}) {
  return (
    <div className="text-center group">
      <div className="relative mb-4">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-20`}></div>
      </div>
      <div className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
        {value}
      </div>
      <div className="text-gray-600 font-semibold">{label}</div>
    </div>
  )
}

// Glass Button Component
export function GlassButton({ 
  children, 
  onClick, 
  variant = "primary",
  className = ""
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "success" | "danger"
  className?: string
}) {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/25",
    secondary: "bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white hover:bg-white/20",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-green-500/25",
    danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white hover:shadow-red-500/25"
  }

  return (
    <button 
      onClick={onClick}
      className={`font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Floating Action Button
export function FloatingActionButton({ 
  icon: Icon, 
  onClick,
  gradient = "from-blue-500 to-purple-600"
}: {
  icon: any
  onClick?: () => void
  gradient?: string
}) {
  return (
    <button 
      onClick={onClick}
      className={`fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br ${gradient} rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 animate-float`}
    >
      <Icon className="h-8 w-8 text-white" />
    </button>
  )
}

// Loading Spinner Component
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  }

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="h-full w-full rounded-full border-4 border-gray-200 border-t-blue-600"></div>
    </div>
  )
}