import { VisualFrame } from './capture';

/**
 * Interface for OCR results
 */
export interface OCRResult {
  text: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp: string;
  frameId: string;
}

/**
 * Extracts text from a visual frame using OCR
 * 
 * @param frame The visual frame to process
 * @returns OCR result containing extracted text
 */
export async function extractTextFromFrame(frame: VisualFrame): Promise<OCRResult> {
  // For now, we'll assume the frame already has OCR text from Screenpipe
  // In a real implementation, this might call a dedicated OCR service
  // if the frame doesn't already have text
  
  // Create a default OCR result using the text from the frame
  const result: OCRResult = {
    text: frame.text || "",
    confidence: 1.0, // Default high confidence since we're using Screenpipe's OCR
    timestamp: frame.timestamp,
    frameId: frame.id
  };
  
  return result;
}

/**
 * Identifies and extracts content types from OCR results
 * (e.g., headings, bullet points, tables, etc.)
 * 
 * @param ocrResult The OCR result to analyze
 * @returns Analyzed content with type classifications
 */
export function classifyContent(ocrResult: OCRResult): { 
  type: string; 
  content: string;
  confidence: number;
}[] {
  const result = [];
  const lines = ocrResult.text.split('\n');
  
  // Process each line to determine its type
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue; // Skip empty lines
    
    // Check for headings (uppercase lines or ending with colon)
    if (line === line.toUpperCase() || line.endsWith(':')) {
      result.push({
        type: 'heading',
        content: line,
        confidence: 0.8
      });
      continue;
    }
    
    // Check for bullet points
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
      result.push({
        type: 'bullet_point',
        content: line,
        confidence: 0.9
      });
      continue;
    }
    
    // Check for key-value pairs (e.g., "Name: John")
    const kvMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (kvMatch) {
      result.push({
        type: 'key_value',
        content: line,
        confidence: 0.85
      });
      continue;
    }
    
    // Default to paragraph text
    result.push({
      type: 'paragraph',
      content: line,
      confidence: 0.7
    });
  }
  
  return result;
}

/**
 * Enhances OCR results by correcting common errors
 * 
 * @param ocrResult The OCR result to enhance
 * @returns Enhanced OCR result with corrections
 */
export function enhanceOCRResult(ocrResult: OCRResult): OCRResult {
  if (!ocrResult.text) return ocrResult;
  
  let enhancedText = ocrResult.text;
  
  // Common OCR error corrections
  enhancedText = enhancedText
    // Replace common OCR errors (examples)
    .replace(/[0O]/g, 'O') // Replace numeral 0 with letter O where appropriate
    .replace(/[1I]/g, 'I') // Replace numeral 1 with letter I where appropriate
    .replace(/\bIhe\b/g, 'The') // Fix common 'The' misrecognition
    .replace(/\bl\b/g, 'I') // Replace standalone lowercase l with uppercase I
    .replace(/\b0f\b/g, 'of') // Fix common 'of' misrecognition
    
    // Fix spacing issues
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/(\w)- (\w)/g, '$1$2') // Fix hyphenated words
    .trim();
  
  return {
    ...ocrResult,
    text: enhancedText
  };
}

/**
 * Detects and extracts tables from OCR text
 * 
 * @param ocrResult The OCR result to process
 * @returns Extracted table or null if no table is detected
 */
export function extractTable(ocrResult: OCRResult): { headers: string[], rows: string[][] } | null {
  const lines = ocrResult.text.split('\n').filter(line => line.trim().length > 0);
  
  // Simple heuristic: If we have multiple lines with similar patterns of spaces or delimiters,
  // it might be a table
  
  // First, check if we have at least 2 lines (header + data)
  if (lines.length < 2) return null;
  
  // Check for common table delimiters
  const delimiterMatch = lines.some(line => line.includes('|') || line.includes('\t'));
  
  if (delimiterMatch) {
    // Process as delimiter-based table
    const delimiter = lines[0].includes('|') ? '|' : '\t';
    const headers = lines[0].split(delimiter).map(h => h.trim()).filter(h => h);
    const rows = lines.slice(1).map(line => 
      line.split(delimiter).map(cell => cell.trim()).filter(cell => cell || cell === '0')
    );
    
    return { headers, rows };
  }
  
  // Check for space-aligned columns (simple detection)
  const alignmentPattern = /\s{2,}/g;
  const spacedColumns = lines.map(line => line.split(alignmentPattern));
  
  // If all rows have the same number of columns, it might be a space-aligned table
  const columnCounts = new Set(spacedColumns.map(row => row.length));
  
  if (columnCounts.size === 1 && columnCounts.has(1) === false) {
    return {
      headers: spacedColumns[0].map(h => h.trim()),
      rows: spacedColumns.slice(1).map(row => row.map(cell => cell.trim()))
    };
  }
  
  // No table detected
  return null;
} 