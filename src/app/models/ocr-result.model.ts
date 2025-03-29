export interface OcrResult {
  rawText: string;       // Original OCR text 
  processedText: string; // Text after Claude processing
  editedText: string;    // Text after user editing
}
