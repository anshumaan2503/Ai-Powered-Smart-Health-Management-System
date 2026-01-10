'use client';

import React from 'react';

export default function TestPublicPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Public Route Test
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this page, public routes are working!
        </p>
        <p className="text-sm text-gray-500">
          This page requires no authentication.
        </p>
        <div className="mt-4">
          <a 
            href="/aichatbot" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to AI Chatbot
          </a>
        </div>
      </div>
    </div>
  );
}