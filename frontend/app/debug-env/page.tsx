export default function DebugEnvPage() {
  return (
    <pre style={{ padding: 20 }}>
      {JSON.stringify(
        {
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
        },
        null,
        2
      )}
    </pre>
  )
}
