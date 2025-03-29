import { Injectable } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Injectable({
  providedIn: 'root'
})
export class TextUtilsService {

  constructor(
    private markdownService: MarkdownService,
  ) { }

  async markdownToHtml(text: string) {
    let markdownOptions = {
      markedOptions: {
        gfm: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: true,
      }
    };

    let content = await this.markdownService.parse(text, markdownOptions);
    content = this.fixHTMLEntities(content);
    return content;
  }


  fixHTMLEntities(text: string) {
    // Replace encoded HTML newline with R character
    let newText = text.replace(/&#10;/g, `
`);

    // Replace encoded quotes with actual quote characters
    newText = newText.replace(/&quot;/g, '"')
      .replace(/&#34;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&lsquo;/g, "‘")
      .replace(/&rsquo;/g, "’")
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/&#8216;/g, "‘")  // Single curly quote left
      .replace(/&#8217;/g, "’")  // Single curly quote right
      .replace(/&#8220;/g, '“')  // Double curly quote left
      .replace(/&#8221;/g, '”'); // Double curly quote right

    return newText;
  }


}
