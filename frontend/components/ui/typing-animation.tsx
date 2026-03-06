"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypingAnimationProps {
    children: string
    className?: string
    duration?: number
    delay?: number
    startOnView?: boolean
}

export function TypingAnimation({
    children,
    className,
    duration = 100,
    delay = 0,
    startOnView = false,
}: TypingAnimationProps) {
    const [displayedText, setDisplayedText] = useState<string>("")
    const [i, setI] = useState<number>(0)

    useEffect(() => {
        const typingEffect = setInterval(() => {
            if (i < children.length) {
                setDisplayedText((prevState) => prevState + children.charAt(i))
                setI(i + 1)
            } else {
                clearInterval(typingEffect)
            }
        }, duration)

        return () => {
            clearInterval(typingEffect)
        }
    }, [children, duration, i])

    return (
        <span className={cn("font-medium", className)}>
            {displayedText}
        </span>
    )
}
