'use client';

import React from 'react';
import PrescriptionAnalyzer from '@/components/prescription/PrescriptionAnalyzer';
import { ThemeToggleButton } from '@/components/ui/ThemeToggle';

export default function PrescriptionAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <div className="container mx-auto py-8">
        <PrescriptionAnalyzer />
      </div>
    </div>
  );
}