'use client';

import React, { useState, useEffect } from 'react';
import { setupScreenCapture } from '@/lib/visual/capture';
import { pipe } from '@screenpipe/browser';
import { v4 as uuidv4 } from 'uuid';

// Define proper types for the Screenpipe API
interface TranscriptionData {
  text: string;
  confidence?: number;
  speaker_id?: number;
  [key: string]: any;
}

interface EnrichedTranscription extends TranscriptionData {
  id: string;
  timestamp: string;
}

type TranscriptionCallback = (transcription: TranscriptionData) => void;
type CleanupFunction = () => void;

interface RecordingControlsProps {
  onTranscriptionReceived?: (transcription: EnrichedTranscription) => void;
  onFrameCaptured?: (frame: any) => void;
  isRecording?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export default function RecordingControls({
  onTranscriptionReceived,
  onFrameCaptured,
  isRecording = false,
  onRecordingStateChange,
}: RecordingControlsProps) {
  const [isCapturingAudio, setIsCapturingAudio] = useState(false);
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  const [audioStatus, setAudioStatus] = useState<'idle' | 'starting' | 'recording' | 'error'>('idle');
  const [screenStatus, setScreenStatus] = useState<'idle' | 'starting' | 'recording' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Start/stop timer based on recording state
  useEffect(() => {
    if (isRecording && !timerId) {
      const id = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setTimerId(id);
    } else if (!isRecording && timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRecording, timerId]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start audio capture
  const startAudioCapture = async (): Promise<CleanupFunction | null> => {
    try {
      setAudioStatus('starting');
      setError(null);

      // Define the callback that will be passed to streamTranscriptions
      const transcriptionCallback: TranscriptionCallback = (transcription) => {
        // Add timestamp and unique ID
        const enrichedTranscription: EnrichedTranscription = {
          ...transcription,
          id: uuidv4(),
          timestamp: new Date().toISOString()
        };
        
        // Call the callback if provided
        if (onTranscriptionReceived) {
          onTranscriptionReceived(enrichedTranscription);
        }
      };

      // Call the Screenpipe API and get the cleanup function
      // We're handling the type conversion safely
      const unsubscribe = pipe.streamTranscriptions(transcriptionCallback) as unknown as CleanupFunction;

      setIsCapturingAudio(true);
      setAudioStatus('recording');
      
      return unsubscribe;
    } catch (error) {
      console.error('Error starting audio capture:', error);
      setAudioStatus('error');
      setError('Failed to start audio capture. Please check permissions.');
      return null;
    }
  };

  // Start screen capture
  const startScreenCapture = async (): Promise<CleanupFunction | null> => {
    try {
      setScreenStatus('starting');
      setError(null);

      // Setup screen capture using our utility function
      const stopCapture = setupScreenCapture((frame) => {
        if (onFrameCaptured) {
          onFrameCaptured(frame);
        }
      });

      setIsCapturingScreen(true);
      setScreenStatus('recording');
      
      return stopCapture;
    } catch (error) {
      console.error('Error starting screen capture:', error);
      setScreenStatus('error');
      setError('Failed to start screen capture. Please check permissions.');
      return null;
    }
  };

  // Handle start recording button click
  const handleStartRecording = async () => {
    // Start audio capture
    const audioUnsubscribe = await startAudioCapture();
    
    // Start screen capture
    const screenCaptureStop = await startScreenCapture();
    
    // If both successful, update state
    if (audioUnsubscribe && screenCaptureStop) {
      if (onRecordingStateChange) {
        onRecordingStateChange(true);
      }
      
      // Store cleanup functions for later
      window._recordingCleanup = {
        audioUnsubscribe,
        screenCaptureStop
      };
      
      setElapsedTime(0);
    } else {
      // If either failed, clean up the other
      if (audioUnsubscribe) audioUnsubscribe();
      if (screenCaptureStop) screenCaptureStop();
      
      setError('Failed to start recording. Please check permissions and try again.');
    }
  };

  // Handle stop recording button click
  const handleStopRecording = () => {
    // Clean up audio and screen capture
    if (window._recordingCleanup) {
      if (window._recordingCleanup.audioUnsubscribe) {
        window._recordingCleanup.audioUnsubscribe();
      }
      if (window._recordingCleanup.screenCaptureStop) {
        window._recordingCleanup.screenCaptureStop();
      }
      
      window._recordingCleanup = null;
    }
    
    // Update state
    setIsCapturingAudio(false);
    setIsCapturingScreen(false);
    setAudioStatus('idle');
    setScreenStatus('idle');
    
    if (onRecordingStateChange) {
      onRecordingStateChange(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Recording Controls</h3>
          {isRecording && (
            <div className="flex items-center mt-1">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-500">Recording in progress - {formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 md:mt-0 flex space-x-2">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="6" />
              </svg>
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <rect x="6" y="6" width="8" height="8" />
              </svg>
              Stop Recording
            </button>
          )}
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex items-center">
          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
            audioStatus === 'idle' ? 'bg-gray-300' : 
            audioStatus === 'starting' ? 'bg-yellow-400' :
            audioStatus === 'recording' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            Audio: {
              audioStatus === 'idle' ? 'Ready' : 
              audioStatus === 'starting' ? 'Starting...' :
              audioStatus === 'recording' ? 'Recording' : 'Error'
            }
          </span>
        </div>
        
        <div className="flex items-center">
          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
            screenStatus === 'idle' ? 'bg-gray-300' : 
            screenStatus === 'starting' ? 'bg-yellow-400' :
            screenStatus === 'recording' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            Screen: {
              screenStatus === 'idle' ? 'Ready' : 
              screenStatus === 'starting' ? 'Starting...' :
              screenStatus === 'recording' ? 'Capturing' : 'Error'
            }
          </span>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 text-sm text-red-800 rounded">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

// Add global type declaration
declare global {
  interface Window {
    _recordingCleanup: {
      audioUnsubscribe: CleanupFunction;
      screenCaptureStop: CleanupFunction;
    } | null;
  }
}

// Initialize the cleanup property
if (typeof window !== 'undefined') {
  window._recordingCleanup = null;
} 