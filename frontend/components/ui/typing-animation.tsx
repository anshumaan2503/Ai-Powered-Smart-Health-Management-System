'use client';

import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  children: string;
  className?: string;
  speed?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  children, 
  className = '', 
  speed = 10 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < children.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + children[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, children, speed]);

  // If text changes, reset animation
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [children]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < children.length && (
        <span className="animate-pulse inline-block w-1 h-4 bg-current ml-0.5" />
      )}
    </span>
  );
};
