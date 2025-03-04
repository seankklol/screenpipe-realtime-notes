import { NextResponse } from 'next/server';
import { 
  TranscriptSegment, 
  MeetingMetadata 
} from '@/lib/llm/context-service';
import { 
  MeetingNotes,
  generateNotes 
} from '@/lib/llm/notes-generator';
import { DetectedContent } from '@/lib/visual/content-detector';
import { ContentType } from '@/lib/visual/content-detector';

// Define interface for synchronized content from API
interface SynchronizedContentItem {
  timestamp: string;
  transcription: string;
  visualContentType: string;
  syncConfidence: number;
}

// Validate the request data structure
function validateRequest(data: any): { valid: boolean; error?: string } {
  // Validate basic structure
  if (!data) {
    return { valid: false, error: 'Request body is required' };
  }
  
  // Title is required
  if (!data.title) {
    return { valid: false, error: 'Meeting title is required' };
  }
  
  // Participants should be an array if provided
  if (data.participants && !Array.isArray(data.participants)) {
    return { valid: false, error: 'Participants must be an array' };
  }
  
  // Transcript should be an array if provided
  if (data.transcript && !Array.isArray(data.transcript)) {
    return { valid: false, error: 'Transcript must be an array' };
  }
  
  // Transcriptions should be an array if provided
  if (data.transcriptions && !Array.isArray(data.transcriptions)) {
    return { valid: false, error: 'Transcriptions must be an array' };
  }
  
  // Visual content should be an array if provided
  if (data.visualContent && !Array.isArray(data.visualContent)) {
    return { valid: false, error: 'Visual content must be an array' };
  }
  
  // Frames should be an array if provided
  if (data.frames && !Array.isArray(data.frames)) {
    return { valid: false, error: 'Frames must be an array' };
  }
  
  // Synchronized content should be an array if provided
  if (data.synchronizedContent && !Array.isArray(data.synchronizedContent)) {
    return { valid: false, error: 'Synchronized content must be an array' };
  }
  
  // Validate date formats if provided
  if (data.startTime && isNaN(Date.parse(data.startTime))) {
    return { valid: false, error: 'Start time must be a valid date string' };
  }
  
  if (data.endTime && isNaN(Date.parse(data.endTime))) {
    return { valid: false, error: 'End time must be a valid date string' };
  }
  
  return { valid: true };
}

/**
 * API route handler for generating meeting notes
 */
export async function POST(req: Request) {
  try {
    // Extract data from the request
    const data = await req.json();
    
    // Validate request data
    const validation = validateRequest(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { title, participants, transcript, visualContent, transcriptions, frames, synchronizedContent } = data;
    
    // Prepare metadata
    const metadata: MeetingMetadata = {
      title,
      date: new Date().toISOString().split('T')[0],
      participants: participants || [],
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      description: data.description
    };
    
    // Process transcript/transcriptions - prefer transcript if available, otherwise use transcriptions
    let processedTranscript: TranscriptSegment[] = [];
    
    if (transcript && transcript.length > 0) {
      processedTranscript = transcript;
    } else if (transcriptions && transcriptions.length > 0) {
      // Map individual transcription items to transcript segments
      processedTranscript = transcriptions.map((item: any) => ({
        speaker: item.speaker_id ? `Speaker ${item.speaker_id}` : 'Unknown',
        text: item.text,
        timestamp: item.timestamp,
        duration: item.duration || 0
      }));
    } else {
      // If no real transcription data, generate mock data
      processedTranscript = generateMockTranscript(metadata);
    }
    
    // Process visual content - prefer visualContent if available, otherwise use frames
    let processedVisualContent: DetectedContent[] = [];
    
    if (visualContent && visualContent.length > 0) {
      processedVisualContent = visualContent;
    } else if (frames && frames.length > 0) {
      // Map frames to simple detected content (text type)
      processedVisualContent = frames.map((frame: any) => ({
        type: ContentType.TEXT,
        content: frame.text || '',
        confidence: 0.8,
        timestamp: frame.timestamp,
        frameId: frame.id,
        metadata: {
          app_name: frame.app_name,
          window_name: frame.window_name
        }
      }));
    } else {
      // If no real visual content, generate mock data
      processedVisualContent = generateMockVisualContent();
    }
    
    // Process synchronized content if available
    if (synchronizedContent && synchronizedContent.length > 0) {
      // Enhance the context with synchronized content
      // We'll extend the existing metadata with this information
      metadata.synchronizedContent = synchronizedContent.map((item: SynchronizedContentItem) => ({
        timestamp: item.timestamp,
        transcription: item.transcription,
        visualContentType: item.visualContentType,
        syncConfidence: item.syncConfidence
      }));
    }
    
    // Implement timeout for note generation to prevent hanging requests
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Note generation timed out')), 30000); // 30-second timeout
    });
    
    // Generate notes with timeout
    const notesPromise = generateNotes(
      processedTranscript, 
      processedVisualContent, 
      metadata
    );
    
    // Race the note generation against timeout
    const notes = await Promise.race([notesPromise, timeoutPromise]) as MeetingNotes;
    
    // Return generated notes
    return NextResponse.json(notes);
  } catch (error: any) {
    console.error('Error generating notes:', error);
    
    // Determine the appropriate error response
    if (error.message === 'Note generation timed out') {
      return NextResponse.json(
        { error: 'Note generation timed out. Please try again with less content.' },
        { status: 504 } // Gateway Timeout
      );
    } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid request format. Please check your JSON structure.' },
        { status: 400 }
      );
    } else if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Connection to API service was interrupted. Please try again.' },
        { status: 503 } // Service Unavailable
      );
    } else if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request was aborted. Please try again.' },
        { status: 499 } // Client Closed Request
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate notes',
        message: error.message || 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Generates mock transcript data for testing
 * 
 * @param metadata Meeting metadata
 * @returns Mock transcript segments
 */
function generateMockTranscript(metadata: MeetingMetadata): TranscriptSegment[] {
  const speakers = metadata.participants || ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan'];
  const baseTime = metadata.startTime 
    ? new Date(metadata.startTime).getTime() 
    : new Date().setHours(10, 0, 0, 0);
  
  return [
    {
      speaker: speakers[0],
      text: "Good morning everyone! Let's get started with our product planning meeting. Today, we need to discuss feature prioritization for the next sprint, resource allocation, and any technical challenges we might face.",
      timestamp: new Date(baseTime).toISOString(),
      duration: 12
    },
    {
      speaker: speakers[1],
      text: "I've prepared a list of features based on customer feedback. Feature X seems to be the most requested, followed by Feature Y and then some mobile improvements.",
      timestamp: new Date(baseTime + 15000).toISOString(),
      duration: 10
    },
    {
      speaker: speakers[2],
      text: "I'm a bit concerned about Feature X. It's quite complex and might introduce some performance issues if not implemented carefully.",
      timestamp: new Date(baseTime + 28000).toISOString(),
      duration: 8
    },
    {
      speaker: speakers[0],
      text: "That's a valid concern. Let's discuss the technical challenges. What specific performance issues are you worried about?",
      timestamp: new Date(baseTime + 38000).toISOString(),
      duration: 6
    },
    {
      speaker: speakers[2],
      text: "Well, Feature X will require fetching large datasets and processing them client-side. We might need to implement lazy loading, optimize our database queries, and consider some caching strategies.",
      timestamp: new Date(baseTime + 46000).toISOString(),
      duration: 15
    },
    {
      speaker: speakers[3],
      text: "I've been analyzing the customer feedback data, and users are also reporting issues with the dashboard. The reporting features need enhancement, and the mobile experience has been rated poorly in recent surveys.",
      timestamp: new Date(baseTime + 63000).toISOString(),
      duration: 12
    },
    {
      speaker: speakers[4],
      text: "On a positive note, customers have been happy with our recent security enhancements.",
      timestamp: new Date(baseTime + 77000).toISOString(),
      duration: 5
    },
    {
      speaker: speakers[0],
      text: "Let's talk about resource allocation. I think we should dedicate some time to addressing technical debt. Maybe 20% of our resources?",
      timestamp: new Date(baseTime + 84000).toISOString(),
      duration: 9
    },
    {
      speaker: speakers[1],
      text: "That seems reasonable. We could allocate 20% to technical debt, 50% to Feature X development, 20% to bug fixes, and 10% to exploratory work for Q3 features.",
      timestamp: new Date(baseTime + 95000).toISOString(),
      duration: 12
    },
    {
      speaker: speakers[0],
      text: "Great! So the decisions are: Feature X will be prioritized for the next sprint, we'll allocate 20% of resources to technical debt, and we'll implement the new design system incrementally. Any objections?",
      timestamp: new Date(baseTime + 110000).toISOString(),
      duration: 10
    },
    {
      speaker: speakers[3],
      text: "Sounds good to me.",
      timestamp: new Date(baseTime + 122000).toISOString(),
      duration: 2
    },
    {
      speaker: speakers[0],
      text: "Let's wrap up with action items. Alice, can you create detailed specifications for Feature X by next Friday?",
      timestamp: new Date(baseTime + 126000).toISOString(),
      duration: 7
    },
    {
      speaker: speakers[0],
      text: "Bob, please schedule a technical debt review session for early next week.",
      timestamp: new Date(baseTime + 135000).toISOString(),
      duration: 5
    },
    {
      speaker: speakers[0],
      text: "Charlie, we'll need a performance testing plan for Feature X.",
      timestamp: new Date(baseTime + 142000).toISOString(),
      duration: 4
    },
    {
      speaker: speakers[0],
      text: "Diana, could you analyze the customer feedback data specifically for dashboard improvement opportunities? Let's aim to have that by the 20th.",
      timestamp: new Date(baseTime + 148000).toISOString(),
      duration: 9
    },
    {
      speaker: speakers[0],
      text: "And Evan, please update the sprint planning board with our new priorities by Thursday.",
      timestamp: new Date(baseTime + 159000).toISOString(),
      duration: 6
    },
    {
      speaker: speakers[0],
      text: "Thanks everyone! Let's reconvene next week to review progress.",
      timestamp: new Date(baseTime + 167000).toISOString(),
      duration: 5
    }
  ];
}

/**
 * Generates mock visual content for testing
 * 
 * @returns Mock detected visual content
 */
function generateMockVisualContent(): DetectedContent[] {
  const baseTime = new Date().setHours(10, 5, 0, 0);
  
  return [
    {
      type: 'TABLE' as ContentType,
      content: {
        headers: ['Feature', 'Priority', 'Complexity', 'Estimated Time'],
        rows: [
          ['Feature X', 'High', 'High', '3 weeks'],
          ['Feature Y', 'Medium', 'Medium', '2 weeks'],
          ['Mobile Improvements', 'Medium', 'Low', '1 week'],
          ['Accessibility Enhancements', 'Low', 'Medium', '2 weeks']
        ]
      },
      confidence: 0.9,
      timestamp: new Date(baseTime + 20000).toISOString(),
      frameId: 'frame-001',
      metadata: {
        rowCount: 4,
        columnCount: 4
      }
    },
    {
      type: 'CHART' as ContentType,
      content: {
        image: '',
        description: 'Pie chart showing resource allocation: 50% Feature X, 20% Technical Debt, 20% Bug Fixes, 10% Q3 Planning'
      },
      confidence: 0.85,
      timestamp: new Date(baseTime + 90000).toISOString(),
      frameId: 'frame-002'
    },
    {
      type: 'TEXT' as ContentType,
      content: [
        {
          type: 'heading',
          content: 'Technical Challenges',
          confidence: 0.95
        },
        {
          type: 'bullet_point',
          content: 'Large dataset processing',
          confidence: 0.9
        },
        {
          type: 'bullet_point',
          content: 'Client-side performance',
          confidence: 0.9
        },
        {
          type: 'bullet_point',
          content: 'Mobile compatibility',
          confidence: 0.9
        }
      ],
      confidence: 0.95,
      timestamp: new Date(baseTime + 50000).toISOString(),
      frameId: 'frame-003',
      metadata: {
        charCount: 120,
        lineCount: 4,
        contentTypes: ['heading', 'bullet_point', 'bullet_point', 'bullet_point']
      }
    }
  ];
} 