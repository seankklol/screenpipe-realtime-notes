# Real-Time Meeting Notes Generator

## Project Overview

The Real-Time Meeting Notes Generator is an application that automatically captures, processes, and summarizes meeting content in real-time. Using Screenpipe's powerful APIs, it combines audio transcription, visual content analysis, and LLM processing to generate comprehensive meeting notes with minimal human effort.

## Core Functionality

### 1. Audio Transcription

The application captures and transcribes audio in real-time, providing accurate text representation of spoken content. This functionality is implemented using Screenpipe's audio transcription capabilities, which handle speech-to-text conversion with speaker detection.

### 2. Visual Content Integration

The visual content integration module captures screen content during meetings and processes it to extract valuable information. Key components include:

- **Screen Capture**: Using Screenpipe's vision stream to capture screen content with timestamps
- **OCR Processing**: Extracting text from screen captures and enhancing readability
- **Content Detection**: Identifying different types of visual content (tables, diagrams, code, etc.)

### 3. LLM Integration

The LLM integration module processes the combined audio and visual content to generate structured meeting notes. Key components include:

- **Context Preparation**: Organizing transcript and visual content into a structured format for the LLM
- **Prompt Templates**: Specialized prompts for different note-taking tasks (summarization, action item extraction, etc.)
- **Notes Generation**: Orchestrating the generation process to produce comprehensive notes

### 4. Notes Display

The application provides a user-friendly interface for viewing and interacting with generated notes, including:

- **Summary View**: Concise overview of the meeting's key points
- **Full Notes**: Comprehensive meeting notes with all details
- **Topics View**: Meeting content organized by topic
- **Action Items**: Extracted action items with assignees and due dates

## Project Architecture

The application is built using a modular architecture to ensure maintainability and scalability:

### Frontend (Next.js + React)

- **UI Components**: Reusable React components for different parts of the interface
- **State Management**: Context API for managing application state
- **API Integration**: Fetch API for communicating with backend services

### Backend Services

- **API Routes**: Next.js API routes for handling notes generation requests
- **LLM Service**: Integration with OpenAI's GPT models for text generation
- **Data Processing**: Services for processing and combining different data types

### Screenpipe Integration

- **Audio Capture**: Integration with Screenpipe's audio transcription API
- **Visual Capture**: Integration with Screenpipe's vision stream API
- **Data Querying**: Using Screenpipe's queryScreenpipe API for retrieving data

## Roadmap

### Phase 1: Core Functionality (Current Phase - 70% Complete)

- ✅ Project setup and configuration
- ✅ Audio transcription implementation
- ✅ Visual content integration (90% complete)
- ✅ LLM integration for notes processing (80% complete)
- ⏳ UI development (65% complete)

### Phase 2: Advanced Features

- User authentication and profiles
- Meeting storage and retrieval
- Export functionality (PDF, Markdown, email)
- Real-time collaboration
- Advanced NLP features (sentiment analysis, meeting metrics)

### Phase 3: Enterprise Features

- Team management
- Meeting analytics
- Integration with calendar and project management tools
- Customizable templates
- Privacy and compliance features

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API routes
- **LLM**: OpenAI API (GPT-4)
- **Audio/Visual Processing**: Screenpipe SDK
- **Data Storage**: Local storage (Phase 1), Database (Phase 2)

## Conclusion

The Real-Time Meeting Notes Generator aims to transform how meeting notes are created and shared. By automating the capture and processing of meeting content, it allows participants to focus on the discussion rather than note-taking, while still producing comprehensive and accurate meeting documentation. 