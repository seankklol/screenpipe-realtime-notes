# Real-Time Meeting Notes Generator

A Next.js application that captures, processes, and summarizes meeting content in real-time using Screenpipe's powerful APIs.

## Features

- **Real-time Audio Transcription**: Capture and transcribe meeting audio as it happens
- **Visual Content Processing**: Extract text and context from screen content (slides, documents) (in progress)
- **Intelligent Notes Generation**: Process transcriptions into structured, useful notes using LLM (in progress)
- **Export Options**: Save notes in multiple formats (upcoming)

## Project Status

Currently in Phase 1 development (35% complete):
- ✅ Audio transcription and basic UI are implemented
- 🔄 Visual content integration and LLM processing are in progress

## Getting Started

### Prerequisites

1. Install Screenpipe from the [official website](https://screenpipe.com/)
2. Node.js 18+ and npm/yarn/bun

### Setup

1. Clone this repository
   ```bash
   git clone <repository-url>
   cd real-time-meeting-notes
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. Copy the environment file and add your API keys
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

### Configuration

The application requires the following API keys:
- **OpenAI API Key**: For LLM integration to process meeting notes
  - Get your API key from [OpenAI's website](https://platform.openai.com/api-keys)

## Usage

1. Start a meeting in Screenpipe with microphone access enabled
2. Navigate to the application in your browser
3. The application will automatically begin transcribing audio
4. When visual content integration is ready, screen sharing will be required

## Development Roadmap

See [PLAN.md](./PLAN.md) for the detailed implementation plan.

## License

MIT

<!-- <img width="1312" alt="screenshot of component playground" src="https://github.com/user-attachments/assets/3e5abd07-0a3c-4c3b-8351-5107beb4fb10"> -->

## features

- **interactive component display**: view rendered components in action
- **code inspection**: examine the full source code of each component
- **raw output**: see the raw api responses and data
- **ai prompt visibility**: view the prompts and context used to generate components
- **collapsible interface**: toggle component visibility for a cleaner workspace

## usage

the playground allows you to:

1. view rendered components in their intended state
2. inspect the raw output from api calls
3. study the complete component code
4. examine the ai prompts and context used to generate components

## component structure

each playground card includes:
- component title and collapsible interface
- tabs for different views (rendered output, raw output, code, ai prompt)
- copy functionality for sharing prompts and context

## getting started

1. install this pipe from UI and play with it
2. follow docs to create your pipe (it will create this app) (https://docs.screenpi.pe/docs/plugins)
3. modify code from ready-to-use-examples directory

