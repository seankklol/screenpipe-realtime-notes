'use client';

import React, { useState } from 'react';
import { VisualFrame } from '@/lib/visual/capture';
import Image from 'next/image';

interface VisualContentPreviewProps {
  frames: VisualFrame[];
  isRecording: boolean;
  maxItems?: number;
}

/**
 * Component to display recent visual content captured during recording
 */
export default function VisualContentPreview({
  frames,
  isRecording,
  maxItems = 3
}: VisualContentPreviewProps) {
  const [selectedFrame, setSelectedFrame] = useState<VisualFrame | null>(null);
  
  // Get the most recent frames based on maxItems
  const recentFrames = frames.slice(-maxItems);
  
  // Format timestamp from ISO string to readable time
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Extract application and window information
  const getContentSource = (frame: VisualFrame): string => {
    if (frame.window_name && frame.app_name) {
      return `${frame.app_name} - ${frame.window_name}`;
    } else if (frame.window_name) {
      return frame.window_name;
    } else if (frame.app_name) {
      return frame.app_name;
    }
    return 'Unknown source';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">Visual Content</h3>
          {isRecording && (
            <div className="ml-3 flex items-center">
              <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500">Total frames: {frames.length}</span>
      </div>
      
      {frames.length === 0 ? (
        <div className="border border-gray-200 rounded-md p-6 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 italic text-center">
            {isRecording 
              ? "Capturing screen content..." 
              : "No visual content available. Start recording to capture screen content."}
          </p>
        </div>
      ) : (
        <>
          {/* Selected frame preview */}
          {selectedFrame && (
            <div className="mb-4">
              <div className="bg-gray-800 p-1 rounded-lg">
                {selectedFrame.image ? (
                  <div className="relative w-full" style={{ height: '300px' }}>
                    <Image 
                      src={selectedFrame.image}
                      alt="Captured frame"
                      layout="fill"
                      objectFit="contain"
                      className="rounded"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-700 h-40 rounded flex items-center justify-center">
                    <p className="text-gray-400">Image data not available</p>
                  </div>
                )}
              </div>
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{formatTimestamp(selectedFrame.timestamp)}</span>
                  <span>{getContentSource(selectedFrame)}</span>
                </div>
                {selectedFrame.text && (
                  <p className="text-sm text-gray-700 border-t border-gray-200 pt-2 mt-1">
                    {selectedFrame.text}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedFrame(null)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Back to thumbnails
              </button>
            </div>
          )}
          
          {/* Thumbnails grid */}
          {!selectedFrame && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentFrames.map((frame) => (
                <div 
                  key={frame.id}
                  className="border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => setSelectedFrame(frame)}
                >
                  {frame.image ? (
                    <div className="relative w-full h-28">
                      <Image 
                        src={frame.image}
                        alt="Captured frame thumbnail"
                        layout="fill"
                        objectFit="cover"
                        className="bg-gray-100"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 h-28 flex items-center justify-center">
                      <p className="text-gray-400 text-xs">No preview</p>
                    </div>
                  )}
                  <div className="p-2 bg-white">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatTimestamp(frame.timestamp)}</span>
                    </div>
                    {frame.text && (
                      <p className="text-xs text-gray-700 truncate mt-1">
                        {frame.text.length > 50 ? frame.text.substring(0, 50) + '...' : frame.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        {frames.length > maxItems && !selectedFrame && (
          <p>Showing last {maxItems} of {frames.length} frames. Click a thumbnail to view details.</p>
        )}
      </div>
    </div>
  );
} 