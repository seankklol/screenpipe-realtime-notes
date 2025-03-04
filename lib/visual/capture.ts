import { pipe } from "@screenpipe/browser";
import { v4 as uuidv4 } from "uuid";

// Define frame interface
export interface VisualFrame {
  id: string;
  image?: string;
  timestamp: string;
  capturedAt: string;
  app_name?: string;
  window_name?: string;
  text?: string;
  [key: string]: any;
}

/**
 * Preprocesses a captured frame to enhance OCR quality
 * 
 * @param frame The captured screen frame
 * @returns The processed frame ready for OCR
 */
export async function preprocessFrame(frame: VisualFrame): Promise<VisualFrame> {
  // In a future enhancement, we could implement image preprocessing techniques
  // such as contrast enhancement, noise reduction, or thresholding
  // to improve OCR quality
  
  // For now, just pass the frame through
  return frame;
}

// Store the latest frame
let latestFrame: VisualFrame | null = null;

/**
 * Sets up screen capture using Screenpipe's vision stream
 * 
 * @param callback Optional callback function to receive processed frames
 * @returns A function to stop the capture
 */
export function setupScreenCapture(callback?: (frame: VisualFrame) => void) {
  // Setup the vision stream with Screenpipe
  const unsubscribe = pipe.streamVision(async (visionData: any) => {
    try {
      // Create a frame object from vision data
      const frame: VisualFrame = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        capturedAt: new Date().toISOString(),
        text: visionData.text || "",
        app_name: visionData.app_name || visionData.appName || "",
        window_name: visionData.window_name || visionData.windowName || "",
        image: visionData.image || visionData.frame || ""
      };
      
      // Process the frame to enhance OCR quality
      const processedFrame = await preprocessFrame(frame);
      
      // Store as latest frame
      latestFrame = processedFrame;
      
      // Call the callback if provided
      if (callback) {
        callback(processedFrame);
      }
      
      return processedFrame;
    } catch (error) {
      console.error("Error in vision stream:", error);
      return null;
    }
  });
  
  // Return a function to stop the capture
  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
    console.log("Screen capture stopped");
  };
}

/**
 * Fetches the most recent screen capture frame
 * 
 * @returns The most recent frame or null if none available
 */
export async function fetchLatestFrame(): Promise<VisualFrame | null> {
  try {
    // If we have a latest frame in memory, return it
    if (latestFrame) {
      return latestFrame;
    }
    
    // Otherwise try to query for recent frames
    const result = await pipe.queryScreenpipe({
      limit: 1,
    });
    
    if (!result || !result.data || result.data.length === 0) {
      return null;
    }
    
    // Extract content from the result
    const data = result.data[0];
    
    // Create a new frame with type assertion to handle unknown structure
    const frame: VisualFrame = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      capturedAt: new Date().toISOString(),
      text: "",
      app_name: "",
      window_name: ""
    };
    
    // Safely extract properties from the data if they exist
    if (data.content && typeof data.content === 'object') {
      if ('text' in data.content) {
        frame.text = String(data.content.text || "");
      }
      
      if ('appName' in data.content || 'app_name' in data.content) {
        frame.app_name = String(
          data.content.app_name || 
          data.content.appName || 
          ""
        );
      }
      
      if ('windowName' in data.content || 'window_name' in data.content) {
        frame.window_name = String(
          data.content.window_name || 
          data.content.windowName || 
          ""
        );
      }
      
      if ('frame' in data.content || 'image' in data.content) {
        frame.image = String(
          data.content.image || 
          data.content.frame || 
          ""
        );
      }
    }
    
    return frame;
  } catch (error) {
    console.error("Error fetching latest frame:", error);
    return null;
  }
} 