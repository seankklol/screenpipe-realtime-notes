# Real-Time Meeting Notes Generator: Implementation Plan

## Project Overview

This document outlines the step-by-step process for implementing the Real-Time Meeting Notes Generator using Screenpipe's capabilities. The plan is designed for execution by an AI agent with specific guidance on human developer involvement.

**Current Project Status**: Phase 1 development (35% complete)
- Audio transcription and basic UI are implemented
- Visual content integration and LLM processing are in progress
- Focus is on functional core features rather than privacy

## Implementation Roles

### AI Agent Responsibilities
- Next.js component and feature implementation
- API integration with Screenpipe
- LLM prompt engineering and integration
- Documentation generation
- Test case creation

### Human Developer Responsibilities
- Setting up initial environment and access
- Providing API keys for LLM services
- Testing in real meeting scenarios
- Final review and approval of features
- Deployment to production

## Phase 1: Core Functionality Implementation

### Step 1: Project Setup and Configuration (✅ Completed)
**AI Tasks:**
- Generate Next.js project structure
- Implement basic routing and layouts
- Set up TailwindCSS and ShadCN UI components
- Create configuration structure

**Human Tasks:**
- Create Screenpipe developer account
- Set up local environment
- Generate and provide necessary API keys
- Verify project structure

### Step 2: Audio Transcription Pipeline (✅ Completed)
**AI Tasks:**
- Implement `useTranscription` hook
- Create transcription display components
- Set up real-time transcription rendering
- Implement timestamps and confidence scoring

**Human Tasks:**
- Test microphone access permissions
- Verify transcription accuracy in different environments
- Provide feedback on transcription display UI

### Step 3: Visual Content Integration (🔄 In Progress - 50%)
**AI Tasks:**
- Implement Screenpipe's `streamVision` integration
- Create OCR processing pipeline
- Develop content type detection (slides, documents, etc.)
- Build visual content storage and retrieval system

**Human Tasks:**
- Test screen sharing permissions
- Provide sample meeting materials (slides, documents)
- Validate OCR accuracy across different content types

### Step 4: LLM Integration for Notes Processing (🔄 In Progress - 30%)
**AI Tasks:**
- Design prompt templates for different note sections
- Implement context preparation from transcriptions and visuals
- Create content classification system (topics, action items, decisions)
- Build notes generation pipeline

**Human Tasks:**
- Provide API keys for chosen LLM provider
- Review prompt effectiveness
- Share feedback on notes quality and organization
- Test with varied meeting content

### Step 5: Notes Export Functionality (⏳ Pending)
**AI Tasks:**
- Implement Markdown export functionality
- Create PDF generation pipeline
- Design file system integration
- Build export UI components

**Human Tasks:**
- Specify preferred export formats
- Test file permissions for saving locally
- Verify export quality

### Step 6: Meeting Database Schema (⏳ Pending)
**AI Tasks:**
- Design SQLite schema for meeting data
- Implement database integration with Screenpipe
- Create data persistence layer
- Build querying and retrieval functions

**Human Tasks:**
- Review schema design
- Test database performance
- Validate data integrity

### Step 7: Testing and Performance Optimization
**AI Tasks:**
- Create automated test suite
- Implement performance monitoring
- Optimize CPU and memory usage
- Address known limitations

**Human Tasks:**
- Conduct real-world meeting tests
- Monitor system resource usage
- Report any performance issues

## Detailed Implementation Tasks

### Visual Content Integration Implementation Details

1. **Screen Capture Setup**
   ```typescript
   // Implement in lib/visual/capture.ts
   export function setupScreenCapture(pipe) {
     return pipe.streamVision(async (frame) => {
       // Process frame
       const processedFrame = await preprocessFrame(frame);
       return processedFrame;
     });
   }
   ```

2. **OCR Implementation**
   ```typescript
   // Implement in lib/visual/ocr.ts
   export async function extractTextFromFrame(frame, pipe) {
     // Use Screenpipe's OCR capabilities
     const ocrResult = await pipe.vision.extractText(frame);
     
     // Post-process OCR results
     return {
       text: ocrResult.text,
       confidence: ocrResult.confidence,
       regions: ocrResult.regions
     };
   }
   ```

3. **Content Type Detection**
   ```typescript
   // Implement in lib/visual/content-detection.ts
   export async function detectContentType(frame, pipe) {
     // Analyze frame characteristics
     const hasSlideCharacteristics = await checkForSlideFeatures(frame);
     const hasDocumentCharacteristics = await checkForDocumentFeatures(frame);
     
     // Determine type based on characteristics
     if (hasSlideCharacteristics) return 'slide';
     if (hasDocumentCharacteristics) return 'document';
     return 'other';
   }
   ```

4. **Visual Content Component**
   ```tsx
   // Implement in components/notes/VisualContentView.tsx
   export default function VisualContentView({ visualContent }) {
     return (
       <div className="visual-content-container">
         {visualContent.map((content) => (
           <div key={content.id} className="visual-content-item">
             <div className="timestamp">{formatTimestamp(content.timestamp)}</div>
             <div className="content-type">{content.contentType}</div>
             <div className="ocr-text">{content.ocrText}</div>
           </div>
         ))}
       </div>
     );
   }
   ```

### LLM Integration Implementation Details

1. **Context Preparation**
   ```typescript
   // Implement in lib/llm/context.ts
   export function prepareContext(state, timeWindow = 60) {
     // Get recent content within timeWindow seconds
     const recentTranscriptions = getRecentTranscriptions(state, timeWindow);
     const recentVisualContent = getRecentVisualContent(state, timeWindow);
     
     // Format context for LLM
     return {
       transcriptions: recentTranscriptions.map(formatTranscriptionForLLM),
       visualContent: recentVisualContent.map(formatVisualContentForLLM),
       currentNotes: state.notes
     };
   }
   ```

2. **Prompt Engineering**
   ```typescript
   // Implement in lib/llm/prompts.ts
   export const NOTES_GENERATION_PROMPT = `
   You are an expert meeting transcriber and note taker.
   Based on the following meeting transcription and visual content, 
   generate structured meeting notes.
   
   Organize the content into these sections:
   1. Key Topics
   2. Action Items (with deadlines if mentioned)
   3. Decisions Made
   4. Summary
   
   Transcription: {{transcription}}
   Visual Content: {{visualContent}}
   `;
   
   export function generatePrompt(template, context) {
     return template
       .replace('{{transcription}}', JSON.stringify(context.transcriptions))
       .replace('{{visualContent}}', JSON.stringify(context.visualContent));
   }
   ```

3. **LLM Service Integration**
   ```typescript
   // Implement in lib/llm/service.ts
   export async function generateNotes(context, pipe) {
     const prompt = generatePrompt(NOTES_GENERATION_PROMPT, context);
     
     try {
       // Use either built-in AI capabilities or external service
       const llmResponse = await pipe.ai.generate({
         prompt,
         model: "gpt-4", // or other configured model
         temperature: 0.1
       });
       
       return parseNotesResponse(llmResponse);
     } catch (error) {
       console.error("Error generating notes:", error);
       return null;
     }
   }
   ```

4. **Notes Structure Parser**
   ```typescript
   // Implement in lib/llm/parser.ts
   export function parseNotesResponse(llmResponse) {
     // Parse LLM output into structured notes format
     const sections = extractSections(llmResponse);
     const actionItems = extractActionItems(llmResponse);
     const decisions = extractDecisions(llmResponse);
     const summary = extractSummary(llmResponse);
     
     return {
       sections,
       actionItems,
       decisions,
       summary
     };
   }
   ```

## Timeline and Milestones

| Task | Duration | Dependencies | Assignee |
|------|----------|--------------|----------|
| Visual Content Integration | 2 weeks | Audio Transcription | AI Agent |
| LLM Integration | 3 weeks | Audio Transcription | AI Agent |
| Notes Export Functionality | 4 weeks | Notes Generation | AI Agent |
| Database Schema Implementation | 3 weeks | None | AI Agent |
| Testing & Optimization | 2 weeks | All features | AI & Human |
| Phase 1 Completion | 8 weeks total | All Phase 1 tasks | AI & Human |

## Integration with Screenpipe

The implementation leverages these key Screenpipe capabilities:

1. **Audio Processing**
   - `pipe.streamTranscriptions`: For real-time speech-to-text
   - Transcription confidence scoring
   - Audio quality analysis

2. **Visual Processing**
   - `pipe.streamVision`: For real-time screen capture
   - `pipe.vision.extractText`: For OCR functionality
   - Frame processing and analysis

3. **AI Integration**
   - `pipe.ai.generate`: For LLM-based content generation
   - `pipe.ai.categorize`: For content classification

4. **Database Usage**
   - Screenpipe's built-in SQLite for data persistence
   - Meeting records storage and retrieval

## Testing Strategy

### Automated Testing
The AI agent will implement:
- Unit tests for individual components
- Integration tests for Screenpipe API interactions
- End-to-end tests for complete workflows

### Human Testing
The human developer should conduct:
- Real meeting scenario tests
- Performance testing on various hardware
- UI/UX feedback sessions

## Known Challenges and Mitigation

1. **LLM Processing Latency**
   - **Mitigation**: Implement chunked processing and caching for long meetings
   - **AI Task**: Optimize context preparation and implement background processing
   - **Human Task**: Test with different LLM providers to find optimal balance

2. **Visual Content Processing Accuracy**
   - **Mitigation**: Implement confidence thresholds and manual correction UI
   - **AI Task**: Create algorithms to detect and handle low-confidence OCR results
   - **Human Task**: Provide diverse testing materials to improve detection

3. **Resource Utilization**
   - **Mitigation**: Implement adaptive resource management
   - **AI Task**: Create configurable processing settings based on hardware
   - **Human Task**: Test on target hardware and provide resource monitoring

## Human Developer Setup Guide

To prepare for AI agent implementation, the human developer should:

1. **Initial Setup**
   ```bash
   # Clone repository
   git clone https://github.com/example/meeting-notes-pipe.git
   cd meeting-notes-pipe
   
   # Install dependencies
   npm install
   
   # Create .env file with required API keys
   cp .env.example .env
   # Edit .env with your API keys for OpenAI/Anthropic
   ```

2. **Install Screenpipe**
   - Download from official Screenpipe website
   - Complete installation and setup
   - Authorize necessary permissions (microphone, screen capture)

3. **Add Project as Pipe**
   - Open Screenpipe desktop app
   - Navigate to Pipes section
   - Click "Add Pipe"
   - Select the project directory

4. **Test Environment**
   - Ensure microphone is working correctly
   - Test screen sharing functionality
   - Verify LLM API keys are functioning

## Conclusion

This implementation plan provides a structured approach for an AI agent to develop the Real-Time Meeting Notes Generator with clear delineation of AI and human responsibilities. By following this plan, the project can progress from its current 35% completion to full implementation of Phase 1 functionality, with a clear path toward Phases 2 and 3.

The focus remains on ensuring core functionality works reliably, with careful integration of Screenpipe's capabilities. Regular collaboration between the AI agent and human developer will be essential for successful implementation, particularly for testing and refinement in real-world meeting scenarios. 