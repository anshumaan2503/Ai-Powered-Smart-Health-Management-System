'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  PhotoIcon,
  DocumentIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  attachments?: {
    type: 'image' | 'document';
    name: string;
    url?: string;
    size: number;
  }[];
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPasteReady, setIsPasteReady] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize messages after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your AI Health Assistant. I can help you with general health questions, symptom information, and wellness advice. You can also upload photos or documents for analysis (like prescriptions, lab results, or medical images). Please note that I'm not a replacement for professional medical care. How can I help you today?",
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

  // Clipboard paste handler
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if the item is an image
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file && file.size <= 16 * 1024 * 1024) { // 16MB limit
            // Create a new File with a proper name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = file.type.split('/')[1] || 'png';
            const newFile = new File([file], `pasted-image-${timestamp}.${extension}`, {
              type: file.type
            });
            imageFiles.push(newFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        event.preventDefault();
        setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, 5)); // Max 5 files
        
        // Visual feedback
        setIsPasteReady(true);
        setTimeout(() => setIsPasteReady(false), 2000);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Show paste ready indicator when Ctrl+V is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        setIsPasteReady(true);
        setTimeout(() => setIsPasteReady(false), 3000);
      }
    };

    // Add event listeners
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type === 'application/pdf' ||
                         file.type.includes('document');
      const isValidSize = file.size <= 16 * 1024 * 1024; // 16MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images, PDFs, and documents under 16MB are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-4 w-4" />;
    }
    return <DocumentIcon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && selectedFiles.length === 0) || isLoading) return;

    // Create attachments info for display
    const attachments = selectedFiles.map(file => ({
      type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
      name: file.name,
      size: file.size,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage || (selectedFiles.length > 0 ? `Uploaded ${selectedFiles.length} file(s) for analysis` : ''),
      isUser: true,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: selectedFiles.length > 0 ? 'AI is analyzing your files...' : 'AI is thinking...',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      let response;
      let data;

      if (selectedFiles.length > 0) {
        // Handle file upload and analysis
        const formData = new FormData();
        formData.append('message', inputMessage || 'Please analyze these files');
        
        selectedFiles.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
        
        // Add context
        const context = messages.slice(-5).map(m => ({ text: m.text, isUser: m.isUser }));
        formData.append('context', JSON.stringify(context));

        response = await fetch('/api/public/analyze-files', {
          method: 'POST',
          body: formData
        });
      } else {
        // Handle text-only message
        response = await fetch('/api/public/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: inputMessage,
            context: messages.slice(-5).map(m => ({ text: m.text, isUser: m.isUser }))
          })
        });
      }

      data = await response.json();

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
          responseText = 'Analysis completed successfully.';
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
      setSelectedFiles([]); // Clear selected files after sending
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What are common symptoms of flu?",
    "How can I improve my sleep quality?",
    "What should I do for a headache?",
    "Tips for staying hydrated",
    "When should I see a doctor?",
    "Analyze my prescription (upload or paste image)",
    "Check my lab results (upload document)",
    "How to manage stress naturally?"
  ];

  const handleQuickQuestion = (question: string) => {
    if (question.includes('upload')) {
      // Trigger file upload for questions that mention uploading
      fileInputRef.current?.click();
      setInputMessage(question.replace(' (upload image)', '').replace(' (upload document)', ''));
    } else {
      setInputMessage(question);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your AI Health Assistant. I can help you with general health questions, symptom information, and wellness advice. You can also upload photos or documents for analysis (like prescriptions, lab results, or medical images). Please note that I'm not a replacement for professional medical care. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Health Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Health Assistant</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Free health guidance powered by AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear Chat
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-sm"
              >
                Back to Hospital
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Important Medical Disclaimer</p>
              <p>This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.</p>
            </div>
          </div>
        </div>

        {/* Paste Indicator */}
        {isPasteReady && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 animate-pulse">
            <div className="flex items-center">
              <PhotoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📋 Ready to paste! Copy an image and press Ctrl+V to paste it here
              </p>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
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
                      <span className="ml-2 text-sm">AI is analyzing...</span>
                    </div>
                  ) : (
                    <>
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                              message.isUser ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                            }`}>
                              {attachment.type === 'image' ? (
                                <PhotoIcon className="h-4 w-4" />
                              ) : (
                                <DocumentIcon className="h-4 w-4" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs truncate">{attachment.name || 'Unknown file'}</p>
                                <p className="text-xs opacity-75">{formatFileSize(attachment.size || 0)}</p>
                              </div>
                              {attachment.url && (
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message text */}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
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
            <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick questions to get started:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left p-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-600 p-4">
            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Files ({selectedFiles.length}/5)
                    {selectedFiles.some(f => f.name.includes('pasted-image')) && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                        📋 Pasted
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      {file.type.startsWith('image/') && (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-500"
                        />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedFiles.length > 0 ? "Add a message about your files..." : "Ask me about your health concerns or upload files for analysis..."}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              
              {/* File Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || selectedFiles.length >= 5}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Upload files (images, PDFs, documents)"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
              
              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={(!inputMessage.trim() && selectedFiles.length === 0) || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line • Ctrl+V to paste images
              </p>
              <p className="text-xs text-gray-500">
                Max 5 files, 16MB each
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="font-medium text-gray-900">Health Guidance</h3>
            </div>
            <p className="text-sm text-gray-600">Get general health advice and wellness tips</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <PhotoIcon className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-gray-900">Image & Document Analysis</h3>
            </div>
            <p className="text-sm text-gray-600">Upload files or paste images (Ctrl+V) for AI analysis of prescriptions, lab results, and medical documents</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="font-medium text-gray-900">AI Powered</h3>
            </div>
            <p className="text-sm text-gray-600">Advanced AI technology for accurate responses and file analysis</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Hospital Management System - AI Health Assistant</p>
          <p className="mt-1">For emergencies, call your local emergency number immediately</p>
        </div>
      </div>
    </div>
  );
}