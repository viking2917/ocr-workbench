export interface OcrStrategy {
  initialize(): Promise<boolean>;
  performOcr(imageData: string, customPrompt: string): Promise<string>
} 