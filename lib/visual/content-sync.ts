import { VisualFrame } from './capture';
import { TranscriptionItem } from '@/components/notes/TranscriptionView';
import { DetectedContent } from './content-detector';

/**
 * Interface for synchronized content
 */
export interface SynchronizedContent {
  visualContent: DetectedContent | null;
  transcription: TranscriptionItem;
  timestamp: string;
  syncConfidence: number; // 0-1 indicating confidence in the synchronization
}

/**
 * Synchronizes visual content with audio transcriptions based on timestamps
 * 
 * @param visualContent Array of detected visual content
 * @param transcriptions Array of audio transcriptions
 * @param maxTimeGapMs Maximum allowed time gap in milliseconds between audio and visual timestamps
 * @returns Array of synchronized content objects
 */
export function synchronizeContent(
  visualContent: DetectedContent[],
  transcriptions: TranscriptionItem[],
  maxTimeGapMs: number = 5000
): SynchronizedContent[] {
  if (!visualContent.length || !transcriptions.length) {
    return [];
  }
  
  const result: SynchronizedContent[] = [];
  
  // Sort both arrays by timestamp
  const sortedVisualContent = [...visualContent].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const sortedTranscriptions = [...transcriptions].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // For each transcription, find the closest visual content
  sortedTranscriptions.forEach(transcription => {
    const transcriptionTime = new Date(transcription.timestamp).getTime();
    
    // Find the closest visual content by timestamp
    let closestContent: DetectedContent | null = null;
    let smallestGap = Infinity;
    
    sortedVisualContent.forEach(content => {
      const contentTime = new Date(content.timestamp).getTime();
      const gap = Math.abs(contentTime - transcriptionTime);
      
      if (gap < smallestGap) {
        smallestGap = gap;
        closestContent = content;
      }
    });
    
    // Only include if the gap is within the allowed maximum
    if (closestContent && smallestGap <= maxTimeGapMs) {
      // Calculate synchronization confidence (1.0 for perfect sync, decreasing as gap increases)
      const syncConfidence = 1 - (smallestGap / maxTimeGapMs);
      
      result.push({
        visualContent: closestContent,
        transcription,
        timestamp: transcription.timestamp,
        syncConfidence
      });
    } else {
      // If no matching visual content found within the time gap, include without visual content
      result.push({
        visualContent: null,
        transcription,
        timestamp: transcription.timestamp,
        syncConfidence: 0
      });
    }
  });
  
  return result;
}

/**
 * Groups synchronized content into contextual segments
 * 
 * @param syncedContent Array of synchronized content
 * @param maxGapBetweenSegmentsMs Maximum time gap in milliseconds to consider items part of the same segment
 * @returns Array of content segments
 */
export function groupContentIntoSegments(
  syncedContent: SynchronizedContent[],
  maxGapBetweenSegmentsMs: number = 30000 // 30 seconds
): SynchronizedContent[][] {
  if (!syncedContent.length) {
    return [];
  }
  
  // Sort content by timestamp
  const sortedContent = [...syncedContent].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const segments: SynchronizedContent[][] = [];
  let currentSegment: SynchronizedContent[] = [sortedContent[0]];
  
  // Group content based on time proximity
  for (let i = 1; i < sortedContent.length; i++) {
    const currentTime = new Date(sortedContent[i].timestamp).getTime();
    const prevTime = new Date(sortedContent[i-1].timestamp).getTime();
    
    // If the gap is too large, start a new segment
    if (currentTime - prevTime > maxGapBetweenSegmentsMs) {
      segments.push(currentSegment);
      currentSegment = [];
    }
    
    currentSegment.push(sortedContent[i]);
  }
  
  // Add the last segment if it has content
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }
  
  return segments;
}

/**
 * Extracts a context summary from a synchronized segment
 * 
 * @param segment Array of synchronized content representing a contextual segment
 * @returns Object containing transcription and visual context summaries
 */
export function extractSegmentContext(segment: SynchronizedContent[]): {
  transcriptionContext: string;
  visualContext: string;
  timestamp: string;
} {
  // Default empty result
  const result = {
    transcriptionContext: '',
    visualContext: '',
    timestamp: segment.length > 0 ? segment[0].timestamp : new Date().toISOString()
  };
  
  if (!segment.length) {
    return result;
  }
  
  // Combine all transcription texts
  result.transcriptionContext = segment
    .map(item => item.transcription.text)
    .join(' ');
  
  // Collect unique visual contents (remove duplicates)
  const uniqueVisualContentTypes = new Set<string>();
  const visualContentDescriptions: string[] = [];
  
  segment.forEach(item => {
    if (item.visualContent) {
      const contentType = item.visualContent.type;
      
      // Only include each content type once
      if (!uniqueVisualContentTypes.has(contentType)) {
        uniqueVisualContentTypes.add(contentType);
        
        // Create a description based on the content type
        switch (contentType) {
          case 'table':
            visualContentDescriptions.push(`Table with ${item.visualContent.metadata?.rowCount || 'unknown'} rows and ${item.visualContent.metadata?.columnCount || 'unknown'} columns`);
            break;
          case 'code':
            visualContentDescriptions.push(`Code snippet (${item.visualContent.metadata?.lineCount || 'unknown'} lines)`);
            break;
          case 'text':
            visualContentDescriptions.push('Text content');
            break;
          case 'chart':
            visualContentDescriptions.push('Chart or graph');
            break;
          case 'diagram':
            visualContentDescriptions.push('Diagram or flowchart');
            break;
          case 'image':
            visualContentDescriptions.push('Image content');
            break;
          default:
            visualContentDescriptions.push('Unknown visual content');
        }
      }
    }
  });
  
  result.visualContext = visualContentDescriptions.join(', ');
  
  return result;
} 