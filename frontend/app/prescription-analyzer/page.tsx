'use client';

import React from 'react';
import PrescriptionAnalyzer from '@/components/prescription/PrescriptionAnalyzer';

export default function PrescriptionAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <PrescriptionAnalyzer />
      </div>
    </div>
  );
}