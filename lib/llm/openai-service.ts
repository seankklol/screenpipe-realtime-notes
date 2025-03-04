import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface for completion request options
 */
export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * Default completion options
 */
const defaultOptions: CompletionOptions = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1500,
  frequencyPenalty: 0.2,
  presencePenalty: 0.1,
};

/**
 * Interface for chat message
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Calls the OpenAI API to generate a completion based on the provided messages
 * 
 * @param messages Array of chat messages
 * @param options Completion options
 * @returns The generated completion text
 */
export async function generateCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  try {
    const mergedOptions = { ...defaultOptions, ...options };
    
    const response = await openai.chat.completions.create({
      model: mergedOptions.model || defaultOptions.model as string,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: mergedOptions.temperature,
      max_tokens: mergedOptions.maxTokens,
      frequency_penalty: mergedOptions.frequencyPenalty,
      presence_penalty: mergedOptions.presencePenalty,
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'Error generating completion. Please try again.';
  }
}

/**
 * Generates a summary of the provided transcript
 * 
 * @param transcript The meeting transcript to summarize
 * @returns The generated summary
 */
export async function generateMeetingSummary(transcript: string): Promise<string> {
  const systemPrompt = `
    You are an AI assistant that specializes in summarizing meetings.
    Your task is to create a concise and informative summary of the meeting transcript provided.
    
    Focus on:
    1. Key points and decisions
    2. Action items and assignments
    3. Important discussions and their outcomes
    4. Follow-up tasks

    Format the summary in a clear, structured way with headings and bullet points where appropriate.
    Keep it concise but comprehensive.
  `;
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Please summarize the following meeting transcript:\n\n${transcript}` },
  ];
  
  return generateCompletion(messages, {
    temperature: 0.5, // Lower temperature for more focused output
    maxTokens: 1000,
  });
}

/**
 * Extracts action items from a meeting transcript
 * 
 * @param transcript The meeting transcript to analyze
 * @returns A list of extracted action items with assignees
 */
export async function extractActionItems(transcript: string): Promise<{
  action: string;
  assignee: string;
  dueDate?: string;
}[]> {
  const systemPrompt = `
    You are an AI assistant that specializes in identifying action items from meeting transcripts.
    Your task is to extract clear action items, who they are assigned to, and any mentioned due dates.
    
    If the assignee is not specified, mark it as "Unassigned".
    If the due date is not specified, do not include it.
    
    Format your response as a valid JSON array of objects, each with:
    - action: The specific task to be done
    - assignee: The person assigned to the task
    - dueDate: (Optional) When the task is due
  `;
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Please extract action items from the following meeting transcript:\n\n${transcript}` },
  ];
  
  const completion = await generateCompletion(messages, {
    temperature: 0.3, // Lower temperature for more precise extraction
  });
  
  try {
    return JSON.parse(completion);
  } catch (error) {
    console.error('Error parsing action items JSON:', error);
    return [];
  }
}

/**
 * Classifies the content of a visual element
 * 
 * @param textContent The text content extracted from a visual element
 * @returns Classification and description of the visual content
 */
export async function classifyVisualContent(textContent: string): Promise<{
  contentType: string;
  description: string;
  relevance: 'high' | 'medium' | 'low';
}> {
  const systemPrompt = `
    You are an AI assistant that specializes in analyzing visual content from meetings.
    Your task is to classify the text content extracted from a visual element (such as a slide, whiteboard, or diagram).
    
    Determine:
    1. The type of content (e.g., "technical diagram", "data chart", "project timeline", "feature list", etc.)
    2. A brief description of what the content shows
    3. The relevance to a typical meeting (high, medium, or low)
    
    Format your response as a valid JSON object with:
    - contentType: String describing the type of content
    - description: Brief description of what the content shows
    - relevance: Either "high", "medium", or "low"
  `;
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Please classify the following text content extracted from a visual element:\n\n${textContent}` },
  ];
  
  const completion = await generateCompletion(messages, {
    temperature: 0.4,
  });
  
  try {
    return JSON.parse(completion);
  } catch (error) {
    console.error('Error parsing visual content classification JSON:', error);
    return {
      contentType: 'unknown',
      description: 'Could not classify the visual content',
      relevance: 'low',
    };
  }
}

/**
 * Categorizes topics from a meeting transcript
 * 
 * @param transcript The meeting transcript to analyze
 * @returns A list of identified topics with relevant sections
 */
export async function categorizeTopics(transcript: string): Promise<{
  topics: { name: string; relevance: number }[];
  sections: { topic: string; content: string; startTime?: string; endTime?: string }[];
}> {
  const systemPrompt = `
    You are an AI assistant that specializes in analyzing meeting content.
    Your task is to identify the main topics discussed in the meeting and categorize sections of the transcript by topic.
    
    Provide:
    1. A list of identified topics with a relevance score (0 to 1)
    2. Sections of the transcript categorized by the main topic
    
    Format your response as a valid JSON object with:
    - topics: Array of objects with "name" and "relevance" properties
    - sections: Array of objects with "topic", "content", and optionally "startTime" and "endTime" properties
  `;
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Please categorize topics from the following meeting transcript:\n\n${transcript}` },
  ];
  
  const completion = await generateCompletion(messages, {
    temperature: 0.5,
    maxTokens: 2000,
  });
  
  try {
    return JSON.parse(completion);
  } catch (error) {
    console.error('Error parsing topic categorization JSON:', error);
    return {
      topics: [],
      sections: [],
    };
  }
} 