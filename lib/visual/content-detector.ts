import { VisualFrame } from './capture';
import { OCRResult, classifyContent, extractTable } from './ocr';

/**
 * Content type enum
 */
export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  TABLE = 'table',
  DIAGRAM = 'diagram',
  CHART = 'chart',
  CODE = 'code',
  UNKNOWN = 'unknown'
}

/**
 * Interface for detected content
 */
export interface DetectedContent {
  type: ContentType;
  content: any;
  confidence: number;
  timestamp: string;
  frameId: string;
  metadata?: Record<string, any>;
}

/**
 * Detects if the visual frame contains code
 * 
 * @param ocrResult The OCR result to analyze
 * @returns Boolean indicating if code was detected and the confidence level
 */
function detectCode(ocrResult: OCRResult): { isCode: boolean; confidence: number } {
  if (!ocrResult.text) {
    return { isCode: false, confidence: 0 };
  }
  
  const codeIndicators = [
    /\b(function|class|const|let|var|if|for|while|return|import|export|from|public|private)\b/g,
    /[{}[\]()<>]/g,
    /\b(def|class|import|from|return|if|elif|else|for|while|try|except|with)\b/g, // Python
    /\b(public|private|class|interface|void|int|string|boolean)\b/g, // Java/C#
    /\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|INSERT|UPDATE|DELETE)\b/gi, // SQL
  ];
  
  let matchCount = 0;
  const lines = ocrResult.text.split('\n');
  
  // Check for consistent indentation
  const indentationPattern = /^(\s+)/;
  const indentCounts = lines
    .map(line => {
      const match = line.match(indentationPattern);
      return match ? match[1].length : 0;
    })
    .filter(count => count > 0);
  
  const hasConsistentIndentation = 
    indentCounts.length >= 3 && 
    new Set(indentCounts).size <= 3;
  
  if (hasConsistentIndentation) {
    matchCount += 2;
  }
  
  // Check for code indicators
  for (const pattern of codeIndicators) {
    const matches = ocrResult.text.match(pattern);
    if (matches && matches.length > 3) {
      matchCount += 2;
    } else if (matches && matches.length > 0) {
      matchCount += 1;
    }
  }
  
  // Check for lines ending with semicolons or braces
  const lineEndingPatterns = /[;{}]\s*$/;
  const linesWithCodeEndings = lines.filter(line => 
    lineEndingPatterns.test(line.trim())
  ).length;
  
  if (linesWithCodeEndings > lines.length * 0.3) {
    matchCount += 2;
  }
  
  const confidence = Math.min(1, matchCount / 10);
  
  return {
    isCode: confidence > 0.4,
    confidence
  };
}

/**
 * Detects if the OCR result contains a chart or diagram
 * 
 * @param ocrResult The OCR result to analyze
 * @returns Type of visual element detected and confidence
 */
function detectVisualElement(ocrResult: OCRResult): { 
  type: ContentType.DIAGRAM | ContentType.CHART | ContentType.IMAGE | ContentType.UNKNOWN; 
  confidence: number;
} {
  // This is a placeholder for actual chart/diagram detection
  // In a real implementation, this would likely use image analysis
  // and ML classification to detect visual elements
  
  const chartKeywords = [
    'chart', 'graph', 'plot', 'bar', 'pie', 'line', 'axis', 'trend',
    'histogram', 'scatter', 'series', 'legend', 'data visualization'
  ];
  
  const diagramKeywords = [
    'diagram', 'flowchart', 'process', 'workflow', 'architecture',
    'sequence', 'entity', 'relationship', 'uml', 'box', 'arrow'
  ];
  
  let chartScore = 0;
  let diagramScore = 0;
  
  const lowerText = ocrResult.text.toLowerCase();
  
  // Check for chart/diagram keywords
  chartKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) chartScore++;
  });
  
  diagramKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) diagramScore++;
  });
  
  // Normalize scores
  const chartConfidence = Math.min(1, chartScore / 5);
  const diagramConfidence = Math.min(1, diagramScore / 5);
  
  if (chartConfidence > 0.4 && chartConfidence > diagramConfidence) {
    return { type: ContentType.CHART, confidence: chartConfidence };
  } else if (diagramConfidence > 0.4) {
    return { type: ContentType.DIAGRAM, confidence: diagramConfidence };
  }
  
  // If text is sparse but frame has content, it might be an image
  if (ocrResult.text.length < 50 && ocrResult.text.split('\n').length < 5) {
    return { type: ContentType.IMAGE, confidence: 0.7 };
  }
  
  return { type: ContentType.UNKNOWN, confidence: 0 };
}

/**
 * Analyzes a visual frame to detect content types
 * 
 * @param frame The visual frame to analyze
 * @param ocrResult Optional pre-processed OCR result
 * @returns Array of detected content elements
 */
export async function detectContent(
  frame: VisualFrame, 
  ocrResult?: OCRResult
): Promise<DetectedContent[]> {
  if (!frame.text && !ocrResult) {
    return [{
      type: ContentType.UNKNOWN,
      content: null,
      confidence: 1,
      timestamp: frame.timestamp,
      frameId: frame.id
    }];
  }
  
  // Use provided OCR result or create one from the frame
  const ocr = ocrResult || {
    text: frame.text || '',
    timestamp: frame.timestamp,
    frameId: frame.id
  };
  
  const results: DetectedContent[] = [];
  
  // Detect if it's a table
  const tableData = extractTable(ocr);
  if (tableData) {
    results.push({
      type: ContentType.TABLE,
      content: tableData,
      confidence: 0.8,
      timestamp: frame.timestamp,
      frameId: frame.id,
      metadata: {
        rowCount: tableData.rows.length,
        columnCount: tableData.headers.length
      }
    });
    
    // If we found a table, we can return early as it's likely
    // the main content in the frame
    return results;
  }
  
  // Detect if it's code
  const codeDetection = detectCode(ocr);
  if (codeDetection.isCode) {
    results.push({
      type: ContentType.CODE,
      content: ocr.text,
      confidence: codeDetection.confidence,
      timestamp: frame.timestamp,
      frameId: frame.id,
      metadata: {
        language: 'unknown', // In a real implementation, we'd detect the language
        lineCount: ocr.text.split('\n').length
      }
    });
    
    // If we found code, it's likely the main content
    return results;
  }
  
  // Detect if it's a visual element (chart, diagram, image)
  const visualElementDetection = detectVisualElement(ocr);
  if (visualElementDetection.type !== ContentType.UNKNOWN && 
      visualElementDetection.confidence > 0.4) {
    results.push({
      type: visualElementDetection.type,
      content: {
        image: frame.image,
        description: ocr.text
      },
      confidence: visualElementDetection.confidence,
      timestamp: frame.timestamp,
      frameId: frame.id
    });
    
    // Visual elements are likely the main content
    return results;
  }
  
  // If we got here, it's probably just text content
  // Classify the text content by types (headings, paragraphs, etc.)
  const classifiedContent = classifyContent(ocr);
  
  results.push({
    type: ContentType.TEXT,
    content: classifiedContent,
    confidence: 0.9,
    timestamp: frame.timestamp,
    frameId: frame.id,
    metadata: {
      charCount: ocr.text.length,
      lineCount: ocr.text.split('\n').length,
      contentTypes: classifiedContent.map(item => item.type)
    }
  });
  
  return results;
} 