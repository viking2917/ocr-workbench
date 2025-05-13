import { Injectable } from '@angular/core';

type OcrStrategyType = 'Tesseract' | 'Gemini'; // 'Claude' |
const existingStrategies = ['Tesseract', 'Gemini']; // 'Claude' |

import { TextReplacement, applyTextReplacements } from '../classes/classes';
import { RequestService } from './request.service';
import { OcrStrategy } from './ocr/ocr.interface';
import { TesseractService } from './ocr/tesseract.service';
import { GeminiService } from './ocr/gemini.service';
// import { ClaudeService } from './ocr/claude.service';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private ocrStrategy: OcrStrategy;
  public strategies = existingStrategies; 
  public currentStrategy: OcrStrategyType = 'Tesseract';

  constructor(
    private http: RequestService,
  ) {

    // Load the OCR strategy from localStorage
    const strategyFromStorage = localStorage.getItem('ocrStrategy') || 'Tesseract';
    this.currentStrategy = strategyFromStorage as OcrStrategyType;
    console.log('setting ocr:', this.currentStrategy);

    if(this.currentStrategy === 'Tesseract') {
      this.ocrStrategy = new TesseractService();
    } else if (this.currentStrategy === 'Gemini') {
      this.ocrStrategy = new GeminiService(http);
    } else {
      this.ocrStrategy = new TesseractService();
    }
    this.setStorageStrategy(this.currentStrategy, true);
   }

   async setStorageStrategy(type: OcrStrategyType, force = false): Promise<void> {
    if (!force && (this.currentStrategy === type)) return;
    
    this.currentStrategy = type;
    switch (type) {
      // case 'claude':
      //   this.ocrStrategy = new ClaudeService(this.http);
      //   break;
      case 'Gemini':
        this.ocrStrategy = new GeminiService(this.http);
        break;
      default:
        this.ocrStrategy = new TesseractService();
    }
    
    localStorage.setItem('ocrStrategy', type);

    await this.ocrStrategy.initialize();
  }

  /**
   * Performs OCR on the provided image
   * @param imageData Base64 or URL of the image
   * @returns Promise with the extracted text
   */
  async performOcr(imageData: string, customPrompt: string, replacements: TextReplacement[]|undefined): Promise<string> {
    let text = await this.ocrStrategy.performOcr(imageData, customPrompt);

    // hardcode this for old colonial american docs
    // replace the ſ character with s.
    console.log('performing hard coded text replacement: ſ -> s');
    text = text.replace(/ſ/g, 's');

    // Apply text replacements if they exist
    if(replacements && (replacements?.length > 0)) {
      text = applyTextReplacements(text, replacements);
    }

    return text;
  }
}
