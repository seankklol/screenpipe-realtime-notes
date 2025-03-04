'use client';

import React, { useState } from 'react';
import { MeetingNotes } from '@/lib/llm/notes-generator';
import ExportMenu from './ExportMenu';
import ShareMenu from './ShareMenu';

interface NotesDisplayProps {
  notes?: MeetingNotes;
  isLoading?: boolean;
  error?: string;
}

/**
 * Component for displaying generated meeting notes
 */
export default function NotesDisplay({ notes, isLoading, error }: NotesDisplayProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'full' | 'topics' | 'action-items'>('summary');
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Generating meeting notes...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Generating Notes</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (!notes) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-300 text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Notes Generated Yet</h3>
            <p className="text-gray-600">Start a meeting to generate notes.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render notes
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Notes Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{notes.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{notes.date}</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'summary' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'full' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('full')}
          >
            Full Notes
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'topics' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('topics')}
          >
            Topics
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'action-items' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('action-items')}
          >
            Action Items
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Executive Summary</h3>
            <div className="whitespace-pre-line text-gray-700">
              {notes.summary}
            </div>
          </div>
        )}
        
        {activeTab === 'full' && (
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-gray-700">
              {notes.fullContent}
            </div>
          </div>
        )}
        
        {activeTab === 'topics' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Topics</h3>
            {notes.topics.length > 0 ? (
              <div className="space-y-6">
                {notes.topics.map((topic, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{topic.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                        Relevance: {Math.round(topic.relevance * 100)}%
                      </span>
                    </div>
                    <p className="text-gray-600 whitespace-pre-line">{topic.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No topics identified.</p>
            )}
          </div>
        )}
        
        {activeTab === 'action-items' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Items</h3>
            {notes.actionItems.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notes.actionItems.map((item, index) => (
                  <li key={index} className="py-3">
                    <div className="flex space-x-2">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{item.action}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded-full">
                            <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            {item.assignee}
                          </span>
                          {item.dueDate && (
                            <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-700 py-1 px-2 rounded-full">
                              <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Due: {item.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No action items identified.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Export/Share Options */}
      <div className="bg-gray-50 px-6 py-3 flex justify-end">
        <ExportMenu notes={notes} />
        <div className="ml-3">
          <ShareMenu notes={notes} />
        </div>
      </div>
    </div>
  );
} 