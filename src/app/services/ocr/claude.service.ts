
/* NOTE ALL OF THIS IS UNTESTED AND PROBABLY DOES NOT WORK */

import { Injectable } from '@angular/core';
import { RequestService } from '../request.service';
import { environment } from 'src/environments/environment';
import { OcrStrategy } from './ocr.interface';
// import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClaudeService implements OcrStrategy{
  private apiUrl = environment.claudeApiUrl;
  private apiKey = environment.CLAUDE_API_KEY;

  constructor(private http: RequestService) { }

  async initialize() {
    return true;
  }

  /**
   * Process the OCR text with Claude using the provided prompt
   * @param text Raw OCR text to process
   * @param prompt Custom prompt to instruct Claude
   * @returns Processed text from Claude
   */

  async performOcr(imageData: string, customPrompt: string): Promise<string> {
    return '';  
  }

  async processText(text: string, prompt: string): Promise<string> {
    // For development/demo purposes, simulate Claude's response
    if (environment.useMockClaudeApi) {
      return this.simulateClaudeProcessing(text, prompt);
    }
    
    // In production, make an actual API call to Claude
    try {
      // const headers = new HttpHeaders({
      //   'Content-Type': 'application/json',
      //   'X-API-Key': this.apiKey
      // });

      let headers: HeadersInit = {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
      }
      
      const requestBody = {
        prompt: `${prompt}\n\nText from OCR:\n${text}`,
        max_tokens_to_sample: 2000,
        temperature: 0.5
      };
      
      // const response = await firstValueFrom(
      //   this.http.post<any>(this.apiUrl, requestBody, { headers })
      // );
      const response: {completion: any} = await this.http.post(this.apiUrl, requestBody, headers);
      return response.completion || '';
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('Failed to process text with Claude');
    }
  }
  
  /**
   * Simulates Claude's text processing for development
   * @param text Raw OCR text
   * @param prompt Prompt instructions
   * @returns Processed text
   */
  private simulateClaudeProcessing(text: string, prompt: string): Promise<string> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        let processedText = text;
        
        // Simple text processing based on prompt keywords
        // if (prompt.includes('format')) {
        //   // Basic formatting: fix multiple spaces and line breaks
        //   processedText = processedText.replace(/\s+/g, ' ');
        //   processedText = processedText.replace(/\n\s*\n/g, '\n\n');
        // }
        
        if (prompt.includes('extract')) {
          // Remove common OCR artifacts like page numbers
          processedText = processedText.replace(/Page \d+ of \d+/gi, '');
        }
        
        resolve(processedText);
      }, 1500);
    });
  }
}
