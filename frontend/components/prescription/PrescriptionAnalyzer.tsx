'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Medication {
  name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity?: string;
}

interface AnalysisResult {
  success: boolean;
  medications: Medication[];
  patient_info?: any;
  doctor_info?: any;
  prescription_details?: any;
  safety_alerts: string[];
  recommendations: string[];
  validation?: {
    is_valid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
  };
  confidence_score?: number;
  analysis_id?: string;
}

const PrescriptionAnalyzer: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      setAnalysisResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    multiple: false
  });

  const analyzePrescription = async () => {
    if (!uploadedFile) {
      setError('Please select a file first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch('/api/prescription/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
    setError(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Prescription Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a prescription image or PDF for AI-powered analysis
        </p>
      </div>

      {/* File Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600 dark:text-blue-400">Drop the prescription file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Drag & drop a prescription file here, or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports: PNG, JPG, JPEG, GIF, BMP, TIFF, PDF (Max: 16MB)
              </p>
            </div>
          )}
        </div>

        {/* Selected File */}
        {uploadedFile && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between transition-colors">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile)}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearResults}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Analyze Button */}
        {uploadedFile && !analysisResult && (
          <div className="mt-4 text-center">
            <button
              onClick={analyzePrescription}
              disabled={isAnalyzing}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Prescription'}
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Analysis Results
              </h2>
              {analysisResult.confidence_score !== undefined && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</p>
                  <p className={`font-semibold ${getConfidenceColor(analysisResult.confidence_score)}`}>
                    {(analysisResult.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {/* Validation Status */}
            {analysisResult.validation && (
              <div className={`p-4 rounded-lg mb-4 ${analysisResult.validation.is_valid
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                }`}>
                <div className="flex items-center">
                  {analysisResult.validation.is_valid ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                  )}
                  <p className={`font-medium ${analysisResult.validation.is_valid ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                    {analysisResult.validation.is_valid
                      ? 'Prescription appears valid'
                      : 'Prescription needs review'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Medications */}
          {analysisResult.medications && analysisResult.medications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Medications ({analysisResult.medications.length})
              </h3>
              <div className="space-y-4">
                {analysisResult.medications.map((med, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{med.name}</p>
                        {med.generic_name && med.generic_name !== 'Not specified' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">Generic: {med.generic_name}</p>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p><span className="font-medium text-gray-900 dark:text-white">Dosage:</span> {med.dosage}</p>
                        <p><span className="font-medium text-gray-900 dark:text-white">Frequency:</span> {med.frequency}</p>
                        <p><span className="font-medium text-gray-900 dark:text-white">Duration:</span> {med.duration}</p>
                        {med.quantity && med.quantity !== 'Not specified' && (
                          <p><span className="font-medium text-gray-900 dark:text-white">Quantity:</span> {med.quantity}</p>
                        )}
                      </div>
                    </div>
                    {med.instructions && med.instructions !== 'Not specified' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-gray-900 dark:text-white">Instructions:</span> {med.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Alerts */}
          {analysisResult.safety_alerts && analysisResult.safety_alerts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">
                Safety Alerts
              </h3>
              <ul className="space-y-2">
                {analysisResult.safety_alerts.map((alert, index) => (
                  <li key={index} className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-200">{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
                Recommendations
              </h3>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-700 dark:text-blue-200">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Details */}
          {analysisResult.validation && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Validation Details
              </h3>

              {analysisResult.validation.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Errors:</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-200">
                    {analysisResult.validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.validation.warnings.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-200">
                    {analysisResult.validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.validation.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Suggestions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-200">
                    {analysisResult.validation.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Analyze Another
            </button>
            {analysisResult.analysis_id && (
              <button
                onClick={() => {
                  // TODO: Implement save to patient record
                  alert('Save to patient record functionality coming soon!');
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Save to Patient Record
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionAnalyzer;