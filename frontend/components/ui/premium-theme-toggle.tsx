"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "./ThemeProvider"
import { cn } from "@/lib/utils"

export function PremiumThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme, actualTheme } = useTheme()

    // This is how you implement a premium component:
    // 1. Build the visual state using Framer Motion
    // 2. Connect it to your existing project logic (useTheme)

    return (
        <button
            onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
            className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-300",
                className
            )}
        >
            <AnimatePresence mode="wait" initial={false}>
                {actualTheme === "dark" ? (
                    <motion.div
                        key="moon"
                        initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <Moon className="h-5 w-5" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <Sun className="h-5 w-5" />
                    </motion.div>
                )}
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
