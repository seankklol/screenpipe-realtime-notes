'use client';

import React, { useState } from 'react';
import { MeetingNotes } from '@/lib/llm/notes-generator';
import NotesDisplay from './NotesDisplay';

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
  
  // Function to handle notes generation
  const handleGenerateNotes = async () => {
    setIsLoading(true);
    setError(undefined);
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an API endpoint
      // that processes the meeting data and returns the notes
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meetingTitle,
          participants: participants.split(',').map(p => p.trim()),
          // In a real implementation, we would send the actual meeting data
          // such as transcript and visual content
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }
      
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Error generating notes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating notes');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };
  
  // For demonstration purposes, let's add a function to generate mock notes
  const handleGenerateMockNotes = () => {
    setIsLoading(true);
    setError(undefined);
    
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
    }, 2000);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Meeting Notes Generator</h2>
        
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
                >
                  Generate Notes (API)
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={handleGenerateMockNotes}
                >
                  Generate Mock Notes (Demo)
                </button>
              </div>
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
  );
} 