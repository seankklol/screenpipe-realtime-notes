'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SynchronizedContent } from '@/lib/visual/content-sync';
import { ContentType } from '@/lib/visual/content-detector';

interface SynchronizedContentViewProps {
  syncedContent: SynchronizedContent[];
  isRecording: boolean;
  maxItems?: number;
}

/**
 * Component to display synchronized audio and visual content
 */
export default function SynchronizedContentView({
  syncedContent,
  isRecording,
  maxItems = 5
}: SynchronizedContentViewProps) {
  const [selectedItem, setSelectedItem] = useState<SynchronizedContent | null>(null);
  
  // Get recent items based on maxItems
  const recentItems = syncedContent.slice(-maxItems);
  
  // Format timestamp from ISO string to readable time
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Function to render visual content preview based on content type
  const renderVisualContentPreview = (item: SynchronizedContent) => {
    if (!item.visualContent) {
      return (
        <div className="bg-gray-100 h-28 flex items-center justify-center">
          <p className="text-gray-400 text-xs">No visual content</p>
        </div>
      );
    }
    
    const content = item.visualContent;
    
    switch (content.type) {
      case ContentType.TABLE:
        return (
          <div className="bg-blue-100 h-28 flex items-center justify-center p-2 text-center">
            <div>
              <svg className="w-8 h-8 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-xs mt-1">Table content</p>
              {content.metadata && (
                <p className="text-xs">{content.metadata.rowCount || '?'} rows × {content.metadata.columnCount || '?'} columns</p>
              )}
            </div>
          </div>
        );
      
      case ContentType.CODE:
        return (
          <div className="bg-gray-800 h-28 flex items-center justify-center p-2 text-center">
            <div>
              <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-xs mt-1 text-gray-400">Code snippet</p>
              {content.metadata && (
                <p className="text-xs text-gray-400">{content.metadata.lineCount || '?'} lines</p>
              )}
            </div>
          </div>
        );
      
      case ContentType.CHART:
      case ContentType.DIAGRAM:
        return (
          <div className="bg-green-100 h-28 flex items-center justify-center p-2 text-center">
            <div>
              <svg className="w-8 h-8 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xs mt-1">{content.type === ContentType.CHART ? 'Chart' : 'Diagram'}</p>
            </div>
          </div>
        );
      
      case ContentType.IMAGE:
        // If we have image data, show it
        if (content.content && content.content.image) {
          return (
            <div className="relative w-full h-28">
              <Image 
                src={content.content.image}
                alt="Visual content"
                layout="fill"
                objectFit="cover"
                className="bg-gray-100"
              />
            </div>
          );
        }
        
        return (
          <div className="bg-purple-100 h-28 flex items-center justify-center p-2 text-center">
            <div>
              <svg className="w-8 h-8 mx-auto text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs mt-1">Image content</p>
            </div>
          </div>
        );
      
      case ContentType.TEXT:
        return (
          <div className="bg-yellow-100 h-28 flex items-center justify-center p-2 text-center">
            <div>
              <svg className="w-8 h-8 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs mt-1">Text content</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 h-28 flex items-center justify-center">
            <p className="text-gray-400 text-xs">Unknown content</p>
          </div>
        );
    }
  };
  
  // Function to render the detailed view of a synchronized content item
  const renderDetailedView = (item: SynchronizedContent) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-medium text-gray-800">
            Synchronized Content
          </h4>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            {formatTimestamp(item.timestamp)}
          </span>
        </div>
        
        {/* Transcription */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-1">Transcription</h5>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-gray-800">{item.transcription.text}</p>
            {item.transcription.speaker_id && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-2 inline-block">
                Speaker {item.transcription.speaker_id}
              </span>
            )}
          </div>
        </div>
        
        {/* Visual Content */}
        {item.visualContent && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <h5 className="text-sm font-medium text-gray-700">Visual Content</h5>
              <span className="text-xs text-gray-500">
                Sync confidence: {(item.syncConfidence * 100).toFixed(0)}%
              </span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              {item.visualContent.type === ContentType.TABLE && (
                <div className="overflow-x-auto">
                  <h6 className="text-xs font-medium mb-2">Table Content</h6>
                  {item.visualContent.content && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          {item.visualContent.content.headers.map((header, idx) => (
                            <th key={idx} className="px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {item.visualContent.content.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-3 py-2 text-xs text-gray-500">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
              
              {item.visualContent.type === ContentType.CODE && (
                <div>
                  <h6 className="text-xs font-medium mb-2">Code Snippet</h6>
                  <pre className="text-xs bg-gray-800 text-gray-200 p-3 rounded overflow-auto max-h-64">
                    {item.visualContent.content}
                  </pre>
                </div>
              )}
              
              {(item.visualContent.type === ContentType.CHART || 
                item.visualContent.type === ContentType.DIAGRAM || 
                item.visualContent.type === ContentType.IMAGE) && 
                item.visualContent.content && 
                item.visualContent.content.image && (
                <div>
                  <h6 className="text-xs font-medium mb-2">
                    {item.visualContent.type === ContentType.CHART ? 'Chart' : 
                     item.visualContent.type === ContentType.DIAGRAM ? 'Diagram' : 'Image'}
                  </h6>
                  <div className="bg-gray-900 p-1 rounded">
                    <div className="relative w-full" style={{ height: '200px' }}>
                      <Image 
                        src={item.visualContent.content.image}
                        alt="Visual content"
                        layout="fill"
                        objectFit="contain"
                        className="rounded"
                      />
                    </div>
                  </div>
                  {item.visualContent.content.description && (
                    <p className="text-xs text-gray-600 mt-2">{item.visualContent.content.description}</p>
                  )}
                </div>
              )}
              
              {item.visualContent.type === ContentType.TEXT && (
                <div>
                  <h6 className="text-xs font-medium mb-2">Text Content</h6>
                  <div className="space-y-2">
                    {Array.isArray(item.visualContent.content) ? (
                      item.visualContent.content.map((content, idx) => (
                        <div key={idx} className="text-sm">
                          {content.type === 'heading' && (
                            <h3 className="font-medium">{content.content}</h3>
                          )}
                          {content.type === 'bullet_point' && (
                            <div className="ml-4">• {content.content.replace(/^[•\-*]\s*/, '')}</div>
                          )}
                          {content.type === 'key_value' && (
                            <div className="flex">
                              <span className="font-medium mr-2">{content.content.split(':')[0]}:</span>
                              <span>{content.content.split(':').slice(1).join(':').trim()}</span>
                            </div>
                          )}
                          {content.type === 'paragraph' && (
                            <p>{content.content}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm">{String(item.visualContent.content)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setSelectedItem(null)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          Back to timeline
        </button>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">Synchronized Content</h3>
          {isRecording && (
            <div className="ml-3 flex items-center">
              <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500">Total items: {syncedContent.length}</span>
      </div>
      
      {syncedContent.length === 0 ? (
        <div className="border border-gray-200 rounded-md p-6 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 italic text-center">
            {isRecording 
              ? "Capturing and synchronizing content..." 
              : "No synchronized content available. Start recording to capture data."}
          </p>
        </div>
      ) : (
        <>
          {/* Selected item detailed view */}
          {selectedItem && renderDetailedView(selectedItem)}
          
          {/* Timeline view */}
          {!selectedItem && (
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="relative">
                {/* Timeline track */}
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                
                {/* Timeline items */}
                <div className="space-y-6">
                  <AnimatePresence>
                    {recentItems.map((item) => (
                      <motion.div
                        key={item.transcription.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative flex items-start cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                        onClick={() => setSelectedItem(item)}
                      >
                        {/* Timestamp */}
                        <div className="w-16 text-right pr-4">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        
                        {/* Timeline node */}
                        <div className="absolute left-16 top-2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1.5 z-10"></div>
                        
                        {/* Content */}
                        <div className="ml-6 flex-1">
                          {/* Transcription */}
                          <div className="bg-white p-2 rounded shadow-sm mb-2">
                            <p className="text-sm text-gray-700 line-clamp-2">{item.transcription.text}</p>
                          </div>
                          
                          {/* Visual content preview if available */}
                          {item.visualContent && (
                            <div className="border border-gray-200 rounded overflow-hidden">
                              {renderVisualContentPreview(item)}
                              <div className="p-2 bg-white">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-gray-700 capitalize">
                                    {item.visualContent.type}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Sync: {(item.syncConfidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        {syncedContent.length > maxItems && !selectedItem && (
          <p>Showing last {maxItems} of {syncedContent.length} items. Click an item to view details.</p>
        )}
      </div>
    </div>
  );
} 