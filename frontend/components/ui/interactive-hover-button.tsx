"use client"

import React from "react"
import { ArrowRight } from "lucide-react"
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface InteractiveHoverButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string
}

export const InteractiveHoverButton = React.forwardRef<
    HTMLButtonElement,
    InteractiveHoverButtonProps
>(({ children, className, href, ...props }, ref) => {
    const content = (
        <>
            <div className="flex items-center justify-center gap-2 transition-all duration-300 group-hover:translate-x-[150%]">
                <div className="h-2 w-2 rounded-full bg-blue-600 transition-all duration-300 group-hover:scale-[0]" />
                <span className="inline-block transition-all duration-300 group-hover:opacity-0">
                    {children}
                </span>
            </div>
            <div className="absolute top-0 left-0 z-10 flex h-full w-full -translate-x-[100%] items-center justify-center gap-2 text-blue-600 dark:text-blue-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <span>{children}</span>
                <ArrowRight className="h-4 w-4" />
            </div>
        </>
    )

    const styles = cn(
        "group relative min-w-[140px] w-full max-w-full cursor-pointer overflow-hidden rounded-full border border-slate-200 bg-white p-2 px-6 text-center font-semibold transition-all duration-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white flex items-center justify-center",
        className,
    )

    if (href) {
        return (
            <Link href={href} className={styles}>
                {content}
            </Link>
        )
    }

    return (
        <button
            ref={ref}
            className={styles}
            {...props}
        >
            {content}
        </button>
    )
})

InteractiveHoverButton.displayName = "InteractiveHoverButton"
