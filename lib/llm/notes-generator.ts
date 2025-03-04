import { 
  generateMeetingSummary, 
  extractActionItems, 
  categorizeTopics, 
  generateCompletion, 
  ChatMessage 
} from './openai-service';
import { 
  MeetingContext, 
  TranscriptSegment, 
  MeetingMetadata, 
  prepareMeetingContext, 
  formatContextForLLM,
  createChatMessages,
  summarizeContext 
} from './context-service';
import { DetectedContent } from '../visual/content-detector';
import { 
  MEETING_NOTES_TEMPLATE, 
  MEETING_SUMMARY_TEMPLATE, 
  ACTION_ITEMS_TEMPLATE, 
  TOPIC_CATEGORIZATION_TEMPLATE 
} from './prompt-templates';

/**
 * Interface for generated meeting notes
 */
export interface MeetingNotes {
  title: string;
  date: string;
  summary: string;
  topics: {
    name: string;
    content: string;
    relevance: number;
  }[];
  actionItems: {
    action: string;
    assignee: string;
    dueDate?: string;
  }[];
  fullContent: string;
}

/**
 * Generates comprehensive meeting notes from transcript and visual content
 * 
 * @param transcript Meeting transcript segments
 * @param visualContent Detected visual content
 * @param metadata Meeting metadata
 * @returns Generated meeting notes
 */
export async function generateNotes(
  transcript: TranscriptSegment[],
  visualContent: DetectedContent[],
  metadata: MeetingMetadata = {}
): Promise<MeetingNotes> {
  // Prepare the context for LLM
  const context = prepareMeetingContext(transcript, visualContent, metadata);
  
  // Generate a concise summary
  const summary = await generateSummary(context);
  
  // Extract action items
  const actionItems = await extractActionItemsFromContext(context);
  
  // Categorize topics
  const topicsResult = await categorizeTopicsFromContext(context);
  
  // Generate the full meeting notes content
  const fullContent = await generateFullNotes(context, summary, actionItems, topicsResult.topics);
  
  return {
    title: metadata.title || 'Meeting Notes',
    date: metadata.date || new Date().toISOString().split('T')[0],
    summary,
    topics: topicsResult.topics.map(topic => ({
      name: topic.name,
      content: topicsResult.sections.find(section => section.topic === topic.name)?.content || '',
      relevance: topic.relevance
    })),
    actionItems,
    fullContent
  };
}

/**
 * Generates a concise summary from the meeting context
 * 
 * @param context The meeting context
 * @returns Generated summary
 */
export async function generateSummary(context: MeetingContext): Promise<string> {
  // For summaries, we can use a subset of the context to avoid token limits
  const summaryContext = summarizeContext(context);
  const formattedContext = formatContextForLLM(summaryContext);
  
  return generateMeetingSummary(formattedContext);
}

/**
 * Extracts action items from the meeting context
 * 
 * @param context The meeting context
 * @returns Extracted action items
 */
export async function extractActionItemsFromContext(
  context: MeetingContext
): Promise<{ action: string; assignee: string; dueDate?: string }[]> {
  // For action items, we mainly need the transcript
  const transcriptText = context.transcript.map(segment => {
    const speaker = segment.speaker ? `${segment.speaker}: ` : '';
    return `${speaker}${segment.text}`;
  }).join('\n\n');
  
  return extractActionItems(transcriptText);
}

/**
 * Categorizes topics from the meeting context
 * 
 * @param context The meeting context
 * @returns Categorized topics and sections
 */
export async function categorizeTopicsFromContext(
  context: MeetingContext
): Promise<{
  topics: { name: string; relevance: number }[];
  sections: { topic: string; content: string; startTime?: string; endTime?: string }[];
}> {
  // For topic categorization, we need the transcript
  const transcriptText = context.transcript.map(segment => {
    const speaker = segment.speaker ? `${segment.speaker}: ` : '';
    return `${speaker}${segment.text}`;
  }).join('\n\n');
  
  return categorizeTopics(transcriptText);
}

/**
 * Generates the full meeting notes content
 * 
 * @param context The meeting context
 * @param summary Generated summary
 * @param actionItems Extracted action items
 * @param topics Categorized topics
 * @returns Complete meeting notes content
 */
export async function generateFullNotes(
  context: MeetingContext,
  summary: string,
  actionItems: { action: string; assignee: string; dueDate?: string }[],
  topics: { name: string; relevance: number }[]
): Promise<string> {
  // Create a custom prompt with the pre-generated elements
  const customPrompt = `
    Generate comprehensive meeting notes using the provided context, summary, action items, and topics.

    The summary is:
    ${summary}

    The main topics discussed were:
    ${topics.map(topic => `- ${topic.name} (relevance: ${topic.relevance})`).join('\n')}

    The action items identified are:
    ${actionItems.map(item => {
      const dueDate = item.dueDate ? ` (Due: ${item.dueDate})` : '';
      return `- ${item.action} - Assigned to: ${item.assignee}${dueDate}`;
    }).join('\n')}

    Please create well-structured, professional meeting notes that include all this information in an organized format.
    Start with a clear title and meeting details, followed by the executive summary.
    Then organize the content by topics, and end with a clear action items section.
  `;
  
  // Create chat messages with the meeting notes template and context
  const messages = createChatMessages(
    MEETING_NOTES_TEMPLATE,
    context,
    customPrompt
  );
  
  return generateCompletion(messages, {
    temperature: 0.4, // Lower temperature for more consistent output
    maxTokens: 2500, // Allow for longer output
  });
}

/**
 * Generates a quick summary without the full notes generation process
 * 
 * @param transcript Meeting transcript segments
 * @returns Quick summary of the meeting
 */
export async function generateQuickSummary(transcript: TranscriptSegment[]): Promise<string> {
  // For quick summaries, we just need the transcript text
  const transcriptText = transcript.map(segment => {
    const speaker = segment.speaker ? `${segment.speaker}: ` : '';
    return `${speaker}${segment.text}`;
  }).join('\n\n');
  
  const messages: ChatMessage[] = [
    { role: 'system', content: MEETING_SUMMARY_TEMPLATE },
    { role: 'user', content: `Please summarize the following meeting transcript:\n\n${transcriptText}` }
  ];
  
  return generateCompletion(messages, {
    temperature: 0.5,
    maxTokens: 500, // Shorter for quick summaries
  });
}

/**
 * Extracts key points from the meeting context
 * 
 * @param context The meeting context
 * @returns Array of key points
 */
export async function extractKeyPoints(context: MeetingContext): Promise<string[]> {
  const systemPrompt = `
    You are an AI assistant that specializes in identifying key points from meeting transcripts.
    Your task is to extract the most important points discussed in the meeting.
    Focus on decisions, insights, and significant information.
    Return the result as a JSON array of strings, with each string being a key point.
  `;
  
  const messages = createChatMessages(systemPrompt, context);
  
  const completion = await generateCompletion(messages, {
    temperature: 0.3, // Lower temperature for more focused output
  });
  
  try {
    return JSON.parse(completion);
  } catch (error) {
    console.error('Error parsing key points JSON:', error);
    return ['Error extracting key points'];
  }
} 