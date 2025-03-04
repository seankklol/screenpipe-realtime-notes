# Real-Time Meeting Notes Generator

A Next.js application that captures, processes, and summarizes meeting content in real-time using Screenpipe's powerful APIs.

## Features

- ✅ **Real-time Audio Transcription**: Capture and transcribe meeting audio in real-time
- ✅ **Visual Content Processing**: Extract and process content from screen captures using OCR
- ✅ **Content Synchronization**: Align visual content with audio transcriptions
- ✅ **Intelligent Notes Generation**: Process multi-modal data into structured notes using LLM
- ✅ **Export Options**: Save notes in multiple formats (PDF, Markdown, plain text)

## Project Status

**Current Phase**: 1 (Core Functionality)
**Completion**: 95%

All core features have been implemented. The application is ready for testing.

## Getting Started

### Prerequisites

1. Install Screenpipe from the [official website](https://screenpipe.com/)
2. Node.js 18+ and npm/yarn/bun
3. OpenAI API Key for LLM integration

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
   # Edit .env.local with your OpenAI API key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to access the application

## Testing the Application

Follow these steps to test the application:

1. **Launch the Application**
   - Start the development server as described above
   - Open http://localhost:3000 in your browser
   - You will be automatically redirected to the notes page

2. **Start Recording**
   - Click the "Start Recording" button
   - Grant necessary permissions for audio and screen recording
   - Select the screen/window you want to capture
   - The application will begin capturing audio and screen content

3. **Observe Real-time Content**
   - Watch as audio transcriptions appear in real-time
   - Visual content will be captured and processed
   - Content synchronization will attempt to align audio with visual elements

4. **Generate Notes**
   - Enter a meeting title and participants (comma-separated)
   - Click "Generate Notes" to process the captured content
   - For quick testing without recording, use the "Generate Mock Notes (Demo)" button

5. **View and Export Notes**
   - Review the generated notes in the tabbed interface
   - Use the export menu to save notes in your preferred format
   - Share notes via the share menu options

6. **Testing Known Limitations**
   - Content detection for complex visual elements may have reduced accuracy
   - Processing long meetings (>30 minutes) may take more time
   - For best results, use clear speech and visible screen content

## Troubleshooting

If you encounter issues during testing:

1. **API Errors**
   - Check your OpenAI API key in the .env.local file
   - Ensure your API key has sufficient quota/credits

2. **Recording Issues**
   - Make sure Screenpipe is installed and running
   - Check browser permissions for microphone and screen capture
   - Try restarting Screenpipe and/or your browser

3. **Performance Problems**
   - For long meetings, processing may take time
   - Consider testing with shorter recording sessions first
   - Check system resources if the application becomes unresponsive

## Next Steps

After testing, we plan to:

1. Implement performance optimizations (chunking for large meetings)
2. Add local storage to save meeting history
3. Enhance content detection accuracy for complex visual elements

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

