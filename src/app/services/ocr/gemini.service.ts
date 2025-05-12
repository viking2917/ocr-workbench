import { Injectable } from '@angular/core';
import { RequestService } from '../request.service';
import { environment } from 'src/environments/environment';
import { OcrStrategy } from './ocr.interface';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
  }>,
  error?: {
    code: number;
    message: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService implements OcrStrategy {
  private get apiKey(): string {
    // First check localStorage, then fall back to environment
    return localStorage.getItem('geminiApiKey') || environment.GEMINI_API_KEY;
  }
  
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  constructor(private http: RequestService) { }

  async initialize(): Promise<boolean> {
    return true;
  }

  async performOcr(imageData: string, customPrompt: string): Promise<string> {
    if (environment.useMockGeminiApi) {
      return this.simulateGeminiProcessing(imageData, customPrompt);
    }

    const apiKey = this.apiKey;
    if (!apiKey) {
      throw new Error('No Gemini API key found. Please set one in the settings page.');
    }

    try {
      // Convert base64 image data to the format Gemini expects
      const base64ImageData = imageData.split(',')[1]; // Remove data URL prefix if present

      const requestBody = {
        contents: [{
          parts: [
            { text: customPrompt || "Please extract and format all the text from this image." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64ImageData
              }
            }
          ]
        }]
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      };

      const response = await this.http.post<GeminiResponse>(
        `${this.apiUrl}?key=${apiKey}`,
        requestBody,
        headers
      );


      if (response && response.hasOwnProperty('error') && response.error && (response.error.message.search('API key') !== -1)) {
        throw new Error('Gemini API key error: ' + response.error.message);
      } else if ( response && response.candidates && response.candidates[0]?.finishReason && 
        response.candidates[0]?.finishReason === 'RECITATION' ) {

          // API seems to hork a lot on old text, thinking it is copyright...
        throw new Error('Gemini RECITATION error from Gemini API');
      } else if (!response.candidates || !response.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      let text = response.candidates[0].content.parts[0].text;
      console.log('Gemini API Response:', text);
      return text;
    } catch (error) {
      console.log('Gemini API Error:', error);
      throw error;
      // throw new Error('Failed to process image with Gemini');
    }
  }

  private simulateGeminiProcessing(imageData: string, customPrompt: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate basic OCR response
        resolve("This is a simulated OCR response from Gemini.\n\n" +
               "The image appears to contain text that would be processed and formatted " +
               "according to the custom prompt: " + customPrompt);
      }, 1500);
    });
  }
} 