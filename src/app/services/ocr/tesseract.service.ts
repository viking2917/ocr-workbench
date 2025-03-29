import { Injectable } from '@angular/core';
import * as Tesseract from 'tesseract.js';
import { OcrStrategy } from './ocr.interface';

// import { MarkdownService } from 'ngx-markdown';

@Injectable({
  providedIn: 'root',
})
export class TesseractService implements OcrStrategy {

  constructor(
    // private markdownService: MarkdownService,
  ) { }

  async initialize() {
    return true;
  }

  /**
   * Performs OCR on the provided image
   * @param imageData Base64 or URL of the image
   * @returns Promise with the extracted text
   */
  async performOcr(imageData: string, customPrompt: string): Promise<string> {
    try {
      const result = await Tesseract.recognize(
        imageData,
        'eng',
        { 
        //  logger: m => console.log(m)
        }
      );
      
      let markdownOptions = {
        markedOptions: {
          gfm: true,
          breaks: false,
          pedantic: false,
          smartLists: true,
          smartypants: false,
        }
      };

      // let markdownToHtml = this.markdownService.parse(result.data.text, markdownOptions);
      // console.log(markdownToHtml);
      // return markdownToHtml;
      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to process image with OCR');
    }
  }
}
