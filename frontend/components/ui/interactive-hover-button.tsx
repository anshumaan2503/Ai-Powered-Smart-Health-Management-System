'use client'

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: InteractiveHoverButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95",
        className
      )}
      {...props}
    >
      {/* Normal State Text */}
      <span className="relative z-10 font-bold transition-all duration-300 group-hover:translate-x-[-10px] group-hover:opacity-0">
        {children}
      </span>

      {/* Hover State Content */}
      <div className="absolute inset-0 z-20 flex h-full w-full translate-x-[100%] items-center justify-center gap-2 font-bold text-white transition-all duration-300 group-hover:translate-x-0">
        <span>{children}</span>
        <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
      </div>

      {/* Background Animated Element */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/40 transition-all duration-300 group-hover:w-full"
        initial={false}
        animate={isHovered ? { width: "100%" } : { width: "0%" }}
      />
      
      {/* Glassmorphism Shine */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
