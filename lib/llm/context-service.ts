import { DetectedContent, ContentType } from '../visual/content-detector';
import { ChatMessage } from './openai-service';

/**
 * Interface for synchronized content from API
 */
export interface SynchronizedContentItem {
  timestamp: string;
  transcription: string;
  visualContentType: string;
  syncConfidence: number;
}

/**
 * Interface for a transcript segment
 */
export interface TranscriptSegment {
  speaker?: string;
  text: string;
  timestamp: string;
  duration?: number;
}

/**
 * Interface for meeting metadata
 */
export interface MeetingMetadata {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  participants?: string[];
  description?: string;
  synchronizedContent?: SynchronizedContentItem[];
}

/**
 * Interface for combined meeting context
 */
export interface MeetingContext {
  metadata: MeetingMetadata;
  transcript: TranscriptSegment[];
  visualContent: DetectedContent[];
}

/**
 * Prepares context for the LLM by combining transcript and visual content
 * 
 * @param transcript Array of transcript segments
 * @param visualContent Array of detected visual content
 * @param metadata Meeting metadata
 * @returns Combined meeting context
 */
export function prepareMeetingContext(
  transcript: TranscriptSegment[],
  visualContent: DetectedContent[],
  metadata: MeetingMetadata = {}
): MeetingContext {
  // Sort transcript by timestamp
  const sortedTranscript = [...transcript].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
  
  // Sort visual content by timestamp
  const sortedVisualContent = [...visualContent].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
  
  return {
    metadata,
    transcript: sortedTranscript,
    visualContent: sortedVisualContent
  };
}

/**
 * Formats meeting context into a text representation for LLM consumption
 * 
 * @param context Meeting context object
 * @returns Formatted context string
 */
export function formatContextForLLM(context: MeetingContext): string {
  // Format metadata
  let formattedContext = '# MEETING INFORMATION\n';
  
  if (context.metadata.title) {
    formattedContext += `Title: ${context.metadata.title}\n`;
  }
  
  if (context.metadata.date) {
    formattedContext += `Date: ${context.metadata.date}\n`;
  }
  
  if (context.metadata.startTime) {
    formattedContext += `Start Time: ${context.metadata.startTime}\n`;
  }
  
  if (context.metadata.endTime) {
    formattedContext += `End Time: ${context.metadata.endTime}\n`;
  }
  
  if (context.metadata.participants && context.metadata.participants.length > 0) {
    formattedContext += `Participants: ${context.metadata.participants.join(', ')}\n`;
  }
  
  if (context.metadata.description) {
    formattedContext += `\nDescription: ${context.metadata.description}\n`;
  }
  
  // Format transcript
  formattedContext += '\n# TRANSCRIPT\n\n';
  
  context.transcript.forEach(segment => {
    const timestamp = new Date(segment.timestamp).toISOString().substr(11, 8); // HH:MM:SS format
    const speaker = segment.speaker ? `${segment.speaker}: ` : '';
    formattedContext += `[${timestamp}] ${speaker}${segment.text}\n\n`;
  });
  
  // Format visual content
  if (context.visualContent.length > 0) {
    formattedContext += '\n# VISUAL CONTENT\n\n';
    
    context.visualContent.forEach((content, index) => {
      const timestamp = new Date(content.timestamp).toISOString().substr(11, 8); // HH:MM:SS format
      formattedContext += `## Visual Element ${index + 1} [${timestamp}]\n\n`;
      formattedContext += `Type: ${content.type}\n`;
      formattedContext += `Confidence: ${content.confidence}\n\n`;
      
      // Format content based on type
      switch (content.type) {
        case ContentType.TABLE:
          formattedContext += 'Table Content:\n';
          if (content.content.headers) {
            formattedContext += `Headers: ${content.content.headers.join(' | ')}\n`;
            content.content.rows.forEach((row: string[]) => {
              formattedContext += `Row: ${row.join(' | ')}\n`;
            });
          } else {
            formattedContext += `${JSON.stringify(content.content, null, 2)}\n`;
          }
          break;
          
        case ContentType.CODE:
          formattedContext += 'Code Content:\n```\n';
          formattedContext += content.content;
          formattedContext += '\n```\n';
          break;
          
        case ContentType.TEXT:
          formattedContext += 'Text Content:\n';
          if (Array.isArray(content.content)) {
            content.content.forEach(item => {
              formattedContext += `[${item.type}] ${item.content}\n`;
            });
          } else {
            formattedContext += content.content;
          }
          break;
          
        case ContentType.CHART:
        case ContentType.DIAGRAM:
        case ContentType.IMAGE:
          formattedContext += 'Visual Description:\n';
          if (typeof content.content === 'object' && content.content.description) {
            formattedContext += content.content.description;
          } else {
            formattedContext += JSON.stringify(content.content);
          }
          break;
          
        default:
          formattedContext += `Content: ${JSON.stringify(content.content)}\n`;
      }
      
      formattedContext += '\n\n';
    });
  }
  
  // Format synchronized content if available
  if (context.metadata.synchronizedContent && context.metadata.synchronizedContent.length > 0) {
    formattedContext += '\n# SYNCHRONIZED CONTENT\n\n';
    formattedContext += 'The following shows moments where visual content and audio were synchronized:\n\n';
    
    context.metadata.synchronizedContent.forEach((item, index) => {
      const timestamp = new Date(item.timestamp).toISOString().substr(11, 8); // HH:MM:SS format
      formattedContext += `## Synchronized Moment ${index + 1} [${timestamp}]\n\n`;
      formattedContext += `Confidence: ${(item.syncConfidence * 100).toFixed(0)}%\n`;
      formattedContext += `Visual Content Type: ${item.visualContentType}\n\n`;
      formattedContext += `Transcription: "${item.transcription}"\n\n`;
    });
  }
  
  return formattedContext;
}

/**
 * Creates chat messages for the LLM with system prompt and context
 * 
 * @param systemPrompt The system prompt to use
 * @param context The meeting context
 * @param userPrompt Optional additional user prompt
 * @returns Array of chat messages ready for LLM
 */
export function createChatMessages(
  systemPrompt: string,
  context: MeetingContext,
  userPrompt?: string
): ChatMessage[] {
  const formattedContext = formatContextForLLM(context);
  
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userPrompt
        ? `${formattedContext}\n\n${userPrompt}`
        : formattedContext
    }
  ];
  
  return messages;
}

/**
 * Creates a summarized version of the context for shorter prompts
 * 
 * @param context The full meeting context
 * @param maxTranscriptSegments Maximum number of transcript segments to include
 * @param maxVisualElements Maximum number of visual elements to include
 * @returns Summarized meeting context
 */
export function summarizeContext(
  context: MeetingContext,
  maxTranscriptSegments: number = 10,
  maxVisualElements: number = 5
): MeetingContext {
  // Get a sample of transcript segments, prioritizing by importance
  // For now, we'll just take the first and last few segments
  const transcriptLength = context.transcript.length;
  let sampledTranscript: TranscriptSegment[] = [];
  
  if (transcriptLength <= maxTranscriptSegments) {
    sampledTranscript = context.transcript;
  } else {
    // Take some from beginning, middle, and end
    const beginCount = Math.floor(maxTranscriptSegments / 3);
    const middleCount = Math.floor(maxTranscriptSegments / 3);
    const endCount = maxTranscriptSegments - beginCount - middleCount;
    
    // Beginning
    sampledTranscript = sampledTranscript.concat(
      context.transcript.slice(0, beginCount)
    );
    
    // Middle 
    const middleStart = Math.floor(transcriptLength / 2) - Math.floor(middleCount / 2);
    sampledTranscript = sampledTranscript.concat(
      context.transcript.slice(middleStart, middleStart + middleCount)
    );
    
    // End
    sampledTranscript = sampledTranscript.concat(
      context.transcript.slice(transcriptLength - endCount)
    );
  }
  
  // Prioritize visual content by confidence score
  const sortedVisualContent = [...context.visualContent]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxVisualElements);
  
  return {
    metadata: context.metadata,
    transcript: sampledTranscript,
    visualContent: sortedVisualContent
  };
} 