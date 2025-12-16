'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aiAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { SparklesIcon, ShieldCheckIcon, ExclamationTriangleIcon, BoltIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

type ChatTurn = {
  role: 'user' | 'bot'
  message: string
  meta?: {
    type?: string
    suggestions?: string[]
    disclaimer?: string
  }
}

const starterPrompts = [
  'I have a headache and mild fever',
  'I feel shortness of breath when walking',
  'How should I prepare for my doctor visit?',
  'What should I include when describing my symptoms?'
]

export default function AIChatbotPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [history, setHistory] = useState<ChatTurn[]>([
    {
      role: 'bot',
      message:
        'Hi! I am the AI health assistant. I can offer general guidance, help structure symptom details, and remind you of next steps. How can I help?',
      meta: { type: 'greeting' },
    },
  ])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token') ||
        localStorage.getItem('hospital_access_token') ||
        localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to access AI Health Assistant')
        router.push('/login')
        return
      }
      setIsAuthenticated(true)
      setCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || loading) return
    const message = prompt.trim()
    setInput('')
    setHistory((prev) => [...prev, { role: 'user', message }])
    setLoading(true)

    try {
      const context = history.slice(-6).map((h) => ({
        role: h.role,
        message: h.message,
      }))

      const { data } = await aiAPI.chatbot({ message, context })
      const bot = data?.response

      setHistory((prev) => [
        ...prev,
        {
          role: 'bot',
          message: bot?.reply || 'I am here to help.',
          meta: {
            type: bot?.type,
            suggestions: bot?.suggestions,
            disclaimer: bot?.disclaimer,
          },
        },
      ])
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to reach AI assistant')
      setHistory((prev) => [
        ...prev,
        {
          role: 'bot',
          message: 'Sorry, I could not process that. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Hero / Header */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_25%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.15),transparent_25%)]" />
          <div className="relative p-8 md:p-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur">
                <SparklesIcon className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">AI Health Copilot</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-tight">
                Modern AI Chatbot for symptom guidance and visit prep
              </h1>
              <p className="text-white/80 text-base md:text-lg">
                Get structured prompts, safety reminders, and concise advice. Fast, safe, and aligned with your platform’s look.
              </p>
              <div className="flex flex-wrap gap-3">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-sm px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 text-sm space-y-3 max-w-xs shadow-xl">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheckIcon className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Safety-first</p>
                  <p className="text-white/80 text-xs">Not a medical professional; flags urgent cues.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <BoltIcon className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Instant prompts</p>
                  <p className="text-white/80 text-xs">Quick chips to pre-fill rich symptom context.</p>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold hover:translate-y-[-1px] transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Chat layout */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-4 md:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  🤖
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Chatbot</p>
                  <p className="text-sm text-gray-600">Safe guidance • Non-diagnostic</p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                Online
              </span>
            </div>

            <div className="h-[60vh] overflow-y-auto pr-2 space-y-4 custom-scroll">
              {history.map((turn, idx) => (
                <div
                  key={idx}
                  className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] md:max-w-[75%]`}>
                    {turn.role === 'bot' && (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm shadow-md">
                        🤖
                      </div>
                    )}
                    <div
                      className={`flex-1 rounded-2xl p-4 shadow-md ${turn.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-auto'
                        : 'bg-white border border-gray-100 text-gray-800'
                        }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {turn.message}
                      </div>
                      {turn.meta?.suggestions?.length ? (
                        <div className="mt-3 text-xs md:text-sm text-blue-700 bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <p className="font-semibold mb-2">Suggestions</p>
                          <ul className="list-disc list-inside space-y-1">
                            {turn.meta.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {turn.meta?.disclaimer ? (
                        <p className="mt-3 text-[11px] md:text-xs text-gray-500">
                          {turn.meta.disclaimer}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-md text-gray-500 flex items-center gap-2">
                    <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    Typing...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
              <div className="flex gap-2 flex-wrap">
                {starterPrompts.slice(0, 3).map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  className="flex-1 input-field"
                  placeholder="Describe symptoms, ask for visit prep tips, or request guidance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="btn-primary px-6"
                  disabled={loading || !input.trim()}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>

          {/* Side panel */}
          <aside className="space-y-4">
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-semibold text-gray-800">Safety notes</p>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Not a medical professional; for guidance only.</li>
                <li>If you mention red-flag symptoms, it will advise urgent care.</li>
                <li>Keep PHI minimal; avoid sharing sensitive identifiers.</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-semibold text-gray-800">Best prompts</p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                  “List what a doctor will ask for chest pain at night.”
                </span>
                <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                  “Help me summarize these symptoms before my visit.”
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
