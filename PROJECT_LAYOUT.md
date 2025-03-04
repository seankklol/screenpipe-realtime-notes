# Real-Time Meeting Notes Generator: Technical Overview

## Introduction

This repository contains a Next.js application designed to capture, process, and summarize meeting content in real-time using Screenpipe's powerful APIs. The application currently implements core functionality including audio transcription and initial UI scaffolding, with visual content integration and LLM processing features in active development. The focus is on ensuring core functionality works well rather than privacy concerns.

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
│   │   ├── NotesDisplay.tsx    # Component for displaying notes
│   │   └── NotesGenerator.tsx  # Component for generating notes
│   ├── ready-to-use-examples/  # Example components
│   ├── ui/                     # UI components
│   └── playground-card.tsx     # Playground card component
├── lib/                    # Library code
│   ├── llm/                # LLM integration
│   │   ├── context-service.ts    # Context preparation for LLM
│   │   ├── notes-generator.ts    # Notes generation functionality
│   │   ├── openai-service.ts     # OpenAI API integration
│   │   └── prompt-templates.ts   # Prompt templates for LLM
│   ├── visual/             # Visual content processing
│   │   ├── capture.ts            # Screen capture module
│   │   ├── content-detector.ts   # Content type detection
│   │   └── ocr.ts                # OCR processing
│   └── ...                 # Other library modules
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

#### LLM Integration

- **lib/llm/openai-service.ts**: Integrates with OpenAI API for text generation
- **lib/llm/prompt-templates.ts**: Contains specialized prompts for different note-taking tasks
- **lib/llm/context-service.ts**: Prepares meeting context by combining transcript and visual content
- **lib/llm/notes-generator.ts**: Orchestrates the notes generation process

#### UI Components

- **components/notes/NotesDisplay.tsx**: Renders generated notes with tabs for summary, full notes, topics, and action items
- **components/notes/NotesGenerator.tsx**: Provides interface for generating notes

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
│   │   ├── TranscriptionView.tsx # Display of real-time transcriptions
│   │   └── NotesContainer.tsx    # Main notes display container
│   ├── ready-to-use-examples/    # Example Screenpipe components
│   │   ├── health-status.tsx     # Screenpipe health status
│   │   ├── last-audio-transcription.tsx # Audio transcription display
│   │   ├── last-ocr-image.tsx    # OCR image display
│   │   ├── last-ui-record.tsx    # UI records display
│   │   ├── realtime-audio.tsx    # Real-time audio streaming
│   │   └── realtime-screen.tsx   # Real-time screen capture
│   ├── ui/               # UI components (shadcn/ui)
│   └── config/           # Configuration components
├── content/              # Static content files
├── hooks/                # React hooks
│   └── useTranscription.ts # Hook for audio transcription
├── lib/                  # Utility functions and services
│   ├── actions/          # Server actions
│   │   └── get-screenpipe-app-settings.ts # Settings retrieval
│   ├── hooks/            # Custom hooks
│   │   └── use-pipe-settings.tsx # Pipe settings management
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
- **AI Integration**: OpenAI SDK (for LLM integration - in progress)

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

### 2. Initial UI Scaffolding (✅ Completed)

The user interface includes:

- Basic notes view component
- Configuration panel structure
- Component routing setup
- Real-time transcription display

### 3. Visual Content Integration (🔄 In Progress)

Currently in development:
- OCR processing of screen content
- Visual content categorization
- Synchronization with audio transcriptions

### 4. LLM Integration for Notes Processing (🔄 In Progress)

Currently in development:
- Context preparation for LLM
- Prompt engineering for different note sections
- Response parsing and structuring

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
3. **Notes Generation**: Transcriptions are organized into structured notes
4. **Display**: The notes are displayed in real-time in the user interface

## Next Steps

According to the development roadmap, the following features are next to be implemented:

1. Complete the visual content integration
2. Finish LLM integration for notes processing
3. Implement notes export functionality
4. Design and implement the meeting database schema

## Conclusion

This repository implements the core functionality of a Real-Time Meeting Notes Generator using Screenpipe's APIs. With the current implemented features, the application can already capture and transcribe meeting audio with a simple, functional interface. The next development phase will focus on enhancing the functionality with visual content integration and intelligent notes processing. 