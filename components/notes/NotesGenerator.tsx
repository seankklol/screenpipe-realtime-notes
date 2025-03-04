'use client';

import React, { useState, useEffect } from 'react';
import { MeetingNotes } from '@/lib/llm/notes-generator';
import NotesDisplay from './NotesDisplay';
import RecordingControls from '@/components/recording-controls';
import StatusIndicators from '@/components/status-indicators';
import { VisualFrame } from '@/lib/visual/capture';
import TranscriptionView from './TranscriptionView';
import VisualContentPreview from './VisualContentPreview';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useApiPost } from '@/lib/hooks/use-api';
import { TranscriptionItem } from './TranscriptionView';
import ApiErrorDisplay from '@/components/ApiErrorDisplay';

/**
 * Component for generating meeting notes
 */
export default function NotesGenerator() {
  const [notes, setNotes] = useState<MeetingNotes | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [participants, setParticipants] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [frames, setFrames] = useState<VisualFrame[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [showRealTimeFeedback, setShowRealTimeFeedback] = useState(true);
  
  // Setup API hook for notes generation
  const notesApi = useApiPost<MeetingNotes, any>('/api/generate-notes');
  
  // Timer for recording elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isRecording) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);
  
  // Reset error state when API state changes
  useEffect(() => {
    if (notesApi.error) {
      setError(notesApi.error.message);
      setProcessingStatus('error');
    } else if (notesApi.isLoading) {
      setProcessingStatus('processing');
    } else if (notesApi.data) {
      setProcessingStatus('completed');
    }
  }, [notesApi.error, notesApi.isLoading, notesApi.data]);
  
  // Function to handle recording state change
  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording);
    if (recording) {
      // Reset data when starting a new recording
      setTranscriptions([]);
      setFrames([]);
      setElapsedTime(0);
      setProcessingStatus('idle');
      setError(undefined);
    }
  };
  
  // Function to handle transcription received
  const handleTranscriptionReceived = (transcription: TranscriptionItem) => {
    setTranscriptions(prev => [...prev, transcription]);
  };
  
  // Function to handle frame captured
  const handleFrameCaptured = (frame: VisualFrame) => {
    setFrames(prev => [...prev, frame]);
  };
  
  // Function to handle notes generation with improved error handling
  const handleGenerateNotes = async () => {
    // Reset states
    setError(undefined);
    setIsGenerating(true);
    
    try {
      // Call the API using our custom hook
      const response = await notesApi.executePost({
        title: meetingTitle,
        participants: participants.split(',').map(p => p.trim()),
        transcriptions: transcriptions.map(t => ({
          id: t.id,
          speaker_id: t.speaker_id,
          text: t.text,
          timestamp: t.timestamp,
          confidence: t.confidence
        })),
        frames: frames.map(frame => ({
          id: frame.id,
          timestamp: frame.timestamp,
          text: frame.text,
          app_name: frame.app_name,
          window_name: frame.window_name
        }))
      });
      
      if (response) {
        setNotes(response);
      }
    } catch (err) {
      console.error('Error generating notes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating notes');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // For demonstration purposes, let's keep the mock notes function
  const handleGenerateMockNotes = () => {
    setIsLoading(true);
    setError(undefined);
    setProcessingStatus('processing');
    
    // Simulate API delay
    setTimeout(() => {
      const mockNotes: MeetingNotes = {
        title: meetingTitle || 'Product Planning Meeting',
        date: new Date().toISOString().split('T')[0],
        summary: `
This meeting focused on planning the next sprint for the product development team. The team discussed feature prioritization, resource allocation, and technical challenges.

Key decisions:
- Feature X will be prioritized for the next sprint
- Team will allocate 20% of resources to technical debt
- New design system will be implemented incrementally

The team also reviewed customer feedback and identified several opportunities for improvement in the user experience.
        `,
        topics: [
          {
            name: 'Feature Prioritization',
            content: 'Discussed the importance of Feature X for the upcoming release and its potential impact on user engagement. Team agreed to prioritize this feature in the next sprint.',
            relevance: 0.9
          },
          {
            name: 'Resource Allocation',
            content: 'Decided to allocate 20% of development resources to addressing technical debt, with the remaining 80% focused on new features and improvements.',
            relevance: 0.8
          },
          {
            name: 'Technical Challenges',
            content: 'Identified potential challenges with implementing Feature X, particularly around performance and compatibility with existing systems.',
            relevance: 0.7
          },
          {
            name: 'Customer Feedback',
            content: 'Reviewed recent customer feedback, noting that users are requesting improvements to the dashboard and reporting features.',
            relevance: 0.6
          }
        ],
        actionItems: [
          {
            action: 'Create detailed specifications for Feature X',
            assignee: 'Alice',
            dueDate: '2023-06-15'
          },
          {
            action: 'Schedule technical debt review session',
            assignee: 'Bob',
            dueDate: '2023-06-10'
          },
          {
            action: 'Prepare performance testing plan for Feature X',
            assignee: 'Charlie'
          },
          {
            action: 'Analyze customer feedback data for dashboard improvement opportunities',
            assignee: 'Diana',
            dueDate: '2023-06-20'
          }
        ],
        fullContent: `
# Product Planning Meeting
Date: ${new Date().toISOString().split('T')[0]}
Participants: ${participants || 'Alice, Bob, Charlie, Diana, Evan'}

## Executive Summary
This meeting focused on planning the next sprint for the product development team. The team discussed feature prioritization, resource allocation, and technical challenges.

Key decisions:
- Feature X will be prioritized for the next sprint
- Team will allocate 20% of resources to technical debt
- New design system will be implemented incrementally

The team also reviewed customer feedback and identified several opportunities for improvement in the user experience.

## Feature Prioritization
- Feature X identified as highest priority for next sprint
- Feature Y deferred to following sprint
- Mobile improvements scheduled for Q3
- Accessibility enhancements to be implemented across all new features

## Resource Allocation
- 20% of development resources allocated to technical debt
- 50% to Feature X development
- 20% to bug fixes and maintenance
- 10% to exploratory work for Q3 features

## Technical Challenges
- Performance concerns with Feature X identified
- Team discussed potential solutions:
  - Implement lazy loading for large data sets
  - Optimize database queries
  - Consider caching strategies
- Architecture review scheduled for next week

## Customer Feedback
- Dashboard usability issues reported by multiple enterprise customers
- Reporting features need enhancement
- Mobile experience rated poorly in recent survey
- Positive feedback on recent security enhancements

## Action Items
1. Create detailed specifications for Feature X (Alice, Due: 2023-06-15)
2. Schedule technical debt review session (Bob, Due: 2023-06-10)
3. Prepare performance testing plan for Feature X (Charlie)
4. Analyze customer feedback data for dashboard improvement opportunities (Diana, Due: 2023-06-20)
5. Update sprint planning board with new priorities (Evan, Due: 2023-06-08)
        `
      };
      
      setNotes(mockNotes);
      setIsLoading(false);
      setProcessingStatus('completed');
    }, 2000);
  };
  
  // Function to handle API errors
  const handleApiError = (error: Error) => {
    console.error('API Error:', error);
    setError(`API Error: ${error.message}`);
    setProcessingStatus('error');
  };
  
  return (
    <ErrorBoundary onError={(error) => console.error('Component Error:', error)}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Meeting Notes Generator</h2>
          
          {/* Recording controls section */}
          <div className="mb-6">
            <RecordingControls 
              isRecording={isRecording}
              onRecordingStateChange={handleRecordingStateChange}
              onTranscriptionReceived={handleTranscriptionReceived}
              onFrameCaptured={handleFrameCaptured}
            />
          </div>
          
          {/* Status indicators section */}
          {(isRecording || transcriptions.length > 0 || frames.length > 0) && (
            <div className="mb-6">
              <StatusIndicators 
                isRecording={isRecording}
                transcriptionCount={transcriptions.length}
                frameCount={frames.length}
                elapsedTime={elapsedTime}
                processingStatus={processingStatus}
                errorMessage={error}
              />
            </div>
          )}
          
          {/* Real-time feedback section */}
          {showRealTimeFeedback && (isRecording || transcriptions.length > 0 || frames.length > 0) && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Real-time Content</h3>
                <button 
                  onClick={() => setShowRealTimeFeedback(!showRealTimeFeedback)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showRealTimeFeedback ? 'Hide real-time feedback' : 'Show real-time feedback'}
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Transcription view component */}
                <TranscriptionView 
                  transcriptions={transcriptions}
                  isRecording={isRecording}
                  maxItems={5}
                />
                
                {/* Visual content preview component */}
                <VisualContentPreview 
                  frames={frames}
                  isRecording={isRecording}
                  maxItems={3}
                />
              </div>
            </div>
          )}
          
          {/* API Error Display */}
          {notesApi.error && (
            <div className="mb-6">
              <ApiErrorDisplay 
                error={notesApi.error} 
                onRetry={() => {
                  notesApi.reset();
                  setError(undefined);
                  setProcessingStatus('idle');
                }}
              />
            </div>
          )}
          
          {/* Meeting details section */}
          {!isGenerating && !notes && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="meetingTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    id="meetingTitle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter meeting title"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                    Participants (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="participants"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter participant names, separated by commas"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                  />
                </div>
                
                <div className="pt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    onClick={handleGenerateNotes}
                    disabled={transcriptions.length === 0 && frames.length === 0}
                  >
                    Generate Notes
                  </button>
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    onClick={handleGenerateMockNotes}
                  >
                    Generate Mock Notes (Demo)
                  </button>
                </div>
                
                {transcriptions.length === 0 && frames.length === 0 && !isRecording && (
                  <p className="text-sm text-amber-600 mt-2">
                    Record a meeting first to generate notes from actual content.
                  </p>
                )}
              </div>
            </div>
          )}
          
          {(isGenerating || notes) && (
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Generated Notes</h3>
              {notes && (
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    setNotes(undefined);
                    setIsGenerating(false);
                    setProcessingStatus('idle');
                  }}
                >
                  Start New
                </button>
              )}
            </div>
          )}
          
          <NotesDisplay 
            notes={notes} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
      </div>
    </ErrorBoundary>
  );
} 