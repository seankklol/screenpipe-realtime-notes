'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the transcription item type based on the data structure
export interface TranscriptionItem {
  id: string;
  text: string;
  timestamp: string;
  confidence?: number;
  speaker_id?: number;
  [key: string]: any;
}

interface TranscriptionViewProps {
  transcriptions: TranscriptionItem[];
  isRecording: boolean;
  maxItems?: number;
}

/**
 * Component to display real-time transcription feedback during recording
 */
export default function TranscriptionView({
  transcriptions,
  isRecording,
  maxItems = 5
}: TranscriptionViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new transcriptions come in
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcriptions]);
  
  // Get the most recent transcriptions based on maxItems
  const recentTranscriptions = transcriptions.slice(-maxItems);
  
  // Format timestamp from ISO string to readable time
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-3">
        <h3 className="text-lg font-medium text-gray-900">Real-time Transcription</h3>
        {isRecording && (
          <div className="ml-3 flex items-center">
            <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-gray-500">Live</span>
          </div>
        )}
      </div>
      
      <div 
        ref={containerRef}
        className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50"
      >
        {transcriptions.length === 0 ? (
          <p className="text-gray-400 italic text-center py-4">
            {isRecording 
              ? "Listening for speech..." 
              : "No transcriptions available. Start recording to see transcriptions."}
          </p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {recentTranscriptions.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-3 rounded shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </span>
                    {item.speaker_id && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Speaker {item.speaker_id}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <span>Total transcriptions: {transcriptions.length}</span>
        {transcriptions.length > maxItems && (
          <span>Showing last {maxItems} of {transcriptions.length}</span>
        )}
      </div>
    </div>
  );
} 