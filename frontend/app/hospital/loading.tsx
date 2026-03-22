/**
 * Renders a full-viewport centered loading spinner with light and dark background variants.
 *
 * @returns A React element containing a centered, animated circular spinner for indicating loading state.
 */
export default function HospitalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
