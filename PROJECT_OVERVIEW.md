# Real-Time Meeting Notes Generator: Project Overview

## Introduction

The Real-Time Meeting Notes Generator is a specialized Screenpipe pipe (plugin) that captures, processes, and summarizes meeting content in real-time. Leveraging Screenpipe's powerful screen capture, audio processing, and AI capabilities, this solution automatically generates comprehensive meeting notes without requiring manual documentation.

## Core Objectives

- **Real-time Transcription**: Capture and transcribe meeting audio as it happens
- **Visual Content Integration**: Extract and incorporate content from shared screens (slides, documents, diagrams)
- **Structured Notes Generation**: Produce organized, well-formatted meeting notes with key points, action items, and decisions
- **Contextual Awareness**: Maintain context across the entire meeting
- **Functional Focus**: Prioritize core functionality and reliable performance over secondary concerns

## Implementation Status Overview

**Current Status**: In Development (Phase 1 - 35% Complete)

**Completed Features**:
- ✅ Project Structure Setup
- ✅ Audio Transcription Pipeline
- ✅ Initial UI Scaffolding

**In Progress Features**:
- 🔄 Visual Content Integration
- 🔄 LLM Integration for Notes Processing

**Upcoming Features**:
- ⏳ Notes Export Functionality
- ⏳ Meeting Database Schema

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Screenpipe Core                   │
│ ┌───────────┐ ┌───────────┐ ┌────────────────────┐ │
│ │Screen Feed│ │Audio Feed │ │Accessibility Events│ │
│ └─────┬─────┘ └─────┬─────┘ └──────────┬─────────┘ │
└───────┼───────────┼────────────────────┼───────────┘
        │           │                    │
        ▼           ▼                    ▼
┌─────────────────────────────────────────────────────┐
│               Processing Pipeline                   │
│ ┌───────────┐ ┌───────────┐ ┌────────────────────┐ │
│ │OCR Engine │ │STT Engine │ │UI Element Analysis │ │
│ └─────┬─────┘ └─────┬─────┘ └──────────┬─────────┘ │
└───────┼───────────┼────────────────────┼───────────┘
        │           │                    │
        ▼           ▼                    ▼
┌─────────────────────────────────────────────────────┐
│               Meeting Notes Pipe                    │
│ ┌───────────┐ ┌───────────┐ ┌────────────────────┐ │
│ │Content    │ │Notes      │ │Classification      │ │
│ │Aggregator │ │Generator  │ │Engine              │ │
│ └─────┬─────┘ └─────┬─────┘ └──────────┬─────────┘ │
└───────┼───────────┼────────────────────┼───────────┘
        │           │                    │
        ▼           ▼                    ▼
┌─────────────────────────────────────────────────────┐
│                 User Interface                      │
│ ┌───────────┐ ┌───────────┐ ┌────────────────────┐ │
│ │Live Notes │ │Export     │ │Configuration       │ │
│ │View       │ │Options    │ │Panel               │ │
│ └───────────┘ └───────────┘ └────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Component Implementation Status

#### 1. Data Capture Layer (Screenpipe Core)
- **Audio Feed** (✅ Implemented): Captures meeting audio from system or external microphone
- **Screen Feed** (🔄 In Progress): Captures visual content at configurable resolution and frame rate
- **Accessibility Events** (⏳ Pending): Monitors UI interactions for additional context

#### 2. Processing Pipeline
- **STT Engine** (✅ Implemented): Converts audio to text with high accuracy
- **OCR Engine** (🔄 In Progress): Extracts text from screen content (presentations, shared documents)
- **UI Element Analysis** (⏳ Pending): Identifies UI elements for contextual understanding

#### 3. Meeting Notes Pipe
- **Content Aggregator** (🔄 In Progress): Combines and correlates visual and audio content
- **Notes Generator** (🔄 In Progress): Transforms raw data into structured meeting notes
- **Classification Engine** (🔄 In Progress): Categorizes content into topics, action items, etc.

#### 4. User Interface
- **Live Notes View** (✅ Implemented): Real-time display of generated notes
- **Configuration Panel** (✅ Implemented): Customize behavior and appearance
- **Export Options** (⏳ Pending): Save notes in various formats (Markdown, PDF, etc.)

## Technical Implementation

### Data Flow

1. **Capture Phase**
   - Audio is captured via `pipe.streamTranscriptions` (✅ Implemented)
   - Screen content is captured via `pipe.streamVision` (🔄 In Progress)
   - Both streams are processed simultaneously in real-time

2. **Processing Phase**
   - Audio is sent through STT processing (✅ Implemented)
   - Screen content is processed with OCR to extract text (🔄 In Progress)
   - UI elements are analyzed for context (⏳ Pending)

3. **Analysis Phase**
   - LLM processes combined audio and visual data (🔄 In Progress)
   - Content is categorized into topics, action items, decisions, etc. (🔄 In Progress)

4. **Generation Phase**
   - Structured notes are generated with proper formatting (🔄 In Progress)
   - Content is organized chronologically with timestamps (✅ Implemented)
   - Key points are highlighted and summarized (⏳ Pending)

### Current API Implementation

```typescript
// Main pipe entry point - currently implemented
export default async function setupPipe(pipe) {
  // Initialize state
  const meetingState = {
    transcriptions: [],
    visualContent: [],
    notes: { sections: [], actionItems: [], decisions: [] }
  };

  // Start audio transcription stream - implemented
  pipe.streamTranscriptions(async (transcription) => {
    // Add timestamp and unique ID
    const enrichedTranscription = {
      ...transcription,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    // Add to state
    meetingState.transcriptions.push(enrichedTranscription);
    
    // Update notes in real-time
    await updateNotes(meetingState, pipe);
  });

  // Start vision stream for screen content - in progress
  pipe.streamVision(async (frame) => {
    // Process visual content
    await processVisualContent(frame, meetingState, pipe);
    // Update notes with visual context
    await updateNotesWithVisuals(meetingState, pipe);
  });

  // Setup UI
  return {
    name: "Meeting Notes Generator",
    version: "0.3.5", // Phase 1 is 35% complete
    routes: {
      "/": {
        component: "NotesView",
        props: { meetingState }
      },
      "/config": {
        component: "ConfigPanel",
        props: { /* configuration options */ }
      }
      // Export route pending implementation
    }
  };
}
```

### Implemented Functions

```typescript
// This function is in progress
async function processVisualContent(frame, state, pipe) {
  // Extract text from frame using OCR
  const ocrResult = await extractTextFromFrame(frame, pipe);
  
  // Detect content type (slides, document, diagram, etc.)
  const contentType = await detectContentType(frame, pipe);
  
  // Store visual content with metadata
  state.visualContent.push({
    timestamp: new Date().toISOString(),
    ocrText: ocrResult.text,
    contentType,
    frameReference: frame.id // Reference to the actual frame data
  });
}

// This function is in progress
async function updateNotes(state, pipe) {
  // Generate comprehensive notes based on current state
  const latestContent = getRecentContent(state, 60); // Last minute of content
  
  // Use AI to generate/update notes - in progress
  // LLM integration is currently being implemented
}
```

### Notes Structure (Target Design)

```typescript
// Example notes structure - the system is working towards this structure
const notesStructure = {
  metadata: {
    title: "Team Meeting",
    date: "2025-07-15T09:00:00Z",
    duration: "45 minutes"
  },
  sections: [
    {
      title: "Introduction",
      timestamp: "2025-07-15T09:00:00Z",
      content: "The meeting began with an outline of the agenda...",
    },
    {
      title: "Project Updates",
      timestamp: "2025-07-15T09:05:00Z",
      content: "Current status of Project X was presented...",
      visualReferences: [
        { type: "slide", timestamp: "2025-07-15T09:05:30Z", text: "Project X: 75% Complete" }
      ]
    }
  ],
  actionItems: [
    {
      description: "Follow up with vendor about delivery timeline",
      dueDate: "2025-07-22",
      timestamp: "2025-07-15T09:15:00Z"
    }
  ],
  decisions: [
    {
      description: "Approved budget increase for Q3",
      timestamp: "2025-07-15T09:30:00Z"
    }
  ],
  summary: "The team discussed project progress, approved the Q3 budget increase, and assigned follow-up tasks for the vendor relationship."
}
```

## Database Schema (Pending Implementation)

The pipe will leverage Screenpipe's SQLite database, with additional tables for meeting-specific data. Database implementation is planned as part of Phase 1 but is not yet completed.

## Installation and Configuration

### Prerequisites
- Screenpipe installed and running
- Access to an LLM (OpenAI, Anthropic, or local via Ollama)
- Sufficient system resources (4GB RAM minimum recommended)

### Installation Steps
1. Clone the repository:
   ```
   git clone https://github.com/example/meeting-notes-pipe.git
   ```

2. Install dependencies:
   ```
   cd meeting-notes-pipe
   npm install
   ```

3. Configure API keys:
   ```
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Add to Screenpipe:
   - Open Screenpipe desktop app
   - Navigate to Pipes section
   - Click "Add Pipe"
   - Select the meeting-notes-pipe directory

### Current Configuration Options

The pipe currently supports these configuration options:

- **Transcription Settings**: Adjust sensitivity and language
- **UI Theme**: Light or Dark mode

Additional configuration options will be added as more features are implemented.

## Current User Interface

### Live Notes View (Implemented)
- Real-time display of generated transcriptions
- Timeline of meeting progress

### Configuration Panel (Implemented)
- Basic configuration options

### Export Options (Pending)
- Not yet implemented

## Development Roadmap Timeline

| Milestone | Planned Date | Status |
|-----------|--------------|--------|
| Project Initiation | June 15, 2025 | ✅ Completed |
| Phase 1: Core Features | Aug 15, 2025 | 🔄 In Progress (35%) |
| Initial Testing Release | Sept 1, 2025 | ⏳ Pending |
| Phase 2: Enhanced Processing | Oct 15, 2025 | 📅 Planned |
| Beta Release | Nov 1, 2025 | 📅 Planned |
| Phase 3: Integration | Dec 15, 2025 | 📅 Planned |
| 1.0 Release | Jan 15, 2026 | 📅 Planned |

## Known Issues & Current Limitations

1. **LLM Processing Latency**
   - Notes generation can have 2-3 second delay with remote LLMs
   - Large context windows may cause performance issues on older hardware

2. **Visual Content Processing**
   - OCR integration is still in development
   - Screen content analysis is not yet fully implemented

## Next Steps

1. Complete the visual content integration component
2. Finalize LLM integration for notes processing
3. Implement basic export functionality
4. Design and implement the meeting database schema
5. Conduct internal testing with varied meeting scenarios

## Conclusion

The Real-Time Meeting Notes Generator is currently in Phase 1 of development, with core audio transcription features already implemented. The visual content integration and LLM processing features are in active development, with the project on track to complete Phase 1 by the target date of August 15, 2025. The focus remains on delivering core functionality that works reliably rather than secondary concerns like privacy. 