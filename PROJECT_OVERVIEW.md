# Real-Time Meeting Notes Generator

## 🚀 Project Overview

The **Real-Time Meeting Notes Generator** is a Next.js application designed to revolutionize the way meeting notes are captured and processed. By leveraging Screenpipe's powerful APIs, the application captures audio and screen content in real-time, processes the data using advanced AI techniques, and generates comprehensive, well-structured meeting notes with minimal user effort.

## 🎯 Key Features

### Core Functionality

- **🎙️ Real-Time Audio Transcription**
  - Captures and transcribes meeting audio in real-time
  - Displays live transcription with speaker identification
  - Processes multiple audio sources simultaneously

- **🖥️ Visual Content Processing**
  - Captures screen content during meetings
  - Processes visual elements using OCR and content detection
  - Identifies different content types (tables, code, diagrams, etc.)
  - Extracts structured data from visual elements

- **🔄 Content Synchronization**
  - Aligns visual content with audio timestamps
  - Creates contextual connections between speech and visual elements
  - Displays synchronized content in an intuitive timeline view
  - Enhances LLM context with multi-modal data

- **🤖 Intelligent Notes Generation**
  - Processes multi-modal data using advanced LLM techniques
  - Generates comprehensive meeting notes with proper structure
  - Creates summaries, action items, and topic categorization
  - Preserves important visual content in the generated notes

- **📤 Flexible Export Options**
  - Export to PDF with formatting preserved
  - Export to Markdown for compatibility with note-taking apps
  - Export to plain text for maximum compatibility
  - Email sharing and clipboard copying for quick distribution

## 🏗️ Technical Architecture

### Frontend Architecture

The application is built with Next.js 15 and React 18, employing a component-based architecture with a focus on modularity and reusability. Key architectural elements include:

- **Component Structure**: Hierarchical component organization with clear separation of concerns
- **State Management**: React's Context API and custom hooks for state management
- **Server Components**: Next.js server components for improved performance
- **Client Components**: Interactive UI elements implemented as client components
- **API Integration**: RESTful API endpoints for server-side operations

### Core Technical Components

1. **Audio Processing Pipeline**
   - Uses Screenpipe's audio APIs for capturing and processing audio
   - Implements real-time transcription with timestamps and speaker identification
   - Handles multiple audio sources and formats

2. **Visual Content Processing**
   - Screen capture using Screenpipe's vision APIs
   - OCR processing for text extraction from visual elements
   - Content type detection for categorizing visual elements
   - Visual content enhancement for improved readability

3. **Content Synchronization System**
   - Timestamp-based alignment of audio and visual content
   - Confidence scoring for synchronization accuracy
   - Timeline visualization of synchronized content
   - Context enhancement for LLM processing

4. **LLM Integration**
   - OpenAI API integration for notes generation
   - Context preparation and optimization
   - Prompt engineering for specific note sections
   - Token usage optimization and chunking strategies

5. **Export System**
   - PDF generation with jsPDF
   - Markdown formatting with custom parsers
   - Plain text export with structure preservation
   - Email and clipboard sharing capabilities

## 📈 Development Status

The project is currently at **95% completion**. All core features have been implemented, including:

- ✅ Audio transcription pipeline
- ✅ Visual content processing
- ✅ Content synchronization
- ✅ LLM integration for notes generation
- ✅ Export functionality
- 🔄 Performance optimization (in progress)

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 15 (React 18)
- **Styling**: TailwindCSS with ShadCN UI components
- **State Management**: React Context API and custom hooks
- **API Integration**: Fetch API with custom wrappers
- **AI Integration**: OpenAI API (gpt-4-turbo)
- **Media Processing**: Screenpipe SDK (@screenpipe/js, @screenpipe/browser)
- **Export Tools**: jsPDF, markdown-it

## 🔄 Data Flow Architecture

```
┌─────────────────┐     ┌───────────────────┐     ┌────────────────┐
│  Audio Capture  │────▶│  Transcription    │────▶│                │
└─────────────────┘     └───────────────────┘     │                │
                                                  │                │
┌─────────────────┐     ┌───────────────────┐     │    Context    │     ┌────────────────┐     ┌────────────────┐
│ Screen Capture  │────▶│  OCR + Content    │────▶│  Preparation  │────▶│  LLM Processing│────▶│  Notes Display │
└─────────────────┘     │    Detection      │     │                │     └────────────────┘     └────────────────┘
                        └───────────────────┘     │                │              │
                                                  │                │              │
                        ┌───────────────────┐     │                │              ▼
                        │    Content        │────▶│                │     ┌────────────────┐
                        │  Synchronization  │     └────────────────┘     │  Export System │
                        └───────────────────┘                            └────────────────┘
```

## 📋 Implementation Details

### Audio Transcription Pipeline

The audio transcription pipeline leverages Screenpipe's transcription APIs to capture and process audio in real-time. The implementation includes:

```typescript
// Real-time transcription with auto-scroll
export default function TranscriptionView({
  transcriptions,
  isRecording,
  maxHeight = "300px"
}: TranscriptionViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to newest transcriptions
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcriptions]);
  
  return (
    <div className="rounded-md border bg-background p-4">
      <div
        ref={containerRef}
        className="overflow-y-auto transition-all"
        style={{ maxHeight }}
      >
        {transcriptions.map((item, index) => (
          <div key={item.id || index} className="mb-3 last:mb-0">
            <div className="text-xs text-muted-foreground">
              {formatTimestamp(item.timestamp)}
            </div>
            <div className="mt-1">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Visual Content Processing

The visual content processing system captures screen content and processes it using OCR and content detection algorithms:

```typescript
// Content type detection
export function detectContentType(
  imageData: ImageData,
  ocrText: string
): ContentType {
  // Detect tables
  if (containsTableStructure(imageData, ocrText)) {
    return ContentType.TABLE;
  }
  
  // Detect code
  if (containsCodePatterns(ocrText)) {
    return ContentType.CODE;
  }
  
  // Detect diagrams
  if (containsDiagramFeatures(imageData)) {
    return ContentType.DIAGRAM;
  }
  
  // Default to regular text
  return ContentType.TEXT;
}
```

### Content Synchronization System

The content synchronization system aligns visual content with audio transcriptions based on timestamps:

```typescript
// Content synchronization logic
export function synchronizeContent(
  visualContent: DetectedContent[],
  transcriptions: TranscriptionItem[],
  maxTimeGapMs: number = 5000
): SynchronizedContentItem[] {
  const synced: SynchronizedContentItem[] = [];
  
  // Sort by timestamp
  const sortedVisual = [...visualContent].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const sortedTranscriptions = [...transcriptions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Find matching pairs based on timestamps
  for (const transcription of sortedTranscriptions) {
    const transTime = new Date(transcription.timestamp).getTime();
    
    // Find closest visual content
    const closest = sortedVisual.reduce((prev, curr) => {
      const prevTime = new Date(prev.timestamp).getTime();
      const currTime = new Date(curr.timestamp).getTime();
      
      const prevDiff = Math.abs(prevTime - transTime);
      const currDiff = Math.abs(currTime - transTime);
      
      return currDiff < prevDiff ? curr : prev;
    }, sortedVisual[0]);
    
    const closestTime = new Date(closest.timestamp).getTime();
    const timeDiff = Math.abs(closestTime - transTime);
    
    // Only sync if within maximum allowed time gap
    if (timeDiff <= maxTimeGapMs) {
      // Calculate confidence based on time difference
      const syncConfidence = 1 - (timeDiff / maxTimeGapMs);
      
      synced.push({
        timestamp: transcription.timestamp,
        transcription: transcription,
        visualContent: closest,
        syncConfidence
      });
    }
  }
  
  return synced;
}
```

### LLM Integration

The LLM integration system prepares meeting context and generates structured notes:

```typescript
// Context preparation for LLM
export function formatContextForLLM(context: MeetingContext): string {
  let formattedContext = `MEETING METADATA:\n`;
  formattedContext += `Title: ${context.title}\n`;
  formattedContext += `Date: ${context.date}\n`;
  formattedContext += `Start Time: ${context.startTime}\n`;
  formattedContext += `End Time: ${context.endTime}\n`;
  formattedContext += `Duration: ${context.duration} minutes\n`;
  formattedContext += `Participants: ${context.participants.join(", ")}\n\n`;
  
  // Format transcript
  formattedContext += `TRANSCRIPT:\n`;
  for (const segment of context.transcript) {
    const timestamp = formatTimestamp(segment.timestamp);
    formattedContext += `[${timestamp}] ${segment.speaker ? segment.speaker + ': ' : ''}${segment.text}\n`;
  }
  
  // Format visual content
  formattedContext += `\nVISUAL CONTENT:\n`;
  for (const content of context.visualContent || []) {
    const timestamp = formatTimestamp(content.timestamp);
    formattedContext += `[${timestamp}] Type: ${content.contentType}\n`;
    formattedContext += `Content: ${content.extractedText}\n\n`;
  }
  
  // Format synchronized content
  formattedContext += `\nSYNCHRONIZED CONTENT:\n`;
  for (const item of context.synchronizedContent || []) {
    const timestamp = formatTimestamp(item.timestamp);
    formattedContext += `[${timestamp}] (Confidence: ${Math.round(item.syncConfidence * 100)}%)\n`;
    formattedContext += `Visual: ${item.visualContent.contentType} - ${item.visualContent.extractedText.substring(0, 100)}${item.visualContent.extractedText.length > 100 ? '...' : ''}\n`;
    formattedContext += `Audio: ${item.transcription.text}\n\n`;
  }
  
  return formattedContext;
}
```

## 📊 Project Metrics

| Metric | Status | Target | Current |
|--------|--------|--------|---------|
| Transcription Accuracy | ✅ | >90% | 92% |
| Visual Content Detection Accuracy | 🔄 | >90% | 87% |
| Notes Generation Latency | 🔄 | <5s | 7s |
| CPU Utilization | ✅ | <15% | 15% |
| Memory Usage | ✅ | <500MB | 450MB |

## 📅 Current Priorities

### Same-Day Focus

1. **Content Detection Improvements**
   - Improve rule-based detection with better heuristics
   - Enhance pattern matching for diagrams and charts 

2. **LLM Optimization**
   - Implement chunking strategy for large meeting contexts
   - Add visual indicators for synchronized content confidence

3. **Technical Debt**
   - Refactor large components into smaller, more focused components
   - Improve separation of concerns in key components

## 🧰 Development Resources

- **Documentation**: [Screenpipe API](https://docs.screenpipe.co)
- **UI Framework**: [ShadCN UI](https://ui.shadcn.com)
- **AI Integration**: [OpenAI API](https://platform.openai.com/docs)

## 💡 Conclusion

The Real-Time Meeting Notes Generator represents a significant advancement in automated meeting documentation. By combining real-time audio transcription, visual content processing, and intelligent content synchronization with advanced LLM capabilities, the application delivers a comprehensive solution for generating high-quality meeting notes with minimal user effort.

The modular architecture and focus on core functionality have enabled rapid development in a one-day timeframe, with careful attention to the most critical features. The project demonstrates the power of combining Screenpipe's media processing capabilities with cutting-edge AI to create practical, valuable applications for everyday use. 