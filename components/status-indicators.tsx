'use client';

import React from 'react';

interface StatusIndicatorsProps {
  isRecording: boolean;
  transcriptionCount: number;
  frameCount: number;
  elapsedTime: number;
  processingStatus: 'idle' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

/**
 * Component to display current recording status and metrics
 */
export default function StatusIndicators({
  isRecording,
  transcriptionCount,
  frameCount,
  elapsedTime,
  processingStatus,
  errorMessage
}: StatusIndicatorsProps) {
  
  // Format elapsed time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Recording Status</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Recording Status */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center mb-2">
            <div className={`h-3 w-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="font-medium text-gray-700">
              {isRecording ? 'Recording in Progress' : 'Ready to Record'}
            </span>
          </div>
          
          {isRecording && (
            <p className="text-sm text-gray-500">
              Recording time: {formatTime(elapsedTime)}
            </p>
          )}
        </div>
        
        {/* Processing Status */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center mb-2">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              processingStatus === 'idle' ? 'bg-gray-300' :
              processingStatus === 'processing' ? 'bg-blue-500 animate-pulse' :
              processingStatus === 'completed' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium text-gray-700">
              Processing: {
                processingStatus === 'idle' ? 'Idle' :
                processingStatus === 'processing' ? 'In Progress' :
                processingStatus === 'completed' ? 'Completed' : 'Error'
              }
            </span>
          </div>
          
          {errorMessage && processingStatus === 'error' && (
            <p className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}
        </div>
        
        {/* Metrics */}
        <div className="col-span-2">
          <div className="bg-gray-50 p-3 rounded-md grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Transcriptions</p>
              <p className="text-2xl font-semibold text-gray-800">{transcriptionCount}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase">Frames Captured</p>
              <p className="text-2xl font-semibold text-gray-800">{frameCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help text */}
      {!isRecording && processingStatus === 'idle' && (
        <p className="mt-3 text-sm text-gray-500">
          Press the "Start Recording" button to begin capturing meeting content.
        </p>
      )}
    </div>
  );
} 