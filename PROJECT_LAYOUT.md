# Real-Time Meeting Notes Generator: Technical Overview

## Introduction

This repository contains a Next.js application designed to capture, process, and summarize meeting content in real-time using Screenpipe's powerful APIs. The application implements core functionality including audio transcription, visual content integration, content synchronization, and LLM processing features. The focus is on ensuring core functionality works well rather than privacy concerns.

## Current Status

The application is currently at 95% completion and **READY FOR TESTING**. All core features have been implemented:

- ✅ Audio Transcription: Fully functional with real-time display
- ✅ Visual Content Processing: Implemented with OCR and content detection
- ✅ Content Synchronization: Audio and visual content aligned by timestamps
- ✅ LLM Integration: Complete with optimized prompt templates
- ✅ Export Functionality: PDF, Markdown, and text export options implemented

Known limitations:
- Content detection for complex visual elements may not be 100% accurate
- Processing of very long meetings (>30 minutes) may take longer 
- Chunking implementation for large meeting contexts is still being optimized

## Project Layout

This document outlines the structure of the Real-Time Meeting Notes Generator project.

### Root Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   └── generate-notes/ # API endpoint for generating notes
│   ├── notes/              # Notes generation page
│   └── ...                 # Other app pages
├── components/             # React components
│   ├── notes/              # Notes-related components
│   │   ├── NotesDisplay.tsx           # Component for displaying notes
│   │   ├── NotesGenerator.tsx         # Component for generating notes
│   │   ├── ExportMenu.tsx             # Menu for exporting notes
│   │   ├── ShareMenu.tsx              # Menu for sharing notes
│   │   ├── TranscriptionView.tsx      # Display of real-time transcriptions
│   │   ├── VisualContentPreview.tsx   # Preview of captured frames
│   │   └── SynchronizedContentView.tsx # Display of synchronized content
│   ├── recording-controls.tsx  # Component for audio/screen recording controls
│   ├── status-indicators.tsx   # Component for displaying recording status
│   ├── ErrorBoundary.tsx       # Error boundary component
│   ├── ApiErrorDisplay.tsx     # API error display component
│   └── ui/                     # UI components
├── lib/                    # Library code
│   ├── llm/                # LLM integration
│   │   ├── context-service.ts    # Context preparation for LLM
│   │   ├── notes-generator.ts    # Notes generation functionality
│   │   ├── openai-service.ts     # OpenAI API integration
│   │   └── prompt-templates.ts   # Prompt templates for LLM
│   ├── visual/             # Visual content processing
│   │   ├── capture.ts            # Screen capture module
│   │   ├── content-detector.ts   # Content type detection
│   │   ├── content-sync.ts       # Content synchronization module
│   │   └── ocr.ts                # OCR processing
│   ├── utils/              # Utility functions
│   │   └── export-utils.ts       # Notes export utilities
│   ├── actions/            # Server actions
│   ├── hooks/              # Custom React hooks
│   │   └── use-api.tsx          # API request hooks
│   ├── types.ts            # TypeScript type definitions
│   ├── client-only.tsx     # Client-only component utility
│   ├── settings-provider.tsx # Settings provider component
│   └── utils.ts            # General utility functions
├── public/                 # Static assets
├── styles/                 # CSS styles
├── ...
└── package.json           # Project dependencies
```

### Key Components

#### Visual Content Integration

- **lib/visual/capture.ts**: Manages screen capture using Screenpipe's vision stream
- **lib/visual/ocr.ts**: Processes OCR results and enhances text extraction
- **lib/visual/content-detector.ts**: Identifies content types like tables, code, diagrams, etc.
- **lib/visual/content-sync.ts**: Synchronizes visual content with audio transcriptions by timestamps

#### LLM Integration

- **lib/llm/openai-service.ts**: Integrates with OpenAI API for text generation
- **lib/llm/prompt-templates.ts**: Contains specialized prompts for different note-taking tasks
- **lib/llm/context-service.ts**: Prepares meeting context by combining transcript and visual content
- **lib/llm/notes-generator.ts**: Orchestrates the notes generation process

#### UI Components

- **components/notes/NotesDisplay.tsx**: Renders generated notes with tabs for summary, full notes, topics, and action items
- **components/notes/NotesGenerator.tsx**: Provides interface for generating notes
- **components/notes/ExportMenu.tsx**: Provides options for exporting notes
- **components/notes/ShareMenu.tsx**: Provides options for sharing notes
- **components/notes/TranscriptionView.tsx**: Displays real-time transcriptions
- **components/notes/VisualContentPreview.tsx**: Displays a preview of captured frames
- **components/notes/SynchronizedContentView.tsx**: Displays synchronized audio and visual content in a timeline view

#### API Endpoints

- **app/api/generate-notes/route.ts**: Handles note generation requests, processes input data, and returns generated notes

### Pages

- **app/notes/page.tsx**: Main page for the notes generation feature

## Repository Structure

```
├── app/                  # Next.js application routes
│   ├── api/              # Backend API endpoints
│   │   ├── component-source/ # Component source code retrieval
│   │   ├── fetch-external/   # External content fetching
│   │   └── settings/     # Application settings endpoints
│   ├── page.tsx          # Main application page
│   └── layout.tsx        # Root layout component
├── components/           # Reusable React components
│   ├── notes/            # Meeting notes components
│   │   ├── TranscriptionView.tsx     # Display of real-time transcriptions
│   │   ├── VisualContentPreview.tsx  # Preview of captured frames
│   │   ├── SynchronizedContentView.tsx # Display of synchronized content
│   │   └── NotesContainer.tsx        # Main notes display container
│   └── ui/               # UI components (shadcn/ui)
├── content/              # Static content files
├── hooks/                # React hooks
│   └── useTranscription.ts # Hook for audio transcription
├── lib/                  # Utility functions and services
│   ├── actions/          # Server actions
│   │   └── get-screenpipe-app-settings.ts # Settings retrieval
│   ├── hooks/            # Custom hooks
│   │   └── use-pipe-settings.tsx # Pipe settings management
│   ├── visual/           # Visual processing utilities
│   │   ├── capture.ts          # Screen capture module
│   │   ├── content-detector.ts # Content type detection
│   │   ├── content-sync.ts     # Content synchronization module
│   │   └── ocr.ts              # OCR processing
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # General utility functions
├── public/               # Static assets
├── .env.local            # Local environment variables (not in repo)
├── .env.local.example    # Example environment file
├── pipe.json             # Screenpipe pipe configuration
└── package.json          # Project dependencies
```

## Core Technologies

- **Framework**: Next.js 15.x (React 18)
- **Styling**: TailwindCSS
- **UI Components**: ShadCN UI (based on Radix UI)
- **Animation**: Framer Motion
- **Integration**: Screenpipe SDK (@screenpipe/js and @screenpipe/browser)
- **AI Integration**: OpenAI SDK (for LLM integration)

## Implemented Functionality

### 1. Audio Transcription Pipeline (✅ Completed)

The application integrates with Screenpipe's transcription APIs to:

- Capture real-time audio from system or external microphone
- Process and transcribe speech using Screenpipe's STT engine
- Display transcriptions in real-time with timestamps

Implementation example:
```typescript
// hooks/useTranscription.ts
export function useTranscription() {
  const [transcriptions, setTranscriptions] = useState([]);
  
  useEffect(() => {
    const unsubscribe = pipe.streamTranscriptions((transcription) => {
      setTranscriptions(prev => [...prev, {
        id: uuidv4(),
        text: transcription.text,
        timestamp: new Date().toISOString(),
        confidence: transcription.confidence
      }]);
    });
    
    return () => unsubscribe();
  }, []);
  
  return { transcriptions };
}
```

### 2. Visual Content Integration (✅ Completed)

The application captures and processes visual content:

- Captures screen content using Screenpipe's vision APIs
- Extracts text using OCR
- Detects content types (text, tables, code, diagrams, etc.)
- Displays visual content in real-time

### 3. Content Synchronization (✅ Completed)

The application synchronizes visual and audio content:

- Aligns visual content with transcriptions based on timestamps
- Groups content into contextual segments
- Provides visual timeline of synchronized content
- Enhances LLM context with synchronized information

Implementation examples:
```typescript
// lib/visual/content-sync.ts
export function synchronizeContent(
  visualContent: DetectedContent[],
  transcriptions: TranscriptionItem[],
  maxTimeGapMs: number = 5000
): SynchronizedContent[] {
  // Sort arrays by timestamp
  const sortedVisualContent = [...visualContent].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const sortedTranscriptions = [...transcriptions].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // For each transcription, find the closest visual content
  return sortedTranscriptions.map(transcription => {
    // Logic to find closest visual content by timestamp
    // ...
    return {
      visualContent: closestContent,
      transcription,
      timestamp: transcription.timestamp,
      syncConfidence: syncConfidence
    };
  });
}
```

### 4. LLM Integration for Notes Processing (✅ Completed)

The application generates structured meeting notes:

- Processes transcription and visual content
- Includes synchronized content for better context
- Generates summary, topics, and action items
- Structures content for readability

### 5. Export Functionality (✅ Completed)

The application provides comprehensive export functionality:

- Export to PDF using jsPDF
- Export to Markdown and plain text
- Email sharing via mailto: links
- Copy to clipboard functionality

## Project Configuration

### Environment Variables

The application uses the following environment variables:

```
# Screenpipe Configuration
SCREENPIPE_DIR=""  # Path to Screenpipe directory

# OpenAI API Configuration
OPENAI_API_KEY=""  # API key for OpenAI services

# Application Settings
NEXT_PUBLIC_APP_URL=""  # Base URL for the application
```

### Screenpipe Integration

The `pipe.json` file defines the Screenpipe integration with these permissions:

```json
{
  "name": "real-time-meeting-notes",
  "description": "Generates structured meeting notes in real-time from audio transcription and screen content",
  "permissions": [
    "audio.record",
    "display.record",
    "ai"
  ],
  "crons": [
    {
      "path": "/api/pipeline",
      "schedule": "0 0 11 * * *"
    }
  ]
}
```

## Data Flow Architecture

1. **Audio Capture**: Screenpipe captures audio from the system or external microphone
2. **Transcription**: The captured audio is processed by Screenpipe's STT engine
3. **Visual Capture**: Screenpipe captures screen content and processes it with OCR
4. **Content Detection**: Visual content is analyzed to identify content types
5. **Content Synchronization**: Visual and audio content are synchronized by timestamps
6. **Notes Generation**: All processed content is sent to the LLM for notes generation
7. **Display**: The notes are displayed in real-time in the user interface
8. **Export**: Users can export the generated notes in various formats

## Next Steps

The following improvements are currently in progress:

1. Improve content detection heuristics for better accuracy
2. Implement chunking strategy for large meeting contexts
3. Add visual indicators for synchronized content confidence

## Conclusion

This repository implements the core functionality of a Real-Time Meeting Notes Generator using Screenpipe's APIs. With the current implemented features, the application can capture and transcribe meeting audio, process visual content, synchronize multi-modal data, and generate comprehensive notes. The application provides a clean, intuitive interface for users to interact with the system and export notes in various formats. 