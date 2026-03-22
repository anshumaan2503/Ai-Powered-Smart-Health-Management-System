/**
 * Render a centered circular loading spinner for the dashboard.
 *
 * @returns A JSX element that displays a centered, animated circular spinner.
 */
export default function DashboardLoading() {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
