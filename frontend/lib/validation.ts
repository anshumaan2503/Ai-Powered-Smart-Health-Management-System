// Enhanced validation utilities for hospital settings
import { z } from 'zod'
import React from 'react'

// Phone number validation for Indian format
export const phoneSchema = z.string()
  .regex(/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number (+91XXXXXXXXXX)')

// Email validation
export const emailSchema = z.string()
  .email('Please enter a valid email address')

// Operating hours validation
export const operatingHoursSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  closed: z.boolean()
}).refine((data) => {
  if (data.closed) return true
  const openTime = new Date(`1970-01-01T${data.open}:00`)
  const closeTime = new Date(`1970-01-01T${data.close}:00`)
  return closeTime > openTime
}, {
  message: 'Closing time must be after opening time',
  path: ['close']
})

// Hospital settings validation schema
export const hospitalSettingsSchema = z.object({
  // Hospital Information
  name: z.string().min(1, 'Hospital name is required').max(100, 'Hospital name too long'),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  phone: phoneSchema,
  email: emailSchema,
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  license_number: z.string().min(1, 'License number is required'),
  established_year: z.string()
    .regex(/^\d{4}$/, 'Please enter a valid year')
    .refine((year) => {
      const currentYear = new Date().getFullYear()
      const yearNum = parseInt(year)
      return yearNum >= 1900 && yearNum <= currentYear
    }, 'Year must be between 1900 and current year'),

  // Operating Hours
  operating_hours: z.object({
    monday: operatingHoursSchema,
    tuesday: operatingHoursSchema,
    wednesday: operatingHoursSchema,
    thursday: operatingHoursSchema,
    friday: operatingHoursSchema,
    saturday: operatingHoursSchema,
    sunday: operatingHoursSchema
  }),

  // Appointment Settings
  appointment_duration: z.number().min(15, 'Minimum 15 minutes').max(240, 'Maximum 4 hours'),
  advance_booking_days: z.number().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days'),
  cancellation_hours: z.number().min(1, 'Minimum 1 hour').max(168, 'Maximum 7 days'),

  // Notification Settings
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  appointment_reminders: z.boolean(),
  payment_notifications: z.boolean(),

  // Security Settings
  password_expiry_days: z.number().min(30, 'Minimum 30 days').max(365, 'Maximum 365 days'),
  max_login_attempts: z.number().min(3, 'Minimum 3 attempts').max(10, 'Maximum 10 attempts'),
  session_timeout_minutes: z.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours'),
  two_factor_auth: z.boolean(),

  // Billing Settings
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP'], {
    errorMap: () => ({ message: 'Please select a valid currency' })
  }),
  tax_rate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
  payment_methods: z.array(z.string()).min(1, 'At least one payment method is required'),

  // System Settings
  timezone: z.string().min(1, 'Timezone is required'),
  date_format: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], {
    errorMap: () => ({ message: 'Please select a valid date format' })
  }),
  time_format: z.enum(['12h', '24h'], {
    errorMap: () => ({ message: 'Please select a valid time format' })
  }),
  language: z.string().min(1, 'Language is required')
})

// Validation error type
export interface ValidationErrors {
  [key: string]: string | ValidationErrors
}

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

// Validate a single field
export function validateField(
  schema: z.ZodSchema,
  value: any,
  fieldPath: string
): ValidationResult {
  try {
    schema.parse(value)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {}
      error.errors.forEach((err) => {
        const path = err.path.length > 0 ? err.path.join('.') : fieldPath
        errors[path] = err.message
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { [fieldPath]: 'Validation error' } }
  }
}

// Validate entire settings object
export function validateSettings(settings: any): ValidationResult {
  try {
    hospitalSettingsSchema.parse(settings)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { general: 'Validation error' } }
  }
}

// Get nested error message
export function getErrorMessage(errors: ValidationErrors, path: string): string | undefined {
  const keys = path.split('.')
  let current: any = errors
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  
  return typeof current === 'string' ? current : undefined
}

// Debounced validation hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Form validation hook
export function useFormValidation<T>(
  initialValues: T,
  validationSchema: z.ZodSchema<T>
) {
  const [values, setValues] = React.useState<T>(initialValues)
  const [errors, setErrors] = React.useState<ValidationErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [isDirty, setIsDirty] = React.useState(false)

  const debouncedValues = useDebounce(values, 300)

  // Validate on debounced value changes
  React.useEffect(() => {
    if (isDirty) {
      const result = validateSettings(debouncedValues)
      setErrors(result.errors)
    }
  }, [debouncedValues, isDirty, validationSchema])

  const setValue = React.useCallback((field: string, value: any) => {
    setValues(prev => {
      const keys = field.split('.')
      const newValues = { ...prev }
      let current: any = newValues
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newValues
    })
    
    setTouched(prev => ({ ...prev, [field]: true }))
    setIsDirty(true)
  }, [])

  const validateField = React.useCallback((field: string) => {
    const keys = field.split('.')
    let current: any = values
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return
      }
    }

    // Validate the specific field
    try {
      const fieldSchema = getFieldSchema(validationSchema, field)
      if (fieldSchema) {
        fieldSchema.parse(current)
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0]?.message || 'Validation error'
        }))
      }
    }
  }, [values, validationSchema])

  const reset = React.useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsDirty(false)
  }, [initialValues])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isDirty,
    isValid,
    setValue,
    validateField,
    reset,
    getErrorMessage: (field: string) => getErrorMessage(errors, field)
  }
}

// Helper function to get field schema (simplified)
function getFieldSchema(schema: z.ZodSchema, field: string): z.ZodSchema | null {
  // This is a simplified implementation
  // In a real scenario, you'd need to traverse the schema structure
  return null
}