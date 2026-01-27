'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ThemeToggleButton } from '@/components/ui/ThemeToggle';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your AI Health Assistant. I can help you with general health questions, symptom information, and wellness advice. Please note that I'm not a replacement for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: 'AI is thinking...',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Handle text-only message
      const response = await fetch('/api/public/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: messages.slice(-5).map(m => ({ text: m.text, isUser: m.isUser }))
        })
      });

      const data = await response.json();

      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      if (data.success) {
        // Handle the response properly - it might be nested
        let responseText = '';
        const responseData = data.response;

        if (typeof responseData === 'string') {
          responseText = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Handle structured response from AI
          if (responseData.reply) {
            responseText = responseData.reply;
          } else if (responseData.response) {
            responseText = responseData.response;
          } else if (responseData.text) {
            responseText = responseData.text;
          } else {
            responseText = JSON.stringify(responseData);
          }
        } else if (data.analysis) {
          responseText = typeof data.analysis === 'string' ? data.analysis : JSON.stringify(data.analysis);
        } else {
          responseText = 'Response received successfully.';
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.error || "I'm sorry, I'm having trouble responding right now. Please try again or consult with a healthcare professional for medical concerns.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing technical difficulties. Please try again later or seek professional medical advice for urgent concerns.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are common symptoms of flu?",
    "How can I improve my sleep quality?",
    "What should I do for a headache?",
    "Tips for staying hydrated",
    "When should I see a doctor?",
    "What foods are good for immunity?",
    "How to manage stress naturally?",
    "Tips for maintaining good posture?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your AI Health Assistant. I can help you with general health questions, symptom information, and wellness advice. Please note that I'm not a replacement for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading AI Health Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg transition-colors">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Health Assistant</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Free health guidance powered by AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggleButton />
              <button
                onClick={clearChat}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Chat
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition-colors"
              >
                Back to Hospital
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 mb-6 transition-colors">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Important Medical Disclaimer</p>
              <p>This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isUser
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : message.isTyping
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                >
                  {message.isTyping ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="ml-2 text-sm">AI is thinking...</span>
                    </div>
                  ) : (
                    <>
                      {/* Message text */}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 transition-colors">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick questions to get started:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left p-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-400 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 transition-colors">
            <div className="flex space-x-2">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your health concerns..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Health Guidance</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get general health advice, wellness tips, and symptom information from our AI assistant</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
            <div className="flex items-center mb-2">
              <SparklesIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">AI Powered</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Advanced AI technology providing accurate responses to your health questions</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Hospital Management System - AI Health Assistant</p>
          <p className="mt-1">For emergencies, call your local emergency number immediately</p>
        </div>
      </div>
    </div>
  );
}